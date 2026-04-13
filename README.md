# Donation Management System

A full-stack donation management application built with Node.js, Express, MySQL, and React, designed for religious and charitable organizations.

## 🚀 Key Features

- **Advanced Admin Dashboard**: A responsive dashboard with sticky layout, sidebar navigation, and real-time statistics.
- **Role-Based Access Control (RBAC)**: Comprehensive permission management with 3 default roles: Admin, Manager, and Entry Operator.
- **Dynamic Location Hierarchy**: Intelligent location management allowing on-the-fly creation of City > Taluka > Village hierarchy.
- **Multi-mode Payment Support**: Flexible donation entry for Online (Razorpay), Cash, Cheque, Pay Later, and Partial Payments.
- **Digital Receipt Generation**: Automated PDF slip generation with Indian currency word conversion, stored securely on Cloudinary.
- **Instant Notifications**: Automated donation confirmations sent via Email (Nodemailer) and SMS (Fast2SMS integration).
- **QR Code Donations**: Quick access to the public donation form via a dynamically generated QR code on the landing page.
- **Master Data Management**: Dedicated modules for managing Gaushala, Katha, Bapu Schedule, Sevak, Mandal, and Kartal Dhun.
- **Advanced Filtering & Export**: Powerful server-side filtering (Amount range, Date, Category) and data export to XLSX/PDF.
- **Enhanced Security**: JWT-based authentication, Joi request validation, Rate limiting, and strict route protection (`ProtectedRoute`).

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19, Vite
- **State Management**: Redux Toolkit & RTK Query
- **Styling**: Tailwind CSS 4, Lucide React
- **Utils**: XLSX (Excel Export), jsPDF, React Toastify

### Backend
- **Runtime**: Node.js, Express 5
- **Database**: MySQL with Sequelize ORM
- **Services**: Cloudinary (File Storage), BullMQ/Redis (Queueing), Nodemailer, Fast2SMS
- **Tools**: PDFKit (Receipts), QRCode, Joi (Validation), Bcryptjs, JWT, Helmet, Morgan

## 📦 Installation

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env` with MySQL, Razorpay, Cloudinary, SMTP, and Fast2SMS credentials.
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Configure `.env` with `VITE_API_URL`.
4. `npm run dev`

## 🚀 Deployment
**Live Frontend URL**: [https://donation-management-ln4b.vercel.app/](https://donation-management-ln4b.vercel.app/)

Ready for deployment on **Vercel** or any VPS with MySQL and Redis support.
