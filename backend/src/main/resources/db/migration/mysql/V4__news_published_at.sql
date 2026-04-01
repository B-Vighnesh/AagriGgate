ALTER TABLE news
ADD COLUMN published_at DATETIME NULL AFTER image_url;

UPDATE news
SET published_at = created_at
WHERE published_at IS NULL;

CREATE INDEX idx_news_published_at ON news (published_at);
