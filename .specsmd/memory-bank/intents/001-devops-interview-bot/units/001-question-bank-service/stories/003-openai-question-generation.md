---
id: 003-openai-question-generation
unit: 001-question-bank-service
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 002-question-bank-service
implemented: true
---

# Story: 003-openai-question-generation

## User Story

**As a** interview session service
**I want** to generate new questions via OpenAI when the bank has insufficient coverage
**So that** users always receive the correct number of questions for their session config

## Acceptance Criteria

- [ ] **Given** a gap exists, **When** generateQuestionsViaAI(topic, difficulty, experience, count) is called, **Then** OpenAI returns `count` questions in the expected format
- [ ] **Given** the OpenAI prompt is sent, **When** the response is parsed, **Then** each question has: text, type (theory|scenario), topic, difficulty, experience_level, and a model answer with explanation
- [ ] **Given** OpenAI returns a response, **When** the response is parsed, **Then** questions are returned as structured objects (not raw text)
- [ ] **Given** OpenAI API is unavailable, **When** generation is attempted, **Then** the function throws a catchable error and the caller falls back gracefully
- [ ] **Given** generation is called, **When** the prompt is constructed, **Then** it includes context from the DevOps curriculum topics (referencing the relevant topic area)

## Technical Notes

- Use OpenAI Node.js SDK (`openai` npm package)
- Model: `gpt-4o` or `gpt-4o-mini` (configurable via env var OPENAI_MODEL)
- Prompt must specify: topic area, difficulty level, experience level, question type (theory/scenario), and request structured JSON output
- Use OpenAI's structured output (response_format: json_schema) to ensure parseable response
- Implement in `lib/question-bank/ai-generator.ts`
- API key from `OPENAI_API_KEY` env var — never hardcoded

## Dependencies

### Requires
- 001-question-schema-and-storage (needs Question type definition)

### Enables
- 004-generated-question-saved-to-bank

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| OpenAI returns malformed JSON | Parse error caught, throw structured error |
| OpenAI rate limit (429) | Throw rate limit error, caller handles gracefully |
| Topic has no DevOps curriculum match | Still generate — prompt covers general DevOps knowledge |

## Out of Scope

- Saving questions to DB (story 004)
- Deduplication (story 005)
