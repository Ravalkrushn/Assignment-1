# TEST_PLAN.md — Comprehensive Test Plan & Verification Results

This document records the end-to-end testing strategy, automated build verification, and manual test executions across all routes and interactive states of the **LOYALTYBOX** application.

---

## 1. Automated Build & Compilation Tests

| Test Case | Command Executed | Expected Result | Actual Result | Status |
|---|---|---|---|---|
| Frontend Dependencies | `npm install` (in `frontend/`) | Clean dependency resolution without conflicts | All packages installed | **PASS** |
| Frontend Production Build | `npm run build` (in `frontend/`) | Zero syntax errors, bundles generated in `dist/` | Build completed in 1.35s | **PASS** |
| Frontend Code Quality / Lint | `npm run lint` (in `frontend/`) | Zero fatal lint errors | 0 errors | **PASS** |
| Backend Dependencies | `npm install` (in `backend/`) | Clean resolution of Express, Mongoose, Jest | All packages installed | **PASS** |
| Backend Automated Integration Tests | `npm test` (in `backend/`) | 19 integration tests passing across 4 suites | 19 passed, 4 test suites | **PASS** |

---

## 1.1 Backend Automated Integration Test Suite Breakdown

| Suite File | Test Scenario | Verified Assertions | Status |
|---|---|---|---|
| `auth.test.js` | Customer registration | Returns 201, issues JWT tokens, auto-credits 100 welcome bonus points | **PASS** |
| `auth.test.js` | Duplicate email protection | Rejects duplicate email registration with 409 Conflict | **PASS** |
| `auth.test.js` | Password validation | Confirms password confirmation matching, min 6 characters | **PASS** |
| `auth.test.js` | Customer login | Compares bcrypt hash, generates access/refresh tokens | **PASS** |
| `auth.test.js` | Password security check | Rejects invalid password attempt with 401 Unauthorized | **PASS** |
| `auth.test.js` | Token verification | Rejects protected route without token (401), grants access with valid token | **PASS** |
| `products.test.js`| Product creation | Admin creates new physical SKU with points per box | **PASS** |
| `products.test.js`| SKU uniqueness | Rejects duplicate SKU with 409 Conflict | **PASS** |
| `products.test.js`| Role authorization | Blocks customer from creating or deleting products (403 Forbidden) | **PASS** |
| `products.test.js`| Product listing | Public endpoint filters active products | **PASS** |
| `codes.test.js` | Batch code generation | Generates 10 unique codes, stores HMAC-SHA256 hash (never plaintext) | **PASS** |
| `codes.test.js` | Valid code redemption | Verifies HMAC signature, credits points, updates wallet atomically | **PASS** |
| `codes.test.js` | Duplicate code protection | Rejects already-redeemed code with 400 Bad Request, logs duplicate attempt | **PASS** |
| `codes.test.js` | Expired code protection | Rejects promotional code beyond expiration date | **PASS** |
| `codes.test.js` | Invalid code defense | Rejects non-existent code, logs heuristic fraud event | **PASS** |
| `rewards.test.js` | Reward claim | Deducts points, decrements inventory atomically, issues claim code | **PASS** |
| `rewards.test.js` | Insufficient points check| Rejects redemption if wallet balance is below required points | **PASS** |
| `rewards.test.js` | Out-of-stock check | Rejects redemption if reward inventory is zero | **PASS** |

---

## 2. Route Navigation & Page Rendering Tests

| Route | Page Component | Key UI Elements Verified | Status |
|---|---|---|---|
| `/` | LandingPage | Hero, browser dashboard mockup, continuous marquee, problem/solution cards, 6-feature grid, 3-step process, personas, testimonials, CTA | **PASS** |
| `/login` | LoginPage | Split-screen promotional banner, email/password form, 1-click Demo Customer & Demo Admin buttons, password toggle | **PASS** |
| `/register` | RegisterPage | Full name, email, phone, password matching check, terms checkbox, instant registration toast | **PASS** |
| `/forgot-password` | ForgotPasswordPage | Email input, simulated reset link submission state, return to login link | **PASS** |
| `/customer/dashboard` | CustomerDashboard | 4 stats cards (1,250 pts, 2,500 total, 5 rewards, 25 boxes), Recharts 6-month points area chart, reward progress bar, recent activity | **PASS** |
| `/customer/redeem-code`| RedeemCodePage | Code input, verify & redeem button, inner-box guide diagram, 5 quick-test code chips, confetti trigger, result cards | **PASS** |
| `/customer/points` | MyPointsPage | 3 balance cards, 12-month expiration notice, filterable ledger table (All / Earned / Spent) | **PASS** |
| `/customer/rewards` | RewardsPage | Category filter tabs, 8 reward cards, points cost chips, stock badges, redemption confirmation modal | **PASS** |
| `/customer/history` | RedemptionHistoryPage | Search bar, type filter, table with transaction ref, CSV export button, pagination controls | **PASS** |
| `/customer/profile` | CustomerProfilePage | Customer avatar, workshop info, inline profile editing with save button, change password form | **PASS** |
| `/admin/dashboard` | AdminDashboard | 6 KPIs (5k customers, 125 SKUs, 50k codes, 12.5k redemptions, 125k points), monthly growth bar chart, popular rewards progress, live feeds | **PASS** |
| `/admin/customers` | CustomerManagementPage| Directory search, status filter, customer table, detail modal with transaction history, CSV export | **PASS** |
| `/admin/products` | ProductManagementPage | SKU table, Add Product modal, Edit Product modal, Delete confirmation modal, points-per-box configuration | **PASS** |
| `/admin/codes` | CodeManagementPage | Batch code table, status badges (Unused, Redeemed, Expired, Suspicious), Generate Codes modal, CSV export | **PASS** |
| `/admin/rewards` | RewardsManagementPage | Reward catalog table, Add/Edit reward modal with points requirement & stock, delete modal | **PASS** |
| `/admin/redemptions` | RedemptionManagementPage | Master audit log, customer name, code scanned, points awarded, CSV export, pagination | **PASS** |
| `/admin/fraud-monitoring` | FraudMonitoringPage | Threat severity badges (Critical, High, Medium, Low), incident search, review modal with forensic pattern & blacklist action | **PASS** |
| `/admin/analytics` | AnalyticsPage | Points liability area chart, scan growth line chart, SKU yield rate table, top repeat buyer workshops | **PASS** |
| `/admin/settings` | AdminSettingsPage | Factory facility profile, loyalty validity policy, heuristic anti-fraud rate limit configuration, Reset Demo Data button | **PASS** |

---

## 3. Interactive State & Functional Scenario Tests

### Scenario 1: Valid Box Code Redemption
1. Navigate to `/customer/redeem-code`.
2. Click quick-test code `BOX-GOLD-8899` or enter it manually.
3. Click **"Verify & Redeem Points"**.
4. **Result:** Loading spinner simulates cryptographic verification for 800ms. Celebration confetti fires across the screen. Toast alert: *"Awesome! 100 points credited for Industrial Heavy Duty Bearing Box."* Points balance increases from 1,250 to 1,350 PTS.

### Scenario 2: Already Redeemed Code Protection
1. Enter or select test code `BOX-USED-5521`.
2. Click **"Verify & Redeem Points"**.
3. **Result:** Error toast displays: *"This code was already redeemed on 2026-11-02 14:22."* Red warning card appears with status `ALREADY_REDEEMED`. No points are added.

### Scenario 3: Expired Code Protection
1. Enter or select test code `BOX-EXPD-9900`.
2. Click **"Verify & Redeem Points"**.
3. **Result:** Error toast displays: *"This product code expired on 2025-10-15. Promotional period has ended."*

### Scenario 4: Invalid Code Handling
1. Enter random string `XYZ-9999-FAKE`.
2. Click **"Verify & Redeem Points"**.
3. **Result:** Error toast displays: *"Invalid product code. Please verify the code printed inside your box."*

### Scenario 5: Reward Claiming & Point Deduction
1. Navigate to `/customer/rewards`.
2. Click **"Redeem Reward"** on the *"₹100 Discount Coupon"* (100 PTS).
3. The Neo-Brutalist confirmation modal displays points calculation (1,250 - 100 = 1,150 PTS).
4. Click **"Confirm & Claim"**.
5. **Result:** Confetti triggers, points balance decrements, reward available quantity decreases by 1, and transaction appears in `/customer/history`.

### Scenario 6: Batch Code Generation by Factory Owner
1. Navigate to `/admin/codes`.
2. Click **"Generate New Batch"**.
3. Select SKU *"Tungsten Carbide CNC Drill Bit Set"*, count *"10 Codes"*, click **"Generate Batch"**.
4. **Result:** 10 new unique single-use codes (e.g. `BOX-XXXX-XXXX`) are appended to the table with `Unused` status, exportable to CSV.

### Scenario 7: Responsive Breakpoint Verification
- Tested at 375px (Mobile Portrait): Hamburger navigation opens full mobile drawer, tables scroll horizontally without layout clipping.
- Tested at 768px (Tablet): Grid layouts reflow cleanly to 2 columns.
- Tested at 1280px / 1440px (Desktop): Fixed sidebar layout with persistent top navigation.
