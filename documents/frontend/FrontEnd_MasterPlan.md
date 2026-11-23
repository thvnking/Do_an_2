# CineMind — Frontend Master Plan

**Version:** 1.0  
**Status:** Approved Product Direction  
**Project:** CineMind — Đồ án 2

## 1. Product Vision

CineMind is a cinema discovery and community platform where users can explore movies, publish reviews, write cinema articles, discuss films, and interact with an AI cinema assistant.

The product has four main pillars:

### 1.1 Movie Discovery
- Browse movies.
- Search movies.
- Filter by genre and other supported metadata.
- Sort and explore movie collections.
- View detailed movie information.

### 1.2 Movie Reviews
- Rate movies from 1 to 5 stars.
- Write and edit reviews according to business rules.
- Read community reviews.
- Like and discuss reviews where supported.

### 1.3 Cinema Blog and Community
- Browse published articles.
- Read blog details.
- Create and manage blog posts.
- Comment and reply to discussions.
- Like posts without duplicate likes.

### 1.4 CineMind AI
- Ask questions about movies.
- Discover films through conversation.
- Receive recommendations.
- Support personalized interactions for authenticated users where supported by the backend.

## 2. User Roles

### Guest
Can:
- Browse public pages.
- Discover movies.
- Read movie details.
- Read published blogs.
- Use general AI functionality if available.

Cannot:
- Publish reviews.
- Manage a personal watchlist.
- Create blogs.
- Comment or reply.
- Like community posts.
- Access personalized recommendations requiring authentication.

### User
Can:
- Access all Guest features.
- Manage profile information.
- Manage genre preferences if supported.
- Manage watchlist.
- Write and manage movie reviews.
- Create and manage blogs.
- Comment and reply.
- Like eligible posts.
- Use personalized AI features where supported.

### Admin
Can:
- Access Admin Dashboard.
- Manage users.
- Manage movies.
- Synchronize movie data from TMDB.
- Moderate blog submissions.
- View platform analytics.

Admin permissions must be enforced by the backend. Frontend route guards are not a substitute for server-side authorization.

## 3. Business Rules

The following rules must be preserved:

1. A user can have only one review for a specific movie.
2. Movie ratings use a 1–5 star scale.
3. Watchlist has two states: `WANT_TO_WATCH` and `WATCHED`.
4. Newly submitted blogs use `PENDING` status.
5. Only `PUBLISHED` blogs are publicly visible.
6. Blog comments support threaded replies.
7. A user cannot like the same post more than once.
8. Personalized features require authentication.
9. Admin operations require Admin authorization.

Do not invent additional status values or change these rules without confirmation.

## 4. Existing Technology Direction

The current project has been described as using:

- React.
- Vite.
- JavaScript.
- CSS.
- React Router.
- Node.js.
- Express.
- PostgreSQL.
- TMDB for movie data.
- Gemini API through the backend.
- JWT authentication.
- BCrypt password hashing.
- Docker and Render deployment.

Codex must verify the actual repository and configuration before assuming every item is already implemented.

Do not migrate frameworks or introduce a new styling system without approval.

## 5. Frontend Architecture

Suggested organization:

```text
src/
├── app/
├── assets/
├── components/
├── contexts/
├── features/
├── hooks/
├── layouts/
├── pages/
├── services/
├── styles/
└── utils/
```

Responsibilities:

- `app`: application setup and route configuration.
- `assets`: images, icons, fonts.
- `components`: reusable UI components.
- `contexts`: shared application state.
- `features`: feature-specific modules.
- `hooks`: reusable React hooks.
- `layouts`: public, auth, and admin layouts.
- `pages`: route-level pages.
- `services`: API communication.
- `styles`: global design system.
- `utils`: reusable helper functions.

This is a target structure, not permission to reorganize the existing repository blindly.

## 6. Application Layouts

### PublicLayout
For public movie, blog, and AI pages.

### AuthLayout
For login and registration pages.

### AdminLayout
For administration pages with a dedicated navigation system.

## 7. Frontend Quality Requirements

Every relevant page should support:
- Loading.
- Success.
- Empty.
- Error.
- Unauthorized.
- Not Found.

Forms should support validation, submission feedback, and disabled/loading states.

Responsive design must cover mobile, tablet, and desktop.

## 8. Implementation Roadmap

### Phase 1 — Design Foundation
- CSS tokens.
- Reset.
- Typography.
- Global styles.
- Utilities.
- Responsive foundations.

### Phase 2 — Shared Components
- Buttons.
- Inputs.
- Movie Card.
- Review Card.
- Blog Card.
- Rating.
- Modal.
- Toast.
- Skeleton.

### Phase 3 — Core Layouts
- PublicLayout.
- AuthLayout.
- AdminLayout.
- Navigation.
- User menu.

### Phase 4 — Homepage
- Hero.
- Featured movies.
- Trending movies.
- Community reviews.
- Latest blogs.
- AI introduction.

### Phase 5 — Main Product Pages
- Movie Discovery.
- Movie Detail.
- Blog Discovery.
- Blog Detail.
- Create/Edit Blog.
- Profile.
- Watchlist.
- Login/Register.
- AI Assistant.

### Phase 6 — Admin
- Dashboard.
- Users.
- Movies.
- Blog Moderation.
- Analytics.

### Phase 7 — Integration and QA
- Backend integration.
- Responsive testing.
- Accessibility.
- Error handling.
- Performance.
- Regression testing.

## 9. Design Direction

The approved direction is:

**Community Cinematic × Editorial Cinema**

Community is the core product experience. Editorial design is the visual language.

Detailed visual requirements are defined in `FRONTEND_DESIGN_SYSTEM.md`.

## 10. Decisions Requiring Confirmation

Do not treat these as approved requirements until explicitly decided:

- Whether editing a published blog sends it back to `PENDING`.
- Whether blog drafts are supported.
- Rich-text editor versus Markdown editor.
- Notification system.
- Public user profiles.
- Avatar upload.
- Follow system.
- Review moderation and reporting.
- Exact analytics KPIs.
- Pagination versus infinite scroll.
- Light mode support.

## 11. Definition of Done

A phase is complete only when:
- All required work in that phase is implemented.
- Existing functionality is preserved.
- Relevant tests and builds pass.
- Responsive behavior is verified.
- Known limitations are documented.
- The next phase can use the completed work without relying on unfinished foundations.