import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.models.school import Student
from app.core.security import get_password_hash


def test_user_account_lockout_after_five_failures(client: TestClient, db: Session):
    # ── Seed roles ──────────────────────────────────────────────────────────
    admin_role   = Role(name="admin",   description="Admin")
    student_role = Role(name="student", description="Student")
    db.add_all([admin_role, student_role])
    db.commit()

    # ── Provision an admin account (standard User lookup, no Student profile) ─
    admin_user = User(
        username="lockout_admin",
        hashed_password=get_password_hash("adminpass123"),
        role_id=admin_role.id,
        first_login=False,
        is_active=True,
    )
    db.add(admin_user)
    db.commit()

    # ── Provision a student via register_student (User + Student row together) ─
    admin_login = client.post("/api/v1/auth/login", json={
        "username": "lockout_admin",
        "password": "adminpass123",
    })
    assert admin_login.status_code == 200, admin_login.text
    headers = {"Authorization": f"Bearer {admin_login.json()['access_token']}"}

    reg = client.post("/api/v1/auth/register-student", json={
        "student_name":       "Lockout Target",
        "student_id":         "STU_LOCK_001",
        "roll_number":        "99",
        "email":              "lockout@school.edu",
        "class_name":         "10",
        "section":            "B",
        "parent_name":        "Parent Name",
        "parent_phone":       "+91 9999999999",
        "temporary_password": "realpassword123",
        "is_active":          True,
    }, headers=headers)
    assert reg.status_code == 201, reg.text

    # ── Fail login 4 times with wrong password ───────────────────────────────
    for i in range(4):
        resp = client.post("/api/v1/auth/login", json={
            "username": "STU_LOCK_001",
            "password": "wrongpassword",
        })
        assert resp.status_code == 401
        assert "Incorrect Password" in resp.json()["message"], resp.json()

    # ── 5th failure triggers lockout ─────────────────────────────────────────
    lockout_resp = client.post("/api/v1/auth/login", json={
        "username": "STU_LOCK_001",
        "password": "wrongpassword",
    })
    assert lockout_resp.status_code == 401
    assert "locked out" in lockout_resp.json()["message"].lower(), lockout_resp.json()

    # ── Even correct password fails while locked ──────────────────────────────
    subsequent_resp = client.post("/api/v1/auth/login", json={
        "username": "STU_LOCK_001",
        "password": "realpassword123",
    })
    assert subsequent_resp.status_code == 401
    assert "locked out" in subsequent_resp.json()["message"].lower(), subsequent_resp.json()
