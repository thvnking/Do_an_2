# CineMind — Frontend Sitemap

**Version:** 1.0

## 1. Route Structure

### Public Routes

| Route | Page | Access |
|---|---|---|
| `/` | Home | Public |
| `/movies` | Movie Discovery | Public |
| `/movies/:id` | Movie Detail | Public |
| `/blogs` | Blog Discovery | Public |
| `/blogs/:id` | Blog Detail | Public, published content only |
| `/search-ai` | CineMind AI | Public or partially restricted |
| `/login` | Login | Guest |
| `/register` | Register | Guest |

### Authenticated User Routes

| Route | Page | Access |
|---|---|---|
| `/profile` | My Profile | User |
| `/profile/:userId` | Public User Profile | Requires product decision |
| `/watchlist` | My Watchlist | User |
| `/my-reviews` | My Reviews | User |
| `/my-blogs` | My Blogs | User |
| `/blogs/create` | Create Blog | User |
| `/blogs/:id/edit` | Edit Blog | Owner or authorized Admin |
| `/settings` | Account Settings | User |

Routes marked as requiring a product decision must not be implemented as confirmed public functionality until approved.

### Admin Routes

| Route | Page | Access |
|---|---|---|
| `/admin` | Dashboard | Admin |
| `/admin/users` | User Management | Admin |
| `/admin/movies` | Movie Management | Admin |
| `/admin/blogs` | Blog Moderation | Admin |
| `/admin/analytics` | Analytics | Admin |

## 2. Navigation

### Guest Desktop Header

- CineMind Logo.
- Home.
- Movies.
- Blogs.
- CineMind AI.
- Search.
- Login.
- Register.

### Authenticated User Header

- CineMind Logo.
- Home.
- Movies.
- Blogs.
- CineMind AI.
- Search.
- User menu.

User menu:
- Profile.
- Watchlist.
- My Reviews.
- My Blogs.
- Settings.
- Logout.

### Admin Sidebar

- Dashboard.
- Users.
- Movies.
- Blog Moderation.
- Analytics.
- Logout.

Admin navigation must be visually and structurally separate from public navigation.

## 3. Page Hierarchy

```text
CineMind
│
├── Home
│
├── Movies
│   ├── Movie Discovery
│   └── Movie Detail
│       ├── Movie Information
│       ├── Cast and Crew
│       ├── Trailer
│       ├── Ratings
│       ├── Community Reviews
│       ├── Related Movies
│       └── AI Movie Discussion
│
├── Blogs
│   ├── Blog Discovery
│   ├── Blog Detail
│   │   └── Comments and Replies
│   ├── Create Blog
│   ├── Edit Blog
│   └── My Blogs
│
├── CineMind AI
│
├── Authentication
│   ├── Login
│   └── Register
│
├── User Area
│   ├── Profile
│   ├── Watchlist
│   ├── My Reviews
│   └── Settings
│
└── Admin
    ├── Dashboard
    ├── Users
    ├── Movies
    ├── Blog Moderation
    └── Analytics
```

## 4. Route Protection

### GuestOnly
Authenticated users should be redirected away from login and registration pages according to the existing authentication behavior.

### AuthGuard
Protects routes requiring a logged-in user.

### AdminGuard
Protects routes requiring Admin role.

### Ownership Checks
Editing or deleting user-created content must verify ownership or Admin permission.

Frontend guards improve UX but do not replace backend authorization.

## 5. Route States

Every route should account for:

- Loading.
- Content available.
- Empty content.
- Not Found.
- Unauthorized.
- Forbidden.
- API Error.

## 6. URL and Navigation Rules

- Use stable route patterns.
- Use movie and blog identifiers from the actual backend data.
- Preserve query parameters when they represent filters or search state.
- Avoid hardcoding navigation based on demo IDs.
- Use links for navigation and buttons for actions.
- Support browser back and forward navigation.

## 7. Sitemap Acceptance Criteria

- Every approved page has a route.
- Guest, User, and Admin permissions are clear.
- Admin routes are isolated.
- Protected routes handle unauthenticated access.
- Unknown routes show a Not Found page.
- Navigation matches the user's role.
- Unconfirmed routes are not treated as approved requirements.