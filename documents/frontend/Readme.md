# CineMind Frontend Documentation

**Project:** CineMind — Đồ án 2  
**Documentation Version:** 1.0  
**Status:** Approved direction, implementation specifications in progress.

## 1. Purpose

This folder contains the authoritative frontend planning, design, architecture, user-flow, and implementation documents for CineMind.

The documents are intended for:
- Developers.
- OpenAI Codex.
- Future contributors.
- Frontend testing and maintenance.

The frontend must follow the product requirements and design decisions documented here.

## 2. Project Overview

CineMind is a cinema discovery and community platform.

Its core experiences are:
1. Movie Discovery.
2. Movie Reviews and Ratings.
3. Cinema Blogs and Community Discussions.
4. CineMind AI.

CineMind is not a movie streaming platform.

Its purpose is to help users discover films, express opinions, share articles, and participate in a cinema-focused community.

## 3. Design Direction

**Community Cinematic × Editorial Cinema**

Core principle:

> Community is the soul. Editorial is the visual language.

- Community Cinematic: movie posters, ratings, reviews, watchlists, user profiles, and community activities.
- Editorial Cinema: elegant typography, cinematic imagery, magazine-like layouts, and thoughtful content presentation.

The visual direction combines community-oriented functionality with editorial presentation.

## 4. Document Index

| Document | Purpose |
|---|---|
| `FRONTEND_MASTER_PLAN.md` | Product vision, scope, architecture, and roadmap |
| `FRONTEND_SITEMAP.md` | Routes, navigation, and permissions |
| `FRONTEND_DESIGN_SYSTEM.md` | Visual identity, design tokens, components, and responsive rules |
| `FRONTEND_PAGE_SPECIFICATIONS.md` | Page-by-page UI and behavior requirements |
| `FRONTEND_USER_FLOWS.md` | Guest, User, and Admin journeys |
| `FRONTEND_API_INTEGRATION.md` | Backend integration and data handling |
| `CODEX_IMPLEMENTATION_GUIDE.md` | Implementation sequence and coding instructions |

## 5. Document Priority

When implementing the frontend, Codex must follow this priority:

1. Existing project behavior and verified backend contracts.
2. Existing product requirements and business rules.
3. `FRONTEND_MASTER_PLAN.md`.
4. `FRONTEND_SITEMAP.md`.
5. `FRONTEND_DESIGN_SYSTEM.md`.
6. `FRONTEND_PAGE_SPECIFICATIONS.md`.
7. `FRONTEND_USER_FLOWS.md`.
8. `FRONTEND_API_INTEGRATION.md`.
9. `CODEX_IMPLEMENTATION_GUIDE.md`.

If two documents conflict, do not silently choose one. Report the conflict and request clarification.

A newer explicitly approved decision overrides an older proposal.

## 6. Important Implementation Rules

- Inspect the existing repository before coding.
- Preserve existing working features.
- Keep React + Vite + JavaScript and the existing CSS approach unless explicitly approved otherwise.
- Do not replace real API data with demo data.
- Do not invent backend endpoints or response schemas.
- Do not change business rules without approval.
- Implement loading, empty, error, success, and unauthorized states.
- Ensure responsive behavior.
- Do not claim a feature is complete without testing it.

## 7. Implementation Strategy

Work incrementally:

1. Design Foundation.
2. Shared Components.
3. Core Layouts.
4. Homepage.
5. Remaining User-facing Pages.
6. API Integration and Feature Completion.
7. Admin Experience.
8. Responsive, Accessibility, and Final QA.

Each phase must be validated before moving to the next.

## 8. Definition of Done

A frontend task is complete only when:

- The implementation matches the relevant specifications.
- Existing functionality remains intact.
- API integration follows verified contracts.
- Loading and error states are handled.
- Responsive behavior is checked.
- Build and relevant tests pass.
- Any incomplete work or assumptions are documented.