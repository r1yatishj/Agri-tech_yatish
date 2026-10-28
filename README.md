# 🌾 Agri-Tech: Smart Agriculture & Farm Management Full-Stack Platform (MERN)

> **Precision Farming, IoT Soil NPK Telemetry, Automated Microclimate Pest Forecasting, Kisan Marketplace, and Agronomic Advisory Platform**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Single%20Unified%20Link-success?style=for-the-badge&logo=render&logoColor=white)](https://agri-tech-yatish.onrender.com)
[![GitHub Repo](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/r1yatishj/Agri-tech_yatish)

[![React](https://img.shields.io/badge/Frontend-React%2018%20(Vite)-61DAFB?logo=react&logoColor=black)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js%20%7C%20Express-339933?logo=node.js&logoColor=white)](https://nodejs.org/)
[![MongoDB](https://img.shields.io/badge/Database-MongoDB%20(Mongoose)-47A248?logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![TailwindCSS](https://img.shields.io/badge/Styling-Tailwind%20CSS-38B2AC?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## 🔗 Integrated Live Demo & Deployment

| Resource | Single Unified URL |
|---|---|
| **🌐 Live Application (Frontend + Backend + DB)** | [https://agri-tech-yatish.onrender.com](https://agri-tech-yatish.onrender.com) *(or [Vercel Alternative](https://agri-tech-yatish.vercel.app))* |
| **📁 Source Code Repository** | [https://github.com/r1yatishj/Agri-tech_yatish](https://github.com/r1yatishj/Agri-tech_yatish) |
| **⚡ Integrated API Health Check** | [https://agri-tech-yatish.onrender.com/api/health](https://agri-tech-yatish.onrender.com/api/health) |

> **Unified Full-Stack Architecture:** The React frontend SPA, Node.js/Express REST API, and MongoDB Database are completely unified into **one single domain/link**. The server serves the pre-compiled client bundle at `/` while hosting all RESTful agronomic endpoints under `/api/*`, completely eliminating CORS friction and multi-link complexity.

---

## 🌟 Executive Overview
**Agri-Tech** is an enterprise-grade full-stack MERN application built to solve critical agricultural challenges faced by modern farmers and cooperatives. It bridges real-time microclimate sensors and soil telemetry with actionable agronomic intelligence, facilitating precision fertilization, pest early warnings, direct inputs procurement, and peer community troubleshooting.

---

## 🚀 Key Modules & Architecture

### 1. 🔐 User Authentication & Role-Based Security
- Secure **JSON Web Token (JWT)** session management.
- Password hashing using **bcryptjs** with salt rounds.
- Strict role-based access control (**Farmer** vs. **Admin/Agronomist**).
- Client-side route guards preventing unauthorized navigation.
- Built-in **1-click evaluator demo logins** for instant testing without manual registration.

### 2. 🏞️ Farm Profile & Land Registry
- Comprehensive CRUD operations for registering multiple agricultural land holdings.
- Captures acreage, geographic location (village/district/state), soil classifications (*Loamy, Clay, Sandy, Black Soil, Alluvial, Red Soil*), and irrigation methods (*Drip, Sprinkler, Tube Well, Canal, Rainfed*).

### 3. 🧪 Crop Lifecycle & Soil Health Diagnostics (NPK)
- Crop growth tracking across standard stages: *Germination ➔ Vegetative ➔ Flowering ➔ Yield Formation ➔ Maturity ➔ Harvested*.
- Diagnostic meters for **Nitrogen (N)**, **Phosphorus (P)**, and **Potassium (K)** in mg/kg.
- Root zone **Soil Moisture (%)** and **pH scale (0-14)** visualizers.
- **Automated Agronomic AI Engine**: Calculates tailored fertilizer recommendations, irrigation intervals, and biological treatments based on live telemetry readings.

### 4. ⛅ Microclimate Radar & Automated Pest Alarms
- Live/simulated weather station parameters: Ambient Temp, Feels Like, Relative Humidity, Wind Speed, UV Index, and Evapotranspiration rate.
- 5-Day agronomic weather outlook and hourly rain probability forecast.
- **Automated Bio-Risk Alarms**: Triggers warnings for *Late Blight, Powdery Mildew, Stem Borer, and Aphids* when humidity and canopy moisture cross critical danger thresholds.

### 5. 🛒 Kisan Agri-Marketplace & Milestone Order Tracking
- E-commerce catalog for certified hybrid seeds, microbial bio-fertilizers (*Jeevamrit*), cold-pressed neem repellents, and digital soil sensor kits.
- Dynamic cart management with real-time total calculations.
- Integrated checkout supporting **Kisan Credit Card (KCC)** and verified Cash on Delivery.
- 5-stage interactive order timeline: *Placed ➔ Confirmed & Packed ➔ In Transit ➔ Out for Delivery ➔ Delivered*.

### 6. 💬 Kisan Community Forum & Expert Consultation
- Discussion forum with agricultural category tagging (*Crop Diseases, Soil & Fertilizers, Pest Control, Government Schemes, Market Rates*).
- Interactive upvoting system.
- Thread replies with **Verified Agronomist Solution** badges when answered by administrators or certified agricultural scientists.

### 7. 🛡️ Administrator Command Center
- Aggregate metrics: Total Farmers, Admins, Land Monitored, Revenue, Active Alarms.
- User management table with one-click role toggling and account moderation.
- **Urgent Advisory Broadcaster**: Broadcast high-priority regional pest warnings directly to farmers' dashboards.
- Marketplace product catalog management and stock oversight.
- Order fulfillment control: Update consignment delivery stages.

### 8. 🌐 Multilingual Accessibility
- Instant language toggle in the header:
  - 🇬🇧 **English**
  - 🇮🇳 **हिन्दी (Hindi)**
  - 🌾 **ਪੰਜਾਬੀ (Punjabi)**
  - 🌿 **తెలుగు (Telugu)**

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18 (Vite), React Router v6, Axios, Tailwind CSS, Lucide React Icons |
| **Backend** | Node.js, Express.js, Mongoose ODM, JWT, bcryptjs, dotenv, cors |
| **Database** | MongoDB / MongoDB Atlas (with in-memory zero-config fallback) |
| **DevOps / Deployment** | Render, Vercel, Procfile, Concurrently, Git |

---

## 📁 Repository Directory Structure

```plaintext
Agri-tech_yatish/
├── package.json                 # Monorepo root scripts (dev, build, install-all)
├── vercel.json                  # Vercel one-click deployment configuration
├── render.yaml                  # Render infrastructure as code
├── Procfile                     # Heroku / Railway / Render web process definition
├── .gitignore                   # Excludes node_modules, .env, and dist bundles
├── README.md                    # Detailed documentation and deployment guide
├── backend/
│   ├── package.json             # Express dependencies (mongoose, jwt, bcrypt, cors)
│   ├── .env.example             # Template for environment variables
│   ├── .env                     # Local environment configuration
│   └── src/
│       ├── server.js            # Express application entry & static bundle serving
│       ├── config/
│       │   └── db.js            # MongoDB connection & connection status telemetry
│       ├── models/              # Mongoose schemas (User, Farm, Crop, Order, etc.)
│       ├── middleware/          # JWT auth, role authorization, centralized error handler
│       ├── controllers/         # REST API business logic
│       ├── routes/              # Express API route modules
│       ├── utils/
│       │   └── mockStore.js     # High-fidelity mock store for instant standalone testing
│       └── seed/
│           └── seedData.js      # Database seeder script
└── frontend/
    ├── package.json             # React 18, Vite, Tailwind CSS, Lucide icons
    ├── vite.config.js           # Vite dev server with proxy to backend
    ├── tailwind.config.js       # Agricultural color palette configuration
    ├── index.html               # Main HTML entry with Google fonts
    └── src/
        ├── main.jsx             # React root with BrowserRouter and Context Providers
        ├── App.jsx              # Application router and layout structure
        ├── index.css            # Tailwind directives and custom scrollbar styles
        ├── context/
        │   ├── AuthContext.jsx       # User auth state, JWT persistence, cart state
        │   └── LanguageContext.jsx   # Multilingual translation dictionary
        ├── services/
        │   └── api.js           # Axios instance with Bearer token interceptor
        ├── components/
        │   ├── Navbar.jsx       # Responsive navigation with role indicators & cart
        │   ├── Footer.jsx       # Agronomic helpline and technical credits
        │   ├── CartModal.jsx    # Slide-over cart and shipping checkout drawer
        │   └── ProtectedRoute.jsx # Route security guard for authenticated/admin views
        └── pages/
            ├── Home.jsx             # Hero showcase, metric counters, feature cards
            ├── Login.jsx            # Sign in with 1-click evaluator demo buttons
            ├── Register.jsx         # Sign up with role selection (Farmer vs Admin)
            ├── FarmerDashboard.jsx  # Daily briefing, crop stages, weather radar
            ├── FarmManager.jsx      # Land registry CRUD with soil & irrigation specs
            ├── CropManager.jsx      # Crop growth stage tracking & lifecycle advances
            ├── SoilAnalytics.jsx    # NPK gauges, moisture, pH meter & AI recommendations
            ├── WeatherAndPests.jsx  # Microclimate metrics, 5-day forecast & pest alarms
            ├── Marketplace.jsx      # Agri supplies catalog, category filter & search
            ├── OrderTracking.jsx    # Step-by-step milestone delivery timeline
            ├── CommunityForum.jsx   # Q&A board with verified agronomist solutions
            └── AdminPanel.jsx       # Metrics, user roles, order dispatch, alert broadcaster
```

---

## ⚡ Quick Start & Local Setup

### Prerequisites
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **Git**

### 1. Clone the Repository
```bash
git clone https://github.com/r1yatishj/Agri-tech_yatish.git
cd Agri-tech_yatish
```

### 2. Install All Dependencies
Install root, backend, and frontend packages with a single command:
```bash
npm run install-all
```

### 3. Configure Environment Variables
Copy the backend `.env.example` file:
```bash
cp backend/.env.example backend/.env
```
Default parameters in `backend/.env`:
```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/agritech
JWT_SECRET=agritech_jwt_secure_secret_token_key_2026
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```
> *Note:* The backend features zero-configuration graceful fallback mode; if a local MongoDB instance is not detected, it serves rich pre-configured mock data instantly without crashing!

### 4. (Optional) Seed the Database
If you are connected to MongoDB or MongoDB Atlas:
```bash
npm run seed
```

### 5. Start Full-Stack Development Servers
Run backend and frontend concurrently:
```bash
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`
- **API Health Check**: `http://localhost:5000/api/health`

---

## 🔑 Pre-Configured Demo Credentials

For immediate evaluation, use these credentials or click the **1-Click Demo Buttons** on the Login screen:

| Role | Email Address | Password | Capabilities |
|---|---|---|---|
| **🌾 Kisan / Farmer** | `farmer@agritech.com` | `Farmer@123` | Farm profiles, crop stages, soil testing, weather alarms, marketplace purchasing, forum |
| **🛡️ Agronomist Admin** | `admin@agritech.com` | `Admin@123` | User role switching, platform stats, alert broadcasting, order dispatch control, expert answers |

---

## 🌐 Production Deployment Guide

### Option 1: One-Click Deploy via Render
The repository includes a ready-to-use `render.yaml` specification:
1. Push your code to your GitHub repository.
2. Sign in to [Render](https://render.com/) and click **New + ➔ Blueprint**.
3. Select your GitHub repository (`Agri-tech_yatish`).
4. Set the `MONGO_URI` environment variable pointing to your MongoDB Atlas connection string.
5. Click **Apply Blueprint** — Render will automatically build the backend web service and the static frontend site.

### Option 2: Deploy to Vercel
Using the bundled `vercel.json`:
1. Import the repository in [Vercel](https://vercel.com/).
2. Set `JWT_SECRET` and `MONGO_URI` in **Project Settings ➔ Environment Variables**.
3. Deploy! Both the Express serverless API routes and Vite React SPA are served seamlessly.

---

## 📄 License
This project is licensed under the [MIT License](LICENSE).
Built with passion for farmers and agricultural innovation.
