import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session
from app.models.user import User, Role
from app.core.security import get_password_hash

def test_admin_list_and_update_users(client: TestClient, db: Session):
    # Setup roles and accounts
    admin_role = Role(name="admin", description="Admin role")
    db.add(admin_role)
    db.commit()

    admin_user = User(
        username="mainadmin@triconnect.com",
        email="mainadmin@triconnect.com",
        hashed_password=get_password_hash("adminpassword123"),
        role_id=admin_role.id,
        first_login=False
    )
    db.add(admin_user)
    db.commit()

    # Login to get admin token
    response = client.post("/api/v1/auth/login", json={
        "username": "mainadmin@triconnect.com",
        "password": "adminpassword123"
    })
    assert response.status_code == 200
    token = response.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Test list users
    response = client.get("/api/v1/users/", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) >= 1

    # Test update user details
    response = client.put(f"/api/v1/users/{admin_user.id}", json={
        "email": "updatedadmin@triconnect.com"
    }, headers=headers)
    assert response.status_code == 200
    assert response.json()["email"] == "updatedadmin@triconnect.com"
