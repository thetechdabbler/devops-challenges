-- Add explicit reviewer role to support reviewer-only question management.
ALTER TYPE "UserRole" ADD VALUE IF NOT EXISTS 'reviewer';
