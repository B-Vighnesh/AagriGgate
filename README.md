
# AagriGgate – Agricultural Trade Platform

## Overview

**AagriGgate** is a full-stack web application that connects **farmers and buyers** on a digital platform to simplify agricultural trade.
The platform allows farmers to list crops, buyers to search and approach farmers, and both parties to interact securely through an authenticated system.

The system is built using:

* **Spring Boot** (Backend API)
* **React + Vite** (Frontend)
* **MySQL** (Database)
* **JWT Authentication** (Security)

---

## Features

* Farmer and Buyer Registration
* Login with JWT Authentication
* Email Verification with OTP
* Crop Listing Management (Add / Update / Delete)
* Buyer → Farmer Approach System
* Enquiry Management
* Market Data Storage
* Role-Based Access Control (Admin / Farmer / Buyer)
* Secure API with Spring Security

---

## Tech Stack

### Backend

* Java
* Spring Boot
* Spring Security
* JWT Authentication
* Spring Data JPA (Hibernate)
* Maven
* MySQL

### Frontend

* React.js
* Vite
* JavaScript
* CSS


---

## Project Structure

```
AagriGgate/
│
├── backend/        # Spring Boot Application
├── frontend/       # React Application (Vite)
└── README.md
```

### Backend Architecture (Layered Architecture)

```
Controller → Service → Repository → Database
```

| Layer      | Responsibility                 |
| ---------- | ------------------------------ |
| Controller | Handles HTTP requests          |
| Service    | Business logic                 |
| Repository | Database operations            |
| Security   | Authentication & Authorization |
| JWT        | Token generation & validation  |

---

## Installation & Setup

### Prerequisites

Make sure you have installed:

* Java 21+
* Node.js 18+
* MySQL 8+
* Maven

---

## Backend Setup

```bash
cd backend
```

Configure database in:

```
src/main/resources/application.properties
```

Example:

```properties
spring.datasource.url=jdbc:mysql://localhost:3306/agrigate
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update
```

Run backend:

```bash
./mvnw spring-boot:run
```

Backend runs on:

```
http://localhost:8080
```

---

## Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on:

```
http://localhost:5173
```

---

## Authentication Flow (How Login Works)

1. User registers (Farmer/Buyer)
2. Email OTP verification
3. User logs in
4. Server generates **JWT token**
5. Frontend stores token
6. Token sent in API requests
7. Backend validates token and allows access

---

## API Modules

| Module   | Description               |
| -------- | ------------------------- |
| Auth     | Login / Register          |
| Farmer   | Farmer account management |
| Buyer    | Buyer account management  |
| Crop     | Crop CRUD operations      |
| Approach | Buyer approaches farmer   |
| Enquiry  | Communication             |
| Market   | Market data               |
| Admin    | Admin controls            |

---

## Build for Production

### Backend

```bash
./mvnw clean package
java -jar target/*.jar
```

### Frontend

```bash
npm run build
```

Output folder:

```
frontend/dist/
```

---

## Future Improvements

* Payment integration
* Real-time chat
* Crop price prediction
* Mobile app version
* Notifications system

---

## License

This project is developed for **educational and development purposes**.

---
