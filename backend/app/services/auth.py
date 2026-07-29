from sqlalchemy.orm import Session
from datetime import timedelta
from app.core.security import verify_password, get_password_hash, create_access_token, create_refresh_token
from app.repositories.user import user_repo, role_repo
from app.repositories.school import student_repo, teacher_repo, parent_repo
from app.models.user import User
from app.models.school import Student, Teacher, Parent
from app.models.biometric import FaceEmbedding
from app.schemas.auth import LoginRequest, Token, UserRegister
from app.schemas.onboarding import StudentOnboard, TeacherOnboard, ParentOnboard
from app.core.exceptions import AuthException, AppException
from app.core.config import settings
from app.services.security import security_service
from sqlalchemy import or_, select
from app.schemas.auth import StudentRegistrationRequest


class AuthService:

    # =========================================================================
    #  STUDENT LOGIN — The ONLY authentication path for students.
    #
    #  Algorithm (exactly as required):
    #
    #  STEP 1  Student submits Email / Student ID + Password.
    #  STEP 2  Search students table (JOIN users for email + password).
    #          If NO record → HTTP 401, "Account Not Registered" message.
    #          Password is NEVER touched at this point.
    #  STEP 3  Record exists → check is_active on the linked User row.
    #          If inactive → HTTP 401, "Account Disabled" message.
    #  STEP 4  Account is active → verify bcrypt password.
    #          If wrong      → HTTP 401, "Incorrect Password" message.
    #          (Lockout after 5 consecutive failures.)
    #  STEP 5  Password correct → issue JWT, return Token.
    #
    #  ABSOLUTELY FORBIDDEN:
    #   • Creating a student account during login.
    #   • Auto-registering a student.
    #   • Using mock / hardcoded / demo credentials.
    #   • Skipping the database check.
    #   • Allowing login without a matching student row.
    # =========================================================================

    def authenticate(self, db: Session, payload: LoginRequest, ip: str = None, ua: str = None) -> Token:
        """
        Authenticate a student login request.

        The search target is the students table.  A student can identify
        themselves with either their Student ID (student_identifier) or the
        email address stored on their linked users row.  The two columns are
        joined automatically; no direct SQL is exposed to callers.

        Non-student roles (admin, teacher, parent) use a separate lookup path
        so their portals remain fully functional.
        """

        # ------------------------------------------------------------------
        # STEP 1 – Resolve which role this login attempt belongs to.
        # We do a quick User-only lookup first so non-student roles (admin,
        # teacher, parent) can bypass the strict Student-profile gate below.
        # ------------------------------------------------------------------
        candidate_user: User | None = db.execute(
            select(User).where(
                User.is_deleted == False,
                or_(
                    User.username == payload.username,
                    User.email    == payload.username,
                ),
            )
        ).scalar_one_or_none()

        candidate_role = (
            candidate_user.role.name
            if candidate_user and candidate_user.role
            else None
        )

        # ------------------------------------------------------------------
        # NON-STUDENT PATH (admin / teacher / parent)
        # These roles do not have a Student profile and are not subject to
        # the admin-provisioning gate.  Standard User-row authentication.
        # ------------------------------------------------------------------
        if candidate_role in ("admin", "teacher", "parent"):
            user = candidate_user  # already resolved above

            if not user.is_active:
                raise AuthException(
                    "Account Disabled. Your account has been disabled. "
                    "Please contact your School Administrator."
                )

            user = security_service.check_lockout(db, user.username)

            if not verify_password(payload.password, user.hashed_password):
                security_service.record_login_failure(db, user.username, ip, ua)
                if user.failed_login_attempts >= 5:
                    raise AuthException(
                        "Account locked out due to multiple failed login attempts. "
                        "Please try again in 15 minutes."
                    )
                raise AuthException("Incorrect password")

            role_name = user.role.name
            # In DEMO_MODE, teachers and parents access their portals directly
            # without authentication.  Admin MUST be allowed to obtain a real JWT
            # so protected write operations (e.g. registering students) work correctly.
            if settings.DEMO_MODE and role_name in ("teacher", "parent"):
                raise AuthException(
                    "This portal is available through Demo Mode. "
                    "Return to the portal chooser to continue."
                )

            security_service.reset_login_failures(db, user)
            security_service.log_audit(
                db, user_id=user.id, action="LOGIN_SUCCESS", status="SUCCESS",
                ip_address=ip, user_agent=ua,
            )
            access_token  = create_access_token(subject=user.id)
            refresh_token = create_refresh_token(subject=user.id)
            return Token(
                access_token=access_token,
                refresh_token=refresh_token,
                first_login=user.first_login,
                role=role_name,
            )

        # ------------------------------------------------------------------
        # STUDENT PATH
        #
        # STEP 2 – Search the students table.
        #
        # A student can identify with:
        #   • their Student ID  → students.student_identifier
        #   • their email       → users.email  (via JOIN)
        #   • their username    → users.username (= Student ID by convention)
        #
        # If NO matching student row is found we stop immediately.
        # Password is never touched.
        # ------------------------------------------------------------------
        student: Student | None = db.execute(
            select(Student)
            .join(User, Student.user_id == User.id)
            .where(
                Student.is_deleted == False,
                User.is_deleted    == False,
                or_(
                    Student.student_identifier == payload.username,
                    User.username              == payload.username,
                    User.email                 == payload.username,
                ),
            )
        ).scalar_one_or_none()

        if student is None:
            # Log the failed attempt (no user_id because we found nobody).
            security_service.log_audit(
                db,
                action="STUDENT_LOGIN_UNREGISTERED",
                status="FAILED",
                ip_address=ip,
                user_agent=ua,
                details=f"Unregistered login attempt: {payload.username}",
            )
            # Return the exact error message the frontend expects.
            raise AuthException(
                "Account Not Found. Your email address or Student ID has not been "
                "registered by your School Administrator. Please contact your School "
                "Administrator to create your account before attempting to sign in."
            )

        # From this point forward the identity is the student's User row.
        user: User = student.user

        # ------------------------------------------------------------------
        # STEP 3 – Check account status.
        # ------------------------------------------------------------------
        if not user.is_active:
            security_service.log_audit(
                db,
                user_id=user.id,
                action="STUDENT_LOGIN_DISABLED",
                status="FAILED",
                ip_address=ip,
                user_agent=ua,
                details=f"Login attempt on disabled student account: {payload.username}",
            )
            raise AuthException(
                "Account Disabled. Your student account has been disabled. "
                "Please contact your School Administrator."
            )

        # ------------------------------------------------------------------
        # STEP 4 – Lockout check (runs before password verification so a
        #          locked account never leaks timing information).
        # ------------------------------------------------------------------
        user = security_service.check_lockout(db, user.username)

        # ------------------------------------------------------------------
        # STEP 5 – Verify password using bcrypt.
        # ------------------------------------------------------------------
        if not verify_password(payload.password, user.hashed_password):
            security_service.record_login_failure(db, user.username, ip, ua)
            if user.failed_login_attempts >= 5:
                raise AuthException(
                    "Account locked out due to multiple failed login attempts. "
                    "Please try again in 15 minutes."
                )
            raise AuthException(
                "Incorrect Password. Please enter the correct password."
            )

        # ------------------------------------------------------------------
        # STEP 6 – Password correct.  Create JWT session and return tokens.
        # ------------------------------------------------------------------
        security_service.reset_login_failures(db, user)
        security_service.log_audit(
            db,
            user_id=user.id,
            action="STUDENT_LOGIN_SUCCESS",
            status="SUCCESS",
            ip_address=ip,
            user_agent=ua,
        )

        access_token  = create_access_token(subject=user.id)
        refresh_token = create_refresh_token(subject=user.id)

        return Token(
            access_token=access_token,
            refresh_token=refresh_token,
            first_login=user.first_login,
            role="student",
        )

    # =========================================================================
    #  ADMIN-ONLY STUDENT PROVISIONING
    #  The ONLY way a student account can be created in this system.
    # =========================================================================

    def register_student(self, db: Session, payload: StudentRegistrationRequest, admin_id) -> User:
        """
        Create the only permitted student account shape: an atomic User + Student row.

        Called exclusively from POST /auth/register-student (admin role required).
        Students cannot call this endpoint.  There is no self-registration path.
        """
        # Prevent duplicate Student ID or email.
        existing_user = db.execute(
            select(User).where(
                User.is_deleted == False,
                or_(User.username == payload.student_id, User.email == payload.email),
            )
        ).scalar_one_or_none()

        existing_student = db.execute(
            select(Student).where(
                Student.student_identifier == payload.student_id,
                Student.is_deleted == False,
            )
        ).scalar_one_or_none()

        if existing_user or existing_student:
            raise AppException(
                "A student account already exists with this Student ID or email address."
            )

        student_role = role_repo.get_by_name(db, "student")
        if not student_role:
            raise AppException("Student role is not configured in this system.")

        # Create User row.  Username = Student ID (used as login identifier).
        user = User(
            username=payload.student_id,
            email=str(payload.email),
            hashed_password=get_password_hash(payload.temporary_password),
            role_id=student_role.id,
            is_active=payload.is_active,
            first_login=True,
            created_by_id=admin_id,
        )
        db.add(user)
        db.flush()  # get user.id without committing

        # Create Student profile row — proves admin provisioning.
        student = Student(
            user_id=user.id,
            student_identifier=payload.student_id,
            full_name=payload.student_name,
            roll_number=payload.roll_number,
            class_name=payload.class_name,
            section=payload.section,
            parent_name=payload.parent_name,
            parent_phone=payload.parent_phone,
            parent_email=None,
        )
        db.add(student)
        db.commit()
        db.refresh(user)

        security_service.log_audit(
            db,
            user_id=admin_id,
            action="STUDENT_ACCOUNT_REGISTERED",
            status="SUCCESS",
            details=f"Admin provisioned student: {payload.student_id} ({payload.email})",
        )
        return user

    # =========================================================================
    #  GENERIC ACCOUNT REGISTRATION (admin / teacher / parent only)
    # =========================================================================

    def register(self, db: Session, payload: UserRegister) -> User:
        """Register a new non-student user account. Admin only. Self-registration blocked."""
        if settings.DEMO_MODE and payload.role_name.lower() != "student":
            raise AppException(
                "Demo Mode only provisions student accounts via the register-student endpoint."
            )

        existing_user = user_repo.get_by_username(db, payload.username)
        if existing_user:
            raise AppException("User ID already registered")

        role = role_repo.get_by_name(db, payload.role_name.lower())
        if not role:
            raise AppException(f"Role '{payload.role_name}' does not exist")

        hashed_password = get_password_hash(payload.password)
        new_user = User(
            username=payload.username,
            hashed_password=hashed_password,
            role_id=role.id,
            first_login=True,
        )
        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        # Provision stub profiles for onboarding
        if payload.role_name.lower() == "teacher":
            db.add(Teacher(user_id=new_user.id))
        elif payload.role_name.lower() == "parent":
            db.add(Parent(user_id=new_user.id))
        # NOTE: student accounts must NEVER be created via this generic endpoint.
        # Use register_student() instead.

        db.commit()
        db.refresh(new_user)
        return new_user

    # =========================================================================
    #  ONBOARDING — First-login profile completion
    # =========================================================================

    def onboard_student(self, db: Session, user: User, payload: StudentOnboard) -> User:
        """Complete student onboarding (password reset, profile details, face mesh)."""
        if not user.student_profile:
            raise AppException("Student profile not provisioned.")

        if payload.new_password != payload.confirm_password:
            raise AppException("Passwords do not match.")

        user.email                = payload.student_email
        user.hashed_password      = get_password_hash(payload.new_password)
        user.first_login          = False
        user.is_verified          = True

        student                   = user.student_profile
        student.full_name         = payload.full_name
        student.roll_number       = payload.roll_number
        student.class_name        = payload.class_name
        student.section           = payload.section
        student.parent_name       = payload.parent_name
        student.parent_phone      = payload.parent_phone
        student.parent_email      = payload.parent_email

        face = FaceEmbedding(
            user_id=user.id,
            embedding=payload.face_embedding,
            captured_angles=payload.captured_angles,
        )
        db.add(face)
        db.add(user)
        db.add(student)
        db.commit()
        db.refresh(user)

        security_service.log_audit(
            db, user_id=user.id,
            action="ONBOARDING_COMPLETED", status="SUCCESS",
            details="Student profile onboarded",
        )
        return user

    def onboard_teacher(self, db: Session, user: User, payload: TeacherOnboard) -> User:
        """Complete teacher onboarding."""
        if not user.teacher_profile:
            raise AppException("Teacher profile not provisioned.")

        user.email           = payload.email
        user.hashed_password = get_password_hash(payload.new_password)
        user.first_login     = False
        user.is_verified     = True

        teacher                  = user.teacher_profile
        teacher.full_name        = payload.full_name
        teacher.department       = payload.department
        teacher.subjects         = payload.subjects
        teacher.class_teacher_of = payload.class_teacher_of
        teacher.phone            = payload.phone

        if payload.face_embedding:
            db.add(FaceEmbedding(
                user_id=user.id,
                embedding=payload.face_embedding,
                captured_angles=1,
            ))

        db.add(user)
        db.add(teacher)
        db.commit()
        db.refresh(user)

        security_service.log_audit(
            db, user_id=user.id,
            action="ONBOARDING_COMPLETED", status="SUCCESS",
            details="Teacher profile onboarded",
        )
        return user

    def onboard_parent(self, db: Session, user: User, payload: ParentOnboard) -> User:
        """Complete parent onboarding."""
        if not user.parent_profile:
            raise AppException("Parent profile not provisioned.")

        user.email           = payload.email
        user.hashed_password = get_password_hash(payload.new_password)
        user.first_login     = False
        user.is_verified     = True

        parent              = user.parent_profile
        parent.full_name    = payload.full_name
        parent.relationship = payload.relationship
        parent.phone        = payload.phone

        db.add(user)
        db.add(parent)
        db.commit()
        db.refresh(user)

        security_service.log_audit(
            db, user_id=user.id,
            action="ONBOARDING_COMPLETED", status="SUCCESS",
            details="Parent profile onboarded",
        )
        return user

    # =========================================================================
    #  TOKEN REFRESH
    # =========================================================================

    def refresh_session(self, db: Session, refresh_token: str) -> Token:
        """Decode refresh token and issue new access + refresh tokens."""
        from jose import jwt, JWTError
        from app.core.config import settings
        try:
            payload    = jwt.decode(refresh_token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
            user_id    = payload.get("sub")
            token_type = payload.get("type")
            if not user_id or token_type != "refresh":
                raise AuthException("Invalid refresh token")
        except JWTError:
            raise AuthException("Invalid refresh token")

        user = user_repo.get(db, user_id)
        if not user:
            raise AuthException("User not found")

        role_name = user.role.name if user.role else "student"
        if settings.DEMO_MODE and role_name != "student":
            raise AuthException("This portal is available through Demo Mode.")

        new_access  = create_access_token(subject=user.id)
        new_refresh = create_refresh_token(subject=user.id)

        return Token(
            access_token=new_access,
            refresh_token=new_refresh,
            first_login=user.first_login,
            role=role_name,
        )


auth_service = AuthService()
