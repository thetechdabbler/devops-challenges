# UX Guide

## Overview
Desktop-first UI built with shadcn/ui and Tailwind CSS, targeting WCAG 2.1 AA accessibility compliance.

## Design System / Component Library
shadcn/ui

Copy-paste component library built on Radix UI primitives and Tailwind CSS. Components are owned by the project (not a node_modules dependency) — fully customizable. Radix handles accessibility primitives (focus management, ARIA, keyboard navigation).

Install components via: `npx shadcn@latest add <component>`

Component location: `components/ui/` (shadcn defaults)
Custom components: `components/` (project-specific)

## Styling Approach
Tailwind CSS

Utility-first CSS framework. All styling via Tailwind classes. No separate CSS files except for global styles in `app/globals.css`.

Conventions:
- Use Tailwind's design tokens (spacing, color, typography) — avoid arbitrary values
- Extract repeated class combinations into components, not CSS classes
- `cn()` utility (from `lib/utils.ts`) for conditional class merging

## Accessibility Standards
WCAG 2.1 AA

- shadcn/ui components are AA-compliant by default via Radix primitives
- All images require meaningful `alt` text
- Interactive elements must be keyboard-navigable
- Color contrast ratio minimum 4.5:1 for normal text, 3:1 for large text
- Use semantic HTML elements (`nav`, `main`, `section`, `button`) over generic `div`

## Responsive Design Strategy
Desktop-first

Primary target is desktop (1280px+). Tailwind breakpoints used to adapt for smaller screens where needed, but mobile is not the primary concern.

Breakpoint usage: `lg:` and above for primary layouts, `md:` for tablet adaptations.
