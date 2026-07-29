import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.models.school import Student
from app.core.security import get_password_hash


def test_user_registration_and_login(client: TestClient, db: Session):
    # ── Seed roles ──────────────────────────────────────────────────────────
    admin_role   = Role(name="admin",   description="Admin")
    student_role = Role(name="student", description="Student")
    db.add_all([admin_role, student_role])
    db.commit()

    # ── Create and login as admin ────────────────────────────────────────────
    admin_user = User(
        username="admin_user",
        email="admin@triconnect.com",
        hashed_password=get_password_hash("adminpassword123"),
        role_id=admin_role.id,
        first_login=False,
    )
    db.add(admin_user)
    db.commit()

    login_response = client.post("/api/v1/auth/login", json={
        "username": "admin_user",
        "password": "adminpassword123",
    })
    assert login_response.status_code == 200, login_response.text
    admin_token   = login_response.json()["access_token"]
    admin_headers = {"Authorization": f"Bearer {admin_token}"}

    # ── Register a student via the dedicated admin-only endpoint ─────────────
    reg_payload = {
        "student_name":       "Test Student",
        "student_id":         "STU_TEST_001",
        "roll_number":        "1",
        "email":              "student_test@triconnect.com",
        "class_name":         "10",
        "section":            "A",
        "parent_name":        "Test Parent",
        "parent_phone":       "+91 9876543210",
        "temporary_password": "securepassword123",
        "is_active":          True,
    }
    reg_response = client.post(
        "/api/v1/auth/register-student",
        json=reg_payload,
        headers=admin_headers,
    )
    assert reg_response.status_code == 201, reg_response.text
    assert reg_response.json()["username"] == "STU_TEST_001"

    # ── Unauthenticated registration must fail ───────────────────────────────
    anon_response = client.post("/api/v1/auth/register-student", json=reg_payload)
    assert anon_response.status_code == 401

    # ── Student logs in with Student ID ──────────────────────────────────────
    login_response = client.post("/api/v1/auth/login", json={
        "username": "STU_TEST_001",
        "password": "securepassword123",
    })
    assert login_response.status_code == 200, login_response.text
    data = login_response.json()
    assert "access_token"  in data
    assert "refresh_token" in data
    assert data["token_type"]   == "bearer"
    assert data["first_login"]  is True   # New accounts must flag first_login=True

    # ── Student also logs in with email ──────────────────────────────────────
    email_login = client.post("/api/v1/auth/login", json={
        "username": "student_test@triconnect.com",
        "password": "securepassword123",
    })
    assert email_login.status_code == 200, email_login.text

    # ── Unregistered login must return the "Account Not Found" message ────────
    unregistered = client.post("/api/v1/auth/login", json={
        "username": "nobody@unknown.com",
        "password": "whatever",
    })
    assert unregistered.status_code == 401
    assert "Account Not Found" in unregistered.json()["message"]

    # ── /auth/me with a valid token ───────────────────────────────────────────
    headers  = {"Authorization": f"Bearer {data['access_token']}"}
    me_resp  = client.get("/api/v1/auth/me", headers=headers)
    assert me_resp.status_code == 200
    assert me_resp.json()["username"] == "STU_TEST_001"
