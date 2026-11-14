# LOYALTYBOX — Customer Loyalty Rewards Platform
> **Assignment 2: Customer Loyalty Rewards System**  
> Built for a physical manufacturing factory producing boxed physical products with tamper-evident inner-box codes.

---

## ⚡ Overview

**LOYALTYBOX** is a comprehensive, production-ready Customer Loyalty Rewards Platform designed specifically for manufacturers of boxed physical goods (bearings, hydraulic seals, CNC cutting tools, motor windings, and pneumatic valves). 

The platform bridges the gap between factories and their end-user workshops by placing **cryptographic, single-use scratch codes inside every physical product box**. Mechanics and workshops scan or type the inner code to instantly claim loyalty points, unlock discount vouchers, and claim high-value factory tools.

The platform includes two dedicated portals built with a tactile **Neo-Brutalist design system**:
1. **Customer Portal:** Point balance tracking, 5-state simulated code verification, rewards marketplace, transaction history, and workshop profile management.
2. **Factory Owner Admin Portal:** KPI dashboards, customer CRM directory, product catalog management, batch code generation, reward configuration, fraud/threat monitoring, and analytics.

---

## 🛠️ Tech Stack

### Frontend (Agent 1)
- **Framework:** React 19 + Vite 8
- **Styling & Design System:** Tailwind CSS v4 + `@tailwindcss/vite`
- **Design Aesthetic:** Strict Neo-Brutalist direction (`#ffe17c`, `#171e19`, `#b7c6c2`, 2px solid borders, hard shadows, physical button push effects)
- **Typography:** Cabinet Grotesk (Headings) & Satoshi (Body) via Fontshare CDN
- **Routing:** React Router DOM v7
- **Icons:** Lucide React
- **Analytics & Data Visualizations:** Recharts (Area charts, bar charts, multi-series curves)
- **Notifications:** React Hot Toast (custom Neo-Brutalist styling)
- **Celebration Effects:** Canvas-Confetti
- **State & Persistence:** React Context synchronized with browser `localStorage`

### Backend (Agent 2)
- **Runtime & Server:** Node.js (ES Modules) + Express.js
- **Database & ODM:** MongoDB Atlas / Local MongoDB via Mongoose
- **Authentication:** JWT (Access Token 15m & Rotating Refresh Tokens 7d)
- **Cryptography:** Node.js `crypto` with HMAC-SHA256 keyed hash for tamper-evident scratch codes (zero plaintext code storage)
- **Security & Defenses:** Helmet, CORS, express-rate-limit, bcrypt password hashing
- **Testing Suite:** Jest + Supertest + MongoMemoryServer (19 integration tests passing)

---

## 🚀 Quick Setup & Run Instructions

### Prerequisites
- Node.js version `18.x` or higher (tested on Node `v22.18.0`)
- npm version `9.x` or higher

### 1. Frontend Setup (Client SPA)
```bash
cd frontend
npm install
npm run dev
# Running on http://localhost:5173
```

### 2. Backend Setup (RESTful API Server)
```bash
cd backend
npm install

# Optional: Seed initial admin user and catalog data
npm run seed:demo

# Run development server
npm run dev
# Server running on http://localhost:5000 (Health check: http://localhost:5000/api/health)

# Run automated integration tests (19/19 tests)
npm test
```

---

## 📱 Navigation & Available Routes

### 🌐 Public & Authentication Routes
| Route | Description |
|---|---|
| `/` | Neo-Brutalist SaaS Landing Page with hero, live dashboard mockup, continuous marquee, 3-step process, personas, and feature grid |
| `/login` | Authentication portal with 1-click Demo Customer & Demo Admin quick login buttons |
| `/register` | Workshop member signup with instant 100-point bonus claim |
| `/forgot-password` | Password recovery with simulated email verification |

### 👤 Customer Experience Portal
| Route | Description |
|---|---|
| `/customer/dashboard` | Main customer hub with 4 stat counters, 6-month points history chart, reward milestone progress bar, and recent activity |
| `/customer/redeem-code` | Inner-box code redemption engine simulating all 5 verification states (Valid, Invalid, Already Redeemed, Expired, Loading) with confetti |
| `/customer/points` | Points ledger with 12-month expiration policy notice and filterable transactions (All / Earned / Spent) |
| `/customer/rewards` | Rewards marketplace with category filters, points cost chips, stock badges, and interactive redemption modal |
| `/customer/history` | Full audit log of code redemptions and claimed gifts with search, filters, pagination, and CSV export |
| `/customer/profile` | Workshop contact details, inline editing with local storage persistence, and password reset form |

### 🏭 Factory Owner Admin Portal
| Route | Description |
|---|---|
| `/admin/dashboard` | Executive KPI control center (5,000 customers, 125 SKUs, 50k codes, 12.5k redemptions, 125k points), growth charts, and live feed |
| `/admin/customers` | Customer directory with search, active/inactive filters, detail modal, points balances, and CSV export |
| `/admin/products` | Factory product line manager with Add/Edit/Delete modals and points-per-box allocation |
| `/admin/codes` | Batch code generator with customizable points, batch IDs, status badges (Unused, Redeemed, Expired, Suspicious), and CSV export |
| `/admin/rewards` | Catalog reward manager with inventory control, points pricing, category assignment, and modals |
| `/admin/redemptions` | Complete audit log of every customer transaction with filterable flows and CSV export |
| `/admin/fraud-monitoring`| Threat defense dashboard monitoring brute-force scans, duplicate redemption attempts, suspicious IPs, and blacklist actions |
| `/admin/analytics` | Business intelligence charts tracking monthly liability, scan velocity, and SKU yield rates |
| `/admin/settings` | Factory plant settings, loyalty expiration rules, anti-fraud rate limits, and 1-click Demo Reset button |

---

## 🧪 Evaluator Quick-Test Codes

For instant testing on `/customer/redeem-code`, use the clickable test chips or manually type:
- **`BOX-GOLD-8899`** ➔ **Valid Code:** Credits +100 points, fires confetti, creates transaction.
- **`BOX-TOOL-7711`** ➔ **Valid Code:** Credits +150 points for CNC tool set.
- **`BOX-USED-5521`** ➔ **Already Redeemed:** Shows duplicate protection warning with prior timestamp.
- **`BOX-EXPD-9900`** ➔ **Expired Code:** Shows expiration notice for older promotional batch.
- **`ANY-RANDOM-TEXT`** ➔ **Invalid Code:** Triggers format validation warning.

---

## 📁 Repository Documentation Deliverables

- **[ASSUMPTIONS.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/ASSUMPTIONS.md):** Business assumptions, packaging choices, proof-of-purchase mechanics, and fraud defense rationale.
- **[ARCHITECTURE.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/ARCHITECTURE.md):** Complete component diagram, data entity relationships (ERD), and Neo-Brutalist design tokens.
- **[AI_LOG.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/AI_LOG.md):** Detailed record of prompts, tool interactions, and two specific AI error cases (Lucide brand icon export mismatch and Tailwind v4 Vite setup) with solutions.
- **[TEST_PLAN.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/TEST_PLAN.md):** Automated build verification results and manual scenario test walkthroughs.
- **[.env.example](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/.env.example):** Environment configuration placeholder values.

---

## ⚖️ Agent Ownership Guarantee
- **Agent 1 (Frontend Developer & UI/UX Engineer):** Completely responsible for the frontend SPA, client-side interactions, and design system.
- **No Backend Files Modified:** No database connections, server-side routes, or backend APIs were altered. Agent 2 can independently implement the backend services without friction.
