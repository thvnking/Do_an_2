# CineMind — Frontend Page Specifications

**Version:** 1.0

This document defines the content hierarchy, components, and expected behavior of each frontend page.

## 1. Global Page Requirements

Every page must define:
- Page title.
- Main content hierarchy.
- Reusable components.
- Loading state.
- Empty state.
- Error state.
- Responsive behavior.
- Required authentication.
- Relevant navigation.

Do not build pages as isolated visual mockups. They must use the shared Design System.

## 2. Home — `/`

**Goal:** Introduce CineMind and direct users into movie discovery and community content.

Sections:
1. Cinematic Hero.
2. Featured Movies.
3. Trending Movies.
4. Browse by Genre.
5. Community Reviews.
6. Latest Cinema Blogs.
7. CineMind AI Introduction.
8. Personalized Recommendations when authenticated.

Components:
- Hero.
- Movie Card.
- Review Card.
- Blog Card.
- Section Header.
- CTA Button.

Visual direction: Editorial Cinema + Community.

## 3. Movie Discovery — `/movies`

**Goal:** Help users find movies.

Components:
- Search Bar.
- Genre Filter.
- Additional supported filters.
- Sort Control.
- Movie Grid.
- Pagination or Load More.

Behavior:
- Search and filters should update displayed results.
- Preserve filter state in URL query parameters where appropriate.
- Show empty state when no movie matches.
- Do not invent movie metadata.

Visual direction: Community Cinematic.

## 4. Movie Detail — `/movies/:id`

**Goal:** Present movie information and community interaction.

Content:
1. Backdrop Hero.
2. Poster and movie information.
3. Overview.
4. Cast and Crew.
5. Trailer when available.
6. Rating summary.
7. User review action.
8. Community reviews.
9. Related movies.
10. AI movie discussion.

Interactions:
- Add/remove from watchlist for authenticated users.
- Submit or update review according to the one-review-per-user-per-movie rule.
- Open discussion and related content.
- Prompt unauthenticated users to log in for restricted actions.

Visual direction: Hybrid Community + Editorial.

## 5. Blog Discovery — `/blogs`

**Goal:** Discover published cinema articles.

Sections:
- Featured article.
- Category navigation when supported.
- Latest articles.
- Blog grid.
- Pagination or Load More.

Only `PUBLISHED` articles are publicly visible.

Visual direction: Editorial Cinema.

## 6. Blog Detail — `/blogs/:id`

**Goal:** Provide a comfortable long-form reading experience.

Content:
- Article title.
- Author.
- Publication date.
- Cover image.
- Article content.
- Like action.
- Comments.
- Threaded replies.
- Related articles.

Only published articles are publicly accessible.

Visual direction: Digital Cinema Magazine.

## 7. Create Blog — `/blogs/create`

**Access:** Authenticated User.

Form:
- Title.
- Excerpt if supported.
- Cover image if supported.
- Category if supported.
- Article content.
- Submit action.

Business rule:
- A newly submitted blog uses `PENDING` status.

Draft support is not confirmed. Do not implement draft persistence until the product requirement and backend support are verified.

## 8. Edit Blog — `/blogs/:id/edit`

**Access:** Owner or authorized Admin.

Requirements:
- Load the existing article.
- Validate ownership.
- Pre-fill existing content.
- Show save feedback.
- Handle API errors.

The effect of editing an already published article on its publication status is not yet confirmed. Do not invent this behavior.

## 9. Login — `/login`

Form:
- Email or supported login identifier.
- Password.
- Submit button.
- Link to registration.

States:
- Validation errors.
- Loading.
- Invalid credentials.
- Server error.
- Successful login.

Never store passwords in local storage.

## 10. Register — `/register`

Form fields must follow the verified backend contract.

Expected UI:
- Registration fields.
- Validation feedback.
- Password visibility control if appropriate.
- Submit state.
- Link to login.

Do not assume extra profile fields without checking the API.

## 11. User Profile — `/profile`

**Access:** Authenticated User.

Sections:
- Avatar.
- Username and profile information.
- Genre preferences if supported.
- Review history.
- Blog activity.
- Watchlist summary.

Profile editing must follow actual backend capabilities.

## 12. Watchlist — `/watchlist`

**Access:** Authenticated User.

Tabs:
- Want to Watch.
- Watched.

Content:
- Movie poster grid.
- Relevant metadata.
- Remove or update watchlist state.
- Empty states for both lists.

## 13. My Reviews — `/my-reviews`

**Access:** Authenticated User.

Content:
- User's submitted reviews.
- Movie reference.
- Rating.
- Review content.
- Edit/delete actions when permitted.

One review per user per movie must be preserved.

## 14. My Blogs — `/my-blogs`

**Access:** Authenticated User.

Display:
- Blog title.
- Cover.
- Submission date.
- Current status.
- Edit action where permitted.

Status display must use actual backend values.

## 15. CineMind AI — `/search-ai`

**Goal:** Help users discover and discuss movies.

Components:
- Conversation history when supported.
- Message input.
- Send button.
- Suggested prompts.
- Movie references.
- Loading indicator.
- Error state.

Guest and authenticated capabilities must follow actual backend behavior.

Do not call Gemini directly from the browser if the architecture requires requests through the backend.

## 16. Admin Dashboard — `/admin`

**Access:** Admin.

Sections:
- Summary metrics.
- Recent activity.
- Pending blog submissions.
- Relevant system statistics.

All metrics must come from actual data sources.

## 17. User Management — `/admin/users`

Features:
- User table.
- Search.
- Filters.
- User details.
- Supported moderation actions.

Destructive actions require confirmation.

## 18. Movie Management — `/admin/movies`

Features:
- Movie list.
- Search.
- Movie details.
- Supported create/update operations.
- TMDB synchronization where implemented.

Show synchronization progress and errors.

## 19. Blog Moderation — `/admin/blogs`

Features:
- Pending submissions.
- Article preview.
- Approve.
- Reject.
- Moderation feedback where supported.

Only Admins can perform moderation actions.

## 20. Analytics — `/admin/analytics`

Features:
- User statistics.
- Movie statistics.
- Review statistics.
- Blog statistics.
- Other metrics only when verified data is available.

Do not fabricate charts or KPIs.

## 21. Cross-Page Requirements

- Shared header and footer where appropriate.
- Consistent page container.
- Shared typography and colors.
- Route-aware active navigation.
- Clear authentication behavior.
- Accessible forms and actions.
- Responsive layout.
- Loading, empty, error, and success states.

## 22. Page Completion Criteria

A page is complete when:
- Its content hierarchy matches this specification.
- It uses shared components.
- Its interactions work.
- It handles API states.
- It respects permissions.
- It works on mobile and desktop.
- It does not break existing routes or features.