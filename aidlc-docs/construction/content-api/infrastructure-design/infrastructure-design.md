# Infrastructure Design — Unit 3: content-api

## No New Services
All content-api components run in the existing `backend` Docker service. No Caddy, postgres, or frontend changes required.

## Component Mapping
| Component | Service |
|-----------|---------|
| `ContentService` | `backend` (in-process singleton) |
| `ContentController` | `backend` (Express route handler) |
| `devops-challenges/` content | Bind-mounted volume (read-only) |

## Volume (Unit 1 — unchanged)
`docker-compose.yml` already mounts the content directory:
```yaml
backend:
  volumes:
    - ../devops-challenges:/data/devops-challenges:ro
```
`CONTENT_PATH=/data/devops-challenges` in `.env`.

## Route Registration
New routes added to `index.ts` under the existing `app.use('/api', authenticate)` middleware — content routes are automatically protected.
