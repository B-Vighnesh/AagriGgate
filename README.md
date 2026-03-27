# AagriGgate

AagriGgate is a full-stack agriculture marketplace that connects farmers and buyers for direct crop trade. The platform combines crop listing, market price lookup, weather support, buyer request workflows, favorites, cart, OTP-based authentication, and role-aware dashboards in one system.

## What The Project Does

- Farmers can register, manage their profile, add crops, update listings, mark crops as urgent or waste, and handle buyer requests.
- Buyers can register, browse crops, filter and sort listings, save favorites, add crops to cart, and send purchase approaches.
- The platform supports direct interaction without a marketplace middleman workflow.
- Market price and weather features help users make better selling and buying decisions.

## Current Feature Set

### Authentication

- Seller and buyer registration
- OTP verification during registration
- Password login
- OTP-based login
- Forgot password with OTP
- JWT-based session handling

### Farmer Features

- Add crop with image upload
- Update crop details
- Delete crop
- View own crops with pagination
- Mark crop as:
  - urgent
  - waste
  - available
  - sold
- Set discount price
- View buyer approaches
- Accept or reject buyer approaches
- Weather lookup for own location
- Market price lookup and save market records

### Buyer Features

- Browse all crops with pagination
- Search by crop name
- Filter by:
  - normal
  - urgent
  - waste
  - discount
- Sort by:
  - newest
  - oldest
  - price low to high
  - price high to low
- View crop details
- Save favorites
- Add to cart
- Send approach directly
- Checkout cart into requests
- Track own requests

### Platform Features

- Feature-based backend package structure
- Lean DTO-based crop listing responses
- Separate crop image endpoint to avoid heavy list payloads
- Scheduled cleanup for sold crop items
- Responsive React UI

## Tech Stack

### Backend

- Java 21
- Spring Boot 3.3.4
- Spring Security
- Spring Data JPA
- Hibernate
- JWT
- Maven
- MySQL for local development
- PostgreSQL support for production
- Spring Mail

### Frontend

- React 18
- Vite
- React Router DOM
- CSS

## Project Structure

```text
AagriGgate/
├── backend/
│   ├── src/main/java/com/MyWebpage/register/login/
│   │   ├── admin/
│   │   ├── approach/
│   │   ├── auth/
│   │   ├── buyer/
│   │   ├── cart/
│   │   ├── crop/
│   │   ├── favorite/
│   │   ├── farmer/
│   │   ├── market/
│   │   ├── passwordreset/
│   │   ├── security/
│   │   ├── verification/
│   │   └── weather/
│   └── src/main/resources/
└── frontend/
    ├── src/components/
    ├── src/api/
    ├── src/lib/
    └── src/index.css
```

## Important API Areas

The backend is organized by feature. Main modules currently include:

- `auth` - registration, login, OTP login, password management
- `farmer` - farmer profile endpoints
- `buyer` - buyer profile endpoints
- `crop` - crop CRUD, search, sort, filtering, image fetch
- `approach` - buyer requests and farmer request management
- `favorite` - buyer favorites
- `cart` - buyer cart and checkout
- `market` - market price and saved market data
- `weather` - weather lookup
- `verification` - farmer verification endpoint
- `admin` - admin login and enquiries

## Frontend Pages

Key pages currently available:

- Home
- Login
- Register
- Account
- Add Crop
- My Crops
- Browse Crops
- Crop Details
- Favorites
- Cart
- Farmer Requests
- Buyer Requests
- Market
- Weather
- Settings
- Forgot Password
- Enquiry / Contact

## Local Development Setup

## Prerequisites

- Java 21
- Node.js 18 or later
- npm
- Maven
- MySQL running locally if using the default dev profile

## Backend Setup

Move into the backend project:

```bash
cd backend
```

Run the app with Maven wrapper:

```bash
./mvnw spring-boot:run
```

On Windows PowerShell:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend default base URL is:

```text
http://localhost:8080/api/v1
```

### Backend Configuration

Common config files:

- `backend/src/main/resources/application.yml`
- `backend/src/main/resources/application-dev.yml`
- `backend/src/main/resources/application-prod.yml`

### Local Development Defaults

The current development config uses MySQL by default:

- `DB_URL=jdbc:mysql://localhost:3306/app`
- `DB_USERNAME=root`
- `DB_PASSWORD=1234`

It also expects values for:

- `EMAIL_USERNAME`
- `EMAIL_PASSWORD`
- `JWT_SECRET`
- `WEATHER_API_URL`
- `WEATHER_API_KEY`
- `MARKET_API_URL`
- `MARKET_API_KEY`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

Some dev defaults are already present in `application-dev.yml`, but it is still better to keep secrets in environment variables.

## Frontend Setup

Move into the frontend project:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the Vite dev server:

```bash
npm run dev
```

The frontend runs on:

```text
http://localhost:5173
```

### Frontend Environment

Example frontend env file:

```env
VITE_API_BASE_URL=https://aagriggate-1.onrender.com/
```

For local backend development, set:

```env
VITE_API_BASE_URL=http://localhost:8080/api/v1
```

## Build Commands

### Backend

Compile:

```bash
./mvnw compile
```

Package:

```bash
./mvnw clean package
```

### Frontend

Build:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

## Authentication Flow

1. User registers as seller or buyer.
2. OTP verification completes registration.
3. User logs in using password or OTP.
4. Backend returns JWT and role.
5. Frontend stores token and role.
6. Protected API calls send the token in the `Authorization` header.
7. Backend authorizes access based on JWT role.

## Notes On API Design

- Crop list endpoints use DTO projections to keep responses lighter.
- Crop images are fetched through a dedicated image endpoint instead of embedding large image blobs in list responses.
- Request, favorites, and cart pages use pagination with a default page size of `10`.
- Search and filters for crop browsing are handled on the backend for more realistic pagination behavior.

## Production Notes

- The project includes:
  - `backend/Dockerfile`
  - frontend production env support through `.env.production`
- Production backend config is set up for PostgreSQL in `application-prod.yml`.

## Suggested Future Work

These ideas are already aligned with the project direction:

- Admin moderation and suspension workflows
- Chat between farmer and buyer
- Notifications
- Price trend analytics
- Price prediction
- Multi-language support
- Transport booking
- Escrow/payment workflows

## Repository Notes

- The backend was refactored into a feature-based package layout.
- If you move DTOs or entities between packages, update any JPQL `SELECT new ...` constructor query strings to the new fully qualified class names.

## License

This project is currently intended for academic, portfolio, and product development use.
