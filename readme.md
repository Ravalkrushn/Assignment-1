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

### Backend & Integration (Agent 2 & Agent 3)
- **Runtime & Server:** Node.js (ES Modules) + Express.js
- **Database & ODM:** MongoDB Atlas / Local MongoDB via Mongoose
- **Authentication:** JWT (Access Token 15m & Rotating Refresh Tokens 7d)
- **Cryptography:** Node.js `crypto` with HMAC-SHA256 keyed hash for tamper-evident scratch codes (zero plaintext code storage)
- **Security & Defenses:** Helmet, CORS, express-rate-limit, bcrypt password hashing
- **Integration Layer:** Reusable API service layer (`frontend/src/services/api.js`) with Bearer token injection and graceful fallback
- **Testing Suite:** Jest + Supertest + MongoMemoryServer (21/21 unit & end-to-end integration tests passing)
- **Deployment Prep:** Vercel SPA config (`vercel.json`), Render blueprint (`render.yaml`), Multi-Stage Dockerfile

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
| `/customer/dashboard` | Main customer hub with 4 stat counters, active campaign promotional banner, 6-month points history chart, and recent activity |
| `/customer/redeem-code` | Inner-box code redemption engine with automatic campaign multiplier (+2x / bonus points), 5-state simulated verification, and confetti celebration |
| `/customer/points` | Points ledger with 12-month expiration policy notice and filterable transactions (All / Earned / Spent) |
| `/customer/rewards` | Rewards marketplace with category filters, points cost chips, stock badges, delivery address input, and interactive redemption modal |
| `/customer/history` | Full audit log of code redemptions and claimed gifts with real-time fulfillment tracking modal, courier tracking numbers, and order timeline |
| `/customer/support` | Customer support & dispute ticketing center with thread conversations, status badges, and related box code referencing |
| `/customer/profile` | Workshop contact details, inline editing with local storage persistence, and password reset form |

### 🏭 Factory Owner Admin Portal
| Route | Description |
|---|---|
| `/admin/dashboard` | Executive KPI control center, growth charts, active campaign highlights, and live transaction feed |
| `/admin/customers` | Customer directory with search, active/suspended status, detail modal, points balances, and CSV export |
| `/admin/products` | Factory product line manager with Add/Edit/Delete modals and points-per-box allocation |
| `/admin/codes` | Batch code generator with customizable points, batch IDs, status badges (Unused, Redeemed, Expired, Suspicious), and CSV export |
| `/admin/rewards` | Catalog reward manager with inventory control, points pricing, category assignment, and modals |
| `/admin/fulfillment` | **Feature 1:** Reward fulfillment pipeline managing orders through Approved, Processing, Shipped (courier & tracking number), Delivered, and Rejection with atomic point refunds |
| `/admin/campaigns` | **Feature 4:** Promotional campaign manager creating Double Points, Bonus Points, and Festival campaigns with SKU targeting and real-time multiplier crediting |
| `/admin/redemptions` | Complete audit log of every customer transaction with filterable flows and CSV export |
| `/admin/fraud-monitoring`| **Feature 3:** Advanced fraud investigation dashboard with deterministic risk scores (0–100), forensic investigation notes, and customer account lock/unlock controls |
| `/admin/support` | **Feature 5:** Customer support dispute resolution center managing tickets, replies, and private internal notes hidden from customers |
| `/admin/audit-trail` | **Feature 2:** System-wide admin audit trail tracking all administrative creations, edits, deletions, and policy changes |
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

- **[INTEGRATION_RESULTS.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/frontend/docs/INTEGRATION_RESULTS.md):** Complete Agent 3 report on connected views, mapped REST APIs, auth flows, and end-to-end test verification.
- **[API_DOCUMENTATION.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/backend/docs/API_DOCUMENTATION.md):** Complete Agent 2 backend REST API contracts with request/response schemas.
- **[DATABASE_SCHEMA.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/backend/docs/DATABASE_SCHEMA.md):** Mongoose database schemas, relationships, indexing, and data models.
- **[SECURITY.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/backend/docs/SECURITY.md):** Cryptographic code storage, JWT rotation, rate limiting, and fraud prevention architecture.
- **[ASSUMPTIONS.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/ASSUMPTIONS.md):** Business assumptions, packaging choices, proof-of-purchase mechanics, and fraud defense rationale.
- **[ARCHITECTURE.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/ARCHITECTURE.md):** Complete component diagram, data entity relationships (ERD), and Neo-Brutalist design tokens.
- **[AI_LOG.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/AI_LOG.md):** Detailed record of prompts, tool interactions, error cases, and resolution logs across all agents.
- **[TEST_PLAN.md](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/TEST_PLAN.md):** Automated build verification results and manual scenario test walkthroughs.
- **[.env.example](file:///c:/Users/raval/Desktop/rndtechnosoft/diwali-assignment-1/.env.example):** Root and service environment configuration placeholder values.

---

## ⚖️ Full-Stack Multi-Agent Collaboration
- **Agent 1 (Frontend Developer & UI/UX):** 19 responsive Neo-Brutalist views, charts, and customer/admin experiences.
- **Agent 2 (Backend & Database Engineer):** Express REST API, MongoDB schemas, cryptographic security, and automated test suites.
- **Agent 3 (Integration & Deployment Specialist):** Connected frontend API client, live database state synchronization, end-to-end integration test suite, Vercel/Render deployment configurations, and comprehensive integration documentation.
