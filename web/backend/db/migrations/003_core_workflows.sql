ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS view_count INTEGER NOT NULL DEFAULT 0 CHECK (view_count >= 0);
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS moderated_at TIMESTAMPTZ;
ALTER TABLE blog_posts ADD COLUMN IF NOT EXISTS moderated_by BIGINT REFERENCES users ON DELETE SET NULL;
ALTER TABLE countries ADD COLUMN IF NOT EXISTS iso_code CHAR(2) UNIQUE;
ALTER TABLE persons ADD COLUMN IF NOT EXISTS profile_url TEXT;
ALTER TABLE movie_credits ADD COLUMN IF NOT EXISTS credit_order SMALLINT;

CREATE INDEX IF NOT EXISTS idx_blog_posts_author_created ON blog_posts(author_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_comments_user_created ON blog_comments(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reviews_user_created ON reviews(user_id, created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_username_lower ON users (lower(username));
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email_lower ON users (lower(email));
