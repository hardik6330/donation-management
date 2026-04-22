# Donation Management System

Full-stack donation & organization management platform for religious/charitable operations.

## Tech Stack

| Layer    | Tech                                                    |
| -------- | ------------------------------------------------------- |
| Frontend | React 19, Vite, Redux Toolkit + RTK Query, Tailwind CSS, jsPDF, XLSX |
| Backend  | Node.js, Express 5, Sequelize ORM, MySQL                |
| Services | Razorpay (payments), Cloudinary (files), Nodemailer, Fast2SMS, WhatsApp Business API, PDFKit, QRCode, BullMQ/Redis |
| Deploy   | Vercel (both frontend & backend)                        |

## Project Structure

```
backend/src/
├── server.js                    # Entry point (clustering, middleware, DB seed)
├── config/
│   ├── db.js                    # Sequelize connection + all env vars export
│   ├── env.js                   # Validated environment variables
│   ├── cloudinary.js
│   ├── razorpay.js              # Currently disabled
│   ├── redis.js                 # Currently disabled
│   └── cron.js                  # Node-cron scheduler (notification processing)
├── models/                      # 17 Sequelize models (with Sequelize scopes for filtering)
├── controllers/                 # Controller files
│                                #   donation split: donationController (CRUD read/update),
│                                #   donationPaymentController (create/verify/QR),
│                                #   donationSlipController (resend WhatsApp slip)
│                                #   master split: locationController + categoryController
├── routes/
│   └── index.js                 # Route aggregator, all under /api/v1
├── middlewares/
│   ├── auth.js                  # protect, adminOnly, requirePermission(module, level)
│   ├── ipAuth.js                # IP whitelist (dev bypass)
│   ├── errorHandler.js          # Global error handler
│   ├── asyncHandler.js          # Async wrapper for controllers
│   └── rateLimiter.js           # express-rate-limit for API protection
├── validators/                  # Joi schemas + validate middleware (top-level, middleware-tier)
├── assets/                      # Static assets
│   ├── slip.jpg                 # Donation slip template
│   ├── rasid-template.png       # Gujarati receipt template
│   └── fonts/                   # NotoSansGujarati Regular & Bold
└── utils/
    ├── apiResponse.js           # sendSuccess / sendError wrappers
    ├── pagination.js            # getPaginationParams, getPaginatedResponse
    ├── filterHelper.js          # buildSearchFilter, buildDonationFilter (Sequelize where builders)
    ├── locationHelper.js        # Location hierarchy helpers
    ├── queryBuilder.js          # Reusable Sequelize include builders (locationParentInclude, donorInclude, roleInclude, mandalInclude, gaushalaWithLocationInclude)
    ├── donationHelpers.js       # Shared retryAction + managePartialPaymentReminder
    ├── retryHelper.js           # retryWithBackoff (used by email/sms/whatsapp services)
    ├── httpError.js             # HTTP error class
    ├── logger.js                # Winston logger (file + console, Morgan stream)
    ├── services/                # External integrations
    │   ├── email.service.js     # Nodemailer + donation receipt template
    │   ├── sms.service.js       # Fast2SMS integration
    │   ├── donationSlip.service.js  # PDF generation + Cloudinary upload
    │   ├── donationQueue.service.js # BullMQ queue for async donation side-effects
    │   ├── whatsapp.service.js  # WhatsApp Business API integration
    │   └── notification.service.js  # Cron-based notification processing
    └── seeders/                 # Initial data setup (Roles, Admin)

frontend/src/
├── App.jsx                      # All routes defined here
├── main.jsx                     # Redux Provider + ReactDOM
├── app/store.js                 # Redux store (only apiSlice reducer)
├── context/
│   ├── AuthContext.jsx          # Auth state, JWT, logout on 401/403
│   └── LanguageContext.jsx      # Language toggle (English/Gujarati)
├── services/                    # RTK Query API slices (12 files)
│   ├── apiSlice.js              # Base API slice, feature endpoints injected
│   └── createCRUDEndpoints.js   # Factory for list/add/update/delete endpoints (used by 7 slices)
├── hooks/
│   ├── usePermissions.js        # hasPermission(module, level) from localStorage
│   ├── useDropdownPagination.js # Paginated server-search dropdown hook
│   ├── useLocationDropdowns.js  # Hierarchical location dropdown state
│   ├── useTable.js              # Shared table state (filters, pagination, limit)
│   └── useDebounce.js           # Debounce utility hook
├── utils/
│   ├── tableUtils.js            # Status colors, payment mode labels
│   ├── formNavigation.js        # Global Arrow/Enter key navigation logic
│   ├── gujaratiTransliteration.js # Roman to Gujarati script conversion
│   └── errorHelper.js           # Error formatting helpers
├── components/
│   ├── auth/                    # ProtectedRoute, GuestRoute
│   └── common/                  # Reusable: AdminTable, AdminModal, FilterSection,
│                                #   Pagination, SearchableDropdown, FormInput,
│                                #   CardSkeleton, etc.
└── pages/
    ├── Home.jsx                 # Landing page with QR code
    ├── Login.jsx / Signup.jsx   # Auth pages
    ├── Donate.jsx               # Public donation form
    └── admin/
        ├── layout/              # AdminLayout, Sidebar, Header
        └── components/          # 17 modules, each with index.jsx (container),
                                 #   *List.jsx (presentation), Add*Modal.jsx
                                 #   Includes: announcement/ (WhatsApp), profile/,
                                 #   reports/ (PDF/Excel export), system-users/
                                 #   donations/ has partial payment modals & InstallmentTable
```

## Database Models (17 tables)

| Model          | Key Fields                                                        | Relationships                          |
| -------------- | ----------------------------------------------------------------- | -------------------------------------- |
| User           | name, email, mobileNumber, password, roleId, isAdmin              | hasMany Donations, belongsTo Role      |
| Role           | name, permissions (JSON), description                             | hasMany Users                          |
| Donation       | amount, cause, status, paymentMode, paidAmount, remainingAmount   | belongsTo User, Location, Category, Gaushala, Katha |
| Location       | name, type (city/taluka/village), parentId                        | Self-referencing hierarchy             |
| Category       | name, description, isActive                                       | hasMany Donations                      |
| Gaushala       | name, locationId, isActive                                        | belongsTo Location, hasMany Donations/Expenses |
| Katha          | name, locationId, startDate, endDate, status                      | belongsTo Location, hasMany Donations/Expenses |
| Expense        | date, amount, category, description, paymentMode                  | belongsTo Gaushala, Katha              |
| Sevak          | name, mobileNumber, email, address, isActive                      | standalone                             |
| Mandal         | name, price, mandalType, isActive                                 | hasMany MandalMembers                  |
| MandalMember   | name, mobileNumber, city, mandalId                                | belongsTo Mandal, hasMany Payments     |
| MandalPayment  | memberId, month (YYYY-MM), amount, status (paid/unpaid)           | belongsTo MandalMember                 |
| BapuSchedule   | date, time, eventType, contactPerson, amount, status              | belongsTo Location                     |
| KartalDhun     | name, date, amount, locationId, description                       | belongsTo Location                     |
| Notification   | userId, donationId, type, status, attempts, scheduledAt, sentAt   | belongsTo User, Donation               |
| DonationInstallment | donationId, amount, paymentMode, paymentDate, notes            | belongsTo Donation (cascade delete)  |
| Announcement   | userId, mobileNumber, message, templateName, variables, status, type | WhatsApp announcement tracking      |

## API Routes (all under `/api/v1`)

| Route            | Key Endpoints                                      | Auth        |
| ---------------- | -------------------------------------------------- | ----------- |
| /donations       | GET /, POST /order, POST /verify, PUT /:id, GET /:id/installments, GET /:id/status | Mixed |
| /users           | POST /register, /login, /logout; GET /mobile/:num; /system CRUD | Mixed/Admin |
| /admin           | GET /stats, /donations, /donors                    | Admin       |
| /master          | GET /categories, /cities, /sub-locations/:id        | Public GET  |
|                  | POST /location, /category; PUT/DELETE by id         | Admin       |
| /gaushala        | CRUD: GET /all, POST /add, PUT /:id, DELETE /:id   | Admin       |
| /katha           | CRUD: same pattern                                  | Admin       |
| /bapu            | CRUD: same pattern                                  | Admin       |
| /expenses        | CRUD + GET /stats                                   | Admin       |
| /sevak           | CRUD                                                | Admin       |
| /mandal          | CRUD mandals + /members + /payments + /payments/report | Admin    |
| /kartal-dhun     | CRUD                                                | Admin       |
| /roles           | CRUD                                                | Admin       |
| /admin/announcement | POST /, GET /history                             | Admin       |
| /admin/process-reminders | POST / (manual cron trigger)                | Admin       |

## Frontend Routes

**Public:** `/` (Home), `/donate`, `/login`, `/signup`

**Admin** (`/admin/*`, requires auth): dashboard, donations, donors, announcement, gaushala, katha, bapu-schedule, expenses, sevaks, mandal, mandal-members, mandal-payments, kartal-dhun, roles, system-users, profile, category, location

## Backend Structure

- `src/config/`: `env.js` (validated env vars), `db.js` (Sequelize init), `cron.js` (node-cron scheduler).
- `src/utils/services/`: External integrations (Email, SMS, WhatsApp, Cloudinary, PDF Slips, Notifications, Queue).
- `src/validators/`: Joi schemas and `validate` middleware (top-level, middleware-tier).
- `src/utils/seeders/`: Initial data setup (Roles, Admin).
- `src/middlewares/`: `auth`, `errorHandler`, `asyncHandler`, `ipAuth`, `rateLimiter`.
- `src/assets/`: Static assets (slip templates, Gujarati fonts).

## Key Patterns

- **Auth:** JWT managed via centralized `useAuth()` hook and `AuthContext`. Token auto-attached via RTK Query `prepareHeaders`. 401/403 triggers logout.
- **Validation:** Joi-based request validation in `backend/src/validators/`. Applied as middleware in routes using `validate(schema)` helper.
- **Logging:** Winston logger (`utils/logger.js`) with file transports (`logs/error.log`, `logs/combined.log`) and colored console output in dev. Morgan HTTP logging piped through Winston stream.
- **Error Handling:** 
  - **Backend:** Global `errorHandler` middleware (uses Winston logger) and `asyncHandler` wrapper to eliminate `try/catch` in controllers.
  - **Frontend:** Global `ErrorBoundary` component in `App.jsx`.
- **API Management:** Base `apiSlice.js` with feature-specific endpoints injected from `services/*Api.js` files.
- **Route Protection:** 
  - `ProtectedRoute`: Wraps admin routes, redirects unauthenticated users to `/login`.
  - `GuestRoute`: Wraps login/signup, redirects authenticated users to dashboard/home.
- **RBAC:** 3 default roles (Admin/Manager/Entry Operator). Permissions are per-module with levels: none < view < entry < full. Checked via `requirePermission(module, level)` middleware (backend) and `usePermissions()` hook (frontend).
- **Container/Presentation:** Each admin page: `index.jsx` (state via `useTable()`, API calls, handlers) + `*List.jsx` (pure render) + `Add*Modal.jsx`.
- **API Layer:** Single `apiSlice.js` with RTK Query. Tag-based cache invalidation on mutations. Pure-CRUD slices (gaushala, katha, bapu, sevak, kartalDhun, role, expense) use `createCRUDEndpoints({ entity, entityPlural, tag, basePath, listPath?, createPath? })` factory — non-CRUD slices (auth, donation, mandal, master, announcement) stay hand-written.
- **Table State:** `useTable()` hook centralizes filter/pagination/limit state across all admin list pages. Supports `fetchAll` flag, custom limit parsing, and filter reset.
- **Pagination:** `getPaginationParams()` extracts page/limit from query. `getPaginatedResponse()` always returns `{ items, totalData, totalPages, currentPage, limit, fetchAll }` — the collection key is always `items` (standardized; no per-controller overrides). Frontend consumes via `response?.data?.items`. `Pagination` component used in admin lists.
- **Navigation:** Global Arrow Down/Up and Enter key navigation across all form fields via `formNavigation.js`. Skips disabled fields.
- **Donation Flow:** Multi-mode (online/cash/pay_later/cheque/partially_paid). PDF slip generation with amount in Indian words and hierarchical address (Village, Taluka, City). Email + SMS notifications. DonationInstallment model tracks partial payment history with AddPartialPaymentModal, EditPartialPaymentModal, EditPayLaterModal, and InstallmentTable components.
- **Async Donation Processing:** After create, heavy side-effects (PDF gen, Cloudinary upload, WhatsApp, Email) run through the BullMQ queue in `donationQueue.service.js` when Redis is configured, or via fire-and-forget fallback otherwise. Email is skipped entirely (no SMTP connection) when `isValidEmail(user.email)` fails.
- **Slip-Ready Polling:** Donations list no longer constant-polls. After a create OR after an update that transitions a donation to `completed` (via `EditPayLaterModal`, `AddPartialPaymentModal`, `EditPartialPaymentModal`), the container sets `pendingDonationId` and polls lightweight `GET /donations/:id/status` every ~2s (response is `{ ready, slipUrl }`). When `ready=true` the full list is refetched and polling stops. Trigger helpers: `handleDonationCreated(id)` for create flow, `handleDonationUpdated(result)` for update flows — the latter only starts polling when `result.data.status === 'completed'` and `slipUrl` is empty. 30s safety timeout prevents runaway polling.
- **Reports:** PDF export (with Gujarati font support via jsPDF) and Excel export (via XLSX). Advanced filtering by date range, amount, location, category.
- **Dynamic Locations:** `findOrCreateLocationStructure` in backend allows on-the-fly creation of City > Taluka > Village hierarchy during entry in Donations, Gaushala, Katha, and Kartal Dhun modules. Frontend `useLocationDropdowns` hook manages hierarchical dropdown state.
- **Model Scopes:** All models define Sequelize scopes (search, active, location, etc.) for reusable filtering. Controllers use `Model.scope([...scopes]).findAndCountAll()` instead of building inline where clauses. Scopes accept parameters via `{ method: ['scopeName', arg] }` syntax.
- **DB Indexes:** Donation model indexes `status`, `createdAt`, `paymentDate`, `razorpay_order_id`, and composite `(status, createdAt)`. User model indexes `name`, `isAdmin`, `createdAt`. FK columns and unique fields (mobileNumber, email) rely on auto-indexes.
- **Filtering:** `FilterSection` component with inline typing search (direct search in dropdown trigger). Server-side search for paginated dropdowns. `buildSearchFilter()` for generic multi-field search. `buildDonationFilter()` builds complex Sequelize where clauses.
- **Validation:** 10-digit mobile number enforcement on input. Required Category/Gaushala/Katha validation in donation modal. Donation routes use `donationSchema` (create — `paidAmount` required+positive+less than `amount` when `status='partially_paid'`) and `donationUpdateSchema` (PUT — numeric checks on amount/paidAmount/remainingAmount + cross-field `paidAmount <= amount`).
- **Responses:** All backend responses via `sendSuccess()`/`sendError()` wrappers.
- **Query Builder:** Shared Sequelize include helpers in `utils/queryBuilder.js` (e.g. `locationParentInclude(depth)` for the recursive Location.parent chain) replace hand-rolled nested `include: [{ model, as }]` across controllers.
- **Logging discipline:** Services, seeders, and controllers route all diagnostic output through the Winston `logger` — no stray `console.*` in notification/slip/seeder paths.
- **WhatsApp Announcements:** Send templated WhatsApp messages to donors/sevaks with template variables and document attachments. Announcement history tracked in DB.
- **Notification Scheduling:** Cron job (1-minute interval) processes pending partial payment reminders via Email + WhatsApp. Retry logic with attempt tracking.
- **Gujarati Support:** Roman-to-Gujarati transliteration utility. Gujarati fonts for PDF slip generation. Language context for future UI translations.
- **Rate Limiting:** express-rate-limit middleware for API protection.

## Environment Variables (backend .env)

DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD, DB_DIALECT, JWT_SECRET, REFRESH_TOKEN_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_MOBILE, RAZORPAY_KEY_ID, RAZORPAY_KEY_SECRET, SMTP_HOST/PORT/USER/PASS/FROM, VITE_CLOUDINARY_*, VITE_FAST2SMS_API_KEY, WHATSAPP_ACCESS_TOKEN, WHATSAPP_PHONE_NUMBER_ID, WHATSAPP_BUSINESS_ACCOUNT_ID, REDIS_URL, ALLOWED_IPS, NODE_ENV, PORT, FRONTEND_URL

## Frontend .env

VITE_API_URL (backend base URL)

## Startup Flow

1. Sequelize connects to MySQL → sync tables
2. Seeds default roles (Admin, Manager, Entry Operator)
3. Creates admin user from env vars
4. Express listens on PORT (default 5000)
5. Cluster mode in development (1 worker per CPU)
