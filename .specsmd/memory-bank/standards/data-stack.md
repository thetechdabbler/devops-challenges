# Data Stack

## Overview
PostgreSQL database with Prisma ORM for type-safe data access.

## Database
PostgreSQL 16

Full relational database. Runs as a Docker container alongside the backend. Supports indexing, transactions, and complex queries needed for the interview bot's question filtering and session tracking.

> **Note**: Original standards specified SQLite. Decision updated 2026-03-06 to align with existing portal (Option A+). PostgreSQL is already provisioned and in use.

## ORM / Database Client
Prisma ORM

TypeScript-native ORM with a declarative schema (`schema.prisma`), auto-generated client, and migration tooling (`prisma migrate`). Already wired up in the existing portal.

## Decision Relationships
- PostgreSQL chosen over SQLite because the existing portal already uses it — avoids running two databases
- Prisma preferred for its migration workflow and generated types
- All new models (questions, question_topics, user_question_history) added to the existing `schema.prisma`
