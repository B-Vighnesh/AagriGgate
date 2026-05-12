[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

# AagriGgate

In India, farmers receive as little as 30–40% of the final price a buyer pays — the rest is absorbed by middlemen, commission agents, and logistics brokers. AagriGgate eliminates that chain entirely.
AagriGgate is a full-stack agriculture marketplace where farmers list crops and buyers purchase directly — with real-time chat, live market prices, and weather-driven decisions built in. No agents. No markups. No information asymmetry.

---

## Live Deployments

### Production Deployments

* Deployment 1 (AWS):
  [https://d3bnt1t6yx1asq.cloudfront.net](https://d3bnt1t6yx1asq.cloudfront.net)

* Deployment 2 (Vercel):
  [https://aagriggate.vercel.app](https://aagriggate.vercel.app)

---

## Project Overview

AagriGgate enables:

* Direct farmer-to-buyer trading
* Crop listing and request management
* Real-time chat between farmers and buyers
* Real-time notifications system
* Data-driven decision making using:

  * Market price data
  * Weather information
  * Agriculture-related updates

The platform also includes features such as urgent crop selling and waste crop selling to help reduce crop wastage and improve selling efficiency.

---

## Problem Statement

Traditional agriculture marketplaces involve multiple intermediaries, which:

* Reduce farmer profits
* Increase buyer costs
* Limit access to real-time data

This system addresses these issues by enabling:

* Direct interaction between farmers and buyers
* Access to real-time market and weather data
* Improved decision-making and communication

---

## Solution

AagriGgate provides:

* Direct farmer-to-buyer marketplace
* Crop listing and management
* Buyer search, filter, and cart workflow
* Request/approach system
* OTP-based authentication
* JWT-based authorization
* Weather and market price integration
* Real-time chat functionality
* Real-time notifications
* Role-based dashboards

---

## System Architecture

### Architecture Flow

```text
React Frontend (Vite)
        │
        ├── REST API (HTTP/HTTPS)
        │         │
        │         ▼
        │   Spring Boot Backend
        │         │
        │         ├── MySQL Database
        │         ├── Weather API
        │         ├── Market Price API
        │         └── News API
        │
        └── WebSocket (STOMP over SockJS)
                  │
                  ▼
          Spring Boot WebSocket Broker
                  │
                  ├── Real-time Chat (Farmer ↔ Buyer)
                  └── Real-time Notifications
```
---

### Layers

| Layer             | Technology              | Responsibility                   |
| ----------------- | ----------------------- | -------------------------------- |
| Client            | React + Vite            | UI and API interaction           |
| API Layer         | Spring Boot             | REST endpoints                   |
| Service Layer     | Spring Boot             | Business logic                   |
| Security Layer    | Spring Security + JWT   | Authentication and authorization |
| Persistence Layer | Spring Data JPA         | Database operations              |
| Database          | MySQL      | Data storage                     |
| External Services | Weather API, Market API | External data                    |

---

## Tech Stack

### Backend

* Java 21
* Spring Boot
* Spring Security
* Spring Data JPA (Hibernate)
* Maven
* JWT Authentication
* Spring Mail (OTP)

### Frontend

* React 18
* Vite
* React Router
* Axios
* CSS

### Database

* MySQL
* Flyway (Production migrations)

---

## Core Features

### Authentication & Security

* Seller and buyer registration
* OTP verification
* Password login
* OTP login
* Forgot password with OTP
* JWT-based authentication
* Role-based authorization

### Farmer Features

* Add, update, delete crops
* Upload crop images
* Mark crops (urgent, waste, available, sold)
* Set discount price
* View buyer requests
* Accept/reject requests
* Weather lookup
* Market price lookup and save
* Real-time buyer chat
* Instant notifications

### Buyer Features

* Browse crops
* Search crops
* Filter and sort crops
* Add to favorites
* Add to cart
* Send purchase request
* Checkout cart
* Track requests
* Real-time farmer chat
* Instant notifications

### Platform Features

* Pagination
* Filtering and sorting
* DTO-based API responses
* Separate image endpoints
* Scheduled cleanup jobs
* Responsive UI
* Real-time communication system
* Notification delivery system

---

## Database Design

### Main Tables

* farmer
* buyer
* crop
* cart_item
* favorite
* approach_farmer
* saved_market_data
* enquiry
* login_otp
* registration_otp
* password_reset_otp
* notification
* chat_message

### Relationships

* One Farmer → Many Crops
* One Buyer → Many Cart Items
* One Buyer → Many Favorites
* One Buyer → Many Approaches
* One Crop → Many Approaches
* Farmer ↔ Buyer Chat Messages

---

## API Overview

### Authentication

* POST /api/v1/auth/register
* POST /api/v1/auth/login
* POST /api/v1/auth/otp-login
* POST /api/v1/auth/forgot-password
* POST /api/v1/auth/reset-password

### Crops

* POST /api/v1/crops
* GET /api/v1/crops
* GET /api/v1/crops/{id}
* PUT /api/v1/crops/{id}
* DELETE /api/v1/crops/{id}

### Cart

* GET /api/v1/cart
* POST /api/v1/cart/add
* DELETE /api/v1/cart/remove
* POST /api/v1/cart/checkout

### Favorites

* POST /api/v1/favorites
* GET /api/v1/favorites
* DELETE /api/v1/favorites/{id}

### Approaches

* POST /api/v1/approach
* GET /api/v1/approach/buyer
* GET /api/v1/approach/farmer
* PUT /api/v1/approach/{id}/accept
* PUT /api/v1/approach/{id}/reject

### Market & Weather

* GET /api/v1/market/prices
* GET /api/v1/weather

### Chat & Notifications

* GET /api/v1/chat
* POST /api/v1/chat/send
* GET /api/v1/notifications
* PUT /api/v1/notifications/read

---

## User Flow

### Farmer Flow

Register → Verify OTP → Login → Add Crop → Buyer Sends Request → Real-time Chat → Accept Request → Crop Sold

### Buyer Flow

Register → Verify OTP → Login → Browse Crops → Add to Cart → Send Request → Real-time Chat → Farmer Accepts → Purchase Completed

---

## Local Setup

### Prerequisites

* Java 21
* Node.js
* npm
* Maven
* MySQL

### Run Backend

```bash
cd backend
./mvnw spring-boot:run
```

Backend URL:

```text
http://localhost:8080/api/v1
```

### Run Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend URL:

```text
http://localhost:5173
```

---

## Environment Variables

```env
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
```

---

## Deployment

* Backend: AWS EC2
* Frontend: AWS CloudFront and Vercel
* Database: MySQL

### Live URLs

* [https://d3bnt1t6yx1asq.cloudfront.net](https://d3bnt1t6yx1asq.cloudfront.net)
* [https://aagriggate.vercel.app](https://aagriggate.vercel.app)

---


## Contributors

* B. Vighnesh Kumar
* Joylan Dsouza

---

## License

This project is licensed under the MIT License.
