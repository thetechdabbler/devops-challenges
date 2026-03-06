-- Ensure UUID generation is available for Prisma uuid defaults
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Enums required by interview/question-bank models
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuestionType') THEN
    CREATE TYPE "QuestionType" AS ENUM ('theory', 'scenario');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ExperienceLevel') THEN
    CREATE TYPE "ExperienceLevel" AS ENUM ('junior', 'mid', 'senior');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuestionSource') THEN
    CREATE TYPE "QuestionSource" AS ENUM ('bank', 'ai');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'QuestionStatus') THEN
    CREATE TYPE "QuestionStatus" AS ENUM ('pending_review', 'active', 'rejected');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Topic') THEN
    CREATE TYPE "Topic" AS ENUM ('Docker', 'Kubernetes', 'CI/CD', 'Ansible', 'IaC/Terraform', 'Observability', 'AWS', 'General');
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'InterviewSessionStatus') THEN
    CREATE TYPE "InterviewSessionStatus" AS ENUM ('in_progress', 'completed');
  END IF;
END $$;

-- Question bank tables
CREATE TABLE IF NOT EXISTS "Question" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "text" TEXT NOT NULL,
  "type" "QuestionType" NOT NULL,
  "difficulty" INTEGER NOT NULL,
  "experience_level" "ExperienceLevel" NOT NULL,
  "source" "QuestionSource" NOT NULL,
  "status" "QuestionStatus" NOT NULL DEFAULT 'active',
  "answer" TEXT NOT NULL,
  "explanation" TEXT NOT NULL,
  "key_concepts" TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewed_at" TIMESTAMP(3),
  "reviewed_by" INTEGER,
  CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "QuestionTopic" (
  "question_id" TEXT NOT NULL,
  "topic" "Topic" NOT NULL,
  CONSTRAINT "QuestionTopic_pkey" PRIMARY KEY ("question_id", "topic")
);

CREATE TABLE IF NOT EXISTS "UserQuestionHistory" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" INTEGER NOT NULL,
  "question_id" TEXT NOT NULL,
  "seen_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "UserQuestionHistory_pkey" PRIMARY KEY ("id")
);

-- Interview session tables
CREATE TABLE IF NOT EXISTS "InterviewSession" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "user_id" INTEGER NOT NULL,
  "topics" "Topic"[] NOT NULL,
  "difficulty" INTEGER NOT NULL,
  "experience_level" "ExperienceLevel" NOT NULL,
  "question_count" INTEGER NOT NULL,
  "status" "InterviewSessionStatus" NOT NULL DEFAULT 'in_progress',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "completed_at" TIMESTAMP(3),
  CONSTRAINT "InterviewSession_pkey" PRIMARY KEY ("id")
);

CREATE TABLE IF NOT EXISTS "InterviewSessionQuestion" (
  "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
  "session_id" TEXT NOT NULL,
  "question_id" TEXT NOT NULL,
  "sequence_order" INTEGER NOT NULL,
  "answer_revealed" BOOLEAN NOT NULL DEFAULT false,
  "self_rating" INTEGER,
  "revealed_at" TIMESTAMP(3),
  CONSTRAINT "InterviewSessionQuestion_pkey" PRIMARY KEY ("id")
);

-- Constraints
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'Question_reviewed_by_fkey') THEN
    ALTER TABLE "Question"
      ADD CONSTRAINT "Question_reviewed_by_fkey"
      FOREIGN KEY ("reviewed_by") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'QuestionTopic_question_id_fkey') THEN
    ALTER TABLE "QuestionTopic"
      ADD CONSTRAINT "QuestionTopic_question_id_fkey"
      FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserQuestionHistory_user_id_fkey') THEN
    ALTER TABLE "UserQuestionHistory"
      ADD CONSTRAINT "UserQuestionHistory_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'UserQuestionHistory_question_id_fkey') THEN
    ALTER TABLE "UserQuestionHistory"
      ADD CONSTRAINT "UserQuestionHistory_question_id_fkey"
      FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InterviewSession_user_id_fkey') THEN
    ALTER TABLE "InterviewSession"
      ADD CONSTRAINT "InterviewSession_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InterviewSessionQuestion_session_id_fkey') THEN
    ALTER TABLE "InterviewSessionQuestion"
      ADD CONSTRAINT "InterviewSessionQuestion_session_id_fkey"
      FOREIGN KEY ("session_id") REFERENCES "InterviewSession"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'InterviewSessionQuestion_question_id_fkey') THEN
    ALTER TABLE "InterviewSessionQuestion"
      ADD CONSTRAINT "InterviewSessionQuestion_question_id_fkey"
      FOREIGN KEY ("question_id") REFERENCES "Question"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
  END IF;
END $$;

-- Uniques
CREATE UNIQUE INDEX IF NOT EXISTS "InterviewSessionQuestion_session_id_sequence_order_key"
  ON "InterviewSessionQuestion"("session_id", "sequence_order");

CREATE UNIQUE INDEX IF NOT EXISTS "InterviewSessionQuestion_session_id_question_id_key"
  ON "InterviewSessionQuestion"("session_id", "question_id");

-- Indexes
CREATE INDEX IF NOT EXISTS "Question_status_idx" ON "Question"("status");
CREATE INDEX IF NOT EXISTS "Question_difficulty_idx" ON "Question"("difficulty");
CREATE INDEX IF NOT EXISTS "Question_status_difficulty_experience_level_idx"
  ON "Question"("status", "difficulty", "experience_level");
CREATE INDEX IF NOT EXISTS "QuestionTopic_topic_idx" ON "QuestionTopic"("topic");
CREATE INDEX IF NOT EXISTS "UserQuestionHistory_user_id_idx" ON "UserQuestionHistory"("user_id");
CREATE INDEX IF NOT EXISTS "UserQuestionHistory_user_id_question_id_idx" ON "UserQuestionHistory"("user_id", "question_id");
CREATE INDEX IF NOT EXISTS "InterviewSession_user_id_idx" ON "InterviewSession"("user_id");
CREATE INDEX IF NOT EXISTS "InterviewSession_user_id_status_idx" ON "InterviewSession"("user_id", "status");
CREATE INDEX IF NOT EXISTS "InterviewSessionQuestion_session_id_idx" ON "InterviewSessionQuestion"("session_id");
