# 🌾 AagriGgate

AagriGgate is a full-stack web application designed to connect **farmers, buyers, and administrators** in a seamless platform for agricultural trade, market insights, and crop management.

The project is divided into:

* **Frontend** → React + Vite
* **Backend** → Spring Boot + MySQL (with JWT Authentication & Spring Security)

---

## 📂 Project Structure

```
AagriGgate-main/
│── frontend/         # React + Vite frontend
│── backend/          # Spring Boot + MySQL backend
│── README.md         # Documentation
```

---

## 🚀 Features

### 🌱 Farmers

* Register/Login securely (JWT Auth)
* Add, update, and delete crops
* Manage trade approaches
* View buyer enquiries

### 🚲 Buyers

* Browse available crops
* Approach farmers
* Save market data
* Enquiry system

### 🔐 Authentication & Security

* JWT-based authentication
* Role-based access (Admin, Farmer, Buyer)
* OTP & Email verification support

---

## ⚙️ Backend Setup (Spring Boot + MySQL)

1. Navigate to the backend folder:

   ```bash
   cd backend
   ```

2. Configure database in **`src/main/resources/application.properties`** or **`application.yml`**:

   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/agrigate
   spring.datasource.username=your_username
   spring.datasource.password=your_password
   spring.jpa.hibernate.ddl-auto=update
   spring.jpa.show-sql=true
   ```

3. Run the backend:

   ```bash
   ./mvnw spring-boot:run
   ```

4. The API will be available at:

   ```
   http://localhost:8080
   ```

---

## 🌈 Frontend Setup (React + Vite)

1. Navigate to the frontend folder:

   ```bash
   cd frontend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start development server:

   ```bash
   npm run dev
   ```

4. The frontend will run at:

   ```
   http://localhost:5173
   ```

---

## 🔗 Connecting Frontend & Backend

Update API URLs in frontend (inside `src/components/` or services) to match your backend server:

```js
const API_BASE_URL = "http://localhost:8080";
```

---

## 📦 Build & Deployment

### Frontend

```bash
npm run build
```

This will generate a `dist/` folder for deployment.
For GitHub Pages, update `vite.config.js` with:

```js
export default defineConfig({
  base: "/your-repo-name/",
});
```

### Backend

Build the JAR file:

```bash
./mvnw clean package
```

Run it:

```bash
java -jar target/backend-0.0.1-SNAPSHOT.jar
```

---

## 🛡️ Tech Stack

* **Frontend** → React, Vite, Tailwind CSS
* **Backend** → Spring Boot, Spring Security, JWT, Hibernate, MySQL
* **Build Tools** → Maven, npm

---

## 🤝 Contributing

1. Fork the repository
2. Create a new branch (`feature/xyz`)
3. Commit changes
4. Open a pull request

---

## 📜 License

This project is for educational & development purposes.
