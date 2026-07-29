import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.models.school import Student, ClassGroup, Teacher
from app.core.security import get_password_hash

def test_student_attendance_flow(client: TestClient, db: Session):
    # Setup roles and student user
    student_role = Role(name="student", description="Student Role")
    teacher_role = Role(name="teacher", description="Teacher Role")
    db.add_all([student_role, teacher_role])
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

    teacher_user = User(
        username="test_teacher@triconnect.com",
        email="test_teacher@triconnect.com",
        hashed_password=get_password_hash("teacherpassword123"),
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

    student_profile = Student(user_id=student_user.id, class_id=classroom.id)
    db.add(student_profile)
    db.commit()

    # Login to get student credentials
    response = client.post("/api/v1/auth/login", json={
        "username": "test_student@triconnect.com",
        "password": "studentpassword123"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Record attendance check-in (successful GPS match)
    check_in_payload = {
        "class_id": str(classroom.id),
        "status": "Present",
        "method": "GPS Face Scan",
        "latitude": 37.7749,
        "longitude": -122.4194
    }
    response = client.post("/api/v1/attendance/check-in", json=check_in_payload, headers=headers)
    assert response.status_code == 201
    assert response.json()["status"] in ("Present", "Late")   # backend auto-assigns based on time-of-day
    assert response.json()["geofence_verified"] is True

def test_smart_attendance_verification_pipeline(client: TestClient, db: Session):
    # Setup roles and student user
    student_role = Role(name="student", description="Student Role")
    admin_role = Role(name="admin", description="Admin Role")
    db.add_all([student_role, admin_role])
    db.commit()

    student_user = User(
        username="smart_student",
        email="smart@triconnect.com",
        hashed_password=get_password_hash("password123"),
        role_id=student_role.id,
        first_login=False
    )
    admin_user = User(
        username="smart_admin",
        email="admin_smart@triconnect.com",
        hashed_password=get_password_hash("password123"),
        role_id=admin_role.id,
        first_login=False
    )
    db.add_all([student_user, admin_user])
    db.commit()

    student_profile = Student(user_id=student_user.id)
    db.add(student_profile)
    db.commit()

    # Login student
    login_resp = client.post("/api/v1/auth/login", json={"username": "smart_student", "password": "password123"})
    student_token = login_resp.json()["access_token"]
    student_headers = {"Authorization": f"Bearer {student_token}"}

    # Login admin
    admin_resp = client.post("/api/v1/auth/login", json={"username": "smart_admin", "password": "password123"})
    admin_token = admin_resp.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # 1. Fetch settings
    settings_resp = client.get("/api/v1/attendance/settings", headers=student_headers)
    assert settings_resp.status_code == 200
    assert settings_resp.json()["school_name"] == "Westside Academy High"

    # 2. Modify settings (Admin only)
    payload_settings = {
        "school_name": "Eastside Tech High",
        "latitude": 37.7749,
        "longitude": -122.4194,
        "radius": 50.0  # 50 meters allowed
    }
    put_resp = client.put("/api/v1/attendance/settings", json=payload_settings, headers=admin_headers)
    assert put_resp.status_code == 200
    assert put_resp.json()["school_name"] == "Eastside Tech High"
    assert put_resp.json()["radius"] == 50.0

    # 3. Verify attendance - GPS premise violation (lat/long set outside 50m radius)
    verify_fail_gps = {
        "latitude": 38.0000,  # Far away
        "longitude": -122.0000,
        "accuracy": 5.0,
        "device_info": "iOS Device",
        "liveness_challenge": "Blink",
        "liveness_verified": True,
        "liveness_score": 0.95,
        "face_match_confidence": 0.92
    }
    verify_resp = client.post("/api/v1/attendance/verify", json=verify_fail_gps, headers=student_headers)
    assert verify_resp.status_code == 400
    assert "permitted school attendance area" in verify_resp.json()["message"]

    # 4. Verify attendance - Success (exact geofence, valid face, valid liveness)
    verify_success = {
        "latitude": 37.7749,  # Matches setting Center
        "longitude": -122.4194,
        "accuracy": 3.0,
        "device_info": "Chrome Desktop",
        "liveness_challenge": "Smile",
        "liveness_verified": True,
        "liveness_score": 0.88,
        "face_match_confidence": 0.95
    }
    verify_resp = client.post("/api/v1/attendance/verify", json=verify_success, headers=student_headers)
    assert verify_resp.status_code == 200
    assert verify_resp.json()["status"] in ["Present", "Late"]
    assert verify_resp.json()["verified_gps"] is True
    assert verify_resp.json()["verified_face"] is True

def test_campuses_crud_pipeline(client: TestClient, db: Session):
    # Setup admin user
    admin_role = Role(name="admin", description="Admin Role")
    db.add(admin_role)
    db.commit()
    
    admin_user = User(
        username="campus_admin",
        email="campus_admin@triconnect.com",
        hashed_password=get_password_hash("password123"),
        role_id=admin_role.id,
        first_login=False
    )
    db.add(admin_user)
    db.commit()
    
    login_resp = client.post("/api/v1/auth/login", json={"username": "campus_admin", "password": "password123"})
    headers = {"Authorization": f"Bearer {login_resp.json()['access_token']}"}
    
    # 1. Create campus
    payload = {
        "campus_name": "North Campus Wing",
        "latitude": 37.8000,
        "longitude": -122.4500,
        "attendance_radius": 150.0,
        "formatted_address": "100 North Campus Blvd, San Francisco, CA"
    }
    create_resp = client.post("/api/v1/attendance/campuses", json=payload, headers=headers)
    assert create_resp.status_code == 201
    campus_id = create_resp.json()["id"]
    assert create_resp.json()["campus_name"] == "North Campus Wing"
    
    # 2. Get list of campuses
    list_resp = client.get("/api/v1/attendance/campuses", headers=headers)
    assert list_resp.status_code == 200
    assert len(list_resp.json()) == 1
    
    # 3. Update campus
    update_payload = {
        "campus_name": "Updated North Campus",
        "latitude": 37.8010,
        "longitude": -122.4510,
        "attendance_radius": 200.0,
        "formatted_address": "101 Updated North Campus Blvd"
    }
    put_resp = client.put(f"/api/v1/attendance/campuses/{campus_id}", json=update_payload, headers=headers)
    assert put_resp.status_code == 200
    assert put_resp.json()["campus_name"] == "Updated North Campus"
    assert put_resp.json()["attendance_radius"] == 200.0
    
    # 4. Delete campus
    del_resp = client.delete(f"/api/v1/attendance/campuses/{campus_id}", headers=headers)
    assert del_resp.status_code == 200
    assert del_resp.json() is True


