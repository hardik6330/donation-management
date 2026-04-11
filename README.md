# Donation Management System

A full-stack donation management application built with Node.js, Express, MySQL, and React.

## 🚀 Recent Updates & Features

- **Improved Admin Dashboard**: Sticky header, footer, and sidebar with scrollable content area.
- **Enhanced Security**: Centralized authentication with `useAuth` hook, Joi-based request validation, and strict route protection (`ProtectedRoute` & `GuestRoute`).
- **Robust Architecture**: Refactored backend into `services/`, `validators/`, and `seeders/` for better separation of concerns.
- **Improved API Management**: Split monolithic `apiSlice` into feature-specific API modules using RTK Query's `injectEndpoints`.
- **Global Error Handling**: Centralized `errorHandler` middleware and `asyncHandler` wrapper for consistent API responses and cleaner code.
- **Advanced Filtering**: Support for Min/Max amount range and category-wise filtering in admin records.
- **Instant Category Management**: Toggle category status (Active/Inactive) directly from the list.
- **Email Notifications**: Automated donation confirmation emails using Nodemailer (BullMQ/Redis ready).
- **Modern UI Components**: Custom searchable dropdowns and interactive toggles in master data management.

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite, Redux Toolkit (RTK Query), Lucide React, Tailwind CSS.
- **Backend**: Node.js, Express, MySQL (Sequelize ORM), Redis (ioredis), BullMQ (Queueing).
- **Payment Integration**: Razorpay for secure online transactions.
- **Tools**: JWT, Bcrypt, Helmet, Morgan, PDFKit (Receipt Generation).

## 📦 Installation

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env` with your MySQL, Razorpay, and SMTP (Email) credentials.
4. `npm start` or `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Configure `.env` with `VITE_API_URL`.
4. `npm run dev`

## 🚀 Deployment
**Live Frontend URL**: [https://donation-management-ln4b.vercel.app/](https://donation-management-ln4b.vercel.app/)

Ready for deployment on **Vercel** or any VPS with MySQL support.
