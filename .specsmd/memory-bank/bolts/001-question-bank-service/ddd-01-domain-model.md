---
stage: domain-model
bolt: 001-question-bank-service
created: 2026-03-06T00:00:00Z
---

# Static Domain Model: question-bank-service (Bolt 001)

## Entities

- **Question**: The core domain object. Represents a single DevOps interview question that can be served in a session.
  - Properties: `id` (UUID), `text` (string), `type` (QuestionType), `difficulty` (1–5), `experienceLevel` (ExperienceLevel), `source` (QuestionSource), `status` (QuestionStatus), `answer` (string), `explanation` (string), `keyConcepts` (string[]), `createdAt` (Date)
  - Business Rules:
    - Must have at least one topic (via QuestionTopic)
    - `text` must be non-empty
    - `difficulty` must be between 1 and 5 (inclusive)
    - `answer` and `explanation` must be non-empty before a question can become `active`
    - Only `active` questions are eligible for session delivery
    - `pending_review` questions are visible only to admins

- **QuestionTopic**: Junction entity that associates a Question with one or more Topics. Enables multi-topic questions.
  - Properties: `questionId` (FK → Question), `topic` (Topic enum)
  - Business Rules:
    - A Question must have at least 1 QuestionTopic entry
    - A Question can be associated with multiple topics (no upper limit)
    - Deleting a Question cascades to its QuestionTopic entries

- **UserQuestionHistory**: Tracks which questions a user has been served, for deduplication.
  - Properties: `id` (UUID), `userId` (string), `questionId` (FK → Question), `seenAt` (Date)
  - Business Rules:
    - A (userId, questionId) pair recorded when a session is created (not when answered)
    - Used to exclude questions seen within the last 30 days for that user
    - No unique constraint on (userId, questionId) — a user may be shown the same question after 30 days

---

## Value Objects

- **QuestionType**: Discriminated enum classifying the nature of the question.
  - Values: `theory` | `scenario`
  - Constraints: Immutable once set on a Question

- **Topic**: Enum of DevOps subject areas drawn from the DevOps curriculum.
  - Values: `Docker` | `Kubernetes` | `CI/CD` | `Ansible` | `IaC/Terraform` | `Observability` | `AWS` | `General`
  - Constraints: Fixed set — no custom topics in v1

- **ExperienceLevel**: Target seniority for the question.
  - Values: `junior` | `mid` | `senior`
  - Constraints: Immutable once set

- **QuestionSource**: Origin of the question.
  - Values: `bank` (manually seeded) | `ai` (OpenAI-generated)
  - Constraints: Set at creation, never changed

- **QuestionStatus**: Lifecycle state of a question.
  - Values: `pending_review` | `active` | `rejected`
  - Transitions:
    - `pending_review` → `active` (admin approves)
    - `pending_review` → `rejected` (admin rejects)
    - `active` → `rejected` (admin deactivates — future concern)
  - Constraints: Only `active` questions served to users; `rejected` questions retained for audit

- **SessionConfig**: Value object capturing the parameters of a session request.
  - Properties: `topics` (Topic[]), `difficulty` (1–5), `experienceLevel` (ExperienceLevel), `count` (5–20)
  - Constraints: `topics` must be non-empty; `count` clamped to [5, 20]

- **QuestionFetchResult**: Value object returned by the retrieval operation.
  - Properties: `questions` (Question[]), `gapCount` (number)
  - `gapCount` = count requested minus questions found after dedup — signals how many must be generated

---

## Aggregates

- **Question Aggregate** (root: Question)
  - Members: Question + QuestionTopic entries (1..N)
  - Invariants:
    - Must have ≥1 QuestionTopic when persisted
    - `answer` and `explanation` non-empty before status can become `active`
    - Status transitions follow defined lifecycle (pending_review → active/rejected)
  - Operations on aggregate: `activate()`, `reject()`, `updateText(text)`

- **UserQuestionHistory** is a standalone entity (no aggregate root) — simple append-only log

---

## Domain Events

- **QuestionGenerated**: Fired when OpenAI successfully generates and returns question data.
  - Trigger: OpenAI API returns valid structured response
  - Payload: `{ text, type, topics, difficulty, experienceLevel, answer, explanation, keyConcepts, source: 'ai' }`
  - Note: Event is internal (not published externally in v1) — generation and save happen in same transaction

- **QuestionActivated**: Fired when an admin approves a pending_review question.
  - Trigger: Admin calls `reviewQuestion(id, 'approve')`
  - Payload: `{ questionId, activatedAt }`

- **QuestionRejected**: Fired when an admin rejects a pending_review question.
  - Trigger: Admin calls `reviewQuestion(id, 'reject')`
  - Payload: `{ questionId, rejectedAt }`

- **UserQuestionHistoryRecorded**: Fired when a user's session is created and questions are assigned.
  - Trigger: `getQuestionsForSession` completes and questions are returned
  - Payload: `{ userId, questionIds[], seenAt }`

---

## Domain Services

- **QuestionBankService**: Orchestrates the hybrid question retrieval flow. Lives in `lib/question-bank/`.
  - Operation: `getQuestionsForSession(config: SessionConfig, userId: string): Promise<QuestionFetchResult>`
  - Responsibility:
    1. Queries QuestionRepository for active questions matching config
    2. Passes candidates to DeduplicationService to filter already-seen questions
    3. Calculates gapCount
    4. Returns result (gap filled by caller — Bolt 002 adds AI generation here)
  - Dependencies: QuestionRepository, DeduplicationService

- **DeduplicationService**: Filters questions a user has seen in the last 30 days. Lives in `lib/question-bank/`.
  - Operation: `filterUnseen(userId: string, candidates: Question[]): Promise<Question[]>`
  - Responsibility: Queries UserQuestionHistoryRepository, returns only questions not seen in last 30 days
  - Dependencies: UserQuestionHistoryRepository

---

## Repository Interfaces

- **IQuestionRepository**: Contract for Question persistence.
  - `findByConfig(topics: Topic[], difficulty: number, experienceLevel: ExperienceLevel, type?: QuestionType, status?: QuestionStatus): Promise<Question[]>`
    - Returns active questions matching any of the given topics (ANY-match, not ALL-match)
    - JOINs question_topics, uses DISTINCT to avoid duplicates from multi-topic questions
  - `findById(id: string): Promise<Question | null>`
  - `save(question: Question): Promise<Question>` — insert or update
  - `saveBatch(questions: Question[]): Promise<Question[]>` — batch insert for AI generation
  - `updateStatus(id: string, status: QuestionStatus): Promise<Question>`
  - `updateText(id: string, text: string): Promise<Question>`
  - `getStats(): Promise<BankStats>`

- **IUserQuestionHistoryRepository**: Contract for seen-question tracking.
  - `recordSeen(userId: string, questionIds: string[]): Promise<void>` — batch insert
  - `getSeenQuestionIds(userId: string, since: Date): Promise<string[]>` — returns IDs seen since date

---

## Ubiquitous Language

- **Question Bank**: The persistent store of all interview questions (active, pending, rejected)
- **Active Question**: A question with `status=active` — eligible to be served in sessions
- **Pending Question**: A question with `status=pending_review` — AI-generated, awaiting admin approval
- **Gap**: The number of questions still needed after the bank and dedup have been exhausted for a session config; triggers AI generation
- **Session Config**: The combination of topics, difficulty, experience level, and count that defines a user's interview request
- **Deduplication Window**: The 30-day rolling period during which a user will not see the same question twice
- **Multi-topic Question**: A question associated with more than one Topic via the QuestionTopic junction — relevant to users who select either topic
- **Topic (ANY-match)**: When filtering, a question matches if it has ANY of the user's selected topics (not all)
- **Bank-first**: The retrieval strategy of always querying the question bank before calling OpenAI
- **Gap-fill**: The act of calling OpenAI to generate the missing questions when the bank cannot satisfy the full session request
