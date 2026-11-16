# LOYALTYBOX - PHASE 1 QA & SECURITY AUDIT REPORT
**Auditor:** Agent 3 (Senior QA Engineer, Security Auditor & Full-Stack Integration Specialist)  
**Target Applications:** 
- Frontend: `https://assignment-1-ten-pink.vercel.app` (React 19, Vite, Tailwind CSS v4)
- Backend: `https://loyaltybox-backend.onrender.com` (Node.js, Express, MongoDB Atlas, Mongoose)
**Date:** November 15, 2026  
**Scope:** Complete Codebase Security, Authorization, Concurrency, Data Isolation, and Integration Audit.

---

## 1. Executive Summary

A comprehensive, read-only inspection of the LOYALTYBOX full-stack application was conducted across all nine mandated audit areas: Role-Based Access Control, Authentication, Customer Functionality, Admin Functionality, Reward Fulfillment, Support System, Fraud Prevention, API & Database Security, and Frontend/Backend Integration.

While the backend demonstrates robust cryptographic security (HMAC-SHA256 hashed scratch codes, bcrypt password hashing, and atomic code redemptions), **critical authorization vulnerabilities and concurrency issues** were uncovered:
1. **Unprotected Frontend Admin Routes:** The frontend lacks route guards (`ProtectedRoute` / `AdminRoute`), permitting unauthenticated visitors and customers to view administrative pages.
2. **Double-Spending Concurrency Flaw:** The reward redemption endpoint (`claimReward`) reads point balances before decrementing without atomic conditional locks, enabling negative balance exploits via parallel requests.
3. **Ghost Session Persistence on Logout:** Frontend `logoutUser()` removes `localStorage` items but fails to reset the in-memory React state, leaving the previous session active in browser memory.
4. **Permanent Inventory Leakage on Fulfillment Rejection:** When admins reject redemptions, points are refunded to the customer, but physical inventory is never restored to the catalog.
5. **Session Deadlock on Access Token Expiry:** With a 15-minute access token lifespan, the frontend lacks a 401 refresh token interceptor, stranding active users until a hard manual re-login.

**Summary of Findings by Severity:**
- **Critical:** 2
- **High:** 4
- **Medium:** 4
- **Low:** 2
- **Total Findings:** 12

---

## 2. Confirmed Bugs & Vulnerabilities (Detailed Register)

---

### FINDING-SEC-01 (Severity: CRITICAL)
- **Module:** Role-Based Access Control / Frontend Routing
- **File Path:** `frontend/src/App.jsx` (Lines 86–115), `frontend/src/layouts/AdminLayout.jsx` (Lines 6–23), `frontend/src/layouts/CustomerLayout.jsx` (Lines 6–23)
- **Root Cause:** In `App.jsx`, nested routes under `/admin` and `/customer` are rendered directly inside `AdminLayout` and `CustomerLayout` without any `<ProtectedRoute>`, authentication check, or role verification hook. Neither layout inspects `currentUser` nor redirects unauthorized guests to `/login`.
- **Actual Impact:** Any unauthenticated guest or authenticated customer can navigate directly in their browser URL bar to `https://assignment-1-ten-pink.vercel.app/admin/dashboard`, `/admin/fraud-monitoring`, `/admin/codes`, or `/admin/settings`. While backend API endpoints reject unauthorized calls with 403, the frontend falls back to mock analytics/settings, exposing internal operational dashboards.
- **Reproduction Steps:**
  1. Open a new Incognito browser window.
  2. Directly navigate to `https://assignment-1-ten-pink.vercel.app/admin/dashboard`.
  3. Observe that the Admin Dashboard loads completely with navigation, metrics, and reset buttons without asking for authentication.
- **Recommended Solution:**
  Create a reusable `ProtectedRoute` component checking `currentUser` authentication status and required roles (`role === 'admin'`). Wrap all `/admin/*` routes with `<ProtectedRoute requiredRole="admin">` and `/customer/*` routes with `<ProtectedRoute requiredRole="customer">`. Redirect unauthenticated sessions to `/login`.

---

### FINDING-SEC-02 (Severity: CRITICAL)
- **Module:** Points & Rewards Concurrency / Financial Safety
- **File Path:** `backend/src/controllers/rewardController.js` (`claimReward`, Lines 64–96)
- **Root Cause:** In `claimReward`, the user's available points are checked via `const user = await User.findById(req.user._id); if (user.availablePoints < reward.pointsRequired)`. Then, points are deducted via `User.findByIdAndUpdate(user._id, { $inc: { availablePoints: -reward.pointsRequired } })`. This update does NOT include `{ availablePoints: { $gte: reward.pointsRequired } }` in the query criteria, nor does it pass `{ runValidators: true }`.
- **Actual Impact:** An attacker with exactly 100 points can issue two concurrent HTTP requests to `POST /api/rewards/:id/redeem`. Both requests pass the point check simultaneously, resulting in a negative point balance (`-100 PTS`) and duplicate reward fulfillment orders issued for points the user does not possess.
- **Reproduction Steps:**
  1. Register a customer account with 100 points.
  2. Intercept `POST /api/rewards/REW-002/redeem` (100 PTS reward) in Burp Suite or use `Promise.all([fetch(...), fetch(...)])`.
  3. Send both redemption requests concurrently.
  4. Both return HTTP 201; customer balance becomes negative.
- **Recommended Solution:**
  Perform atomic point deduction with a conditional query:
  ```javascript
  const updatedUser = await User.findOneAndUpdate(
    { _id: req.user._id, availablePoints: { $gte: reward.pointsRequired } },
    { $inc: { availablePoints: -reward.pointsRequired, totalPointsRedeemed: reward.pointsRequired } },
    { new: true }
  );
  if (!updatedUser) {
    // Rollback reward quantity decrement
    await Reward.findByIdAndUpdate(reward._id, { $inc: { quantity: 1 } });
    return apiResponse.error(res, 'Insufficient points or concurrent claim in progress.', [], 400);
  }
  ```

---

### FINDING-AUTH-01 (Severity: HIGH)
- **Module:** Authentication & Session Management
- **File Path:** `frontend/src/context/AppContext.jsx` (`logoutUser`, Lines 790–799; `useState(currentUser)`, Lines 53–72)
- **Root Cause:** In `AppContext.jsx`, `logoutUser()` removes `loyaltybox_token`, `loyaltybox_refresh_token`, and `loyaltybox_user` from `localStorage`, but NEVER executes `setCurrentUser(null)`. Furthermore, on initial load or empty storage, `useState(currentUser)` defaults to a hardcoded mock user (`Rahul Sharma`, `role: "customer"`).
- **Actual Impact:** When a user logs out, their profile remains loaded in React memory. If an admin logs out and navigates back, their session appears active until a hard reload. Furthermore, new visitors are automatically treated as logged-in customer Rahul Sharma rather than unauthenticated guests.
- **Reproduction Steps:**
  1. Log in as an Admin (`admin@factory.io`).
  2. Click "Admin Sign Out".
  3. In console, inspect `currentUser`: it still contains the Admin profile object.
  4. Clear browser storage and refresh: the app initializes as "Rahul Sharma" with 1,250 points instead of guest state.
- **Recommended Solution:**
  Update `logoutUser` to explicitly invoke `setCurrentUser(null)`. Initialize `currentUser` state to `null` if no valid `loyaltybox_user` exists in `localStorage`.

---

### FINDING-INT-01 (Severity: HIGH)
- **Module:** API Integration & Token Lifecycle
- **File Path:** `frontend/src/services/api.js` (`request`, Lines 30–80)
- **Root Cause:** Backend access tokens expire in 15 minutes (`JWT_ACCESS_EXPIRES_IN: '15m'`). In `api.js`, the `request` function does not catch HTTP 401 responses to automatically call `/api/auth/refresh` using the stored refresh token.
- **Actual Impact:** After 15 minutes of user inactivity or active dashboard browsing, all subsequent API operations (redeeming codes, viewing history, filtering customers) fail with `401 Unauthorized`. Users are stranded with silent failures or error toasts without automatic session renewal.
- **Reproduction Steps:**
  1. Log in to the application.
  2. Wait 15 minutes (or set `JWT_ACCESS_EXPIRES_IN=10s` in backend test).
  3. Attempt to redeem a code or view transaction history.
  4. Request fails with 401; user is not refreshed.
- **Recommended Solution:**
  Implement a response interceptor in `request()`: upon receiving a 401 status, call `api.auth.refreshToken()`, persist the new access token in `localStorage`, and replay the failed request. If the refresh token has expired, trigger `logoutUser()` and redirect to `/login`.

---

### FINDING-LOGIC-01 (Severity: HIGH)
- **Module:** Reward Fulfillment & Inventory Management
- **File Path:** `backend/src/controllers/redemptionController.js` (`updateFulfillmentStatus`, Lines 140–165)
- **Root Cause:** When an admin transitions a redemption request to `Rejected`, the controller atomically refunds points to the user (`User.findByIdAndUpdate`), but fails to increment the reward's inventory count (`Reward.findByIdAndUpdate`).
- **Actual Impact:** Stock count permanently leaks. For example, if a limited stock reward (40 units) receives 10 fraudulent claims that the admin subsequently rejects, the catalog reflects only 30 units left, permanently depriving legitimate customers of stock.
- **Reproduction Steps:**
  1. Note available quantity of reward `REW-006` (e.g., 40 units).
  2. Customer claims the reward; quantity drops to 39 units.
  3. Admin navigates to `/admin/fulfillment` and marks the order as `Rejected` with reason.
  4. Customer points are refunded, but reward quantity remains at 39 units instead of returning to 40.
- **Recommended Solution:**
  In `updateFulfillmentStatus`, when `nextStatus === 'Rejected'`, restore catalog inventory:
  ```javascript
  await Reward.findByIdAndUpdate(redemption.rewardId, {
    $inc: { quantity: 1 }
  });
  ```

---

### FINDING-BUG-01 (Severity: HIGH)
- **Module:** Catalog & Promotion Filtering / Role Identification
- **File Path:** 
  - `backend/src/routes/rewardRoutes.js` (Line 20)
  - `backend/src/routes/campaignRoutes.js` (Line 15)
  - `backend/src/routes/productRoutes.js` (Line 19)
  - `backend/src/controllers/rewardController.js` (Line 13)
  - `backend/src/controllers/campaignController.js` (Line 12)
  - `backend/src/controllers/productController.js` (Line 12)
- **Root Cause:** Controllers for `getRewards`, `getCampaigns`, and `getProducts` contain logic: `if (!req.user || req.user.role !== 'admin') { query.status = 'active'; }`. However, the routes in `rewardRoutes.js`, `campaignRoutes.js`, and `productRoutes.js` do NOT mount `protect` or an optional authentication middleware.
- **Actual Impact:** Because `protect` is never invoked, `req.user` is ALWAYS `undefined` on these GET routes, even when an admin includes their `Bearer` JWT token. Consequently, the admin portal can NEVER retrieve inactive products, draft rewards, or paused campaigns from the database.
- **Reproduction Steps:**
  1. Create a product with `status: 'inactive'`.
  2. Log in as admin and send `GET /api/products?status=inactive` with Admin `Bearer` token.
  3. Response returns an empty list because `!req.user` evaluates to true and forces `query.status = 'active'`.
- **Recommended Solution:**
  Create an `optionalProtect` middleware that verifies the JWT token if present in headers without throwing 401 if absent. Mount `optionalProtect` on public GET routes.

---

### FINDING-SEC-03 (Severity: MEDIUM)
- **Module:** Mass Assignment / Data Integrity
- **File Path:** `backend/src/controllers/rewardController.js` (`updateReward`, Line 191)
- **Root Cause:** `Reward.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })` passes unvalidated `req.body` directly into Mongoose.
- **Actual Impact:** Allows unexpected or undocumented schema fields to be persisted or overwritten.
- **Recommended Solution:**
  Destructure only permitted fields (`name, description, pointsRequired, quantity, category, image, tag, status`) before updating.

---

### FINDING-SEC-04 (Severity: MEDIUM)
- **Module:** Denial of Service / Regular Expression Injection (ReDoS)
- **File Path:** 
  - `backend/src/controllers/productController.js` (Line 24)
  - `backend/src/controllers/rewardController.js` (Line 26)
  - `backend/src/controllers/fraudController.js` (Line 18)
  - `backend/src/controllers/analyticsController.js` (Line 168)
- **Root Cause:** User-supplied `search` query parameters are directly interpolated into MongoDB `$regex` objects without escaping special regex characters: `{ productName: { $regex: search, $options: 'i' } }`.
- **Actual Impact:** An attacker can submit regex metacharacters (`(a+)+$`) that trigger catastrophic backtracking, causing CPU spikes and blocking Express event loop threads.
- **Recommended Solution:**
  Escape user regex input using a helper: `const safeSearch = search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');`.

---

### FINDING-SEC-05 (Severity: MEDIUM)
- **Module:** Audit Trail Completeness
- **File Path:** `backend/src/controllers/codeController.js` (`blockCode`, Lines 180–194), `backend/src/controllers/pointsController.js` (`adjustPoints`, Lines 97–141)
- **Root Cause:** Neither `blockCode` nor `adjustPoints` calls `logAdminActivity()`.
- **Actual Impact:** Administrative actions of high compliance significance (blocking security packaging codes and manual ledger point adjustments) are omitted from the centralized `AuditLog` collection and the Admin Audit Trail UI.
- **Recommended Solution:**
  Add `logAdminActivity()` invocations in `blockCode` and `adjustPoints` detailing admin ID, target ID, reason, and points adjusted.

---

### FINDING-SEC-06 (Severity: MEDIUM)
- **Module:** Token Storage Security / XSS Exposure
- **File Path:** `frontend/src/services/api.js` (Line 15), `frontend/src/context/AppContext.jsx` (Line 796)
- **Root Cause:** JWT access and refresh tokens are stored in browser `localStorage`.
- **Actual Impact:** Tokens are accessible via JavaScript. If any cross-site scripting (XSS) vulnerability is introduced via third-party packages, attacker scripts can exfiltrate tokens.
- **Recommended Solution:**
  Store refresh tokens in `httpOnly`, `Secure`, `SameSite=Strict` cookies. Keep access tokens in memory or short-lived storage.

---

### FINDING-FEAT-01 (Severity: MEDIUM)
- **Module:** Password Recovery Lifecycle
- **File Path:** `backend/src/controllers/authController.js` (`forgotPassword`, Line 229), `frontend/src/App.jsx` (Lines 80–84)
- **Root Cause:** `forgotPassword` generates a reset token in MongoDB but comments out email dispatch (`// In production, send email with rawToken`). Furthermore, `frontend/src/App.jsx` lacks a route or UI for `/reset-password`.
- **Actual Impact:** If a user clicks "Forgot Password" on the login page, the system claims instructions were sent, but the user never receives a reset link and cannot recover access.
- **Recommended Solution:**
  Integrate an email transport (e.g., Nodemailer/SendGrid) or provide an SMS/OTP alternative. Create a `/reset-password` page accepting the reset token from query params.

---

### FINDING-VAL-01 (Severity: LOW)
- **Module:** Input Validation / Credential Strength
- **File Path:** `backend/src/validators/authValidators.js` (`registerValidator`, Lines 17–25), `backend/src/models/User.js` (Line 28)
- **Root Cause:** Passwords only require minimum 6 characters with no complexity checks (letters, digits, symbols). Phone number validation checks only `notEmpty()`.
- **Actual Impact:** Allows weak passwords (`123456`) and malformed phone strings (`"abc"`).
- **Recommended Solution:**
  Enforce NIST-compliant password validation (`isStrongPassword({ minLength: 8, minNumbers: 1, minUppercase: 1 })`) and regex phone validation (`/^[+]?[0-9]{10,14}$/`).

---

## 3. Prioritized Remediation Roadmap (Pre-Production Checklist)

| Priority | Finding ID | Severity | Description | Target Module |
| :---: | :---: | :---: | :--- | :--- |
| **P0** | **FINDING-SEC-01** | **CRITICAL** | Implement React Router ProtectedRoute & AdminRoute guards | Frontend Routing |
| **P0** | **FINDING-SEC-02** | **CRITICAL** | Atomic conditional locks on `claimReward` to prevent negative point balances | Backend Points/Rewards |
| **P1** | **FINDING-AUTH-01** | **HIGH** | Fix `logoutUser` in-memory state leakage and remove default guest impersonation | Frontend AppContext |
| **P1** | **FINDING-INT-01** | **HIGH** | Add 401 Axios/Fetch token refresh interceptor in `api.js` | Frontend API Layer |
| **P1** | **FINDING-LOGIC-01** | **HIGH** | Restore catalog inventory when redemption orders are rejected | Backend Fulfillment |
| **P1** | **FINDING-BUG-01** | **HIGH** | Create `optionalProtect` middleware for public GET routes | Backend Routes/Auth |
| **P2** | **FINDING-SEC-03** | **MEDIUM** | Whitelist input fields in `updateReward` to prevent mass assignment | Backend Rewards |
| **P2** | **FINDING-SEC-04** | **MEDIUM** | Escape special characters in `$regex` search queries against ReDoS | Backend Search |
| **P2** | **FINDING-SEC-05** | **MEDIUM** | Add `logAdminActivity` to `blockCode` and `adjustPoints` | Backend Audit Logs |
| **P2** | **FINDING-FEAT-01** | **MEDIUM** | Build `/reset-password` frontend view and integrate SMTP dispatch | Auth / Email |
| **P3** | **FINDING-SEC-06** | **MEDIUM** | Migrate refresh tokens to `httpOnly` secure cookies | Token Management |
| **P3** | **FINDING-VAL-01** | **LOW** | Upgrade password complexity and phone regex validators | Input Validation |

---
**Audit Status:** Phase 1 Inspection Completed. In accordance with Rule #160, **no code has been modified or patched** in this phase.
