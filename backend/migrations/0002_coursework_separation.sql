-- PostgreSQL migration: separate Learning Quest from Homework Management.
-- Run with the application's migration runner, after the base school tables exist.

ALTER TABLE learning_quests ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES teachers(id);
ALTER TABLE learning_quests ADD COLUMN IF NOT EXISTS status varchar(24) NOT NULL DEFAULT 'draft';
ALTER TABLE learning_quests ADD COLUMN IF NOT EXISTS number_of_levels integer NOT NULL DEFAULT 4;
ALTER TABLE learning_quest_questions ADD COLUMN IF NOT EXISTS source_reference text NOT NULL DEFAULT '';
ALTER TABLE learning_quest_questions ADD COLUMN IF NOT EXISTS source_confidence numeric(5,2);
ALTER TABLE learning_quest_questions ADD COLUMN IF NOT EXISTS explanation text;

ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS teacher_id uuid REFERENCES teachers(id);
ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS allowed_submission_types jsonb NOT NULL DEFAULT '["PDF"]'::jsonb;
ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS max_file_size_bytes bigint NOT NULL DEFAULT 26214400;
ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS max_file_count integer NOT NULL DEFAULT 3;
ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS allow_multiple_files boolean NOT NULL DEFAULT true;
ALTER TABLE homeworks ADD COLUMN IF NOT EXISTS allow_resubmission boolean NOT NULL DEFAULT true;

ALTER TABLE submission_files ADD COLUMN IF NOT EXISTS original_filename varchar(512);
ALTER TABLE submission_files ADD COLUMN IF NOT EXISTS mime_type varchar(128);
ALTER TABLE submission_files ADD COLUMN IF NOT EXISTS size_bytes bigint;
ALTER TABLE submission_files ADD COLUMN IF NOT EXISTS storage_key varchar(1024);

CREATE INDEX IF NOT EXISTS idx_learning_quests_subject_status ON learning_quests(subject_id, status);
CREATE INDEX IF NOT EXISTS idx_quest_attempts_student_level ON learning_quest_attempts(student_id, level_id);
CREATE INDEX IF NOT EXISTS idx_homeworks_deadline ON homeworks(submission_deadline);
CREATE INDEX IF NOT EXISTS idx_homework_submissions_lookup ON homework_submissions_new(homework_id, student_id);
