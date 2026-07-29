import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.models.school import Student, Teacher, Subject
from app.models.wellbeing import MoodCheckIn, CounsellingRequest
from app.core.security import get_password_hash
from datetime import date, datetime

def test_student_wellbeing_companion_pipeline(client: TestClient, db: Session):
    # Setup student and teacher role
    student_role = Role(name="student", description="Student Role")
    teacher_role = Role(name="teacher", description="Teacher Role")
    db.add_all([student_role, teacher_role])
    db.commit()

    student_user = User(
        username="wellbeing_student",
        email="wellbeing_student@triconnect.com",
        hashed_password=get_password_hash("password123"),
        role_id=student_role.id,
        first_login=False
    )
    teacher_user = User(
        username="wellbeing_teacher",
        email="wellbeing_teacher@triconnect.com",
        hashed_password=get_password_hash("password123"),
        role_id=teacher_role.id,
        first_login=False
    )
    db.add_all([student_user, teacher_user])
    db.commit()

    student_profile = Student(user_id=student_user.id, full_name="John Doe")
    teacher_profile = Teacher(user_id=teacher_user.id, full_name="Sarah Jenkins")
    db.add_all([student_profile, teacher_profile])
    db.commit()

    # Login student
    student_login = client.post("/api/v1/auth/login", json={"username": "wellbeing_student", "password": "password123"})
    student_headers = {"Authorization": f"Bearer {student_login.json()['access_token']}"}

    # Login teacher
    teacher_login = client.post("/api/v1/auth/login", json={"username": "wellbeing_teacher", "password": "password123"})
    teacher_headers = {"Authorization": f"Bearer {teacher_login.json()['access_token']}"}

    # 1. Log daily mood check-in (Stressed - Score 2)
    mood_payload = {
        "mood_score": 2,
        "mood_text": "Feeling anxious about the upcoming math coursework test.",
        "checkin_date": date.today().isoformat()
    }
    mood_resp = client.post("/api/v1/wellbeing/mood", json=mood_payload, headers=student_headers)
    assert mood_resp.status_code == 201
    assert mood_resp.json()["mood_score"] == 2

    # 2. Retrieve student dashboard wellbeing indices
    dashboard_resp = client.get("/api/v1/wellbeing/dashboard", headers=student_headers)
    assert dashboard_resp.status_code == 200
    assert dashboard_resp.json()["mood_score_today"] == 2
    assert dashboard_resp.json()["risk_level"] == "Orange"  # Recalculated due to low overall scores and 1 negative mood log

    # 3. Chat with mentor companion (bully indicator sentiment query)
    chat_payload = {
        "sender": "STUDENT",
        "message": "Some students were mean and teased me in the hallway today."
    }
    chat_resp = client.post("/api/v1/wellbeing/chat", json=chat_payload, headers=student_headers)
    assert chat_resp.status_code == 200
    assert chat_resp.json()["detected_emotion"] == "BULLYING_INDICATOR"
    assert "bullying is never okay" in chat_resp.json()["response"].lower()

    # 4. Schedule school counselor session request
    counsel_payload = {
        "preferred_date": date.today().isoformat(),
        "preferred_time": "02:30 PM",
        "reason": "Teasing incident and study anxiety"
    }
    counsel_resp = client.post("/api/v1/wellbeing/counselling/book", json=counsel_payload, headers=student_headers)
    assert counsel_resp.status_code == 201
    assert counsel_resp.json()["status"] == "PENDING"
    assert "teasing incident" in counsel_resp.json()["ai_summary"].lower()

    # 5. Teacher checks pending interventions dashboard
    teacher_dash = client.get("/api/v1/wellbeing/teacher/dashboard", headers=teacher_headers)
    assert teacher_dash.status_code == 200
    assert len(teacher_dash.json()["students_needing_attention"]) == 1
    assert teacher_dash.json()["students_needing_attention"][0]["student_name"] == "John Doe"
    assert len(teacher_dash.json()["upcoming_counselling_sessions"]) == 1
