# 🌾 AagriGgate

## 📌 Project Overview
The **AagriGgate** application is designed to help farmers manage their resources efficiently, connect with buyers, and get real-time insights for better agricultural practices. This platform leverages technology to bridge the gap between farmers and the market. 

### 🎯 Key Benefits:
- **Eliminates Middlemen:** Ensures direct transactions between farmers and buyers, maximizing profits.
- **Increases Profits:** Farmers can sell their produce at competitive rates without unnecessary deductions.
- **Finds Suitable Rates:** Real-time price comparisons help farmers make informed selling decisions.

## 🚀 Features
- 📊 **Dashboard:** A user-friendly interface displaying key farming insights.
- 🛒 **Marketplace:** Connect farmers with buyers to sell produce at fair prices.
- 🌦️ **Weather Forecasting:** Provides real-time weather updates to help farmers plan their activities.
- 📋 **Crop Management:** Track crop growth, yield predictions, and best farming practices.
- 📱 **Mobile Support:** Fully responsive for mobile access.

## 🔧 Tech Stack
- **Frontend:** React.js, HTML, CSS, JavaScript
- **Backend:** Java Spring Boot
- **Database:** MySQL
- **APIs:** OpenWeather API, Data.gov.in API, OpenCageData API
- **Tools & Platforms:** Git, Postman
- **Security:** JWT-based authentication

## 🛠️ Setup & Installation
1. Clone the repository:
   ```sh
   git clone https://github.com/B-Vighnesh/AagriGgate.git
   cd AagriGgate
   ```
2. Install dependencies:
   ```sh
   npm install   # For frontend
   mvn install   # For backend
   ```
3. Run the application:
   ```sh
   npm start  # Start frontend
   mvn spring-boot:run  # Start backend
   ```
4. Open your browser and navigate to `http://localhost:3000`

## 🔧 Database Configuration
1. **Create the Database:**
   ```sql
   CREATE DATABASE app;
   ```

## 🔧 Email Configuration
1. **Create an App Password for Gmail:**
   - Go to [Google App Passwords](https://myaccount.google.com/apppasswords).
   - Sign in to your Google Account.
   - Select "Mail" as the app and "Other (Custom Name)" as the device.
   - Enter a name like "AagriGgate App" and click **Generate**.
   - Copy the generated password and use it as `spring.mail.password` in `application.properties`.

2. Open `application.properties` and update the following details with your Gmail credentials:
   ```properties
   spring.mail.username=your-email@gmail.com
   spring.mail.password=your-email-password(app-password)
   ```


## 📬 Contact
For queries and collaborations, reach out at: **vighneshsheregar2004@gmail.com**

📌 Connect with me on [LinkedIn](https://www.linkedin.com/in/b-vighnesh-kumar/)
