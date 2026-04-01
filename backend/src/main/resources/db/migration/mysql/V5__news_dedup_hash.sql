UPDATE news
SET source_url_hash = SHA2(CONCAT(LOWER(TRIM(title)), '|', LOWER(TRIM(source_url))), 256)
WHERE title IS NOT NULL
  AND source_url IS NOT NULL;

ALTER TABLE news
DROP INDEX uk_news_title;
