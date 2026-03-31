# AagriGgate - News Feature Workflow Documentation

## Overview

The Level 1 News feature provides authenticated farmers and buyers with agriculture-relevant news from trusted sources. News is stored in the database and served from the database - never fetched live on each user request.

---

## Architecture Summary
```text
External Sources                  Backend                      Frontend
-----------------                 --------------------         ------------
GNews API (HTTPS)  -------------> NewsIngestionScheduler
RSS Feeds          -------------> (every 6 hours)
                                       |
                                       v
                                  NewsRepository (MySQL / PostgreSQL)
                                       |
                                   +---+---------------+
                                   |                   |
                              NewsController    AdminController
                                   |                   |
                              SavedNewsController      |
                                   |                   |
                         <---------+-------------------+
                         React (News.jsx + NewsCard.jsx)
```

---

## Database Tables

### news
Stores all news items regardless of source.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | Auto-increment |
| title | VARCHAR(255) | Unique - deduplication key |
| summary | TEXT | Plain text, HTML stripped |
| source_name | VARCHAR(200) | Human-readable source label |
| source_url | VARCHAR(1000) | Unique - redirect target on click |
| image_url | VARCHAR(1000) | HTTPS only - null if blocked |
| category | ENUM | SUBSIDY, LOAN, LAW, WEATHER, MARKET, FARMING_TIP, OTHER |
| news_type | ENUM | INTERNAL, EXTERNAL, WEATHER |
| status | ENUM | ACTIVE, ARCHIVED, DELETED |
| language | VARCHAR(10) | Default en |
| is_important | BOOLEAN | Triggers in-app notification |
| uploaded_by | VARCHAR(20) | ADMIN, SOURCE, or SYSTEM |
| report_reason | TEXT | Reserved for Level 2 |
| report_count | INT | Reserved for Level 2 |
| created_at | DATETIME | Indexed |
| updated_at | DATETIME | |

### trusted_source
Admin-configured list of news sources the scheduler fetches from.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| name | VARCHAR(200) | Display name |
| domain | VARCHAR(200) | Domain of source website |
| source_url | VARCHAR(1000) | RSS URL or GNews base URL |
| category_scope | VARCHAR(200) | Comma-separated categories |
| source_type | VARCHAR(30) | RSS, GNEWS_TOPIC, GNEWS_KEYWORD |
| fetch_keyword | VARCHAR(200) | Used for GNEWS_KEYWORD type |
| is_active | BOOLEAN | Scheduler skips if false |
| last_fetched_at | DATETIME | Updated after each run |
| created_at | DATETIME | |
| updated_at | DATETIME | |

### saved_news
User bookmarks. Many-to-many between users and news.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| user_id | BIGINT | farmerId (SELLER or BUYER) |
| news_id | BIGINT FK | References news.id |
| created_at | DATETIME | |

Unique constraint on `(user_id, news_id)`.

### notification
Shared in-app notification store. Used by news and other modules.

| Column | Type | Notes |
|---|---|---|
| id | BIGINT PK | |
| user_id | BIGINT | farmerId (SELLER or BUYER) |
| title | VARCHAR(100) | |
| body | VARCHAR(500) | |
| type | ENUM | NEWS_IMPORTANT, etc. |
| status | ENUM | UNREAD, READ, ARCHIVED |
| reference_id | VARCHAR(50) | newsId, approachId, cropId |
| reference_type | VARCHAR(30) | NEWS, APPROACH, CROP |
| created_at | DATETIME | Indexed |

### api_quota_log
Tracks the GNews daily quota guard.

| Column | Type | Notes |
|---|---|---|
| date | DATE | Quota bucket date |
| api_name | VARCHAR(50) | gnews |
| call_count | INT | Incremented before each external call |

Unique constraint on `(date, api_name)`.

---

## News Ingestion Workflow

### Path A: Admin Manual Entry
```text
Admin UI / API call
    |
    v
POST /api/v1/admin/news  (AdminController, ADMIN JWT required)
    |
    v
NewsServiceImpl.createNews(request, uploadedBy="ADMIN")
    |
    +--> Validate title length, summary length, URL format
    |
    +--> Check deduplication:
    |    newsRepository.existsBySourceUrlOrTitle(url, title)
    |    If exists -> throw DuplicateNewsException -> 409 Conflict
    |
    +--> NewsMapper.toEntity(request)
    |    Set uploadedBy = ADMIN
    |    Set status = ACTIVE
    |    Set reportCount = 0
    |
    +--> newsRepository.save(news)
    |
    +--> Evict cache: news-feed
    |
    +--> if isImportant = true AND category in [LAW, SUBSIDY, LOAN, WEATHER]:
         NotificationService.createNotification() for each active user
         type = NEWS_IMPORTANT
         referenceId = news.getId()
         referenceType = NEWS
         (No email - in-app notification only)
```

### Path B: Scheduler Automated Fetch
```text
@Scheduled(cron = "0 0 */6 * * *")
NewsIngestionScheduler.fetchAllSources()
    |
    v
trustedSourceRepository.findByIsActiveTrue()
    |
    v
For each TrustedSource:
    |
    +--> sourceType == RSS
    |      |
    |      v
    |  Rome SyndFeedInput.build(sourceUrl)
    |      |
    |      v
    |  For each entry (limit: maxItemsPerSource):
    |      extractTitle()
    |      extractSummary() -> strip HTML tags
    |      extractLink() -> becomes sourceUrl (unique key)
    |      extractImage() -> enclosures first, then media:content
    |      sanitizeImageUrl() -> null if HTTP or blocked domain
    |      infer category from source.categoryScope
    |
    +--> sourceType == GNEWS_TOPIC
    |      |
    |      v
    |  GET https://gnews.io/api/v4/top-headlines
    |      ?topic={fetchKeyword}&lang=en&country=in
    |      &max={maxItemsPerSource}&page={page}&apikey={NEWS_API_KEY}
    |
    +--> sourceType == GNEWS_KEYWORD
           |
           v
       GET https://gnews.io/api/v4/search
           ?q={URLEncoded fetchKeyword}&lang=en&country=in
           &max={maxItemsPerSource}&page={page}&apikey={NEWS_API_KEY}

For every GNews page request:
    |
    +--> api_quota_log(date=today, api_name='gnews') must stay below 90
    +--> if quota >= 90: log warning, skip remaining GNews sources, continue RSS sources

For each fetched NewsRequest:
    |
    +--> Deduplication check:
    |    existsBySourceUrlOrTitle(sourceUrl, title)
    |    If exists -> skip and increment dedupe metric
    |
    +--> NewsMapper.toEntity(item)
    |    Set uploadedBy = SOURCE
    |    Set newsType = EXTERNAL
    |    Set status = ACTIVE
    |
    +--> newsRepository.save(news)
    +--> Counter: saved++

After all items for this source:
    source.setLastFetchedAt(now(Asia/Kolkata))
    trustedSourceRepository.save(source)
    cache evict: news-feed
    structured log + metrics + tracing span

On exception for any source:
    log structured error event
    record metrics
    continue to next source - never crash the scheduler
```

### Scheduler Configuration

| Property | Dev value | Prod value |
|---|---|---|
| news.api.scheduler-cron | 0 0 */6 * * * | 0 0 */6 * * * |
| news.api.max-items-per-source | 100 | 100 |
| news.api.rss-timeout-seconds | 15 | 15 |
| news.api.gnews-timeout-seconds | 5 | 5 |
| news.api.retention-days | 90 | 90 |
| news.api.gnews-daily-limit | 90 | 90 |
| news.api.cache-ttl-seconds | 120 | 120 |

### Cleanup Scheduler
```text
@Scheduled(cron = "0 0 2 * * *")
NewsCleanupScheduler.cleanupOldNews()
    |
    v
cutoff = now(Asia/Kolkata) - retentionDays (90 days)
    |
    v
UPDATE news SET status='ARCHIVED'
WHERE status='ACTIVE'
AND is_important = false
AND created_at < cutoff
    |
    v
counter: news.cleanup.archived.total
log structured cleanup event
```

Important news (`isImportant=true`) is never auto-archived.

### Midnight Quota Reset
```text
@Scheduled(cron = "0 0 0 * * *")
NewsCleanupScheduler.resetQuotaAtMidnight()
    |
    v
apiQuotaLogService.resetDailyQuota("gnews")
```

---

## User-Facing Workflow

### Read News
```text
User opens app -> navigates to /news
    |
    v
Auth guard in News.jsx
    +--> Not logged in -> redirect to /login
    +--> Logged in -> proceed
    |
    v
getNews({ category, newsType, isImportant, keyword,
          dateRange, page, size, sortBy })
    |
    v
GET /api/v1/news (JWT required)
    |
    v
NewsServiceImpl.getAllNews()
    +--> Build Specification (category, newsType, isImportant,
    |    keyword, dateRange, status=ACTIVE)
    +--> Query with Pageable (createdAt DESC by default)
    +--> Cache per user in news-feed using a user-aware key
    +--> For each item: check isSaved for current user
    +--> Map via NewsMapper -> Page<NewsResponse>
    |
    v
Render NewsCard grid
    |
    v
User clicks card -> window.open(sourceUrl, '_blank', 'noopener,noreferrer')
```

### Save / Unsave News
```text
User taps bookmark icon
    |
    v
Optimistic UI update
    +--> isSaved = true -> show filled bookmark
    +--> isSaved = false -> show outline bookmark
    |
    v
Background API call:
    +--> Save:   POST /api/v1/news/saved/{newsId}
    +--> Unsave: DELETE /api/v1/news/saved/{newsId}
    |
    +--> On success: show Toast Saved or Removed from saved
    +--> On error: revert bookmark + show error toast
    |
    v
Evict cache: news-feed
```

### Date Filtering
```text
User selects date pill: All / Today / Yesterday / Last 7 days / Last 30 days
    |
    v
dateRange state updates -> page resets to 0
    |
    v
getNews({ ..., dateRange: 'TODAY' })
    |
    v
Backend Specification adds IST-based windows:
    TODAY:       createdAt between today start and now(Asia/Kolkata)
    YESTERDAY:   createdAt between yesterday start and today start
    LAST_7_DAYS: createdAt >= now - 7 days
    LAST_30_DAYS: createdAt >= now - 30 days
    ALL:         no date filter
```

---

## Security

| Endpoint | Access |
|---|---|
| GET /api/v1/news | JWT required |
| GET /api/v1/news/{id} | JWT required |
| POST /api/v1/news/{id}/view | JWT required |
| POST /api/v1/news/saved/{id} | JWT required |
| DELETE /api/v1/news/saved/{id} | JWT required |
| GET /api/v1/news/saved | JWT required |
| POST /api/v1/admin/login | Public |
| GET /api/v1/admin/news/** | ADMIN JWT required |
| POST /api/v1/admin/news | ADMIN JWT required |
| POST /api/v1/admin/sources | ADMIN JWT required |

All JWT tokens are extracted using `JWTService`. `userId` is passed to the service layer and is never accepted as a request parameter.

Admin auth is config-backed JWT auth using `ADMIN_USERNAME` and `ADMIN_PASSWORD`, with `role=ADMIN`, `subject=-1`, and a 30-minute token expiry.

---

## Configuration Reference

### Required Environment Variables

| Variable | Description | Example |
|---|---|---|
| NEWS_API_KEY | GNews.io API key | get from gnews.io/dashboard |
| JWT_SECRET | JWT signing secret | minimum 256-bit random string |
| DB_URL | JDBC connection URL | jdbc:mysql://localhost/db |
| DB_USERNAME | Database username | root |
| DB_PASSWORD | Database password | strong password |
| WEATHER_API_KEY | Weather API key | |
| MARKET_API_KEY | Market data API key | |
| ADMIN_USERNAME | Admin login username | |
| ADMIN_PASSWORD | Admin login password | |
| EMAIL_USERNAME | SMTP username | |
| EMAIL_PASSWORD | SMTP password | |

Never set default values for any of the above in YAML files. Spring should fail at startup if a required variable is missing.

---

## Cache Design

- Cache name: `news-feed`
- TTL: 2 minutes
- Key prefix: `userId:category:newsType:page`
- Full key also includes `dateRange`, `isImportant`, `keywordHash`, `size`, and `sortBy` to avoid collisions across filtered result sets.
- Eviction happens on:
  - `saveNews()`
  - `unsaveNews()`
  - `createNews()`
  - `softDeleteNews()`
  - each successful scheduler insert batch

---

## Image Loading Strategy

1. Backend sanitizes `imageUrl` at fetch time:
   - Rejects `http://` URLs to avoid mixed content on HTTPS frontends
   - Rejects known hotlink-blocked domains
   - Stores `null` if no valid image is found

2. Frontend uses lazy loading:
   - `loading="lazy"` on all image tags
   - `onError` fallback to a category placeholder

3. Category placeholders are CSS-backed:
   - no broken image icon is shown to the user
   - placeholders remain color-coded by category for fast scanning

---

## Observability

### Structured JSON Logs
Scheduler events log these fields:
- `event`
- `sourceId`
- `sourceName`
- `sourceType`
- `fetchDurationMs`
- `itemsFetched`
- `itemsSaved`
- `itemsDeduped`
- `errorMessage`
- `timestamp`

### Metrics
Micrometer metrics emitted by the news system:
- `news.scheduler.fetch.duration` (Timer, tags: `sourceName`, `sourceType`)
- `news.items.fetched.total` (Counter, tag: `sourceName`)
- `news.items.saved.total` (Counter, tag: `sourceName`)
- `news.items.deduped.total` (Counter, tag: `sourceName`)
- `news.gnews.quota.calls.today` (Gauge backed by DB quota count)
- `news.cleanup.archived.total` (Counter)

### Health Indicator
`NewsSchedulerHealthIndicator` reports:
- `UP`: at least one source has `lastFetchedAt` within 7 hours
- `OUT_OF_SERVICE`: all sources failed in the last cycle
- `DOWN`: no scheduler progress for 13 hours

---

## Known Limitations (Level 1)

- Report feature is implemented but disabled for Level 1
- No user language or region preference UI yet
- No push notifications yet (WebSocket or FCM is Level 2)
- No content approval workflow yet
- GNews free tier quotas must be monitored closely when pagination is enabled

---

## Extending to Level 2

Reserved fields and commented code:
- `reportReason`, `reportCount` on `News`
- `reportNews()` in `NewsService` and `NewsServiceImpl`
- Report UI block in `NewsCard.jsx`
- Content approval flow hooks in admin APIs
- Push-notification expansion in `NotificationService`
