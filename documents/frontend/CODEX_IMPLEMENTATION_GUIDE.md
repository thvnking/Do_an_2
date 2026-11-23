# CineMind — Codex Implementation Guide

**Version:** 1.0  
**Purpose:** Instructions for implementing the CineMind frontend incrementally.

## 1. Before Starting

Codex must inspect the repository before modifying files.

Read:
1. Root `README.md`.
2. `documents/CineMind_AI_Build_Spec.md`.
3. Frontend README.
4. Backend README.
5. `web/frontend/src/App.jsx`.
6. Existing stylesheets.
7. Existing route configuration.
8. Existing API services and data modules.

Then read all relevant files in `documents/frontend/`.

Do not assume the repository matches old documentation without verification.

## 2. Project Constraints

- Preserve React + Vite + JavaScript.
- Preserve the existing CSS approach.
- Do not migrate to Next.js.
- Do not migrate to Vue.
- Do not introduce TypeScript without approval.
- Do not introduce Tailwind without approval.
- Do not modify backend code during frontend-only tasks unless explicitly requested.
- Do not remove existing working features.
- Do not invent API endpoints.
- Do not expose API secrets.

## 3. Implementation Workflow

For every task:

1. Inspect relevant existing code.
2. Identify dependencies and affected files.
3. Compare implementation with product and design documentation.
4. Describe the intended changes briefly.
5. Implement the smallest coherent change.
6. Run relevant checks.
7. Review regressions.
8. Report files changed and remaining issues.

Do not rewrite large parts of the project when a focused change is sufficient.

## 4. Phase 1 — Design Foundation

### Scope
- CSS tokens.
- Reset.
- Typography.
- Global styles.
- Utilities.
- Responsive foundations.

### Target files

```text
src/styles/
  tokens.css
  reset.css
  typography.css
  global.css
  utilities.css
  index.css
```

### Requirements
- Centralize design tokens.
- Implement Community Cinematic × Editorial Cinema.
- Verify Vietnamese font rendering.
- Preserve existing component functionality.
- Import global styles exactly once.
- Avoid uncontrolled CSS overrides.

### Acceptance
- Build succeeds.
- Existing routes still work.
- Typography renders correctly.
- Responsive foundation works.
- No unintended layout regressions.

Do not proceed to Phase 2 until Phase 1 passes validation.

## 5. Phase 2 — Shared Components

Implement reusable components:

### Core
- Button.
- Input.
- Textarea.
- Select.
- Checkbox.
- Modal.
- Toast.
- Skeleton.
- Badge.
- Avatar.

### Movie
- MovieCard.
- MovieGrid.
- Rating.
- MoviePoster.
- MovieBackdrop.

### Community
- ReviewCard.
- ReviewForm.
- CommentItem.
- CommentThread.
- BlogCard.
- BlogAuthor.

### Requirements
- Components must have clear responsibilities.
- Support relevant interaction states.
- Use shared design tokens.
- Use real data props rather than embedded demo data.
- Provide accessible labels and keyboard interaction.
- Avoid unnecessary component abstraction.

Do not proceed until core components are reusable and validated.

## 6. Phase 3 — Core Layouts

Implement or consolidate:

- PublicLayout.
- AuthLayout.
- AdminLayout.
- PublicHeader.
- MobileNavigation.
- UserMenu.
- AdminSidebar.
- Footer.

Requirements:
- Correct navigation based on role.
- Active route indication.
- Responsive behavior.
- Protected navigation behavior.
- No duplicate layout markup across pages.

## 7. Phase 4 — Homepage

Implement the Home page according to the Page Specifications.

Required sections:
1. Cinematic Hero.
2. Featured Movies.
3. Trending Movies.
4. Genres.
5. Community Reviews.
6. Latest Blogs.
7. CineMind AI Introduction.
8. Personalized Recommendations when authenticated and supported.

Requirements:
- Strong visual hierarchy.
- Community and editorial balance.
- Reusable cards.
- Real API data when available.
- Loading, empty, and error states.

Validate at desktop, tablet, and mobile sizes.

## 8. Phase 5 — Main User Pages

Implement in this order:

1. Movie Discovery.
2. Movie Detail.
3. Blog Discovery.
4. Blog Detail.
5. Create Blog.
6. Edit Blog.
7. Profile.
8. Watchlist.
9. My Reviews.
10. My Blogs.
11. Login and Register.
12. CineMind AI.

Follow:
- `FRONTEND_PAGE_SPECIFICATIONS.md`
- `FRONTEND_USER_FLOWS.md`
- `FRONTEND_API_INTEGRATION.md`

Do not invent behavior for unresolved product decisions.

## 9. Phase 6 — Admin

Implement:
1. Dashboard.
2. User Management.
3. Movie Management.
4. Blog Moderation.
5. Analytics.

Requirements:
- Admin-specific layout.
- Verified backend permissions.
- Clear status indicators.
- Confirmation for destructive actions.
- Real metrics only.
- Error and loading handling.

## 10. Phase 7 — Quality Assurance

### Functional QA
- Navigation.
- Authentication.
- Route protection.
- Reviews.
- Watchlist.
- Blog submission.
- Blog moderation.
- Comments and replies.
- Likes.
- AI requests.
- Admin actions.

### Visual QA
- Color consistency.
- Typography.
- Spacing.
- Poster ratios.
- Image fallbacks.
- Component states.
- Responsive behavior.

### Technical QA
- Build.
- Relevant tests.
- Console errors.
- Network errors.
- API failures.
- CSS regressions.
- Accessibility checks.

## 11. Rules for Handling Unclear Requirements

If a requirement is unclear:

1. Check the project documentation.
2. Inspect existing code.
3. Inspect backend contracts.
4. Identify whether the behavior is confirmed or only proposed.
5. Do not silently invent a business rule.
6. Ask for clarification when the decision materially affects implementation.

## 12. Required Completion Report

After each phase, report:

### Summary
What was implemented.

### Files Created
List new files.

### Files Modified
List modified files.

### Preserved Features
List existing features verified as working.

### Validation
- Build result.
- Tests.
- Responsive checks.
- Relevant manual checks.

### Remaining Issues
List incomplete work and known limitations.

### Next Phase
State the next phase and its prerequisites.

## 13. Final Rule

Implement CineMind incrementally.

Do not attempt to rebuild the entire frontend in one operation.

The goal is not merely to produce visually attractive pages. The goal is a coherent, maintainable, responsive frontend that follows the product's business rules and works with the real backend.

The approved visual direction is:

**Community Cinematic × Editorial Cinema.**