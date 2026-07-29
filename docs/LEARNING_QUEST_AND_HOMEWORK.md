# Learning Quest and Homework

triconnect exposes two independent coursework modules. They share identity, subjects, classes, notifications, and audit logging only. Their data, APIs, permissions, and UI are not interchangeable.

## Learning Quest

Learning Quest is an interactive, AI-generated learning path. A teacher supplies source material and configuration; the generation service extracts text, chunks it by concept, maps chunks to learning objectives, and creates a reviewed level plan. Every question stores a source reference and confidence score. Publishing is blocked when a question cannot be grounded in an uploaded source.

Students complete sequential levels in the browser. Completion records stars, accuracy, time, XP, coins, and badges. An adaptive policy uses the most recent attempts to select hints, revision content, or a more challenging generated item. Quest submissions never accept files.

Core API contract (all requests require bearer authentication):

| Endpoint | Role | Purpose |
| --- | --- | --- |
| `POST /api/v1/learning-quests` | teacher | Create a source-bound quest draft |
| `POST /api/v1/learning-quests/{id}/materials` | teacher | Upload a source document |
| `POST /api/v1/learning-quests/{id}/generate` | teacher | Queue content generation |
| `POST /api/v1/learning-quests/{id}/publish` | teacher | Publish validated levels |
| `GET /api/v1/learning-quests/{id}/analytics` | teacher | Completion, score, time, concepts, and help signals |
| `GET /api/v1/student/learning-quests` | student | Fetch only assigned, unlocked levels |
| `POST /api/v1/quest-levels/{id}/attempts` | student | Record an evaluated interactive attempt |

## Homework

Homework is a conventional task-management workflow. Teachers define instructions, deadlines, allowed file or link types, grading, and rubric. Students submit files, text, GitHub or Drive links, and comments. Teachers review, annotate, request resubmission, approve, and grade. This module contains no XP, coins, badges, hearts, or level locks.

| Endpoint | Role | Purpose |
| --- | --- | --- |
| `POST /api/v1/homework` | teacher | Create homework and submission policy |
| `POST /api/v1/homework/{id}/attachments` | teacher | Upload reference material |
| `GET /api/v1/homework` | student/teacher | List scoped homework cards |
| `POST /api/v1/homework/{id}/submissions` | student | Create or replace an allowed submission |
| `GET /api/v1/homework/{id}/submissions` | teacher | View review queue |
| `POST /api/v1/homework/submissions/{id}/review` | teacher | Save feedback, annotations, approval, or resubmission request |
| `POST /api/v1/homework/submissions/{id}/grade` | teacher | Save marks, grade, or completed-only result |

## Guardrails

- Validate MIME type, extension, file count, byte limit, virus scan result, and signed upload owner before accepting homework files.
- Store files in private object storage; issue short-lived signed preview/download URLs after authorization checks.
- Never send teacher source material to an LLM without tenant-scoped retrieval and an explicit source citation requirement.
- Use background jobs for extraction and generation. Persist job status and make publishing idempotent.
- Enforce role, school, class, and subject scoping in every query; write audit events for publish, review, grade, and resubmission actions.
- Trigger notifications for assignment, deadline reminders, submission, late submission, review, grading, and resubmission.

## Frontend routes

- Student Quest: `/dashboard/student/assignments`
- Teacher Quest Studio: `/dashboard/teacher/quests`
- Student Homework: `/dashboard/student/homework`
- Teacher Homework Manager: `/dashboard/teacher/homework`

The Quest pages intentionally use vibrant progression and reward language. Homework uses neutral cards, deadlines, and review controls so it remains a professional workflow.
