CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
CREATE TYPE post_status AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');
CREATE TYPE chat_type AS ENUM ('GENERAL_SEARCH', 'MOVIE_PAGE_QA');

CREATE TABLE users (
  user_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name VARCHAR(150),
  avatar_url TEXT,
  role user_role NOT NULL DEFAULT 'USER',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE movies (
  movie_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tmdb_id INTEGER UNIQUE,
  title VARCHAR(255) NOT NULL,
  vietnamese_title VARCHAR(255),
  synopsis TEXT,
  release_year SMALLINT CHECK (release_year BETWEEN 1888 AND 2200),
  runtime_minutes SMALLINT CHECK (runtime_minutes > 0),
  poster_url TEXT,
  banner_url TEXT,
  trailer_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE genres (genre_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(80) NOT NULL UNIQUE);
CREATE TABLE movie_genres (movie_id BIGINT NOT NULL REFERENCES movies ON DELETE CASCADE, genre_id BIGINT NOT NULL REFERENCES genres ON DELETE CASCADE, PRIMARY KEY (movie_id, genre_id));
CREATE TABLE user_favorite_genres (user_id BIGINT NOT NULL REFERENCES users ON DELETE CASCADE, genre_id BIGINT NOT NULL REFERENCES genres ON DELETE CASCADE, PRIMARY KEY (user_id, genre_id));
CREATE TABLE countries (country_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(100) NOT NULL UNIQUE);
CREATE TABLE movie_countries (movie_id BIGINT NOT NULL REFERENCES movies ON DELETE CASCADE, country_id BIGINT NOT NULL REFERENCES countries ON DELETE CASCADE, PRIMARY KEY (movie_id, country_id));
CREATE TABLE persons (person_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY, name VARCHAR(180) NOT NULL, tmdb_id INTEGER UNIQUE);
CREATE TABLE movie_credits (movie_id BIGINT NOT NULL REFERENCES movies ON DELETE CASCADE, person_id BIGINT NOT NULL REFERENCES persons ON DELETE CASCADE, credit_role VARCHAR(30) NOT NULL CHECK (credit_role IN ('DIRECTOR', 'ACTOR')), character_name VARCHAR(180), PRIMARY KEY (movie_id, person_id, credit_role));
CREATE TABLE blog_posts (
  post_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  author_id BIGINT NOT NULL REFERENCES users ON DELETE CASCADE,
  movie_id BIGINT REFERENCES movies ON DELETE SET NULL,
  title VARCHAR(240) NOT NULL,
  slug VARCHAR(260) NOT NULL UNIQUE,
  content TEXT NOT NULL,
  status post_status NOT NULL DEFAULT 'PENDING',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE blog_comments (
  comment_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  post_id BIGINT NOT NULL REFERENCES blog_posts ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users ON DELETE CASCADE,
  parent_comment_id BIGINT REFERENCES blog_comments ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE blog_likes (post_id BIGINT NOT NULL REFERENCES blog_posts ON DELETE CASCADE, user_id BIGINT NOT NULL REFERENCES users ON DELETE CASCADE, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY (post_id, user_id));
CREATE TABLE reviews (
  review_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  movie_id BIGINT NOT NULL REFERENCES movies ON DELETE CASCADE,
  user_id BIGINT NOT NULL REFERENCES users ON DELETE CASCADE,
  rating SMALLINT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment_text TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (movie_id, user_id)
);
CREATE TABLE watchlists (
  watchlist_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users ON DELETE CASCADE,
  movie_id BIGINT NOT NULL REFERENCES movies ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'WANT_TO_WATCH' CHECK (status IN ('WANT_TO_WATCH', 'WATCHED')),
  added_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, movie_id)
);
CREATE TABLE movie_view_history (
  view_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT NOT NULL REFERENCES users ON DELETE CASCADE,
  movie_id BIGINT NOT NULL REFERENCES movies ON DELETE CASCADE,
  viewed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE TABLE ai_chat_history (
  chat_id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  user_id BIGINT REFERENCES users ON DELETE SET NULL,
  chat_type chat_type NOT NULL,
  user_query TEXT NOT NULL,
  ai_response TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_movies_title ON movies(title);
CREATE INDEX idx_movies_release_year ON movies(release_year);
CREATE INDEX idx_posts_status_created ON blog_posts(status, created_at DESC);
CREATE INDEX idx_comments_post_created ON blog_comments(post_id, created_at);
CREATE INDEX idx_reviews_movie ON reviews(movie_id);
CREATE INDEX idx_watchlists_user ON watchlists(user_id);
CREATE INDEX idx_movie_views_user_time ON movie_view_history(user_id, viewed_at DESC);
CREATE INDEX idx_chat_history_user_time ON ai_chat_history(user_id, created_at DESC);
