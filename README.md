# 💸 Expense Tracker

A full-stack expense tracker application that allows users to manage their income, expenses, and transfers in real time.  
Built with **React Native (Expo)** for the mobile app and **Node.js + Express + PostgreSQL** for the backend API.

---

## 🚀 Features

### 📱 Mobile App (Frontend)
- Add expenses, income, and transfers
- Transaction categories
- Multi-currency support (€, $, MKD, etc.)
- Real-time balance updates
- Modern, clean UI
- Authentication (Register / Login)
- Profile management (email & password update)
- Secure API communication

### 🖥 Backend (API)
- RESTful API with Express.js
- JWT-based authentication
- Password hashing with bcrypt
- PostgreSQL database
- User-specific transactions
- Protected routes & middleware
- Environment-based configuration

---

## 🛠 Tech Stack

### Frontend
- React Native
- Expo
- JavaScript
- Expo Vector Icons

### Backend
- Node.js
- Express.js
- PostgreSQL
- JWT Authentication
- bcrypt

---

## 📂 Project Structure

expense-tracker/
│
├── assets/                         # App images, icons, splash screens
│
├── src/                            # Frontend source code (React Native)
│   │
│   ├── screens/                    # App screens
│   │   ├── Home.js
│   │   ├── AddTransaction.js
│   │   ├── Transactions.js
│   │   ├── Profile.js
│   │   ├── Login.js
│   │   └── Register.js
│   │
│   ├── components/                 # Reusable UI components
│   │   ├── TransactionCard.js
│   │   ├── BalanceCard.js
│   │   ├── Header.js
│   │   └── Loader.js
│   │
│   ├── navigation/                 # Navigation setup
│   │   ├── AppNavigator.js
│   │   └── AuthNavigator.js
│   │
│   ├── api/                        # API communication
│   │   ├── client.js
│   │   └── endpoints.js
│   │
│   ├── auth/                       # Authentication logic
│   │   ├── authState.js
│   │   ├── AuthContext.js
│   │   └── authStorage.js
│   │
│   ├── utils/                      # Helpers & utilities
│   │   ├── formatCurrency.js
│   │   └── constants.js
│   │
│   └── theme/                      # Colors, fonts, spacing
│       ├── colors.js
│       └── typography.js
│
├── backend/                        # Backend API (Node.js + Express)
│   │
│   ├── routes/                     # API routes
│   │   ├── authRoutes.js
│   │   ├── transactionRoutes.js
│   │   └── userRoutes.js
│   │
│   ├── controllers/                # Request handlers
│   │   ├── authController.js
│   │   ├── transactionController.js
│   │   └── userController.js
│   │
│   ├── middleware/                 # Custom middleware
│   │   ├── authMiddleware.js
│   │   └── errorHandler.js
│   │
│   ├── config/                     # Configuration files
│   │   └── db.js
│   │
│   ├── models/                     # Database queries / models
│   │   ├── userModel.js
│   │   └── transactionModel.js
│   │
│   ├── .env                        # Environment variables (ignored)
│   ├── server.js                   # Express app entry point
│   └── package.json
│
├── App.js                          # App entry point
├── app.json                        # Expo configuration
├── package.json                    # Frontend dependencies
├── package-lock.json
├── tsconfig.json
├── .gitignore
└── README.md


---
## 🔐 Environment Variables (.env Setup)

This project uses environment variables to keep sensitive data secure  
(database credentials, JWT secrets, ports, etc.).

### 📁 Backend `.env` file

Create a file named **`.env`** inside the **`backend/`** folder:


### 🧾 Example `.env` content

```env
PORT=5050
DATABASE_URL=postgresql://username:password@localhost:5432/expense_tracker
JWT_SECRET=super_secure_jwt_secret
-- =====================================
-- Expense Tracker - PostgreSQL Schema
-- =====================================

-- 1️⃣ Create database
CREATE DATABASE expense_tracker;

-- Connect to database (psql only)
-- \c expense_tracker;

-- =====================================
-- 2️⃣ Users table
-- =====================================
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- 3️⃣ Transactions table
-- =====================================
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'transfer')),
  title VARCHAR(255) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL CHECK (amount >= 0),

  category VARCHAR(100),
  currency VARCHAR(10) DEFAULT 'EUR',

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================
-- 4️⃣ Indexes (performance)
-- =====================================
CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_type ON transactions(type);

-- =====================================
-- 5️⃣ Optional: demo data (remove in prod)
-- =====================================
-- INSERT INTO users (name, email, password)
-- VALUES ('Test User', 'test@example.com', 'hashed_password');

-- INSERT INTO transactions (user_id, type, title, amount, category, currency)
-- VALUES
-- (1, 'income', 'Salary', 1200, 'Job', 'EUR'),
-- (1, 'expense', 'Groceries', 80, 'Food', 'EUR');

-- =====================================
-- ✅ Schema ready
-- =====================================


