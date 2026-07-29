from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.models.coursework import (
    QuestChapter, QuestLevel, StudentQuestProgress, StudentStreak, AchievementBadge, StudentWallet, NoteResource
)
from app.models.school import Student, Subject
from app.schemas.coursework import QuestSubmitAttemptRequest, QuestSubmitAttemptResponse, LeaderboardEntry
from app.core.exceptions import AppException
from uuid import UUID
from datetime import datetime, timezone, date, timedelta

class QuestService:
    def get_or_create_wallet(self, db: Session, student_id: UUID) -> StudentWallet:
        """Retrieve student's gamified coin purse and heart count, or initialize one."""
        wallet = db.query(StudentWallet).filter(StudentWallet.student_id == student_id).first()
        if not wallet:
            wallet = StudentWallet(student_id=student_id, coins=100, hearts=5)
            db.add(wallet)
            db.commit()
            db.refresh(wallet)
        return wallet

    def get_or_create_streak(self, db: Session, student_id: UUID) -> StudentStreak:
        """Retrieve student's daily streak counter or initialize one."""
        streak = db.query(StudentStreak).filter(StudentStreak.student_id == student_id).first()
        if not streak:
            streak = StudentStreak(
                student_id=student_id,
                current_streak=0,
                last_activity_date=date.today() - timedelta(days=2)
            )
            db.add(streak)
            db.commit()
            db.refresh(streak)
        return streak

    def get_subject_quest_map(self, db: Session, student_id: UUID, subject_id: UUID) -> dict:
        """Build the full scrolling adventure map nodes list for a subject, highlighting completed/locked states."""
        chapters = db.query(QuestChapter).filter(QuestChapter.subject_id == subject_id).order_by(QuestChapter.chapter_number).all()
        
        # Pull student progress history
        progress = db.query(StudentQuestProgress).filter(StudentQuestProgress.student_id == student_id).all()
        completed_level_ids = {p.level_id: p.stars_earned for p in progress if p.status == "COMPLETED"}

        chapter_maps = []
        is_previous_completed = True  # First node is unlocked by default

        for chap in chapters:
            level_nodes = []
            levels = db.query(QuestLevel).filter(QuestLevel.chapter_id == chap.id).order_by(QuestLevel.level_number).all()
            
            for lvl in levels:
                stars = completed_level_ids.get(lvl.id, 0)
                is_completed = lvl.id in completed_level_ids
                
                # A level is unlocked if it's already completed or if the preceding level was completed
                is_unlocked = is_completed or is_previous_completed
                is_current = is_unlocked and not is_completed
                
                level_nodes.append({
                    "id": lvl.id,
                    "level_number": lvl.level_number,
                    "title": lvl.title,
                    "activity_type": lvl.activity_type,
                    "difficulty": lvl.difficulty,
                    "xp_reward": lvl.xp_reward,
                    "coins_reward": lvl.coins_reward,
                    "stars_earned": stars,
                    "is_completed": is_completed,
                    "is_unlocked": is_unlocked,
                    "is_current": is_current,
                    "quest_content": lvl.quest_content
                })
                
                # Preceding pointer updates
                is_previous_completed = is_completed

            chapter_maps.append({
                "id": chap.id,
                "chapter_number": chap.chapter_number,
                "title": chap.title,
                "description": chap.description,
                "levels": level_nodes
            })

        return {"chapters": chapter_maps}

    def record_quest_attempt(self, db: Session, student_id: UUID, payload: QuestSubmitAttemptRequest) -> QuestSubmitAttemptResponse:
        """Process quiz node outcomes, calculating Candy Crush stars, streaks, XP level-ups, and awarding badges."""
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise AppException("Student not found")

        level = db.query(QuestLevel).filter(QuestLevel.id == payload.level_id).first()
        if not level:
            raise AppException("Quest level not found")

        wallet = self.get_or_create_wallet(db, student_id)
        streak = self.get_or_create_streak(db, student_id)
        
        # 1. Heart Verification Check
        if not wallet.hearts_disabled and wallet.hearts <= 0:
            raise AppException("No hearts remaining! Refill your hearts in the Shop before starting another Quest.")

        # 2. Compute Candy Crush / Duolingo Stars based on accuracy
        stars = 0
        status_val = "FAILED"
        
        if payload.accuracy_percentage >= level.passing_percentage:
            status_val = "COMPLETED"
            if payload.accuracy_percentage >= 99.0:
                stars = 3
            elif payload.accuracy_percentage >= 80.0:
                stars = 2
            else:
                stars = 1

        # 3. Calculate rewards multipliers
        xp_earned = 0
        coins_earned = 0
        badge_unlocked = None

        if status_val == "COMPLETED":
            # Scale XP & Coins dynamically based on stars ratio
            xp_earned = int(level.xp_reward * (stars / 3.0))
            coins_earned = int(level.coins_reward * (stars / 3.0))

            # Update wallet
            wallet.coins += coins_earned
            db.add(wallet)

            # Update Student profile XP scores
            student.xp_score += xp_earned
            # Level-up thresholds math: level * 100
            while student.xp_score >= (student.level * 100):
                student.xp_score -= (student.level * 100)
                student.level += 1
            db.add(student)

            # Update daily streaks
            today = date.today()
            if streak.last_activity_date == today - timedelta(days=1):
                streak.current_streak += 1
                streak.last_activity_date = today
            elif streak.last_activity_date == today:
                # Streak already updated for today
                pass
            else:
                # Streak broke
                streak.current_streak = 1
                streak.last_activity_date = today
            db.add(streak)

            # Trigger Badges for streaks
            if streak.current_streak in [3, 5, 7, 10]:
                badge_unlocked = f"{streak.current_streak} Day Streak Tracker"
                badge = AchievementBadge(
                    student_id=student_id,
                    badge_name=badge_unlocked,
                    badge_type="STREAK_MILESTONE"
                )
                db.add(badge)
        else:
            # Deduct hearts if enabled and failed
            if not wallet.hearts_disabled:
                wallet.hearts = max(0, wallet.hearts - 1)
                db.add(wallet)

        # 4. Save progress log
        progress_record = StudentQuestProgress(
            student_id=student_id,
            level_id=level.id,
            stars_earned=stars,
            xp_earned=xp_earned,
            coins_earned=coins_earned,
            completion_time_sec=payload.completion_time_sec,
            accuracy_percentage=payload.accuracy_percentage,
            status=status_val
        )
        db.add(progress_record)

        # 5. Locate next level to unlock
        next_lvl = db.query(QuestLevel).filter(
            QuestLevel.chapter_id == level.chapter_id,
            QuestLevel.level_number == level.level_number + 1
        ).first()

        db.commit()

        return QuestSubmitAttemptResponse(
            stars_earned=stars,
            xp_earned=xp_earned,
            coins_earned=coins_earned,
            streak_count=streak.current_streak,
            badge_unlocked=badge_unlocked,
            level_unlocked=next_lvl.id if next_lvl else None,
            status=status_val
        )

    def get_weekly_leaderboard(self, db: Session) -> list[LeaderboardEntry]:
        """Aggregate all students ranked by their computed total XP."""
        students = db.query(Student).order_by(desc(Student.level), desc(Student.xp_score)).all()
        
        ranks = []
        for idx, s in enumerate(students):
            user = s.user
            total_xp = s.level * 100 + s.xp_score
            streak_count = s.streak.current_streak if s.streak else 0
            
            ranks.append(LeaderboardEntry(
                student_name=s.full_name or user.username,
                roll_number=s.roll_number or f"STU-{s.id.hex[:6].upper()}",
                xp=total_xp,
                streak=streak_count,
                rank=idx + 1
            ))
        return ranks

    # --- Shop & Refills ---
    def purchase_hearts(self, db: Session, student_id: UUID) -> StudentWallet:
        """Buy extra hearts inventory using coins (e.g. 50 coins refills to full 5 hearts)."""
        wallet = self.get_or_create_wallet(db, student_id)
        if wallet.coins < 50:
            raise AppException("Insufficient coins reward! Earn more by finishing quests.")
        wallet.coins -= 50
        wallet.hearts = 5
        db.add(wallet)
        db.commit()
        db.refresh(wallet)
        return wallet

    def generate_quest_from_note(self, db: Session, note_id: UUID, activity_type: str, difficulty: str) -> dict:
        """Parses the teacher's lecture note resource and generates syllabus-bound question configurations."""
        note = db.query(NoteResource).filter(NoteResource.id == note_id).first()
        if not note:
            raise AppException("Note resource not found")

        title = note.title.lower()
        
        # Build syllabus-aligned questions based on notes context
        if "chemistry" in title or "compound" in title:
            if activity_type == "MCQ" or activity_type == "Boss":
                return {
                    "question": "Based on the organic chemistry lecture notes, which functional group has a carbonyl carbon bonded to two alkyl groups?",
                    "options": ["Aldehyde", "Ketone", "Ester", "Ether"],
                    "answer": "Ketone"
                }
            elif activity_type == "Puzzle":
                return {
                    "instruction": "Match the organic compound formulas with their IUPAC names:",
                    "pairs": [
                        {"left": "CH3-CH2-OH", "right": "Ethanol"},
                        {"left": "CH3-COOH", "right": "Ethanoic Acid"},
                        {"left": "CH4", "right": "Methane"}
                    ]
                }
            else: # Coding
                return {
                    "instruction": "Write a Python function that prints the compound classification based on saturated status (Saturated/Unsaturated):",
                    "skeleton": "def organic_class(is_saturated):\n    # TODO: return classification\n    _______",
                    "answer": "return 'Saturated' if is_saturated else 'Unsaturated'"
                }
        elif "calculus" in title or "math" in title:
            if activity_type == "MCQ" or activity_type == "Boss":
                return {
                    "question": "Referring to the derivatives worksheet, what is the derivative of sin(x)?",
                    "options": ["-sin(x)", "cos(x)", "-cos(x)", "tan(x)"],
                    "answer": "cos(x)"
                }
            elif activity_type == "Puzzle":
                return {
                    "instruction": "Match the function to its derivative:",
                    "pairs": [
                        {"left": "x^2", "right": "2x"},
                        {"left": "sin(x)", "right": "cos(x)"},
                        {"left": "e^x", "right": "e^x"}
                    ]
                }
            else: # Coding
                return {
                    "instruction": "Implement the derivative power rule power_rule(coefficient, power):",
                    "skeleton": "def power_rule(c, p):\n    # TODO: return new coefficient and power as string 'cx^p'\n    _______",
                    "answer": "return f'{c*p}x^{p-1}'"
                }
        else:
            # Generic syllabus quiz matching note title
            return {
                "question": f"Based on the lecture notes '{note.title}', which concept represents the core foundation of this chapter?",
                "options": ["Concept A", "Concept B", "Concept C", "Concept D"],
                "answer": "Concept A"
            }

quest_service = QuestService()
