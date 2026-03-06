-- Add optimistic concurrency versioning and reviewer mutation audit events.
ALTER TABLE "Question"
ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 0;

DO $$
BEGIN
  CREATE TYPE "QuestionAuditAction" AS ENUM ('create', 'update', 'archive');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "QuestionAuditEvent" (
  "id" TEXT NOT NULL,
  "question_id" TEXT NOT NULL,
  "actor_id" INTEGER NOT NULL,
  "action" "QuestionAuditAction" NOT NULL,
  "before_json" JSONB,
  "after_json" JSONB,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "QuestionAuditEvent_pkey" PRIMARY KEY ("id")
);

DO $$
BEGIN
  ALTER TABLE "QuestionAuditEvent"
    ADD CONSTRAINT "QuestionAuditEvent_question_id_fkey"
    FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
  ALTER TABLE "QuestionAuditEvent"
    ADD CONSTRAINT "QuestionAuditEvent_actor_id_fkey"
    FOREIGN KEY ("actor_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE INDEX IF NOT EXISTS "QuestionAuditEvent_question_id_created_at_idx"
  ON "QuestionAuditEvent"("question_id", "created_at");
CREATE INDEX IF NOT EXISTS "QuestionAuditEvent_actor_id_created_at_idx"
  ON "QuestionAuditEvent"("actor_id", "created_at");
