CREATE EXTENSION IF NOT EXISTS pgcrypto;

UPDATE news
SET source_url_hash = encode(digest(lower(btrim(title)) || '|' || lower(btrim(source_url)), 'sha256'), 'hex')
WHERE title IS NOT NULL
  AND source_url IS NOT NULL;

ALTER TABLE news
DROP CONSTRAINT IF EXISTS uk_news_title;
