# News Manual

This manual covers how to run, test, and validate the hardened News feature in AagriGgate.

## Manual Security Action

Revoke the exposed GNews key `63a3f1fd8c9c25b008ebe112c5946a00` in the GNews dashboard and replace it with a new key stored only in environment variables before running the scheduler anywhere.

## Local Run Commands

### Backend

```powershell
cd d:\Agri-AVJ-Project\AagriGgate\backend
$env:DB_URL="jdbc:mysql://localhost:3306/app"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="your-db-password"
$env:JWT_SECRET="your-jwt-secret"
$env:NEWS_API_KEY="your-gnews-key"
$env:WEATHER_API_KEY="your-weather-key"
$env:MARKET_API_KEY="your-market-key"
$env:ADMIN_USERNAME="your-admin-username"
$env:ADMIN_PASSWORD="your-admin-password"
$env:EMAIL_USERNAME="your-mail-username"
$env:EMAIL_PASSWORD="your-mail-password"
.\mvnw.cmd spring-boot:run
```

Backend base URL:

```text
http://localhost:8080
```

### Frontend

```powershell
cd d:\Agri-AVJ-Project\AagriGgate\frontend
npm install
npm run dev
```

Frontend base URL:

```text
http://localhost:5173
```

## Frontend Pages To Open

- News feed: `http://localhost:5173/news`
- Saved tab: open `/news` and switch to `Saved`

## Core API Endpoints

### News

- `GET /api/v1/news`
- `GET /api/v1/news/{id}`
- `POST /api/v1/news/{id}/view`

All news endpoints require a JWT for `BUYER` or `SELLER` users.

### Saved News

- `GET /api/v1/news/saved`
- `POST /api/v1/news/saved/{newsId}`
- `DELETE /api/v1/news/saved/{newsId}`
- `GET /api/v1/news/saved/{newsId}/check`

### Admin Auth

- `POST /api/v1/admin/login`

Admin login returns `ApiResponse<AdminAuthResponse>` with a 30-minute JWT.

### Admin News

- `POST /api/v1/admin/news`
- `PUT /api/v1/admin/news/{id}`
- `DELETE /api/v1/admin/news/{id}`
- `GET /api/v1/admin/news`
- `PATCH /api/v1/admin/news/{id}/archive`
- `PATCH /api/v1/admin/news/{id}/restore`

### Admin Sources

- `POST /api/v1/admin/sources`
- `GET /api/v1/admin/sources`
- `PUT /api/v1/admin/sources/{id}`
- `DELETE /api/v1/admin/sources/{id}`
- `POST /api/v1/admin/sources/{id}/trigger-fetch`

All `/api/v1/admin/**` endpoints except `/api/v1/admin/login` require an `Authorization: Bearer <admin_jwt_token>` header with `role=ADMIN`.

## Manual Test Checklist

### Auth Guard

1. Open `/news` while logged out.
2. Confirm the app redirects to `/login`.
3. Confirm the login page shows `Please log in to read news and alerts.`.

### News Feed

1. Log in as a buyer or seller.
2. Open `/news`.
3. Confirm date pills appear above the filter bar.
4. Test search, category, type, and `Important Only`.
5. Test date filters: Today, Yesterday, Last 7 days, Last 30 days.
6. Confirm the feed uses number pagination on desktop and simplified pagination on mobile.
7. Click a card and confirm the source URL opens in a new tab.

### Saved Tab

1. Save a news item from `All News`.
2. Switch to the `Saved` tab.
3. Confirm the item appears there.
4. Unsave it.
5. Confirm it disappears immediately.

### Admin Flow

1. Run `POST /api/v1/admin/login` with the configured admin username and password.
2. Store the returned token as `admin_jwt_token`.
3. Use that token to create, update, archive, restore, and delete news.
4. Use the same token to manage trusted sources.

### Scheduler And Cleanup

1. Confirm canonical trusted sources exist after startup or migration.
2. Trigger a source fetch with the admin API.
3. Confirm metrics appear under `/actuator/prometheus`.
4. Confirm `/actuator/health` includes `newsScheduler`.
5. Confirm old non-important news is archived by the cleanup scheduler.

## Notes

- News is no longer public.
- The report feature is intentionally disabled for Level 1.
- The `news-feed` cache is user-aware and is evicted on save, unsave, admin news mutations, and successful scheduler insert batches.
- Backend tests now include disabled skeleton classes for controller security, services, scheduler ingestion, saved-news behavior, and cleanup behavior.
