-- PostgreSQL migration for school-managed student account lifecycle.
ALTER TABLE users ADD COLUMN IF NOT EXISTS created_by_id uuid REFERENCES users(id);
ALTER TABLE students ADD COLUMN IF NOT EXISTS student_identifier varchar(100);
CREATE UNIQUE INDEX IF NOT EXISTS uq_students_student_identifier ON students(student_identifier) WHERE student_identifier IS NOT NULL;

-- Existing fields provide the remaining required lifecycle data:
-- users.username/email            -> Student ID or registered email
-- users.hashed_password           -> hashed temporary/password value
-- users.first_login               -> temporary-password completion state
-- users.is_active                 -> active/inactive account status
-- users.created_at/updated_at     -> audit timestamps
