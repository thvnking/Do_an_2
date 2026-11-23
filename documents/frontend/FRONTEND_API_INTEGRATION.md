# CineMind — Frontend API Integration

**Version:** 1.0  
**Status:** Integration Guidelines

## 1. Purpose

Define how the frontend communicates with the CineMind backend.

This document does not invent API endpoints. Actual routes, payloads, response formats, and authentication contracts must be verified from the backend source code or API documentation.

## 2. Architecture

Expected request flow:

```text
React Page / Feature
        |
        v
Feature Hook or Service
        |
        v
Central API Client
        |
        v
Express Backend
        |
        v
Database / External Services
```

The browser should communicate with the CineMind backend for protected operations and AI requests.

## 3. Environment Configuration

Expected development variable:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

Rules:
- Read configuration from environment variables.
- Do not hardcode production URLs throughout components.
- Never expose private API keys or server secrets in Vite environment variables.
- Only variables intentionally exposed to the browser may use the `VITE_` prefix.

## 4. API Client

Create or reuse a central API client.

Responsibilities:
- Base URL.
- Headers.
- Authentication token handling.
- JSON serialization.
- Error normalization.
- Network error handling.
- Consistent response processing.

Do not create a separate raw `fetch` implementation in every page.

## 5. Service Organization

Suggested structure:

```text
src/services/
  apiClient.js
  authService.js
  movieService.js
  reviewService.js
  blogService.js
  commentService.js
  watchlistService.js
  aiService.js
  adminService.js
```

Use only services that correspond to actual backend functionality.

## 6. Authentication

The authentication implementation must follow the current backend contract.

Verify:
- Login endpoint.
- Registration endpoint.
- Token response structure.
- User profile response.
- Token expiration behavior.
- Logout behavior.
- Refresh token support, if any.

Security:
- Never store plaintext passwords.
- Do not expose JWT signing secrets.
- Prefer secure, HttpOnly cookies when the backend supports that architecture.
- If the existing application uses another token strategy, inspect its security implications before changing it.
- Do not claim that frontend route guards provide real security.

## 7. Data Contracts

Before implementing a feature, inspect:
- Backend route.
- Controller.
- Validation.
- Service or model.
- Database schema.
- Existing API response.

Document the actual:
- Request method.
- URL.
- Query parameters.
- Request body.
- Response shape.
- Error behavior.
- Required role.

Do not guess field names or enum values.

## 8. Feature Integration

### Movies
Verify actual TMDB-backed movie endpoints and local database behavior.

### Reviews
Preserve one-review-per-user-per-movie behavior.

### Watchlist
Verify the backend representation of `WANT_TO_WATCH` and `WATCHED`.

### Blogs
Verify submission, editing, publication, and moderation contracts.

Only `PUBLISHED` blogs are publicly visible.

### Comments
Verify parent-child reply structure and supported nesting behavior.

### Likes
Verify duplicate-like handling and resulting response state.

### AI
Send requests through the backend. Do not expose Gemini credentials in the browser.

### Admin
Verify authorization and supported administrative operations.

## 9. Async UI States

Every API-driven feature should handle:
- Initial loading.
- Refresh loading.
- Success.
- Empty result.
- Validation error.
- Unauthorized.
- Forbidden.
- Not Found.
- Server error.
- Network error.

Avoid showing stale or fabricated data as if it were authoritative.

## 10. Data and Cache Strategy

Use the existing project's state-management approach where possible.

Guidelines:
- Keep local UI state local.
- Share authentication state consistently.
- Avoid duplicating the same API state across unrelated components.
- Refetch or update affected data after successful mutations.
- Prevent race conditions in search requests.
- Handle component unmounting and stale requests where appropriate.

Do not introduce a large state-management dependency without justification.

## 11. Demo Data

Demo data may be used only when:
- The feature is explicitly in demo mode.
- The backend does not yet provide the required functionality.
- The UI clearly distinguishes demo data from real data.

Never silently replace available API data with hardcoded examples.

## 12. API Integration Checklist

- [ ] Backend endpoint verified.
- [ ] Request schema verified.
- [ ] Response schema verified.
- [ ] Authentication requirement verified.
- [ ] Role requirement verified.
- [ ] Loading state implemented.
- [ ] Error state implemented.
- [ ] Empty state implemented.
- [ ] Successful mutation refreshes relevant data.
- [ ] No secret is exposed in frontend code.
- [ ] No invented API contract remains.