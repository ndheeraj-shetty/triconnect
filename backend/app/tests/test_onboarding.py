import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.models.school import Student, Teacher, Parent
from app.models.biometric import FaceEmbedding
from app.core.security import get_password_hash
from sqlalchemy import select

def test_student_first_login_onboarding(client: TestClient, db: Session):
    # Setup roles and student account in first_login=True state
    student_role = Role(name="student", description="Student")
    admin_role = Role(name="admin", description="Admin")
    db.add_all([student_role, admin_role])
    db.commit()

    student_user = User(
        username="STU9988",
        hashed_password=get_password_hash("temp_pass"),
        role_id=student_role.id,
        first_login=True
    )
    db.add(student_user)
    db.commit()

    student_profile = Student(user_id=student_user.id)
    db.add(student_profile)
    db.commit()

    # Login student with temporary password
    login_resp = client.post("/api/v1/auth/login", json={
        "username": "STU9988",
        "password": "temp_pass"
    })
    assert login_resp.status_code == 200
    assert login_resp.json()["first_login"] is True
    
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Submit student onboarding wizard
    onboard_payload = {
        "full_name": "Liam Sterling",
        "roll_number": "24B-CS9",
        "class_name": "Calculus AP 10A",
        "section": "A",
        "parent_name": "Elizabeth Sterling",
        "parent_phone": "+1-555-9011",
        "student_email": "liam@student.triconnect.com",
        "parent_email": "elizabeth@parent.com",
        "new_password": "newsecurepassword123",
        "confirm_password": "newsecurepassword123",
        "face_embedding": "ENCRYPTED_FACE_VECTOR_DATA_3D_XYZ",
        "captured_angles": 3
    }
    
    onboard_resp = client.post("/api/v1/auth/onboard/student", json=onboard_payload, headers=headers)
    assert onboard_resp.status_code == 200
    data = onboard_resp.json()
    assert data["first_login"] is False
    assert data["email"] == "liam@student.triconnect.com"

    # Query DB to check profile attributes and face embedding
    db.expire_all()
    updated_user = db.get(User, student_user.id)
    assert updated_user.student_profile.roll_number == "24B-CS9"
    assert updated_user.student_profile.parent_name == "Elizabeth Sterling"
    
    face = db.execute(select(FaceEmbedding).where(FaceEmbedding.user_id == student_user.id)).scalar_one_or_none()
    assert face is not None
    assert face.embedding == "ENCRYPTED_FACE_VECTOR_DATA_3D_XYZ"
    assert face.captured_angles == 3

    # Verify logging in now doesn't ask for onboarding
    relogin_resp = client.post("/api/v1/auth/login", json={
        "username": "STU9988",
        "password": "newsecurepassword123"
    })
    assert relogin_resp.status_code == 200
    assert relogin_resp.json()["first_login"] is False
