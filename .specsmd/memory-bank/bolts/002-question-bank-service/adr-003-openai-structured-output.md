---
bolt: 002-question-bank-service
created: 2026-03-06T00:00:00Z
status: accepted
superseded_by: null
---

# ADR-003: OpenAI Structured Output via json_schema Mode

## Context

The interview bot generates questions by calling the OpenAI API. The response must contain a
specific set of fields (text, type, topics, difficulty, experience_level, answer, explanation,
key_concepts) in a predictable structure. There are three common approaches to enforcing this
structure:

1. **Prompt-instructed JSON**: Instruct the model to "respond in JSON with these fields" in the
   system prompt. Rely on the model following instructions.
2. **Function calling**: Define a function signature; the model's response is a structured
   function call argument.
3. **Structured output (`json_schema`)**: Pass a JSON Schema to `response_format`; the API
   guarantees the response conforms to the schema or returns an error.

The choice affects reliability, API surface area, and how future AI integrations in the system
should be built.

## Decision

Use OpenAI's **`response_format: { type: 'json_schema', json_schema: { ... } }`** (structured
output) for all question generation calls. The JSON schema defines the exact shape of the
`questions` array and each question object, including enum constraints on `type` and
`experience_level`.

## Rationale

Structured output is the only approach that provides an **API-level guarantee** that the
response conforms to the schema. Prompt-instructed JSON frequently produces valid prose that
wraps JSON (e.g., "Here is your JSON: ..."), extra commentary, or subtly wrong field names —
all of which require defensive parsing. Function calling works but introduces an extra layer
of abstraction that isn't needed here (we're not defining callable functions; we just want
structured data).

### Alternatives Considered

| Alternative | Pros | Cons | Why Rejected |
|-------------|------|------|--------------|
| Prompt-instructed JSON | Simple, no special API params | Model may add prose; field names can drift; requires defensive parsing and retries | Unreliable — parsing errors in production |
| Function calling | Structured, well-established pattern | Adds function-call abstraction layer; semantically odd (we're not calling a function) | Unnecessary complexity for data extraction use case |
| Structured output — json_schema (chosen) | API-level schema guarantee; parse errors are API errors not logic bugs; schema is self-documenting | Slightly more verbose setup; json_schema must be kept in sync with TypeScript types | None — chosen approach |

## Consequences

### Positive

- Zero defensive JSON parsing logic — if the API call succeeds, the shape is guaranteed
- Schema is explicit and version-controlled alongside the code
- Any new field added to `GeneratedQuestion` must also be added to the schema — forces consistency
- Establishes a clear pattern for all future OpenAI integrations in the system

### Negative

- `json_schema` must be manually kept in sync with the `GeneratedQuestion` TypeScript type
- Not all OpenAI models support structured output — model selection is constrained (gpt-4o, gpt-4o-mini supported)

### Risks

- **Schema drift**: If `GeneratedQuestion` gains a new required field but the schema is not updated, the API will not return the field. Mitigated by: keeping schema definition co-located with the type in `ai-generator.ts` and reviewing both together on type changes.
- **Model deprecation**: If gpt-4o-mini is deprecated without a structured-output replacement, the integration must be updated. Mitigated by: `OPENAI_MODEL` env var allows hot-swap without code changes.

## Related

- **Stories**: 003-openai-question-generation
- **Standards**: This pattern should be adopted as the standard for all future OpenAI integrations in this project
- **Previous ADRs**: ADR-002 (dual question types — the json_schema shape mirrors the full `Question` type, not `QuestionSummary`)
