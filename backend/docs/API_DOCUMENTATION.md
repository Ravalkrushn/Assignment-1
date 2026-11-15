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

## 5. Rewards & Fulfillment APIs
### `GET /api/rewards`
Returns all active reward items, points pricing, and available stock.

### `POST /api/rewards/:id/redeem`
Claims a reward item. Deducts points atomically, decrements inventory, and issues a claim order with shipping metadata and event timeline.
- **Auth:** Customer Bearer Token
- **Request Body (Physical Rewards):**
```json
{
  "deliveryAddress": "12 Workshop Road, Pune, Maharashtra 411001"
}
```
- **Response `201 Created`:**
```json
{
  "success": true,
  "message": "Congratulations! You claimed \"Heavy Duty Tool Kit\".",
  "data": {
    "redemption": {
      "id": "67362a...",
      "redemptionCode": "CLAIM-7F9B",
      "rewardName": "Heavy Duty Tool Kit",
      "pointsSpent": 400,
      "status": "Pending",
      "timeline": [
        {
          "status": "Pending",
          "timestamp": "2026-11-15T09:00:00.000Z",
          "note": "Redemption order placed, pending factory dispatch approval."
        }
      ]
    },
    "availablePoints": 750
  }
}
```

### `GET /api/redemptions/my`
Returns authenticated customer's order history with tracking carrier, expected delivery, and full fulfillment timeline.

### `PATCH /api/redemptions/:id/fulfillment`
Updates fulfillment pipeline status. Enforces valid status transitions (`Pending` &rarr; `Approved` &rarr; `Processing` &rarr; `Shipped` &rarr; `Delivered`), records courier details, and atomically refunds points upon `Rejected`.
- **Auth:** Admin Bearer Token
- **Request Body:**
```json
{
  "status": "Shipped",
  "carrier": "BlueDart Express",
  "trackingNumber": "BD-99882233",
  "expectedDeliveryDate": "2026-12-01",
  "adminNotes": "Dispatched via air cargo priority hub"
}
```

---

## 6. Points Ledger APIs
- `GET /api/points/balance`: Current wallet counters.
- `GET /api/points/history`: Audit log of all credits and debits.
- `GET /api/points/summary`: 6-month points velocity for Recharts visualizations.

---

## 7. Fraud Monitoring & Investigation APIs
- `GET /api/admin/fraud`: Threat incidents with deterministic `riskScore` (0–100), heuristic pattern, and customer details.
- `PATCH /api/admin/fraud/:id/status`: Update incident status (`Pending Review`, `Under Review`, `Resolved`, `False Positive`, `Blacklisted`).
- `POST /api/admin/fraud/:id/notes`: Add forensic investigation note to incident log:
```json
{
  "note": "Cross-referenced MAC address with distributor retail delivery manifest"
}
```
- `POST /api/admin/fraud/block-customer`: Locks customer account (`status: 'suspended'`), revoking code scanning and session tokens:
```json
{
  "userId": "67362a...",
  "reason": "Repeated automated code guessing abuse detected"
}
```
- `POST /api/admin/fraud/unblock-customer`: Restores customer access (`status: 'active'`).
- `POST /api/admin/fraud/block-ip`: Blacklist origin IP from code scanning.

---

## 8. Campaign & Promotional Engine APIs
### `POST /api/campaigns`
Creates a marketing multiplier or bonus promotion.
- **Auth:** Admin Bearer Token
- **Request Body:**
```json
{
  "title": "Diwali Double Points Bonanza",
  "description": "2x points and 50 bonus points on all filter products",
  "campaignType": "Double Points",
  "multiplier": 2,
  "bonusPoints": 50,
  "eligibleProducts": ["67362b..."],
  "startDate": "2026-11-01T00:00:00.000Z",
  "endDate": "2026-11-20T23:59:59.000Z",
  "bannerText": "🌟 DIWALI 2X POINTS ACTIVE ON ALL FILTER BOXES!"
}
```

### `GET /api/campaigns`
Returns all campaigns for admin; returns active campaigns for customers.

### `PUT /api/campaigns/:id`
Updates campaign settings, status (`Active`, `Paused`, `Ended`), or dates.

### `DELETE /api/campaigns/:id`
Permanently removes campaign.

---

## 9. Customer Support & Dispute Management APIs
### `POST /api/support`
Creates a new support or dispute ticket.
- **Auth:** Customer Bearer Token
- **Request Body:**
```json
{
  "category": "Code Scan Issue",
  "priority": "High",
  "subject": "Foil scratched off on box code",
  "description": "Purchased heavy bearings box, serial digits partially illegible.",
  "relatedProductCode": "BOX-SCRATCH-01"
}
```

### `GET /api/support/my`
Retrieves all support tickets opened by the logged-in customer.

### `GET /api/support/:id`
Retrieves ticket details and message thread. Customers receive customer-safe messages with private internal staff notes stripped. Admins receive the complete thread including internal notes.

### `POST /api/support/:id/reply`
Appends a message or private internal note to a ticket thread.
- **Request Body (Admin Internal Note):**
```json
{
  "message": "Contacted regional distributor warehouse for dispatch confirmation",
  "isInternalNote": true
}
```
- **Request Body (Public Customer Reply):**
```json
{
  "message": "We have credited 100 points for your damaged box code.",
  "isInternalNote": false
}
```

### `GET /api/support`
Admin endpoint to triage all tickets across the platform with category, priority, and status filters.

### `PATCH /api/support/:id/status`
Updates ticket status (`Open`, `In Progress`, `Waiting for Customer`, `Resolved`, `Closed`).

---

## 10. Admin Audit Trail APIs
### `GET /api/admin/audit-logs`
Provides queryable, paginated audit logging of all sensitive administrative actions (Product mutations, Reward updates, Code batch generation, Fulfillment changes, Fraud actions, and Settings changes).
- **Auth:** Admin Bearer Token only (Customers receive `403 Forbidden`)
- **Query Parameters:** `page`, `limit`, `module`, `actionType`, `search`
- **Response `200 OK`:**
```json
{
  "success": true,
  "data": {
    "logs": [
      {
        "id": "67362c...",
        "adminName": "Chief Administrator",
        "adminEmail": "admin@loyaltybox.com",
        "actionType": "CREATE_PRODUCT",
        "module": "Products",
        "description": "Created new product \"Precision Bearings\" (SKU: SKU-BRG-100)",
        "ipAddress": "127.0.0.1",
        "createdAt": "2026-11-15T09:20:00.000Z"
      }
    ],
    "pagination": {
      "total": 42,
      "page": 1,
      "pages": 3,
      "limit": 20
    }
  }
}
```

---

## 11. Analytics & Admin Dashboard APIs
- `GET /api/admin/analytics/dashboard`: Master KPI summary.
- `GET /api/admin/analytics/customers`: Monthly customer acquisition velocity.
- `GET /api/admin/analytics/points`: Points liability issued vs spent.
- `GET /api/admin/analytics/products`: Product SKU redemption yield rates.
- `GET /api/admin/customers`: Customer CRM directory with CSV export.
