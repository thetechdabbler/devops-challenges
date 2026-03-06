---
id: 001-session-setup-ui
unit: 003-devops-interview-bot-ui
intent: 001-devops-interview-bot
status: complete
priority: must
created: 2026-03-06T00:00:00.000Z
assigned_bolt: 007-devops-interview-bot-ui
implemented: true
---

# Story: 001-session-setup-ui

## User Story

**As an** authenticated user
**I want** a clear setup form to configure my interview session
**So that** I can start a focused, relevant mock interview quickly

## Acceptance Criteria

- [ ] **Given** I navigate to /interview/new, **When** the page loads, **Then** I see topic checkboxes, difficulty slider, experience selector, and question count picker
- [ ] **Given** I have not selected any topics, **When** I click "Start Interview", **Then** an inline error appears: "Select at least one topic"
- [ ] **Given** I fill in a valid config, **When** I click "Start Interview", **Then** a POST to /api/v1/sessions is made and I am redirected to /interview/:sessionId
- [ ] **Given** the API is loading, **When** the button is clicked, **Then** the button shows a loading state and is disabled to prevent double-submit
- [ ] **Given** the API returns an error, **When** the error is caught, **Then** a toast notification shows the error message

## Technical Notes

- Route: app/(protected)/interview/new/page.tsx
- Components: shadcn Checkbox (multi-select topics), Slider (difficulty 1-5), RadioGroup (experience), Input (question count)
- Topics: Docker, Kubernetes, CI/CD, Ansible, IaC/Terraform, Observability, AWS, General DevOps
- Difficulty slider labels: 1=Beginner, 2=Easy, 3=Intermediate, 4=Hard, 5=Expert

## Dependencies

### Requires
- None

### Enables
- 002-interview-question-ui

## Edge Cases

| Scenario | Expected Behavior |
|----------|-------------------|
| User not logged in | Redirect to /login (middleware handles) |
| Network error on submit | Toast error, form stays filled |

## Out of Scope

- Saving draft configurations
