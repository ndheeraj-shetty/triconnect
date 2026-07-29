import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.models.school import Student, Teacher, ClassGroup
from app.core.security import get_password_hash

def test_generate_academic_reports(client: TestClient, db: Session):
    teacher_role = Role(name="teacher", description="Teacher")
    student_role = Role(name="student", description="Student")
    db.add_all([teacher_role, student_role])
    db.commit()

    teacher_user = User(
        username="advisor@triconnect.com",
        email="advisor@triconnect.com",
        hashed_password=get_password_hash("teacher123"),
        role_id=teacher_role.id,
        first_login=False
    )
    db.add(teacher_user)
    db.commit()

    teacher_profile = Teacher(user_id=teacher_user.id, division="Maths")
    db.add(teacher_profile)
    db.commit()

    classroom = ClassGroup(name="AP Calculus 10A", grade="10", advisor_id=teacher_profile.id)
    db.add(classroom)
    db.commit()

    student_user = User(
        username="test_student@triconnect.com",
        email="test_student@triconnect.com",
        hashed_password=get_password_hash("studentpassword123"),
        role_id=student_role.id,
        first_login=False
    )
    db.add(student_user)
    db.commit()

    student_profile = Student(user_id=student_user.id, class_id=classroom.id)
    db.add(student_profile)
    db.commit()

    # Login teacher
    response = client.post("/api/v1/auth/login", json={
        "username": "advisor@triconnect.com",
        "password": "teacher123"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Generate academic report
    response = client.post(
        f"/api/v1/reports/student/{student_profile.id}/generate?term=Term%204",
        headers=headers
    )
    assert response.status_code == 201
    assert "ai_dean_comment" in response.json()
    assert "AP Calculus 10A" in response.json()["ai_dean_comment"]
