from fastapi import APIRouter, Depends, status, Request
from sqlalchemy.orm import Session
from app.database.database import get_db
from app.services.auth import auth_service
from app.schemas.auth import LoginRequest, Token, UserRegister, ForgotPasswordRequest, ResetPasswordRequest, StudentRegistrationRequest
from app.schemas.onboarding import StudentOnboard, TeacherOnboard, ParentOnboard
from app.schemas.user import UserResponse
from app.dependencies.auth import get_current_active_user, RoleChecker
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(
    payload: UserRegister, 
    db: Session = Depends(get_db),
    current_admin: User = Depends(RoleChecker(allowed_roles=["admin"]))
):
    """Create a new user login credential account. Restricted to Admin only (Self-registration is blocked)."""
    return auth_service.register(db, payload)

@router.post("/register-student", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register_student(
    payload: StudentRegistrationRequest,
    db: Session = Depends(get_db),
    current_admin: User = Depends(RoleChecker(allowed_roles=["admin"]))
):
    """Admin-only student provisioning. Creates User and Student records atomically."""
    return auth_service.register_student(db, payload, current_admin.id)

@router.post("/login", response_model=Token)
def login_for_access_token(
    request: Request,
    payload: LoginRequest, 
    db: Session = Depends(get_db)
):
    """Authenticate User ID (username) and password, validating account lockout counters."""
    ip_address = request.client.host if request.client else None
    user_agent = request.headers.get("user-agent")
    return auth_service.authenticate(db, payload, ip=ip_address, ua=user_agent)

@router.post("/refresh", response_model=Token)
def refresh_access_session(refresh_token: str, db: Session = Depends(get_db)):
    """Obtain a new access token using a valid refresh token."""
    return auth_service.refresh_session(db, refresh_token)

@router.post("/forgot-password")
def forgot_password_recovery(payload: ForgotPasswordRequest):
    """Trigger password recovery (Mocked)."""
    return {"success": True, "message": f"Password reset link successfully dispatched to {payload.email}"}

@router.post("/reset-password")
def reset_password_confirmation(payload: ResetPasswordRequest):
    """Verify reset tokens and update credentials (Mocked)."""
    return {"success": True, "message": "Password successfully reset."}

@router.post("/logout")
def logout_session():
    """Invalidate session (Mocked)."""
    return {"success": True, "message": "Logged out successfully."}

@router.get("/me", response_model=UserResponse)
def read_current_user_profile(current_user: User = Depends(get_current_active_user)):
    """Fetch profile data of the currently logged user."""
    return current_user

# --- ONBOARDING ENDPOINTS ---

@router.post("/onboard/student", response_model=UserResponse)
def onboard_student_profile(
    payload: StudentOnboard,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Launch onboarding wizard for Students on first login to save details and register face biometrics."""
    return auth_service.onboard_student(db, current_user, payload)

@router.post("/onboard/teacher", response_model=UserResponse)
def onboard_teacher_profile(
    payload: TeacherOnboard,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Launch onboarding wizard for Teachers on first login to save details and register face biometrics."""
    return auth_service.onboard_teacher(db, current_user, payload)

@router.post("/onboard/parent", response_model=UserResponse)
def onboard_parent_profile(
    payload: ParentOnboard,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Launch onboarding wizard for Parents on first login to update contact details and relationship parameters."""
    return auth_service.onboard_parent(db, current_user, payload)
