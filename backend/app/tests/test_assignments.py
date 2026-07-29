import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.models.school import Teacher, Subject
from app.core.security import get_password_hash
from datetime import datetime, timezone, timedelta

def test_create_and_submit_assignments(client: TestClient, db: Session):
    # Setup roles
    teacher_role = Role(name="teacher", description="Teacher")
    db.add(teacher_role)
    db.commit()

    teacher_user = User(
        username="myteacher@triconnect.com",
        email="myteacher@triconnect.com",
        hashed_password=get_password_hash("teacherpassword123"),
        role_id=teacher_role.id,
        first_login=False
    )
    db.add(teacher_user)
    db.commit()

    teacher_profile = Teacher(user_id=teacher_user.id, division="Sciences")
    db.add(teacher_profile)
    db.commit()

    subj = Subject(name="Chemistry Lab", code="CHEM-10B")
    db.add(subj)
    db.commit()

    # Login teacher
    response = client.post("/api/v1/auth/login", json={
        "username": "myteacher@triconnect.com",
        "password": "teacherpassword123"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Create assignment
    payload = {
        "title": "Lab Experiment 1",
        "description": "Examine basic compounds stability.",
        "due_date": (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
        "xp_reward": 100,
        "difficulty": "Easy",
        "subject_id": str(subj.id)
    }
    response = client.post("/api/v1/assignments/", json=payload, headers=headers)
    assert response.status_code == 201
    assert response.json()["title"] == "Lab Experiment 1"

def test_learning_quests_game_mechanics(client: TestClient, db: Session):
    # Setup student and teacher role
    student_role = Role(name="student", description="Student Role")
    teacher_role = Role(name="teacher", description="Teacher Role")
    db.add_all([student_role, teacher_role])
    db.commit()

    student_user = User(
        username="quest_student",
        email="quest_student@triconnect.com",
        hashed_password=get_password_hash("password123"),
        role_id=student_role.id,
        first_login=False
    )
    teacher_user = User(
        username="quest_teacher",
        email="quest_teacher@triconnect.com",
        hashed_password=get_password_hash("password123"),
        role_id=teacher_role.id,
        first_login=False
    )
    db.add_all([student_user, teacher_user])
    db.commit()

    from app.models.school import Student, Teacher
    student_profile = Student(user_id=student_user.id)
    teacher_profile = Teacher(user_id=teacher_user.id)
    db.add_all([student_profile, teacher_profile])
    db.commit()

    subj = Subject(name="Mathematics Kingdom", code="MATH-101")
    db.add(subj)
    db.commit()

    # Login student
    student_login = client.post("/api/v1/auth/login", json={"username": "quest_student", "password": "password123"})
    student_headers = {"Authorization": f"Bearer {student_login.json()['access_token']}"}

    # Login teacher
    teacher_login = client.post("/api/v1/auth/login", json={"username": "quest_teacher", "password": "password123"})
    teacher_headers = {"Authorization": f"Bearer {teacher_login.json()['access_token']}"}

    # 1. Create Quest Chapter
    chapter_payload = {
        "subject_id": str(subj.id),
        "chapter_number": 1,
        "title": "Numbers Land",
        "description": "Learn counting and basic algebra."
    }
    chap_resp = client.post("/api/v1/assignments/quests/chapters", json=chapter_payload, headers=teacher_headers)
    assert chap_resp.status_code == 201
    chap_id = chap_resp.json()["id"]

    # 2. Create Quest Level (MCQ Node)
    level_payload = {
        "chapter_id": str(chap_id),
        "level_number": 1,
        "title": "Prime Numbers Quest",
        "activity_type": "MCQ",
        "difficulty": "Easy",
        "xp_reward": 120,
        "coins_reward": 30,
        "passing_percentage": 60.0,
        "hints_allowed": 2,
        "ai_difficulty_adjust": True,
        "quest_content": '{"question": "What is the smallest prime number?", "options": ["1", "2", "3"], "answer": "2"}'
    }
    lvl_resp = client.post("/api/v1/assignments/quests/levels", json=level_payload, headers=teacher_headers)
    assert lvl_resp.status_code == 201
    level_id = lvl_resp.json()["id"]

    # 3. Retrieve adventure map
    map_resp = client.get(f"/api/v1/assignments/quests/map/{subj.id}", headers=student_headers)
    assert map_resp.status_code == 200
    assert len(map_resp.json()["chapters"]) == 1
    assert map_resp.json()["chapters"][0]["levels"][0]["title"] == "Prime Numbers Quest"

    # 4. Submit successful attempt (100% accuracy -> 3 Stars)
    attempt_payload = {
        "level_id": str(level_id),
        "completion_time_sec": 35,
        "accuracy_percentage": 100.0,
        "hearts_left": 5,
        "answers_payload": '{"chosen": "2"}'
    }
    submit_resp = client.post("/api/v1/assignments/quests/attempt", json=attempt_payload, headers=student_headers)
    assert submit_resp.status_code == 200
    assert submit_resp.json()["stars_earned"] == 3
    assert submit_resp.json()["xp_earned"] == 120
    assert submit_resp.json()["coins_earned"] == 30
    assert submit_resp.json()["status"] == "COMPLETED"

    # 5. Check wallet details (coins increased from starting 50 to 80)
    wallet_resp = client.get("/api/v1/assignments/quests/wallet", headers=student_headers)
    assert wallet_resp.status_code == 200
    assert wallet_resp.json()["coins"] == 130
    assert wallet_resp.json()["hearts"] == 5

    # 6. Retrieve global leaderboard
    leaderboard_resp = client.get("/api/v1/assignments/quests/leaderboard", headers=student_headers)
    assert leaderboard_resp.status_code == 200
    assert len(leaderboard_resp.json()) == 1
    assert leaderboard_resp.json()[0]["student_name"] == "quest_student"

    # 7. Create a study note (Chemistry Compounds)
    note_payload = {
        "title": "Introduction to Saturated Compounds",
        "file_path": "/storage/notes/compounds.pdf",
        "downloads_count": 0,
        "subject_id": str(subj.id),
        "teacher_id": str(teacher_profile.id)
    }
    note_resp = client.post("/api/v1/assignments/notes", json=note_payload, headers=teacher_headers)
    assert note_resp.status_code == 201
    note_id = note_resp.json()["id"]

    # 8. Request AI Quest generation (strictly bound to syllabus)
    gen_payload = {
        "note_id": str(note_id),
        "activity_type": "MCQ",
        "difficulty": "Easy"
      }
    gen_resp = client.post("/api/v1/assignments/quests/generate-from-notes", json=gen_payload, headers=teacher_headers)
    assert gen_resp.status_code == 200
    assert "organic chemistry" in gen_resp.json()["question"].lower()
    assert gen_resp.json()["answer"] == "Ketone"


