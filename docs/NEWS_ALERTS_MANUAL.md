# News & Alerts Manual

This manual covers how to run, test, and validate the Level 1 `News + Weather Alerts` feature in AagriGgate.

## Files Added For Testing

- `postman/AagriGgate-News-Alerts.postman_collection.json`
- `postman/AagriGgate-News-Alerts.postman_environment.json`

## Import Into Postman

1. Open Postman.
2. Click `Import`.
3. Import:
   - `postman/AagriGgate-News-Alerts.postman_collection.json`
   - `postman/AagriGgate-News-Alerts.postman_environment.json`
4. Select the `AagriGgate Local` environment.

## Local Run Commands

### Backend

```powershell
cd d:\Agri-AVJ-Project\AagriGgate\backend
$env:DB_URL="jdbc:mysql://localhost:3306/app"
$env:DB_USERNAME="root"
$env:DB_PASSWORD="joylan123"
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

- Public news feed: `http://localhost:5173/news`
- Saved news page: `http://localhost:5173/news/saved`

## Sample Admin Request Bodies

### Create News

```json
{
  "title": "Demo Market Update",
  "summary": "A fresh market advisory for testing the News & Alerts module.",
  "sourceName": "AagriGgate QA",
  "sourceUrl": "https://example.com/news/demo-market-update",
  "imageUrl": "https://example.com/images/demo-market-update.jpg",
  "category": "MARKET",
  "newsType": "EXTERNAL",
  "language": "en",
  "isImportant": false
}
```

### Update News

```json
{
  "title": "Demo Market Update Revised",
  "summary": "Updated text for the same demo news item.",
  "sourceName": "AagriGgate QA",
  "sourceUrl": "https://example.com/news/demo-market-update-revised",
  "imageUrl": "https://example.com/images/demo-market-update-revised.jpg",
  "category": "MARKET",
  "newsType": "EXTERNAL",
  "language": "en",
  "isImportant": true
}
```

### Create Trusted Source

```json
{
  "name": "Gov Alerts Feed",
  "domain": "example.com",
  "sourceUrl": "https://example.com/rss",
  "categoryScope": "WEATHER,ALERT",
  "isActive": true
}
```

## Core API Endpoints

### Public

- `GET /api/v1/news`
- `GET /api/v1/news/{id}`
- `POST /api/v1/news/{id}/view`

### Saved News

- `GET /api/v1/news/saved`
- `POST /api/v1/news/saved/{newsId}`
- `DELETE /api/v1/news/saved/{newsId}`
- `GET /api/v1/news/saved/{newsId}/status`

### Admin News

- `POST /api/v1/admin/news?username=admin&password=admin123`
- `PUT /api/v1/admin/news/{id}?username=admin&password=admin123`
- `DELETE /api/v1/admin/news/{id}?username=admin&password=admin123`
- `GET /api/v1/admin/news?username=admin&password=admin123`
- `POST /api/v1/admin/news/{id}/archive?username=admin&password=admin123`

### Admin Sources

- `POST /api/v1/admin/sources?username=admin&password=admin123`
- `GET /api/v1/admin/sources?username=admin&password=admin123`
- `PUT /api/v1/admin/sources/{id}?username=admin&password=admin123`
- `DELETE /api/v1/admin/sources/{id}?username=admin&password=admin123`

## Manual Test Checklist

### Public Feed

1. Open `/news`.
2. Confirm at least one news card appears.
3. Test search by title keyword.
4. Test category filter.
5. Test news type filter.
6. Test `Important only`.
7. Test `Newest` and `Oldest`.
8. Click a card and confirm the source URL opens.

### Saved News

1. Log in as a valid buyer or seller.
2. Open `/news`.
3. Save a news item.
4. Open `/news/saved`.
5. Confirm the item appears.
6. Unsave it.
7. Confirm it disappears from `/news/saved`.

### Admin News

1. Run `Create News`.
2. Run `Get Admin News`.
3. Confirm the new item appears.
4. Run `Archive News`.
5. Confirm the item disappears from the public feed.
6. Run `Delete News`.
7. Confirm the item is visible only in admin listing with `status=DELETED`.

### Admin Sources

1. Run `Create Trusted Source`.
2. Run `Get Trusted Sources`.
3. Confirm the source appears.
4. Run `Update Trusted Source`.
5. Run `Deactivate Trusted Source`.

### Notifications

1. Create a news item with:
   - `isImportant = true`
   - `category = LAW`, `SUBSIDY`, `LOAN`, `ALERT`, or `WEATHER`
2. Confirm the creation succeeds.
3. Confirm notification attempts are written to `notification_log`.

## Notes

- Backend root `http://localhost:8080` is not the frontend UI.
- Use `http://localhost:5173` for the user-facing app.
- Saved-news API calls require a JWT.
- The scheduler currently logs fetch attempts and is scaffolded for future source parsing.
