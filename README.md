# AagriGgate

AagriGgate is a full-stack web application designed to facilitate agricultural trade by connecting farmers and buyers through a secure and structured digital platform. The application provides functionality for farmer registration, crop management, buyer interaction, authentication, and market data handling.

The system is built using a Spring Boot backend and a React (Vite) frontend, with MySQL as the primary database and JWT-based authentication for secure access.

---

# Table of Contents

- Project Overview
- Technology Stack
- Project Structure
- Backend Architecture
- Frontend Architecture
- Installation and Setup
- Backend Configuration
- Frontend Configuration
- Running the Application
- Authentication and Security
- Environment Configuration
- Build and Deployment

---

# Project Overview

The platform provides the following capabilities:

- Farmer registration and account management
- Buyer registration and authentication
- Crop listing and management
- Farmer–buyer interaction system
- Enquiry and approach management
- Market data storage
- Email verification and OTP services
- Secure authentication using JWT
- Role-based security configuration

The project is divided into two main modules:

- Backend – Spring Boot REST API
- Frontend – React application using Vite

---

# Technology Stack

## Backend

- Java
- Spring Boot
- Spring Security
- JWT Authentication
- Spring Data JPA
- Hibernate
- Maven
- MySQL

## Frontend

- React.js
- Vite
- JavaScript
- CSS

## Tools and Configuration

- Maven Wrapper
- ESLint
- PostCSS
- Environment configuration support

---

# Project Structure

AagriGgate-main

├── backend
│   ├── pom.xml
│   ├── mvnw
│   ├── mvnw.cmd
│   ├── src/main/java/com/MyWebpage/register/login
│   │   ├── Application.java
│   │   ├── WebConfig.java
│   │   │
│   │   ├── controller
│   │   │   ├── AdminController.java
│   │   │   ├── AuthController.java
│   │   │   ├── BuyerController.java
│   │   │   ├── FarmerController.java
│   │   │   ├── CropController.java
│   │   │   ├── ApproachFarmerController.java
│   │   │   ├── ApproachFarmerController2.java
│   │   │   ├── SavedMarketDataController.java
│   │   │   └── VerificationController.java
│   │   │
│   │   ├── model
│   │   │   ├── Admin.java
│   │   │   ├── Buyer.java
│   │   │   ├── Farmer.java
│   │   │   ├── Crop.java
│   │   │   ├── ApproachFarmer.java
│   │   │   ├── Enquiry.java
│   │   │   ├── SavedMarketData.java
│   │   │   ├── VerificationToken.java
│   │   │   ├── VerificationTokenBuyer.java
│   │   │   └── ResetPasswordRequest.java
│   │   │
│   │   ├── repositor
│   │   │   ├── BuyerRepo.java
│   │   │   ├── FarmerRepo.java
│   │   │   ├── CropRepo.java
│   │   │   ├── ApproachFarmerRepo.java
│   │   │   ├── EnquiryRepository.java
│   │   │   ├── SavedMarketDataRepository.java
│   │   │   └── VerificationTokenRepository.java
│   │   │
│   │   ├── service
│   │   │   ├── AdminService.java
│   │   │   ├── BuyerService.java
│   │   │   ├── FarmerService.java
│   │   │   ├── CropService.java
│   │   │   ├── ApproachFarmerService.java
│   │   │   ├── SavedMarketDataService.java
│   │   │   ├── EmailService.java
│   │   │   ├── OtpService.java
│   │   │   ├── MyUserDetailsService.java
│   │   │   └── AuthResponse.java
│   │   │
│   │   ├── security
│   │   │   ├── SecurityConfig.java
│   │   │   └── UserPrincipal.java
│   │   │
│   │   └── JWT
│   │       ├── JWTService.java
│   │       ├── JwtFilter.java
│   │       ├── JwtBuyerAuthenticationFilter.java
│   │       └── JwtSellerAuthenticationFilter.java
│   │
│   └── src/main/resources
│       ├── application.properties
│       ├── application.yml
│       └── templates/home.html
│
├── frontend
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── .env.example
│   │
│   ├── src
│   │   ├── main.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   │
│   │   ├── components
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Account.jsx
│   │   │   ├── AddCrop.jsx
│   │   │   ├── UpdateCrop.jsx
│   │   │   ├── DeleteCrop.jsx
│   │   │   ├── ViewCrop.jsx
│   │   │   ├── Market.jsx
│   │   │   ├── ApproachFarmer.jsx
│   │   │   ├── Enquiry.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── Weather.jsx
│   │   │   └── others
│   │   │
│   │   ├── lib
│   │   │   ├── api.js
│   │   │   └── auth.js
│   │   │
│   │   └── assets
│   │
│   └── public
│
└── README.md

```

---

# Backend Architecture

The backend follows layered architecture:

## Controller Layer

Handles HTTP requests and responses.

Location:
```

backend/src/main/java/com/MyWebpage/register/login/controller/

```

## Service Layer

Contains business logic.

Location:
```

backend/src/main/java/com/MyWebpage/register/login/service/

```

## Repository Layer

Handles database access using Spring Data JPA.

Location:
```

backend/src/main/java/com/MyWebpage/register/login/repositor/

```

## Security Layer

Handles authentication and authorization.

Location:
```

backend/src/main/java/com/MyWebpage/register/login/security/
backend/src/main/java/com/MyWebpage/register/login/JWT/

```

---

# Frontend Architecture

The frontend uses React with component-based architecture.

## Main directories

Components:
```

frontend/src/components/

```

API utilities:
```

frontend/src/lib/api.js
frontend/src/lib/auth.js

```

Entry point:
```

frontend/src/main.jsx

```

---

# Installation and Setup

## Prerequisites

Install:

- Java 17 or higher
- Node.js 18 or higher
- MySQL 8 or higher
- Maven

---

# Backend Configuration

Navigate to backend:

```

cd backend

```

Configure database in:

```

src/main/resources/application.properties

```

Example:

```

spring.datasource.url=jdbc:mysql://localhost:3306/agrigate
spring.datasource.username=YOUR_USERNAME
spring.datasource.password=YOUR_PASSWORD
spring.jpa.hibernate.ddl-auto=update

```

---

# Frontend Configuration

Navigate to frontend:

```

cd frontend

```

Install dependencies:

```

npm install

```

---

# Running the Application

## Run Backend

```

./mvnw spring-boot:run

```

Backend runs on:

```

[http://localhost:8080](http://localhost:8080)

```

---

## Run Frontend

```

npm run dev

```

Frontend runs on:

```

[http://localhost:5173](http://localhost:5173)

```

---

# Authentication and Security

Authentication is implemented using:

- JWTService.java
- JwtFilter.java
- SecurityConfig.java
- UserPrincipal.java

JWT is used to secure API endpoints and validate users.

---

# Environment Configuration

Frontend example environment file:

```

frontend/.env.example

```

This file can be used to configure API URLs and environment variables.

---

# Build and Deployment

## Backend Build

```

./mvnw clean package

```

Run JAR:

```

java -jar target/*.jar

```

---

## Frontend Build

```

npm run build

```

Output directory:

```

dist/

```

---

# License

This project is intended for development and educational purposes.
