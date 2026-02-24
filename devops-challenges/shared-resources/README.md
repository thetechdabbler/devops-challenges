# Shared Resources

This directory contains assets used across multiple challenge topics.

## Contents

### `app/`

A minimal Python Flask web application. This is the app you will containerize, deploy, monitor, and automate throughout the entire repo.

See [`app/README.md`](./app/README.md) for endpoints, environment variables, and run instructions.

---

## Why One Shared App?

Real DevOps work doesn't happen in isolation. You containerize the same app you later deploy to Kubernetes, build a CI pipeline for, monitor in Grafana, and provision infrastructure for on AWS. Using one consistent app throughout this repo means:

- Skills connect across topics
- You see how each tool fits into the bigger picture
- Exercises feel like a real project, not isolated drills
