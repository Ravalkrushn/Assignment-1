# LOYALTYBOX Frontend-to-Backend Integration Guide

This guide maps each of Agent 1's 19 completed React views to Agent 2's Express/MongoDB API endpoints, detailing payload contracts and local state transitions.

---

## 1. Authentication & Onboarding Views

### 1.1 Login Page (`/login` ➔ `LoginPage.jsx`)
- **API Endpoint:** `POST /api/auth/login`
- **Request:** `{ "email": email, "password": password }`
- **Frontend Action:** Store `data.accessToken` and `data.refreshToken` in `localStorage` or memory. Store `data.user` in `AppContext`. If `data.user.role === 'admin'`, navigate to `/admin/dashboard`, else `/customer/dashboard`.

### 1.2 Registration Page (`/register` ➔ `RegisterPage.jsx`)
- **API Endpoint:** `POST /api/auth/register`
- **Request:** `{ fullName, email, phone, password, confirmPassword, businessName, city, state }`
- **Frontend Action:** Automatically logs user in and adds 100 signup points. Show toast notification.

---

## 2. Customer Portal Views

### 2.1 Customer Dashboard (`/customer/dashboard` ➔ `CustomerDashboard.jsx`)
- **API Endpoints:**
  - `GET /api/points/balance`: Populate the 4 stat counters (`availablePoints`, `totalPointsEarned`, `boxesRedeemed`).
  - `GET /api/points/summary`: Render the Recharts 6-month area chart.
  - `GET /api/points/history?limit=4`: Render the recent activity feed.

### 2.2 Code Redemption (`/customer/redeem-code` ➔ `RedeemCodePage.jsx`)
- **API Endpoint:** `POST /api/codes/redeem`
- **Request:** `{ "code": inputCode }`
- **Handling Responses:**
  - `200 OK`: Fire `canvas-confetti`, update wallet balance in `AppContext`, append transaction.
  - `400 Invalid`: Show error card *"Invalid product code"*.
  - `400 Already Redeemed`: Show warning card with prior redemption timestamp.
  - `400 Expired`: Show expiration warning card.
  - `429 Too Many Requests`: Show cooldown alert.

### 2.3 My Points (`/customer/points` ➔ `MyPointsPage.jsx`)
- **API Endpoints:**
  - `GET /api/points/balance`: Display lifetime counters and available balance.
  - `GET /api/points/history?flow=ALL|EARNED|SPENT`: Populate filterable transaction table.

### 2.4 Rewards Marketplace (`/customer/rewards` ➔ `RewardsPage.jsx`)
- **API Endpoints:**
  - `GET /api/rewards`: Fetch catalog items.
  - `POST /api/rewards/:id/redeem`: Deduct points and generate `redemptionCode`.

### 2.5 Redemption History (`/customer/history` ➔ `RedemptionHistoryPage.jsx`)
- **API Endpoint:** `GET /api/points/history?page=1&limit=10`
- **Features:** Supports search filtering and CSV export.

### 2.6 Customer Profile (`/customer/profile` ➔ `CustomerProfilePage.jsx`)
- **API Endpoints:**
  - `GET /api/auth/me`: Load profile.
  - `PUT /api/auth/profile`: Save updated business name, phone, city, state.

---

## 3. Factory Owner Admin Portal Views

### 3.1 Admin Dashboard (`/admin/dashboard` ➔ `AdminDashboard.jsx`)
- **API Endpoint:** `GET /api/admin/analytics/dashboard`
- **Response Data:** Returns total customers, total products, total codes generated, total redeemed, points liability, and active fraud incidents.

### 3.2 Customer Management (`/admin/customers` ➔ `CustomerManagementPage.jsx`)
- **API Endpoints:**
  - `GET /api/admin/customers?search=...&status=...`: List registered workshop clients.
  - `GET /api/admin/customers/:id/history`: Load customer-specific scan audit history.

### 3.3 Product Management (`/admin/products` ➔ `ProductManagementPage.jsx`)
- **API Endpoints:**
  - `GET /api/products`: Full product listing.
  - `POST /api/products`: Create new SKU and assign points per box.
  - `PUT /api/products/:id`: Edit product metadata.
  - `DELETE /api/products/:id`: Deactivate SKU.

### 3.4 Code Management (`/admin/codes` ➔ `CodeManagementPage.jsx`)
- **API Endpoints:**
  - `GET /api/codes?batchId=...&status=...`: Master list of serialized packaging codes.
  - `POST /api/codes/generate`: Generate batch of 5, 10, 25, 50 codes and return printable plaintext strings.
  - `GET /api/codes/batches/:id/export`: Download factory CSV for sticker printer.

### 3.5 Rewards Management (`/admin/rewards` ➔ `RewardsManagementPage.jsx`)
- **API Endpoints:**
  - `GET /api/rewards`: List all rewards.
  - `POST /api/rewards`: Add new reward offering.
  - `PUT /api/rewards/:id`: Update points required or stock quantity.
  - `DELETE /api/rewards/:id`: Deactivate reward.

### 3.6 Redemption Management (`/admin/redemptions` ➔ `RedemptionManagementPage.jsx`)
- **API Endpoint:** `GET /api/redemptions?status=...&search=...`: Central audit log.

### 3.7 Fraud Monitoring (`/admin/fraud-monitoring` ➔ `FraudMonitoringPage.jsx`)
- **API Endpoints:**
  - `GET /api/admin/fraud?riskLevel=...`: Incident listing.
  - `PATCH /api/admin/fraud/:id/status`: Update investigation status.
  - `POST /api/admin/fraud/block-ip`: Instant IP firewall blacklist.

### 3.8 Analytics & Reports (`/admin/analytics` ➔ `AnalyticsPage.jsx`)
- **API Endpoints:**
  - `GET /api/admin/analytics/points`: Points liability curve.
  - `GET /api/admin/analytics/customers`: Monthly growth.
  - `GET /api/admin/analytics/products`: SKU yield rate table.

### 3.9 Admin Settings (`/admin/settings` ➔ `AdminSettingsPage.jsx`)
- **API Endpoints:**
  - `GET /api/admin/settings`: Read facility configuration.
  - `PUT /api/admin/settings`: Update points expiry rules and security rate limits.
