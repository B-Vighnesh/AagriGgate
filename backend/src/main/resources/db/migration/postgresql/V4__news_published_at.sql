ALTER TABLE news
ADD COLUMN IF NOT EXISTS published_at TIMESTAMP NULL;

UPDATE news
SET published_at = created_at
WHERE published_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_news_published_at ON news (published_at);
