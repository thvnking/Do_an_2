# PROJECT CONTEXT DOCUMENT (CineMind)
> **Purpose:** This document serves as a complete context baseline for an AI assistant to understand, generate code for, and assist in developing the **CineMind** capstone project.

---

## 1. PROJECT OVERVIEW

* **Project Title (Official):** Xây dựng hệ thống quản lý, đánh giá phim và nền tảng blog điện ảnh tích hợp AI hỗ trợ gợi ý nội dung dựa trên thiết kế UML (System Development for Movie Management, Reviews, and Film Blog Platform with AI-Assisted Content Recommendation based on UML Design).
* **Project Name:** **CineMind**
* **Target Audience:** Single Student (Project 2 - IT Major, Nam Can Tho University / School of Digital Technology & AI).
* **Core Objectives:** 
  1. Complete a single-developer Web Application managing complex relational data (Movies, Reviews, Blogs, Users, Interactions).
  2. Implement AI integration (Google Gemini API) for personalized movie search, blog topic suggestions, and review sentiment summarization.
  3. Adhere strictly to UML modeling standards and software engineering best practices.

---

## 2. TIMELINE & MILESTONES (10 WEEKS)

* **Phase 1: Analysis & UML Design (Weeks 1-2 | Oct 26 – Nov 08, 2026)**
  * Finalize topic approval with Academic Advisor.
  * System Requirements Specification (SRS) & Complete UML Diagrams (Use Case, Class, Sequence, Activity).
  * Conceptual and Logical ERD design.
* **Phase 2: Database & Backend Core (Weeks 3-5 | Nov 09 – Nov 29, 2026)**
  * Initialize PostgreSQL/MySQL database on Cloud (Supabase/Aiven).
  * Build RESTful APIs (Auth, Movies, Reviews, Blogs).
  * Sync movie data from TMDB (The Movie Database) API.
* **Phase 3: AI Integration & Frontend (Weeks 6-8 | Nov 30 – Dec 20, 2026)**
  * Integrate Google Gemini API (Topic Generator, Natural Language Search, Sentiment Summary).
  * Build responsive Frontend SPA in React.js / Next.js (Dark Mode UI).
  * Connect Frontend to Backend APIs.
* **Phase 4: Testing, Deployment & Documentation (Weeks 9-10 | Dec 21, 2026 – Jan 10, 2027)**
  * Deploy Free Cloud Hosting (Vercel + Render + Supabase).
  * Write 30-50 page Project Report according to Decision No. 309/QĐ-ĐHNCT.
  * Burn CD, submit report, and prepare defense demo.

---

## 3. TECH STACK & INFRASTRUCTURE

* **Frontend:** React.js / Next.js (TypeScript), Tailwind CSS.
* **Backend:** Java Spring Boot *or* Node.js (NestJS / Express) following Layered Architecture (Controller -> Service -> Repository).
* **Database:** PostgreSQL / MySQL (Relational Database).
* **Third-Party APIs:**
  * **TMDB API:** Fetches metadata (Posters, Cast, Trailers, Genres, Release Dates).
  * **Google Gemini API:** AI-driven features (Blog topics, AI search, Summaries).
* **Deployment (100% Free Tier):**
  * Frontend: Vercel / Netlify
  * Backend: Render.com
  * Database: Supabase / Aiven

---

## 4. SYSTEM SITEMAP & PAGE FLOW

```text
ROOT (/)
├── [Public Pages]
│   ├── / (Home: Hero Carousel, AI Recommended Movies, Latest Blogs)
│   ├── /movies (Movie Catalog & Advanced Filter)
│   ├── /movies/:id (Movie Detail + Trailer + Star Reviews + AI Summary)
│   ├── /blogs (Community Blog Feed)
│   ├── /blogs/:id (Blog Post Detail + Threaded Comments)
│   └── /search-ai (Natural Language AI Movie Search)
│
├── [Auth Pages]
│   ├── /login
│   └── /register
│
├── [User Workspace - Authenticated]
│   ├── /profile (User Info & My Published Blogs)
│   ├── /watchlist (Saved / Favorite Movies)
│   └── /blogs/create (Blog Editor + AI Topic Assistant)
│
└── [Admin Dashboard - Admin Role]
    ├── /admin/users (Manage Users & Roles)
    ├── /admin/movies (Manage & Sync TMDB Movies)
    └── /admin/blogs (Moderate & Approve Blog Posts)
```

---

## 5. DATABASE SCHEMATICS & DOMAIN CLASS SPECIFICATION

### Core Entities & Key Fields:
1. **User:** `userId` (PK), `username`, `email`, `passwordHash`, `role` (ADMIN, USER), `createdAt`
2. **Movie:** `movieId` (PK), `tmdbId`, `title`, `synopsis`, `releaseYear`, `director`, `posterUrl`, `ratingAvg`
3. **Genre & MovieGenre:** `genreId` (PK), `name` | Junction Table `(movieId, genreId)`
4. **Review:** `reviewId` (PK), `userId` (FK), `movieId` (FK), `rating` (1-5), `content`, `createdAt`
5. **BlogPost:** `postId` (PK), `authorId` (FK), `movieId` (FK, optional), `title`, `content`, `aiSuggestedTopic` (Boolean), `status` (DRAFT, PUBLISHED), `createdAt`
6. **Comment:** `commentId` (PK), `postId` (FK), `userId` (FK), `parentId` (FK, for nested replies), `content`, `createdAt`

---

## 6. KEY UML DIAGRAM SPECIFICATIONS

### A. Use Case Actors
* **Guest:** Browse movies, search movies, read blog posts, view reviews.
* **User (Authenticated):** Rate/Review movies, Save watchlist, Create blog posts with AI assist, Comment on blogs, Receive AI recommendations.
* **Admin:** Sync/Manage Movie Database, Moderate blog posts, Manage user permissions.

### B. Sequence Diagram Flow (AI Blog Suggestion Feature)
1. `User` selects a movie in the Blog Editor and clicks "Generate AI Topics".
2. `Frontend` sends `POST /api/ai/suggest-topics` with `movieId` & `movieTitle` to `Backend`.
3. `Backend` constructs a prompt and calls `Google Gemini API`.
4. `Gemini API` returns a JSON array of 5 creative blog titles/topics.
5. `Backend` relays the list to `Frontend`.
6. `User` selects a topic, edits content, and clicks "Publish".
7. `Backend` validates token and saves `BlogPost` to `Database`.

---

## 7. INSTRUCTIONS FOR CHATBOX / AI ASSISTANTS

When providing help for this project:
1. Maintain strict adherence to **Layered Architecture** (Controller, Service, Entity/Repository) when writing Backend code.
2. Maintain clean separation between Frontend UI components and API calls.
3. Ensure all mathematical, database, and system formulas follow Standard LaTeX notation if presented.
4. Keep the single-developer scope in mind: prioritize practical, working code over over-engineered microservices.