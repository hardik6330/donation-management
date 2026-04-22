# Donation Management System

A full-stack donation management application built with Node.js, Express, MySQL, and React, designed for religious and charitable organizations.

## 🚀 Key Features

- **Advanced Admin Dashboard**: A responsive dashboard with sticky layout, sidebar navigation, and real-time statistics.
- **Role-Based Access Control (RBAC)**: Comprehensive permission management with 3 default roles: Admin, Manager, and Entry Operator.
- **Dynamic Location Hierarchy**: Intelligent location management allowing on-the-fly creation of City > Taluka > Village hierarchy.
- **Multi-mode Payment Support**: Flexible donation entry for Online (Razorpay), Cash, Cheque, Pay Later, and Partial Payments.
- **Digital Receipt Generation**: Automated PDF slip generation with Indian currency word conversion, stored securely on Cloudinary.
- **Instant Notifications**: Automated donation confirmations sent via Email (Nodemailer), SMS (Fast2SMS), and **WhatsApp (Meta API integration)**. Email is short-circuited when donor has no valid email (no SMTP connection wasted).
- **Async Donation Processing**: Heavy work (PDF generation, Cloudinary upload, WhatsApp, Email) runs through a BullMQ/Redis queue so the API response returns immediately, with fire-and-forget fallback when Redis is unavailable.
- **Smart Slip-Ready Polling**: Frontend no longer constant-polls the donations list. After a **create** OR an **update that completes the donation** (Pay Later → Completed, Partial Payment → Completed), a lightweight `GET /donations/:id/status` endpoint is polled every ~2s (≈100-byte response); the list refetches only once the PDF is ready, then polling stops. 30s safety timeout.
- **WhatsApp Announcement System**: Dedicated module to send bulk or individual WhatsApp messages with template support and history tracking.
- **Partial Payment Reminders**: Intelligent scheduling of follow-up notifications (5-day reminders) for pending or partial payments.
- **Multi-language Support**: Seamless switching between **Gujarati and English** across the Admin dashboard.
- **QR Code Donations**: Quick access to the public donation form via a dynamically generated QR code on the landing page.
- **Master Data Management**: Dedicated modules for managing Gaushala, Katha, Bapu Schedule, Sevak, Mandal, and Kartal Dhun.
- **Advanced Filtering & Export**: Powerful server-side filtering (Amount range, Date, Category) and data export to XLSX/PDF.
- **Model Scopes**: Reusable Sequelize scopes across all models for search, filtering by status/location/date range, reducing controller complexity.
- **Standardized Pagination**: All paginated APIs return a uniform `{ items, totalData, totalPages, currentPage, limit, fetchAll }` shape — no per-controller key overrides.
- **CRUD Endpoint Factory**: Frontend `createCRUDEndpoints()` factory generates list/add/update/delete RTK Query endpoints for pure-CRUD modules (gaushala, katha, bapu, sevak, kartalDhun, role, expense), eliminating ~140 LOC of boilerplate.
- **Strict Donation Validation**: Joi `donationSchema` (create) and `donationUpdateSchema` (update) enforce numeric/positivity rules on `amount`, `paidAmount`, `remainingAmount`, plus cross-field checks for partial payments.
- **Indexed Queries**: Composite `(status, createdAt)` index on Donations plus supporting indexes on status, paymentDate, razorpay_order_id; User indexed on name, isAdmin, createdAt.
- **Structured Logging**: Winston-based logging with file rotation (error + combined logs), colored console output, and Morgan HTTP request logging. All services, seeders, and controllers route diagnostics through the Winston logger — no stray `console.*` calls.
- **Split Controllers**: Donation logic separated into `donationController` (CRUD read/update), `donationPaymentController` (create/verify/QR), and `donationSlipController` (resend WhatsApp); master data split into `locationController` and `categoryController`.
- **Shared Query Builders**: `utils/queryBuilder.js` centralizes reusable Sequelize include patterns (e.g. `locationParentInclude(depth)` for the recursive Location.parent chain) so controllers don't hand-roll nested includes.
- **Top-level Validators**: Joi schemas + `validate` middleware live in `backend/src/validators/` (promoted from `utils/`) since they operate at the middleware tier.
- **Skeleton Loading States**: Dashboard cards with animated skeleton placeholders for smooth loading UX.
- **Enhanced Security & Performance**: JWT-based authentication, Joi validation, Rate limiting, and **Clustered/Serverless-optimized DB initialization**.

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19, Vite
- **State Management**: Redux Toolkit & RTK Query
- **Styling**: Tailwind CSS 4, Lucide React
- **Internationalization**: Custom Context-based Language Switcher (Gujarati/English)
- **Utils**: XLSX (Excel Export), jsPDF, React Toastify

### Backend
- **Runtime**: Node.js, Express 5
- **Database**: MySQL with Sequelize ORM (model scopes for reusable query filters)
- **Services**: Cloudinary (File Storage), BullMQ/Redis (Queueing), Nodemailer, **Meta WhatsApp Business API**, Fast2SMS
- **Logging**: Winston (structured file + console logging), Morgan (HTTP request logging)
- **Tools**: PDFKit (Receipts), QRCode, Joi (Validation), Bcryptjs, JWT, Helmet

## 📦 Installation

### Backend Setup
1. `cd backend`
2. `npm install`
3. Configure `.env` with MySQL, Razorpay, Cloudinary, SMTP, Meta (WhatsApp), and Fast2SMS credentials.
4. `npm run dev`

### Frontend Setup
1. `cd frontend`
2. `npm install`
3. Configure `.env` with `VITE_API_URL`.
4. `npm run dev`

## 🚀 Deployment
**Live Frontend URL**: [https://donation-management-ln4b.vercel.app/](https://donation-management-ln4b.vercel.app/)

Ready for deployment on **Vercel** or any VPS with MySQL and Redis support.
