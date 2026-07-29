from sqlalchemy.orm import Session
from sqlalchemy import select, desc
from app.models.wellbeing import (
    MoodCheckIn, ChatHistory, WellBeingScore, RiskAssessment,
    CounsellingRequest, CounsellingSession, TeacherReminder, AIInsight, StudentRecommendation
)
from app.models.school import Student, Subject
from app.models.telemetry import AttendanceRecord
from app.models.coursework import HomeworkSubmission, StudentQuestProgress
from app.schemas.wellbeing import (
    MoodCheckInCreate, ChatHistoryCreate, CounsellingRequestCreate, StudentWellBeingDashboard
)
from app.core.exceptions import AppException
from uuid import UUID
from datetime import datetime, timezone, date, timedelta

class WellBeingService:
    def record_mood(self, db: Session, student_id: UUID, payload: MoodCheckInCreate) -> MoodCheckIn:
        """Log the student's daily mood check-in check."""
        # Prevent duplicate check-ins on the same calendar day
        existing = db.query(MoodCheckIn).filter(
            MoodCheckIn.student_id == student_id,
            MoodCheckIn.checkin_date == payload.checkin_date
        ).first()
        if existing:
            existing.mood_score = payload.mood_score
            existing.mood_text = payload.mood_text
            db.add(existing)
            db.commit()
            db.refresh(existing)
            self.recalculate_wellbeing_index(db, student_id)
            return existing

        checkin = MoodCheckIn(
            student_id=student_id,
            mood_score=payload.mood_score,
            mood_text=payload.mood_text,
            checkin_date=payload.checkin_date
        )
        db.add(checkin)
        db.commit()
        db.refresh(checkin)
        
        self.recalculate_wellbeing_index(db, student_id)
        return checkin

    def recalculate_wellbeing_index(self, db: Session, student_id: UUID) -> WellBeingScore:
        """Run multidimensional diagnosis combining attendance, homework, streaks, and moods."""
        student = db.query(Student).filter(Student.id == student_id).first()
        if not student:
            raise AppException("Student not found")

        # 1. Attendance score (Defaults to 100%, drops if absent logs found)
        attendance_records = db.query(AttendanceRecord).filter(AttendanceRecord.student_id == student_id).all()
        attendance_score = 100.0
        if attendance_records:
            presents = sum(1 for r in attendance_records if r.status in ["Present", "Late"])
            attendance_score = (presents / len(attendance_records)) * 100.0

        # 2. Academic Health score (Derived from homework submission completions)
        homeworks = db.query(HomeworkSubmission).filter(HomeworkSubmission.student_id == student_id).all()
        academic_score = 90.0
        if homeworks:
            graded = sum(1 for h in homeworks if h.status == "Graded")
            academic_score = (graded / len(homeworks)) * 100.0

        # 3. Learning Progress score (Derived from quest stars progress)
        quests = db.query(StudentQuestProgress).filter(StudentQuestProgress.student_id == student_id).all()
        progress_score = 85.0
        if quests:
            earned_stars = sum(q.stars_earned for q in quests)
            max_stars = len(quests) * 3
            if max_stars > 0:
                progress_score = (earned_stars / max_stars) * 100.0

        # 4. Motivation score (Continuous daily streak health check)
        streak_days = student.streak.current_streak if student.streak else 0
        motivation_score = min(100.0, 50.0 + (streak_days * 10))

        # 5. Stress Indicator score (Pulls count of 1-Sad or 2-Stressed daily check-ins)
        one_week_ago = date.today() - timedelta(days=7)
        recent_checkins = db.query(MoodCheckIn).filter(
            MoodCheckIn.student_id == student_id,
            MoodCheckIn.checkin_date >= one_week_ago
        ).all()
        
        stress_indicator = 0.0
        negative_moods_count = 0
        if recent_checkins:
            negative_moods_count = sum(1 for c in recent_checkins if c.mood_score <= 2)
            stress_indicator = (negative_moods_count / len(recent_checkins)) * 100.0

        # 6. Overall Wellbeing Index Score
        overall = (attendance_score + academic_score + progress_score + motivation_score - (stress_indicator * 0.5)) / 4.0
        overall = max(0.0, min(100.0, overall))

        # 7. Risk Level mappings
        risk_level = "Green"
        if overall < 55.0 or negative_moods_count >= 5:
            risk_level = "Red"
        elif overall < 70.0 or negative_moods_count >= 3:
            risk_level = "Orange"
        elif overall < 85.0 or negative_moods_count >= 1:
            risk_level = "Yellow"

        # Save score log
        score_log = db.query(WellBeingScore).filter(
            WellBeingScore.student_id == student_id,
            WellBeingScore.calculated_date == date.today()
        ).first()
        
        if not score_log:
            score_log = WellBeingScore(
                student_id=student_id,
                calculated_date=date.today()
            )

        score_log.attendance_score = attendance_score
        score_log.academic_health_score = academic_score
        score_log.learning_progress_score = progress_score
        score_log.motivation_score = motivation_score
        score_log.stress_indicator_score = stress_indicator
        score_log.overall_wellbeing_score = overall
        score_log.risk_level = risk_level
        db.add(score_log)

        # Generate Explainable AI (XAI) rationale summary
        reasons = []
        if attendance_score < 80.0:
            reasons.append(f"Attendance dropped to {attendance_score:.1f}%")
        if academic_score < 70.0:
            reasons.append("Assignment completion rate is below passing limits")
        if negative_moods_count >= 2:
            reasons.append(f"Student reported high stress or sadness in {negative_moods_count} of their recent mood checks")
        
        reason_explanation = "Student wellbeing metrics are in the healthy zone."
        if reasons:
            reason_explanation = "Conclusion reached because: " + ", ".join(reasons) + "."

        risk_assess = RiskAssessment(
            student_id=student_id,
            risk_level=risk_level,
            reason_explanation=reason_explanation
        )
        db.add(risk_assess)

        # Seed recommendations if status isn't Green
        if risk_level != "Green":
            rec_exist = db.query(StudentRecommendation).filter(
                StudentRecommendation.student_id == student_id,
                StudentRecommendation.is_completed == False
            ).first()
            if not rec_exist:
                rec = StudentRecommendation(
                    student_id=student_id,
                    recommendation_type="BREATHING_EXERCISE",
                    title="Deep Breathing Practice (4-7-8)",
                    description="Take a 2-minute micro break. Breathe in for 4s, hold for 7s, and exhale slowly for 8s to calm the nervous system."
                )
                db.add(rec)

        db.commit()
        db.refresh(score_log)
        return score_log

    def chat_with_companion(self, db: Session, student_id: UUID, payload: ChatHistoryCreate) -> dict:
        """Run supportive mentor chatbot dialogue, parsing sentiment and detecting stress."""
        msg = payload.message.lower()
        sentiment = "NEUTRAL"
        emotion = "JOY"

        # Basic sentiment/emotion matching
        if any(w in msg for w in ["sad", "alone", "lonely", "crying", "hurt"]):
            sentiment = "NEGATIVE"
            emotion = "LONELINESS"
        elif any(w in msg for w in ["stress", "tired", "hard", "difficult", "exam", "grade"]):
            sentiment = "NEGATIVE"
            emotion = "STRESS"
        elif any(w in msg for w in ["burn", "exhaust", "sleep", "cant do"]):
            sentiment = "NEGATIVE"
            emotion = "BURNOUT"
        elif any(w in msg for w in ["bully", "mean", "tease", "scared"]):
            sentiment = "NEGATIVE"
            emotion = "BULLYING_INDICATOR"
        elif any(w in msg for w in ["happy", "great", "smile", "good", "pass"]):
            sentiment = "POSITIVE"
            emotion = "JOY"

        # Log student chat
        student_log = ChatHistory(
            student_id=student_id,
            sender="STUDENT",
            message=payload.message,
            sentiment=sentiment,
            detected_emotion=emotion
        )
        db.add(student_log)

        # Generate supportive, mentor-like response
        response_text = "I hear you, and I am here to support you. You are doing great!"
        if emotion == "LONELINESS":
            response_text = "I'm really sorry you're feeling lonely. Remember that I'm always here to chat. Would you like to share what's on your mind, or maybe discuss talking with a school counselor?"
        elif emotion == "STRESS":
            response_text = "It sounds like you've been carrying a lot of academic weight lately. Remember that progress takes time. Let's start by mapping a small study plan, or you can take a breathing break!"
        elif emotion == "BURNOUT":
            response_text = "Feeling exhausted is a sign that your body needs a micro-break. Would you like to try a quick relaxation breathing exercise right now?"
        elif emotion == "BULLYING_INDICATOR":
            response_text = "I am so sorry you have to go through this. Bullying is never okay. I strongly recommend sharing this with your class teacher or scheduling a session with our school counselor. I can book it for you if you'd like."
        elif emotion == "JOY":
            response_text = "That is amazing news! I am so happy to hear that! Keep shining, you are making incredible progress."

        # Log AI reply
        ai_log = ChatHistory(
            student_id=student_id,
            sender="AI",
            message=response_text,
            sentiment="POSITIVE",
            detected_emotion=emotion
        )
        db.add(ai_log)
        db.commit()

        return {
            "response": response_text,
            "sentiment": sentiment,
            "detected_emotion": emotion
        }

    def create_counselling_booking(self, db: Session, student_id: UUID, payload: CounsellingRequestCreate) -> CounsellingRequest:
        """Create a counselling booking, generating a consolidated AI briefing for teacher and counsellor review."""
        score = db.query(WellBeingScore).filter(WellBeingScore.student_id == student_id).order_by(desc(WellBeingScore.created_at)).first()
        risk = score.risk_level if score else "Green"
        
        # Build AI consolidated summary
        summary = (
            f"Consolidated AI Diagnostics briefing:\n"
            f"- Attendance: {score.attendance_score:.1f}% if logged.\n"
            f"- Academic completion: {score.academic_health_score:.1f}%.\n"
            f"- Probed Risk Level: {risk}.\n"
            f"- Reason: Student requested support for '{payload.reason}'."
        )

        request = CounsellingRequest(
            student_id=student_id,
            preferred_date=payload.preferred_date,
            preferred_time=payload.preferred_time,
            reason=payload.reason,
            ai_summary=summary,
            status="PENDING"
        )
        db.add(request)
        db.commit()
        db.refresh(request)
        return request

    def get_student_dashboard(self, db: Session, student_id: UUID) -> dict:
        """Assemble the complete student wellbeing companion stats dashboard."""
        score = db.query(WellBeingScore).filter(WellBeingScore.student_id == student_id).order_by(desc(WellBeingScore.created_at)).first()
        if not score:
            score = self.recalculate_wellbeing_index(db, student_id)

        today_mood = db.query(MoodCheckIn).filter(
            MoodCheckIn.student_id == student_id,
            MoodCheckIn.checkin_date == date.today()
        ).first()

        recs = db.query(StudentRecommendation).filter(
            StudentRecommendation.student_id == student_id,
            StudentRecommendation.is_completed == False
        ).all()

        insights = db.query(AIInsight).filter(AIInsight.student_id == student_id).order_by(desc(AIInsight.created_at)).limit(3).all()
        insights_list = [i.insight_text for i in insights]
        if not insights_list:
            insights_list = ["You have maintained a consistent learning path. Keep up the high motivation!"]

        return {
            "mood_score_today": today_mood.mood_score if today_mood else None,
            "mood_text_today": today_mood.mood_text if today_mood else None,
            "academic_health_score": score.academic_health_score,
            "attendance_score": score.attendance_score,
            "learning_progress_score": score.learning_progress_score,
            "motivation_score": score.motivation_score,
            "stress_indicator_score": score.stress_indicator_score,
            "overall_wellbeing_score": score.overall_wellbeing_score,
            "risk_level": score.risk_level,
            "ai_insights": insights_list,
            "recommendations": recs
        }

    def get_teacher_wellbeing_dashboard(self, db: Session) -> dict:
        """Fetch teacher panel metrics showing aggregated risk scores and scheduled counselling requests."""
        # Find students in Yellow, Orange, or Red risk categories
        scores = db.query(WellBeingScore).order_by(desc(WellBeingScore.created_at)).all()
        
        # Pull distinct students latest scores
        seen_students = set()
        need_attention = []
        
        for sc in scores:
            if sc.student_id in seen_students:
                continue
            seen_students.add(sc.student_id)
            if sc.risk_level in ["Red", "Orange", "Yellow"]:
                student = db.query(Student).filter(Student.id == sc.student_id).first()
                if student:
                    user = student.user
                    need_attention.append({
                        "id": student.id,
                        "student_name": student.full_name or user.username,
                        "risk_level": sc.risk_level,
                        "overall_score": sc.overall_wellbeing_score,
                        "reason": db.query(RiskAssessment).filter(RiskAssessment.student_id == student.id).order_by(desc(RiskAssessment.assessed_at)).first()
                    })

        sessions = db.query(CounsellingRequest).filter(CounsellingRequest.status != "COMPLETED").all()
        sessions_list = []
        for s in sessions:
            st = db.query(Student).filter(Student.id == s.student_id).first()
            if st:
                sessions_list.append({
                    "id": s.id,
                    "student_name": st.full_name or st.user.username,
                    "date": s.preferred_date.isoformat(),
                    "time": s.preferred_time,
                    "reason": s.reason,
                    "risk_level": risk_level_from_student(db, st.id),
                    "ai_summary": s.ai_summary
                })

        return {
            "students_needing_attention": need_attention,
            "upcoming_counselling_sessions": sessions_list
        }

def risk_level_from_student(db: Session, student_id: UUID) -> str:
    s = db.query(WellBeingScore).filter(WellBeingScore.student_id == student_id).order_by(desc(WellBeingScore.created_at)).first()
    return s.risk_level if s else "Green"

wellbeing_service = WellBeingService()
