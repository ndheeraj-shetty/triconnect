# Demo Mode authentication architecture

## Routing flow

```text
/ (portal chooser)
  ├─ Student Portal → /login → JWT student session → /dashboard/student
  ├─ Teacher Portal → /dashboard/teacher (demo data, no session)
  ├─ Admin Portal   → /dashboard/admin (demo data, no session)
  └─ Parent Portal  → /dashboard/parent (demo data, no session)
```

Every dashboard contains a floating **Switch Portal** action that returns to `/`.

## Frontend boundaries

- `src/lib/demo-mode.ts` is the only portal configuration and demo-profile module.
- `src/context/AuthContext.tsx` owns persisted JWT sessions and intentionally persists only `student` sessions.
- `src/app/login/page.tsx` is student-only. It accepts a student ID/email and password, with a Remember Me option.
- `src/app/dashboard/layout.tsx` guards `/dashboard/student/*` and sends unauthenticated visitors to `/login`. Teacher, Admin, and Parent routes resolve to local demo profiles.

## Backend boundary

`DEMO_MODE=true` is the default FastAPI setting. `AuthService.authenticate` and `refresh_session` issue tokens only to the student role in this mode. Set `DEMO_MODE=false` and `NEXT_PUBLIC_DEMO_MODE=false` to restore the normal multi-role authentication surface without altering dashboard pages.

The existing RBAC dependencies remain active for protected APIs. Demo dashboards use their built-in representative data when no API session is present, which keeps the presentation instant and avoids treating a demo identity as a real privileged credential.

## Student account lifecycle

Student accounts are provisioned only through the admin-protected `POST /api/v1/auth/register` endpoint. In Demo Mode it accepts only `role_name: "student"`; there is no public registration route or UI. The account uses a hashed temporary password and `first_login=true`, then the existing student onboarding endpoint records the replacement password and marks first login complete. The database migration `0003_student_account_lifecycle.sql` adds an optional student identifier and account creator reference; the `users` table already provides email, active status, hashed password, first-login state, and audit timestamps.
