---
stage: domain-model
bolt: 002-question-bank-service
created: 2026-03-06T00:00:00Z
---

# Static Model: AI Question Generation Layer (Bolt 002)

## Context

This model extends the Question Bank domain from Bolt 001 with AI generation capability.
Deduplication (Story 005) was implemented in Bolt 001 as foundational infrastructure and is
confirmed here. The new domain concepts introduced in this bolt are the AI generation layer
and the hybrid orchestration flow.

## Entities

- **GeneratedQuestion** (transient — pre-persistence): `text`, `type`, `topics[]`, `difficulty`, `experienceLevel`, `answer`, `explanation`, `keyConcepts` — Business rules: topics.length >= 1, difficulty 1–5, text non-empty

## Value Objects

- **GenerationConfig**: `{ topics: Topic[], difficulty: number, experienceLevel: ExperienceLevel, count: number }` — Immutable request spec; count must be > 0
- **GenerationResult**: `{ questions: GeneratedQuestion[], requestedCount: number }` — Output of one generation call; questions.length may be < requestedCount on partial failure
- **SaveMode**: `session` (status=active) | `admin` (status=pending_review) — Determines how generated questions enter the bank

## Aggregates

- **QuestionBank** (aggregate root — extended from Bolt 001): Members: Question[], QuestionTopic[], UserQuestionHistory[]. New invariant: AI-generated questions are persisted before being returned — no ephemeral delivery

## Domain Events

- **QuestionsGenerated**: Trigger: AIQuestionGenerator.generate() completes — Payload: `{ questions: GeneratedQuestion[], config: GenerationConfig }`
- **QuestionsPersistedToBank**: Trigger: saveBatch() succeeds — Payload: `{ questionIds: string[], saveMode: SaveMode }`
- **GapFillCompleted**: Trigger: getQuestionsForSession() returns after AI gap-fill — Payload: `{ served: number, fromBank: number, fromAI: number }`

## Domain Services

- **AIQuestionGenerator**: Operations: `generate(config: GenerationConfig): Promise<GenerationResult>` — Dependencies: OpenAI SDK, OPENAI_API_KEY env — Responsibility: structured prompt, parse/validate response, throw typed errors
- **QuestionBankService** (extended): Full hybrid flow — bank → dedup → gap-fill → save → merge → return

## Repository Interfaces

- **IQuestionRepository** (extended): `saveBatch(questions, saveMode): Promise<string[]>` — saveMode controls status field
- **IUserQuestionHistoryRepository** (unchanged from Bolt 001): `findRecentIds`, `recordSeen`

## Ubiquitous Language

- **Gap**: Count by which bank candidates (after dedup) fall short of session count
- **Gap-fill**: Calling OpenAI to generate questions covering the gap
- **Save mode**: `session` = auto-active, `admin` = pending_review
- **Hybrid flow**: bank lookup → dedup → gap detection → AI generation → save → merge → return
- **GenerationConfig**: Full specification for one AI generation call
- **Structured output**: OpenAI response_format:json_schema — guarantees parseable fixed-schema JSON
