
# AagriGgate

AagriGgate is a full-stack agriculture marketplace and decision-support platform designed to enable direct trade between farmers and buyers. The system allows farmers to list crops and buyers to browse and send purchase requests, while also providing real-time market price, weather, and agriculture insights.

---

## Project Overview

AagriGgate enables:

- Direct farmer-to-buyer trading
- Crop listing and request management
- Data-driven decision making using:
  - Market price data
  - Weather information
  - Agriculture-related updates

The platform also includes features such as urgent crop selling and waste crop selling to help reduce crop wastage and improve selling efficiency.

---

## Problem Statement

Traditional agriculture marketplaces involve multiple intermediaries, which:

- Reduce farmer profits
- Increase buyer costs
- Limit access to real-time data

This system addresses these issues by enabling:

- Direct interaction between farmers and buyers
- Access to real-time market and weather data
- Improved decision-making and communication

---

## Solution

AagriGgate provides:

- Direct farmer-to-buyer marketplace
- Crop listing and management
- Buyer search, filter, and cart workflow
- Request/approach system
- OTP-based authentication
- JWT-based authorization
- Weather and market price integration
- Role-based dashboards

---

## System Architecture

Architecture Flow:


React Frontend → REST API → Spring Boot Backend → Database
↓
External APIs (Weather, Market)



### Layers

| Layer | Technology | Responsibility |
|------|-----------|---------------|
| Client | React + Vite | UI and API interaction |
| API Layer | Spring Boot | REST endpoints |
| Service Layer | Spring Boot | Business logic |
| Security Layer | Spring Security + JWT | Authentication and authorization |
| Persistence Layer | Spring Data JPA | Database operations |
| Database | MySQL / PostgreSQL | Data storage |
| External Services | Weather API, Market API | External data |


## Tech Stack

### Backend
- Java 21
- Spring Boot
- Spring Security
- Spring Data JPA (Hibernate)
- Maven
- JWT Authentication
- Spring Mail (OTP)

### Frontend
- React 18
- Vite
- React Router
- Axios
- CSS

### Database
- MySQL (Development)
- PostgreSQL (Production)
- Flyway (Production migrations)

---

## Core Features

### Authentication & Security
- Seller and buyer registration
- OTP verification
- Password login
- OTP login
- Forgot password with OTP
- JWT-based authentication
- Role-based authorization

### Farmer Features
- Add, update, delete crops
- Upload crop images
- Mark crops (urgent, waste, available, sold)
- Set discount price
- View buyer requests
- Accept/reject requests
- Weather lookup
- Market price lookup and save

### Buyer Features
- Browse crops
- Search crops
- Filter and sort crops
- Add to favorites
- Add to cart
- Send purchase request
- Checkout cart
- Track requests

### Platform Features
- Pagination
- Filtering and sorting
- DTO-based API responses
- Separate image endpoints
- Scheduled cleanup jobs
- Responsive UI

---

## Database Design

Main Tables:

- farmer
- buyer
- crop
- cart_item
- favorite
- approach_farmer
- saved_market_data
- enquiry
- login_otp
- registration_otp
- password_reset_otp
- notification

### Relationships

- One Farmer → Many Crops
- One Buyer → Many Cart Items
- One Buyer → Many Favorites
- One Buyer → Many Approaches
- One Crop → Many Approaches

---

## API Overview

### Authentication
- POST /api/v1/auth/register
- POST /api/v1/auth/login
- POST /api/v1/auth/otp-login
- POST /api/v1/auth/forgot-password
- POST /api/v1/auth/reset-password

### Crops
- POST /api/v1/crops
- GET /api/v1/crops
- GET /api/v1/crops/{id}
- PUT /api/v1/crops/{id}
- DELETE /api/v1/crops/{id}

### Cart
- GET /api/v1/cart
- POST /api/v1/cart/add
- DELETE /api/v1/cart/remove
- POST /api/v1/cart/checkout

### Favorites
- POST /api/v1/favorites
- GET /api/v1/favorites
- DELETE /api/v1/favorites/{id}

### Approaches
- POST /api/v1/approach
- GET /api/v1/approach/buyer
- GET /api/v1/approach/farmer
- PUT /api/v1/approach/{id}/accept
- PUT /api/v1/approach/{id}/reject

### Market & Weather
- GET /api/v1/market/prices
- GET /api/v1/weather

---

## User Flow

### Farmer Flow
Register → Verify OTP → Login → Add Crop → Buyer Sends Request → Accept Request → Crop Sold

### Buyer Flow
Register → Verify OTP → Login → Browse Crops → Add to Cart → Send Request → Farmer Accepts → Purchase Completed

---

## Local Setup

### Prerequisites
- Java 21
- Node.js
- npm
- Maven
- MySQL

### Run Backend


cd backend
./mvnw spring-boot:run



Backend URL:

http://localhost:8080/api/v1


### Run Frontend


cd frontend
npm install
npm run dev

Frontend URL:

http://localhost:5173


---

## Environment Variables

SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080

DB_URL=jdbc:mysql://localhost:3306/app
DB_USERNAME=root
DB_PASSWORD=replace_me


EMAIL_USERNAME=your-email@example.com
EMAIL_PASSWORD=replace_me

APP_SECURITY_USER=dev-user
APP_SECURITY_PASSWORD=replace_me

JWT_SECRET=base64_encoded_32_byte_secret_here

MARKET_API_INGEST_ON_STARTUP=false
MARKET_API_STARTUP_STATE=Karnataka
MARKET_API_STARTUP_DISTRICT=Bangalore
WEATHER_API_URL=https://api.weatherapi.com/v1/current.json
WEATHER_API_KEY=replace_me

MARKET_API_URL=https://api.data.gov.in/resource/35985678-0d79-46b4-9ed6-6f13308a1d24
MARKET_API_KEY=replace_me

NEWS_GNEWS_URL=https://gnews.io/api/v4
NEWS_API_KEY=replace_me

ADMIN_USERNAME=admin
ADMIN_PASSWORD=replace_me

APP_CORS_ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173,http://localhost:5174

NEWS_API_CLEANUP_CRON=0 0 0 * * *
NEWS_API_QUOTA_RESET_CRON=0 0 0 * * *
NEWS_API_SCHEDULER_CRON=0 0 0 * * *
MARKET_API_INGESTION_CRON=0 0 9 * * *
OTP_CLEANUP_CRON=0 */5 * * * *


---

## Deployment

- Backend: Render
- Frontend: Vercel
- Database: PostgreSQL
- Containerization: Docker

---

## Future Improvements

- Real-time chat between farmer and buyer
- Notifications system
- Price trend analytics
- Price prediction
- Multi-language support
- Transport booking
- Payment / escrow system
- Admin moderation system

---

## Contributors

- B. Vighnesh Kumar
- Akash D. Shenvi
- Joylan Dsouza

---

## License

This project is licensed under the MIT License.

