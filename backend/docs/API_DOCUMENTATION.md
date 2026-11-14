# LOYALTYBOX API Documentation
> **Version:** 1.0.0  
> **Base URL:** `http://localhost:5000/api`  
> **Protocol:** RESTful JSON  
> **Authentication:** Bearer JWT Header (`Authorization: Bearer <accessToken>`)

---

## 1. System Health
### `GET /api/health`
Returns live system health status and timestamp.
- **Auth:** None
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "LOYALTYBOX API is running",
  "status": "healthy",
  "timestamp": "2026-11-14T21:00:00.000Z"
}
```

---

## 2. Authentication APIs
### `POST /api/auth/register`
Registers a new customer account and automatically credits 100 welcome bonus points.
- **Auth:** None (Public)
- **Request Body:**
```json
{
  "fullName": "Rahul Sharma",
  "email": "rahul.sharma@workshop.in",
  "phone": "+91 98765 43210",
  "password": "password123",
  "confirmPassword": "password123",
  "businessName": "Sharma Precision Engineering Works",
  "city": "Pune",
  "state": "Maharashtra"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Account registered successfully! 100 bonus points have been credited to your wallet.",
  "data": {
    "user": {
      "id": "67362a...",
      "fullName": "Rahul Sharma",
      "email": "rahul.sharma@workshop.in",
      "role": "customer",
      "tier": "Bronze",
      "availablePoints": 100
    },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "a7b3c9..."
  }
}
```

### `POST /api/auth/login`
Authenticates a customer or admin and returns JWT access and refresh tokens.
- **Auth:** None (Public)
- **Request Body:**
```json
{
  "email": "rahul.sharma@workshop.in",
  "password": "password123"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Logged in successfully.",
  "data": {
    "user": { ... },
    "accessToken": "eyJhbGciOi...",
    "refreshToken": "a7b3c9..."
  }
}
```

### `POST /api/auth/refresh`
Refreshes an expired access token using token rotation.
- **Request Body:** `{ "refreshToken": "a7b3c9..." }`

### `GET /api/auth/me`
Retrieves authenticated customer or admin profile.
- **Auth:** Bearer Token

---

## 3. Product Catalog APIs
### `GET /api/products`
Lists products with optional category, status, and search filters.
- **Auth:** Public (active only) / Admin (all statuses)
- **Query Params:** `category`, `search`, `page`, `limit`

### `POST /api/products`
Admin-only endpoint to create a new physical product SKU and set points per box.
- **Auth:** Admin
- **Request Body:**
```json
{
  "productName": "Industrial Heavy Duty Bearing Box",
  "sku": "SKU-HDB-401",
  "category": "Mechanical Components",
  "pointsPerBox": 100,
  "price": 1850,
  "description": "High-grade alloy steel ball bearings"
}
```

---

## 4. Product Code Generation & Secure Redemption
### `POST /api/codes/generate`
Generates a batch of cryptographically unique single-use box codes. Codes are HMAC-SHA256 hashed before database insertion. Plaintext codes are returned **only once** at generation time for packaging printing.
- **Auth:** Admin
- **Request Body:**
```json
{
  "productId": "67362a...",
  "count": 10,
  "customPoints": 100,
  "expiryMonths": 12
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Successfully generated batch BATCH-2026-Q4-8812 with 10 unique product packaging codes.",
  "data": {
    "batchId": "BATCH-2026-Q4-8812",
    "count": 10,
    "points": 100,
    "codes": [
      {
        "code": "BOX-9J3K-8L2A",
        "sku": "SKU-HDB-401",
        "points": 100,
        "expiresAt": "2027-11-14"
      }
    ]
  }
}
```

### `POST /api/codes/redeem`
Customer endpoint to verify and redeem an inner-box security code.
- **Auth:** Customer Bearer Token
- **Rate Limit:** 5 requests per minute
- **Request Body:**
```json
{
  "code": "BOX-GOLD-8899"
}
```
- **Response `200 OK`:**
```json
{
  "success": true,
  "message": "Congratulations! Points added successfully.",
  "data": {
    "pointsEarned": 100,
    "availablePoints": 1350,
    "productName": "Industrial Heavy Duty Bearing Box",
    "sku": "SKU-HDB-401"
  }
}
```
- **Error Responses:**
  - `400`: `Invalid product code` (logs heuristic probe)
  - `400`: `This code has already been redeemed` (logs duplicate attempt)
  - `400`: `This product code has expired`
  - `429`: `Rate limit exceeded`

---

## 5. Rewards & Redemption APIs
### `GET /api/rewards`
Returns all active reward items, points pricing, and available stock.

### `POST /api/rewards/:id/redeem`
Claims a reward item. Deducts points atomically, decrements inventory, and issues a claim coupon code.
- **Auth:** Customer Bearer Token
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Congratulations! You claimed \"₹100 Discount Coupon\".",
  "data": {
    "redemption": {
      "redemptionCode": "CLAIM-7F9B",
      "rewardName": "₹100 Discount Coupon",
      "pointsSpent": 100,
      "status": "delivered"
    },
    "availablePoints": 1150
  }
}
```

---

## 6. Points Ledger APIs
- `GET /api/points/balance`: Current wallet counters.
- `GET /api/points/history`: Audit log of all credits and debits.
- `GET /api/points/summary`: 6-month points velocity for Recharts visualizations.

---

## 7. Fraud Monitoring APIs
- `GET /api/admin/fraud`: Threat incidents filtered by risk level (`Critical`, `High`, `Medium`, `Low`).
- `PATCH /api/admin/fraud/:id/status`: Update incident status (`Pending Review`, `Investigating`, `Resolved`, `Blacklisted`).
- `POST /api/admin/fraud/block-ip`: Blacklist origin IP from code scanning.

---

## 8. Analytics & Admin Dashboard APIs
- `GET /api/admin/analytics/dashboard`: Master KPI summary.
- `GET /api/admin/analytics/customers`: Monthly customer acquisition velocity.
- `GET /api/admin/analytics/points`: Points liability issued vs spent.
- `GET /api/admin/analytics/products`: Product SKU redemption yield rates.
- `GET /api/admin/customers`: Customer CRM directory with CSV export.
