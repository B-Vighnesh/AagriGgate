<!-- ═══════════════════════════════════════════════════════════════════════════ -->
<!--                        AAGRIGGATE · README.md                              -->
<!-- ═══════════════════════════════════════════════════════════════════════════ -->

<div align="center">

```
 █████╗  █████╗  ██████╗ ██████╗ ██╗ ██████╗  ██████╗  █████╗ ████████╗███████╗
██╔══██╗██╔══██╗██╔════╝ ██╔══██╗██║██╔════╝ ██╔════╝ ██╔══██╗╚══██╔══╝██╔════╝
███████║███████║██║  ███╗██████╔╝██║██║  ███╗██║  ███╗███████║   ██║   █████╗  
██╔══██║██╔══██║██║   ██║██╔══██╗██║██║   ██║██║   ██║██╔══██║   ██║   ██╔══╝  
██║  ██║██║  ██║╚██████╔╝██║  ██║██║╚██████╔╝╚██████╔╝██║  ██║   ██║   ███████╗
╚═╝  ╚═╝╚═╝  ╚═╝ ╚═════╝ ╚═╝  ╚═╝╚═╝ ╚═════╝  ╚═════╝ ╚═╝  ╚═╝   ╚═╝   ╚══════╝
```

### 🌾 *Connecting Farmers & Buyers — Directly, Transparently, Efficiently* 🌾

<br/>

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen?style=for-the-badge&logo=github-actions&logoColor=white)](https://github.com/B-Vighnesh/AagriGgate)
[![License](https://img.shields.io/badge/license-MIT-blue?style=for-the-badge&logo=opensourceinitiative&logoColor=white)](./LICENSE)
[![Java](https://img.shields.io/badge/Java-21-orange?style=for-the-badge&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-Latest-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-ff69b4?style=for-the-badge&logo=handshake&logoColor=white)](https://github.com/B-Vighnesh/AagriGgate/pulls)
[![Stars](https://img.shields.io/github/stars/B-Vighnesh/AagriGgate?style=for-the-badge&logo=github&color=yellow)](https://github.com/B-Vighnesh/AagriGgate/stargazers)
[![Forks](https://img.shields.io/github/forks/B-Vighnesh/AagriGgate?style=for-the-badge&logo=github&color=9cf)](https://github.com/B-Vighnesh/AagriGgate/network/members)

<br/>

<a href="#-live-demo">🚀 Demo</a> &nbsp;•&nbsp;
<a href="#-local-development-setup">📖 Docs</a> &nbsp;•&nbsp;
<a href="https://github.com/B-Vighnesh/AagriGgate/issues/new?labels=bug">🐛 Report Bug</a> &nbsp;•&nbsp;
<a href="https://github.com/B-Vighnesh/AagriGgate/issues/new?labels=enhancement">✨ Request Feature</a>

</div>

<hr/>

<!-- PROJECT BANNER -->
<div align="center">

```
┌─────────────────────────────────────────────────────────────────────────┐
│                                                                         │
│   🌱  AagriGgate  ·  The Agriculture Marketplace of Tomorrow  🌱        │
│                                                                         │
│      [ Farmer Dashboard ]  ──▶  [ Crop Listing ]  ──▶  [ Buyer ]       │
│                                                                         │
│   🔐 OTP Auth  |  🌦 Weather  |  📈 Market Prices  |  🛒 Cart           │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

</div>

<hr/>

## AagriGgate

AagriGgate is a full-stack agriculture marketplace that connects farmers and buyers for direct crop trade. The platform combines crop listing, market price lookup, weather support, buyer request workflows, favorites, cart, OTP-based authentication, and role-aware dashboards in one system.

<hr/>

## 💡 Why AagriGgate?

<div align="center">

| &nbsp; | Value Proposition | Description |
|:------:|:------------------|:------------|
| 🤝 | **Zero Middlemen** | Direct farmer-to-buyer connections eliminate unnecessary intermediaries, maximizing profit for producers and reducing cost for buyers. |
| 📊 | **Data-Driven Decisions** | Live market prices and weather data empower users to make smart selling and buying choices at exactly the right time. |
| 🔐 | **Enterprise-Grade Security** | OTP verification, JWT sessions, and role-based access control give both farmers and buyers a safe, trusted platform. |
| 📦 | **End-to-End Workflow** | From crop listing to cart checkout to request tracking — the entire trade lifecycle is managed in one unified system. |
| ⚡ | **Performant by Design** | DTO projections, separate image endpoints, server-side pagination and filtering keep every API call lean and fast. |

</div>

<hr/>

## What The Project Does

- Farmers can register, manage their profile, add crops, update listings, mark crops as urgent or waste, and handle buyer requests.
- Buyers can register, browse crops, filter and sort listings, save favorites, add crops to cart, and send purchase approaches.
- The platform supports direct interaction without a marketplace middleman workflow.
- Market price and weather features help users make better selling and buying decisions.

<hr/>

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

<hr/>

## 🛠 Tech Stack

<div align="center">

### Backend

| Technology | Badge |
|:-----------|:------|
| Java 21 | [![Java](https://img.shields.io/badge/Java-21-orange?style=flat-square&logo=openjdk&logoColor=white)](https://openjdk.org/projects/jdk/21/) |
| Spring Boot 3.3.4 | [![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.3.4-6DB33F?style=flat-square&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot) |
| Spring Security | [![Spring Security](https://img.shields.io/badge/Spring%20Security-✓-6DB33F?style=flat-square&logo=springsecurity&logoColor=white)](https://spring.io/projects/spring-security) |
| Spring Data JPA | [![JPA](https://img.shields.io/badge/Spring%20Data%20JPA-✓-6DB33F?style=flat-square&logo=spring&logoColor=white)](https://spring.io/projects/spring-data-jpa) |
| Hibernate | [![Hibernate](https://img.shields.io/badge/Hibernate-ORM-59666C?style=flat-square&logo=hibernate&logoColor=white)](https://hibernate.org/) |
| JWT | [![JWT](https://img.shields.io/badge/JWT-Auth-000000?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io/) |
| Maven | [![Maven](https://img.shields.io/badge/Maven-Build-C71A36?style=flat-square&logo=apachemaven&logoColor=white)](https://maven.apache.org/) |
| MySQL (Dev) | [![MySQL](https://img.shields.io/badge/MySQL-Local%20Dev-4479A1?style=flat-square&logo=mysql&logoColor=white)](https://www.mysql.com/) |
| PostgreSQL (Prod) | [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Production-336791?style=flat-square&logo=postgresql&logoColor=white)](https://www.postgresql.org/) |
| Spring Mail | [![Spring Mail](https://img.shields.io/badge/Spring%20Mail-✓-6DB33F?style=flat-square&logo=gmail&logoColor=white)](https://docs.spring.io/spring-framework/reference/integration/email.html) |

### Frontend

| Technology | Badge |
|:-----------|:------|
| React 18 | [![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev/) |
| Vite | [![Vite](https://img.shields.io/badge/Vite-Build%20Tool-646CFF?style=flat-square&logo=vite&logoColor=white)](https://vitejs.dev/) |
| React Router DOM | [![React Router](https://img.shields.io/badge/React%20Router%20DOM-✓-CA4245?style=flat-square&logo=reactrouter&logoColor=white)](https://reactrouter.com/) |
| CSS | [![CSS](https://img.shields.io/badge/CSS-Styling-1572B6?style=flat-square&logo=css3&logoColor=white)](https://developer.mozilla.org/en-US/docs/Web/CSS) |

</div>

<hr/>

## 🗂 Project Structure

<details>
<summary><strong>📁 Click to expand the full project folder tree</strong></summary>

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

</details>

<hr/>

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

<hr/>

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

<hr/>

## 🚀 Getting Started

> **Get AagriGgate running locally in under 10 minutes.**

---

### Prerequisites

Before you begin, make sure you have the following installed:

- Java 21
- Node.js 18 or later
- npm
- Maven
- MySQL running locally if using the default dev profile

---

## Local Development Setup

---

## 1️⃣ Clone & Enter the Project

```bash
git clone https://github.com/B-Vighnesh/AagriGgate.git
cd AagriGgate
```

---

## Backend Setup

Move into the backend project:

## 2️⃣ Start the Backend

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

---

## 3️⃣ Start the Frontend

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

<hr/>

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

<hr/>

## 🔐 Authentication Flow

1. User registers as seller or buyer.
2. OTP verification completes registration.
3. User logs in using password or OTP.
4. Backend returns JWT and role.
5. Frontend stores token and role.
6. Protected API calls send the token in the `Authorization` header.
7. Backend authorizes access based on JWT role.

<hr/>

## Notes On API Design

- Crop list endpoints use DTO projections to keep responses lighter.
- Crop images are fetched through a dedicated image endpoint instead of embedding large image blobs in list responses.
- Request, favorites, and cart pages use pagination with a default page size of `10`.
- Search and filters for crop browsing are handled on the backend for more realistic pagination behavior.

<hr/>

## Production Notes

- The project includes:
  - `backend/Dockerfile`
  - frontend production env support through `.env.production`
- Production backend config is set up for PostgreSQL in `application-prod.yml`.

<hr/>

## 🗺 Roadmap

> A living map of what's done, in progress, and coming next.

| Status | Feature |
|:------:|:--------|
| ✅ | OTP-based authentication (registration & login) |
| ✅ | Farmer crop management (add, update, delete, mark status) |
| ✅ | Buyer crop browsing with search, filter, and sort |
| ✅ | Favorites, cart, and checkout workflow |
| ✅ | Market price lookup and saved records |
| ✅ | Weather lookup for farmer location |
| ✅ | Feature-based backend package structure |
| ✅ | JWT role-based access control |
| ✅ | DTO-based lean API responses |
| ✅ | Docker support for backend |
| ✅ | PostgreSQL production support |
| 🔄 | Admin moderation and suspension workflows |
| 🔜 | Chat between farmer and buyer |
| 🔜 | Notifications |
| 🔜 | Price trend analytics |
| 🔜 | Price prediction |
| 🔜 | Multi-language support |
| 🔜 | Transport booking |
| 🔜 | Escrow/payment workflows |

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

<hr/>

## Repository Notes

- The backend was refactored into a feature-based package layout.
- If you move DTOs or entities between packages, update any JPQL `SELECT new ...` constructor query strings to the new fully qualified class names.

<hr/>

## 🚀 Live Demo

> The production backend is deployed on Render. Point your frontend `.env.production` to:

```env
VITE_API_BASE_URL=https://aagriggate-1.onrender.com/
```

<hr/>

## 👥 Contributors

<div align="center">

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/B-Vighnesh">
        <img src="https://github.com/B-Vighnesh.png" width="100px;" style="border-radius:50%;" alt="Vighnesh"/><br/>
        <sub><b>Vighnesh</b></sub>
      </a><br/>
      <sub>🏆 Owner & Lead Developer</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Akash-Shenvi">
        <img src="https://github.com/Akash-Shenvi.png" width="100px;" style="border-radius:50%;" alt="Akash"/><br/>
        <sub><b>Akash</b></sub>
      </a><br/>
      <sub>🤝 Contributor</sub>
    </td>
    <td align="center">
      <a href="https://github.com/Joylan9">
        <img src="https://github.com/Joylan9.png" width="100px;" style="border-radius:50%;" alt="Joylan"/><br/>
        <sub><b>Joylan</b></sub>
      </a><br/>
      <sub>🤝 Contributor</sub>
    </td>
  </tr>
</table>

</div>

<hr/>

## 📄 License

```
MIT License

Copyright (c) 2024 Vighnesh B, Akash Shenvi, Joylan

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

> This project is currently intended for academic, portfolio, and product development use.

<hr/>

<!-- FOOTER -->
<div align="center">

### Made with ❤️ for farmers

<a href="https://github.com/B-Vighnesh">
  <img src="https://github.com/B-Vighnesh.png" width="40px;" style="border-radius:50%; margin:4px;" alt="Vighnesh"/>
</a>
<a href="https://github.com/Akash-Shenvi">
  <img src="https://github.com/Akash-Shenvi.png" width="40px;" style="border-radius:50%; margin:4px;" alt="Akash"/>
</a>
<a href="https://github.com/Joylan9">
  <img src="https://github.com/Joylan9.png" width="40px;" style="border-radius:50%; margin:4px;" alt="Joylan"/>
</a>

<br/><br/>

> ⭐ **Star this repo if you find it useful!**
> Your support motivates us to keep building for the farming community. 🌾

<br/>

[![GitHub stars](https://img.shields.io/github/stars/B-Vighnesh/AagriGgate?style=social)](https://github.com/B-Vighnesh/AagriGgate/stargazers)
&nbsp;&nbsp;
[![GitHub forks](https://img.shields.io/github/forks/B-Vighnesh/AagriGgate?style=social)](https://github.com/B-Vighnesh/AagriGgate/network/members)
&nbsp;&nbsp;
[![GitHub watchers](https://img.shields.io/github/watchers/B-Vighnesh/AagriGgate?style=social)](https://github.com/B-Vighnesh/AagriGgate/watchers)

<br/>

*AagriGgate — Bridging the gap between the field and the market.*

</div>
