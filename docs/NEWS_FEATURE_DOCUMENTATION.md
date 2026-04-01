# News Feature — Technical Documentation

> **Version**: 1.0  
> **Last Updated**: April 2026  
> **Module**: `com.MyWebpage.register.login.news`  
> **Frontend Page**: `src/pages/News.jsx`

---

## Table of Contents

1. [Feature Overview](#1-feature-overview)
2. [Architecture & Data Flow](#2-architecture--data-flow)
3. [Backend Package Structure](#3-backend-package-structure)
4. [Database Schema](#4-database-schema)
5. [API Contracts](#5-api-contracts)
6. [Authentication & Authorization](#6-authentication--authorization)
7. [Scheduler Jobs](#7-scheduler-jobs)
8. [Image Handling Strategy](#8-image-handling-strategy)
9. [Pagination Strategy](#9-pagination-strategy)
10. [Date Filtering Logic](#10-date-filtering-logic)
11. [Caching Strategy](#11-caching-strategy)
12. [Frontend Architecture](#12-frontend-architecture)
13. [Known Limitations](#13-known-limitations)
14. [Disabled Features](#14-disabled-features)

---

## 1. Feature Overview

The News feature delivers agriculture-related news to authenticated users (BUYER/SELLER roles). News is automatically ingested from:

- **RSS feeds** — Government PIB, Krishi Jagran, AgriFarming, Kisan Rath
- **GNews API** — Keyword-based search for subsidies, loans, laws, weather, market prices

Users can:
- Browse news with filters (category, type, keyword, date range, importance)
- Save/unsave articles for later reading
- View news grouped by date (Today, Yesterday, older dates)
- Open original articles in new tabs

---

## 2. Architecture & Data Flow

```
                    ┌──────────────────────┐
                    │   External Sources    │
                    │  (RSS / GNews API)    │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │ NewsIngestionScheduler│  ← @Scheduled (cron)
                    │  - fetchAllSources()  │  ← @EventListener (startup)
                    │  - Circuit Breaker    │
                    │  - Retry (3 attempts) │
                    │  - Quota Guard        │
                    └──────────┬───────────┘
                               │ save(News)
                    ┌──────────▼───────────┐
                    │   NewsRepository     │
                    │   (MySQL / JPA)      │
                    │   + Specification    │
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   NewsServiceImpl    │
                    │  - Specification     │
                    │  - Pagination        │
                    │  - Date filtering    │
                    │  - Cache (@Cacheable)│
                    └──────────┬───────────┘
                               │
                    ┌──────────▼───────────┐
                    │   NewsController     │
                    │  GET /api/v1/news    │
                    │  GET /api/v1/news/{id}│
                    └──────────┬───────────┘
                               │ JSON (ApiResponse)
                    ┌──────────▼───────────┐
                    │   Frontend (React)   │
                    │  News.jsx + NewsCard │
                    │  newsApi.js          │
                    └──────────────────────┘
```

---

## 3. Backend Package Structure

```
news/
├── cache/
│   ├── NewsCacheKeys.java          # Cache key generation for feed cache
│   └── NewsCacheService.java       # Cache eviction service
├── config/
│   ├── NewsApiProperties.java      # @ConfigurationProperties (news.api.*)
│   ├── NewsCacheConfig.java        # Caffeine cache configuration
│   └── NewsExecutorConfig.java     # Thread pool for async source fetching
├── controller/
│   ├── NewsController.java         # GET /api/v1/news, GET /api/v1/news/{id}
│   └── SavedNewsController.java    # CRUD for saved news (/api/v1/news/saved)
├── dto/
│   ├── request/
│   │   ├── NewsRequest.java        # Create/update news DTO
│   │   └── TrustedSourceRequest.java
│   └── response/
│       ├── NewsResponse.java       # Public news response DTO
│       └── SavedNewsResponse.java
├── entity/
│   ├── ApiQuotaLog.java            # GNews daily quota tracking
│   ├── News.java                   # Core news entity
│   ├── SavedNews.java              # User-saved news join entity
│   └── TrustedSource.java          # Registered RSS/GNews sources
├── enums/
│   ├── DateRange.java              # TODAY, YESTERDAY, LAST_7_DAYS, LAST_30_DAYS, ALL
│   ├── NewsCategory.java           # SUBSIDY, LOAN, LAW, WEATHER, MARKET, FARMING_TIP, OTHER
│   ├── NewsStatus.java             # ACTIVE, ARCHIVED, DELETED
│   └── NewsType.java               # INTERNAL, EXTERNAL, WEATHER
├── health/
│   └── NewsSchedulerHealthIndicator.java  # Spring Actuator health check
├── mapper/
│   ├── NewsMapper.java             # Entity ↔ DTO mapping
│   └── SavedNewsMapper.java
├── repository/
│   ├── ApiQuotaLogRepository.java
│   ├── NewsRepository.java         # JPA + Specification executor
│   ├── SavedNewsRepository.java
│   └── TrustedSourceRepository.java
├── scheduler/
│   ├── NewsCleanupScheduler.java   # Archives old news, resets quotas
│   ├── NewsFetchScheduler.java     # @Deprecated — replaced by NewsIngestionScheduler
│   ├── NewsIngestionScheduler.java # Primary scheduler: fetch + persist
│   └── NewsSchedulerState.java     # Volatile state for health checks
├── service/
│   ├── ApiQuotaLogService.java     # GNews quota management
│   ├── NewsService.java            # Service interface
│   ├── NewsServiceImpl.java        # Core business logic
│   ├── SavedNewsService.java
│   └── SavedNewsServiceImpl.java
└── util/
    └── NewsTime.java               # IST timezone constant
```

---

## 4. Database Schema

### `news` Table

| Column           | Type         | Constraints                        | Description                        |
|------------------|--------------|------------------------------------|------------------------------------|
| `id`             | BIGINT (PK)  | AUTO_INCREMENT                     | Primary key                        |
| `title`          | VARCHAR(255) | NOT NULL, UNIQUE                   | Article title                      |
| `summary`        | TEXT         | NOT NULL                           | Article summary/description        |
| `source_name`    | VARCHAR(200) |                                    | Source publication name             |
| `source_url`     | VARCHAR(1000)| NOT NULL                           | Original article URL               |
| `source_url_hash`| VARCHAR(64)  | NOT NULL, UNIQUE                   | SHA-256 hash of source_url         |
| `image_url`      | VARCHAR(1000)|                                    | Article image URL                  |
| `category`       | VARCHAR(50)  | NOT NULL (ENUM)                    | News category                      |
| `news_type`      | VARCHAR(50)  | NOT NULL (ENUM)                    | INTERNAL / EXTERNAL / WEATHER      |
| `status`         | VARCHAR(20)  | NOT NULL, DEFAULT 'ACTIVE'         | ACTIVE / ARCHIVED / DELETED        |
| `language`       | VARCHAR(10)  | NOT NULL, DEFAULT 'en'             | Content language                   |
| `is_important`   | BOOLEAN      | NOT NULL, DEFAULT FALSE            | Priority flag                      |
| `uploaded_by`    | VARCHAR(20)  | NOT NULL, DEFAULT 'SYSTEM'         | SYSTEM / SOURCE / ADMIN            |
| `report_reason`  | VARCHAR(500) |                                    | (Disabled) Report reason text      |
| `report_count`   | INT          | NOT NULL, DEFAULT 0                | (Disabled) Accumulated reports     |
| `created_at`     | DATETIME     | NOT NULL, auto-generated           | Creation timestamp                 |
| `updated_at`     | DATETIME     | NOT NULL, auto-updated             | Last update timestamp              |

**Indexes**: `category`, `news_type`, `is_important`, `created_at`, `language`, `status`

### `saved_news` Table

| Column    | Type        | Constraints       | Description                |
|-----------|-------------|-------------------|----------------------------|
| `id`      | BIGINT (PK) | AUTO_INCREMENT    | Primary key                |
| `user_id` | BIGINT      | NOT NULL          | Reference to user          |
| `news_id` | BIGINT (FK) | NOT NULL → news.id| Reference to news article  |

### `trusted_source` Table

| Column          | Type         | Constraints                   | Description                     |
|-----------------|--------------|-------------------------------|---------------------------------|
| `id`            | BIGINT (PK)  | AUTO_INCREMENT                | Primary key                     |
| `name`          | VARCHAR(200) | NOT NULL, UNIQUE              | Human-readable source name      |
| `domain`        | VARCHAR(200) |                               | Extracted domain                |
| `source_url`    | VARCHAR(1000)| NOT NULL                      | RSS feed URL or GNews endpoint  |
| `category_scope`| VARCHAR(200) |                               | Comma-separated categories      |
| `source_type`   | VARCHAR(50)  | NOT NULL                      | RSS / GNEWS_KEYWORD / GNEWS_TOPIC|
| `fetch_keyword` | VARCHAR(200) |                               | Search keyword (GNews only)     |
| `is_active`     | BOOLEAN      | DEFAULT TRUE                  | Activation toggle               |
| `last_fetched_at`| DATETIME    |                               | Timestamp of last successful fetch|
| `created_at`    | DATETIME     | NOT NULL                      | Row creation timestamp          |

### `api_quota_log` Table

| Column         | Type        | Description                         |
|----------------|-------------|-------------------------------------|
| `id`           | BIGINT (PK) | Primary key                         |
| `api_name`     | VARCHAR(50) | API identifier (e.g. "gnews")       |
| `calls_today`  | INT         | Number of calls made today          |
| `last_call_at` | DATETIME    | Timestamp of the last API call      |

---

## 5. API Contracts

### GET `/api/v1/news`

Fetches paginated news feed for authenticated users.

**Query Parameters:**

| Param        | Type    | Default     | Description                          |
|-------------|---------|-------------|--------------------------------------|
| `category`   | String  | (none)      | Filter: SUBSIDY, LOAN, LAW, etc.     |
| `newsType`   | String  | (none)      | Filter: INTERNAL, EXTERNAL, WEATHER  |
| `language`   | String  | (none)      | Filter by language code              |
| `isImportant`| Boolean | (none)      | Filter important-only news           |
| `keyword`    | String  | (none)      | Full-text search in title/summary    |
| `dateRange`  | String  | (none)      | TODAY, YESTERDAY, LAST_7_DAYS, LAST_30_DAYS, ALL |
| `page`       | int     | 0           | Zero-indexed page number             |
| `size`       | int     | 10          | Items per page (max 100)             |
| `sortBy`     | String  | createdAt   | Sort field ("oldest" for ASC)        |

**Response (200):**
```json
{
  "status": "SUCCESS",
  "message": "News fetched",
  "data": {
    "content": [
      {
        "id": 1,
        "title": "PM Kisan Scheme Update",
        "summary": "New installment dates announced...",
        "sourceName": "PIB Agriculture",
        "sourceUrl": "https://pib.gov.in/...",
        "imageUrl": "https://...",
        "category": "SUBSIDY",
        "newsType": "EXTERNAL",
        "language": "en",
        "isImportant": true,
        "uploadedBy": "SOURCE",
        "status": "ACTIVE",
        "reportCount": 0,
        "isSaved": false,
        "createdAt": "2026-04-01T10:30:00",
        "updatedAt": "2026-04-01T10:30:00"
      }
    ],
    "totalPages": 5,
    "totalElements": 48,
    "number": 0,
    "size": 10
  }
}
```

### GET `/api/v1/news/{id}`

Fetches a single news article by ID.

### POST `/api/v1/news/saved/{newsId}`

Saves a news article for the authenticated user.

### DELETE `/api/v1/news/saved/{newsId}`

Un-saves a previously saved news article.

### GET `/api/v1/news/saved`

Fetches the user's saved news (paginated). Accepts `category`, `keyword`, `dateRange`, `page`, `size`.

### GET `/api/v1/news/saved/{newsId}/check`

Returns `true`/`false` indicating whether the user has saved the given news.

---

## 6. Authentication & Authorization

### Security Configuration

All news endpoints are protected by Spring Security's filter chain in `SecurityConfig.java`:

```java
.requestMatchers("/api/v1/news/saved", "/api/v1/news/saved/**")
    .hasAnyRole("SELLER", "BUYER")
.requestMatchers("/api/v1/news/**")
    .hasAnyRole("BUYER", "SELLER")
```

### Flow

1. **JWT Filter** (`JwtFilter`) extracts and validates the JWT from the `Authorization: Bearer <token>` header
2. **Unauthenticated requests**: Spring Security returns **401 Unauthorized** automatically
3. **Unauthorized role**: Spring Security returns **403 Forbidden** automatically
4. **Frontend handling**:
   - `api.js` → `handleUnauthorized()` clears auth and dispatches `auth:expired` event on 401
   - `newsApi.js` → `unwrap()` intercepts 403 and throws a user-friendly error message
   - `News.jsx` → Listens for `auth:expired` event and redirects to `/login`
   - `News.jsx` → Catches 403 errors and shows toast notification

### Token Extraction

```java
// NewsController.java
private Long extractCurrentUserId(HttpServletRequest request) {
    return jwtService.extractId(request.getHeader("Authorization").substring(7));
}
```

---

## 7. Scheduler Jobs

### 7.1 NewsIngestionScheduler (Primary)

| Property              | Value                                      |
|-----------------------|--------------------------------------------|
| **Class**             | `NewsIngestionScheduler`                   |
| **Annotation**        | `@Component`                               |
| **Cron**              | `${NEWS_SCHEDULER_CRON:0 0 */6 * * *}` (every 6 hours) |
| **Startup**           | `@EventListener(ApplicationReadyEvent.class)` |
| **Thread Pool**       | Dedicated `ExecutorService` (5 threads)    |
| **Resilience**        | Circuit breaker (50% threshold, 60s wait) + Retry (3 attempts, exponential backoff) |
| **Quota Guard**       | `ApiQuotaLogService.tryConsumeGnewsCall()` (90 calls/day) |
| **Metrics**           | Micrometer timers + counters               |
| **Tracing**           | Micrometer tracing spans per source        |

**Startup Flow:**
1. `registerCanonicalSources()` — Upserts 10 default source configs into `trusted_source` table
2. `fetchAllSources()` — Iterates all active trusted sources, fetches and persists new items

**Per-Source Fetch Flow:**
1. Resolve source type (RSS / GNEWS_KEYWORD / GNEWS_TOPIC)
2. Execute fetch with circuit breaker + retry wrapper
3. For each fetched item:
   - Normalize URL and title
   - Deduplicate by `sourceUrl` OR `title`
   - Sanitize image URL (upgrade http→https, block known broken domains)
   - Save to database
4. Update `lastFetchedAt` on the trusted source
5. Record metrics and structured log events

**RSS Fetch:**
- Uses Rome library (`SyndFeedInput`) for parsing
- Connection timeout: `rssTimeoutSeconds` (default 15s)
- Custom User-Agent header
- Image extraction: enclosures → `media:content` → `media:thumbnail` → `<img>` in description HTML

**GNews Fetch:**
- Paginated API calls (`page` param, max `maxItemsPerSource` items)
- Daily quota tracked via `ApiQuotaLogService`
- Quota exceeded → throws `GNEWS_QUOTA_LIMIT_REACHED` → skips remaining GNews sources

### 7.2 NewsCleanupScheduler

| Property              | Value                                      |
|-----------------------|--------------------------------------------|
| **Cron**              | `${NEWS_CLEANUP_CRON:0 0 2 * * *}` (2 AM daily) |
| **Action**            | Archives non-important news older than `retentionDays` (90 days) |
| **Query**             | `UPDATE News SET status = ARCHIVED WHERE status = ACTIVE AND isImportant = false AND createdAt < :cutoff` |
| **Metrics**           | `news.cleanup.archived.total` counter       |

### 7.3 Quota Reset (in NewsCleanupScheduler)

| Property              | Value                                      |
|-----------------------|--------------------------------------------|
| **Cron**              | `${NEWS_QUOTA_RESET_CRON:0 0 0 * * *}` (midnight) |
| **Action**            | Resets the daily GNews API call counter     |

### 7.4 Error Handling & Retry Logic

```
Retry Policy:
  - Max attempts: 3
  - Backoff: Exponential (1s → 2s → 4s)

Circuit Breaker:
  - Failure threshold: 50%
  - Wait in open state: 60 seconds
  - Sliding window: 10 calls
```

If all sources fail in a cycle, `NewsSchedulerState.allSourcesFailedLastCycle` is set to `true`, which is surfaced via the health indicator.

---

## 8. Image Handling Strategy

### Backend (Ingestion)

1. **RSS Sources** — Image extraction priority:
   - `<enclosure>` element URL
   - `<media:content>` element URL
   - `<media:thumbnail>` element URL
   - First `<img src="...">` found in description HTML (Jsoup parse)

2. **GNews Sources** — Direct from `article.image` JSON field

3. **Sanitization** (`sanitizeImageUrl()`):
   - Null/blank → returns null
   - `http://` → upgraded to `https://` (not discarded)
   - Known broken domains blocked: `pbs.twimg.com`, `static.toiimg.com`
   - Invalid URI syntax → returns null

### Frontend (Display)

1. **Loading state**: Shimmer animation placeholder displayed while image loads
2. **Success**: Image fades in with `opacity 0→1` transition (0.35s)
3. **Failure**: `onError` callback sets `imageFailed=true`, which renders a **category-themed placeholder** with an emoji icon:
   - 🌾 Subsidy, 🏦 Loan, ⚖️ Law, 🌦️ Weather, 📊 Market, 🌱 Farming Tip, 📰 Other
4. **CORS**: `crossOrigin="anonymous"` attribute set to handle cross-origin image requests

---

## 9. Pagination Strategy

### Backend

- Spring Data `PageRequest` with configurable sort
- **Page size cap**: max 100 items per page (enforced in `NewsServiceImpl`)
- **Sort options**: `createdAt DESC` (default) or `createdAt ASC` (if `sortBy=oldest`)
- Response includes standard Spring Page metadata: `totalPages`, `totalElements`, `number`, `size`

### Frontend

- `PAGE_SIZE = 10` (default request size)
- Desktop: Numbered button pagination with ellipsis for gaps
- Mobile: Previous/Next buttons with page indicator
- Page resets to 0 when filters change
- Pagination summary: "Showing 1-10 of 48 articles"

---

## 10. Date Filtering Logic

### Backend (IST Timezone)

All date calculations use `NewsTime.IST` (`Asia/Kolkata`):

| DateRange     | From                           | To                |
|---------------|--------------------------------|-------------------|
| `TODAY`       | Start of today (00:00 IST)     | Now               |
| `YESTERDAY`   | Start of yesterday (00:00 IST) | Start of today    |
| `LAST_7_DAYS` | Now minus 7 days               | Now               |
| `LAST_30_DAYS`| Now minus 30 days              | Now               |
| `ALL`         | No filter applied              | —                 |

Implemented as a JPA `Specification` predicate using `cb.between(createdAt, from, to)`.

### Frontend (Date Grouping)

News items are visually grouped under date headers:

| Condition              | Label                               |
|------------------------|-------------------------------------|
| Created today          | **Today**                           |
| Created yesterday      | **Yesterday**                       |
| Older                  | **Month Day** (e.g. "March 28")     |

Grouping is done client-side via `groupNewsByDate()` in `dateUtils.js`, which preserves server sort order.

---

## 11. Caching Strategy

### Configuration (`NewsCacheConfig`)
- **Cache provider**: Caffeine (in-memory)
- **Cache name**: `news-feed`
- **TTL**: `cacheTtlSeconds` (default 120 seconds)

### Cache Key Generation (`NewsCacheKeys`)
Composite key built from: `userId + category + newsType + dateRange + isImportant + keyword + page + size + sortBy`

### Eviction
- `NewsCacheService.evictFeedCache()` called after any write operation:
  - News created/updated/deleted/archived/restored
  - Scheduler saves new items

---

## 12. Frontend Architecture

### File Structure
```
frontend/src/
├── pages/
│   └── News.jsx              # Main news page (filters, tabs, grid, pagination)
├── components/
│   └── NewsCard.jsx           # Individual news card component
├── assets/
│   ├── News.css               # News page styles
│   └── NewsCard.css           # Card styles (image shimmer, badges, layout)
└── lib/
    ├── newsApi.js             # News API client (getNews, saveNews, etc.)
    ├── dateUtils.js           # Date formatting + grouping utilities
    ├── api.js                 # Base API client (fetch wrapper, auth, errors)
    └── auth.js                # Auth utilities (token, role, session)
```

### State Management
- `allState` — News feed data (items, totalPages, loading, error)
- `savedState` — Saved news data
- Filters: `category`, `newsType`, `importantOnly`, `dateRange`, `search`
- Debounced search (350ms delay)
- Optimistic UI updates for save/unsave operations

### Key UX Features
- Sticky filter header with glassmorphism backdrop
- Date range pill strip (horizontal scroll on mobile)
- Skeleton loading cards (6 shimmer cards during fetch)
- Date-based section headers (Today / Yesterday / Date)
- Image shimmer loading → fade-in transition
- Category-themed placeholder images with emoji fallbacks
- Mobile-responsive pagination
- Toast notifications for save/unsave/error feedback

---

## 13. Known Limitations

1. **GNews Free Tier**: Limited to 100 API calls/day and max 10 articles per request. The scheduler paginates but may hit quota limits with many keyword sources.

2. **No Full-Text Search Index**: Keyword search uses SQL `LIKE %keyword%` which has linear scan performance. For high-volume production, consider adding a full-text index or Elasticsearch.

3. **Image Availability**: Many agricultural RSS feeds do not include images. The fallback placeholder covers this, but the visual experience is less rich.

4. **Single Language**: Currently hardcoded to `en` (English). Multi-language support requires additional source configuration and i18n work.

5. **No User-Generated Content**: All news is system-ingested. There is no user submission or editorial workflow.

6. **Cache per User**: The cache key includes `userId` for saved-status accuracy, which may reduce cache hit rate in high-traffic scenarios.

---

## 14. Disabled Features

### Report Feature
> **Status**: Temporarily disabled  
> **Comment**: `// TODO: Report feature temporarily disabled — to be re-enabled in future release.`

The report feature allows users to flag inappropriate news articles. When a news item accumulates 5+ reports, it is auto-archived. This is disabled pending implementation of a content moderation workflow.

**Affected files:**
- `SecurityConfig.java` — Route matcher commented out
- `NewsController.java` — `@PostMapping("/{id}/report")` block-commented
- `NewsService.java` — `reportNews()` method signature commented
- `NewsServiceImpl.java` — `reportNews()` implementation block-commented
- `newsApi.js` — `reportNews()` export commented
- `NewsCard.jsx` — Report button JSX commented

**Database fields preserved:**
- `news.report_reason` (VARCHAR 500)
- `news.report_count` (INT, default 0)

---

## Configuration Reference

All configurable properties under `news.api.*` prefix:

| Property                 | Default                     | Description                            |
|--------------------------|-----------------------------|----------------------------------------|
| `key`                    | `${NEWS_API_KEY}`          | GNews API key                          |
| `gnews-url`              | `https://gnews.io/api/v4`  | GNews base URL                         |
| `rss-timeout-seconds`    | `15`                        | RSS connection/read timeout            |
| `gnews-timeout-seconds`  | `5`                         | GNews request timeout                  |
| `max-items-per-source`   | `100`                       | Max items fetched per source per cycle |
| `scheduler-cron`         | `0 0 */6 * * *`            | Ingestion schedule (every 6 hours)     |
| `cleanup-cron`           | `0 0 2 * * *`              | Cleanup schedule (2 AM daily)          |
| `quota-reset-cron`       | `0 0 0 * * *`              | Quota reset schedule (midnight)        |
| `retention-days`         | `90`                        | Days before non-important news archived|
| `scheduler-enabled`      | `true`                      | Master scheduler toggle                |
| `gnews-enabled`          | `true`                      | GNews source toggle                    |
| `executor-pool-size`     | `5`                         | Async fetch thread pool size           |
| `gnews-daily-limit`      | `90`                        | Max GNews API calls per day            |
| `cache-ttl-seconds`      | `120`                       | Feed cache TTL                         |
| `healthy-within-hours`   | `7`                         | Health indicator: healthy window       |
| `stale-within-hours`     | `13`                        | Health indicator: stale threshold      |
