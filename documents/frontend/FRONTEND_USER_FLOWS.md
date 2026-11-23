# CineMind — Frontend User Flows

**Version:** 1.0

## 1. Purpose

Define the expected user journeys for Guest, User, and Admin.

Flows describe frontend behavior. Backend authorization and business rules remain authoritative.

## 2. Guest Journey

### 2.1 Discover a Movie

1. Guest opens Home.
2. Guest browses featured or trending movies.
3. Guest opens Movie Discovery.
4. Guest searches or filters movies.
5. Guest selects a movie.
6. Guest views Movie Detail.
7. Guest reads reviews and movie information.

### 2.2 Read a Blog

1. Guest opens Blog Discovery.
2. Guest selects a published article.
3. Guest reads Blog Detail.
4. Guest views comments and replies.
5. Guest attempts a restricted action.
6. Frontend requests login when authentication is required.

### 2.3 Authentication Entry

1. Guest selects Login or Register.
2. Frontend validates input.
3. Frontend submits to the backend.
4. On success, authentication state is updated.
5. Guest is redirected according to the application's existing redirect rules.

## 3. User Journey

### 3.1 Movie Review

1. User opens Movie Detail.
2. User selects a rating from 1–5 stars.
3. User writes review content.
4. Frontend validates the form.
5. Frontend submits the review.
6. Backend checks whether the user already has a review for this movie.
7. Frontend displays success or error feedback.
8. Updated review data is displayed.

Business rule: One user can have only one review for one movie.

### 3.2 Watchlist

1. User opens a movie.
2. User selects Add to Watchlist.
3. Frontend sends the action to the backend.
4. Backend stores the appropriate watchlist state.
5. Frontend updates the UI.
6. User can view the movie under Want to Watch or Watched.

### 3.3 Create a Blog

1. User opens Create Blog.
2. User fills the required fields.
3. Frontend validates content.
4. User submits.
5. Backend creates the submission with `PENDING` status.
6. Frontend shows submission confirmation.
7. The article is not publicly visible while pending.

Draft support must not be assumed.

### 3.4 Blog Discussion

1. User opens a published blog.
2. User writes a comment.
3. Frontend submits the comment.
4. User can reply to an existing comment.
5. Frontend renders the threaded discussion.
6. API errors are displayed without losing unsaved input where feasible.

### 3.5 Like a Blog

1. User opens a published blog.
2. User selects Like.
3. Backend checks duplicate-like rules.
4. Frontend reflects the resulting state.
5. Repeated likes must not create duplicate records.

### 3.6 Personalized AI

1. Authenticated User opens CineMind AI.
2. User enters a question.
3. Frontend sends the request through the backend.
4. Backend processes the request.
5. Frontend displays the response.
6. Loading and error states remain visible and understandable.

## 4. Admin Journey

### 4.1 Admin Login

1. Admin signs in.
2. Backend returns authenticated user information and role.
3. Frontend verifies the role for navigation and route experience.
4. Admin accesses Admin Dashboard.
5. Non-Admin users cannot access Admin pages.

Backend authorization remains mandatory.

### 4.2 Moderate a Blog

1. Admin opens Blog Moderation.
2. Admin views pending submissions.
3. Admin selects a blog.
4. Admin reviews content.
5. Admin approves or rejects.
6. Frontend sends the moderation action.
7. Backend updates the status.
8. Frontend refreshes the list and displays feedback.

### 4.3 Manage Movies

1. Admin opens Movie Management.
2. Admin searches or selects a movie.
3. Admin performs a supported management action.
4. Admin may start TMDB synchronization if the backend supports it.
5. Frontend shows progress and result.
6. Errors are displayed clearly.

### 4.4 Manage Users

1. Admin opens User Management.
2. Admin searches or filters users.
3. Admin opens a user record.
4. Admin performs an authorized action.
5. Destructive actions require confirmation.
6. Frontend updates the displayed data.

## 5. Common Interaction States

Every asynchronous action should support:

- Idle.
- Loading.
- Success.
- Error.
- Disabled where appropriate.

Avoid duplicate submissions while a request is pending.

## 6. Authentication Edge Cases

- Expired token.
- Invalid token.
- Unauthorized response.
- Forbidden response.
- Network failure.
- User logout.
- Missing user information.

The frontend must not assume that a locally stored role guarantees permission.

## 7. Navigation and Redirects

- Preserve intended destination when a Guest is redirected to login, where appropriate.
- Do not redirect users into Admin routes without Admin authorization.
- Avoid redirect loops.
- Handle unknown routes.
- Preserve browser back/forward behavior.

## 8. Flow Acceptance Criteria

- All restricted actions have clear authentication behavior.
- Review uniqueness is respected.
- Blog moderation status is respected.
- Duplicate likes are prevented.
- Threaded comments are rendered correctly.
- Admin-only actions are protected.
- Errors do not silently disappear.
- User input is preserved when reasonable after recoverable errors.s