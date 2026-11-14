# AI_LOG.md — AI Engineering & Prompt Log

This document records key AI interactions, decisions, tool executions, and specifically documents instances where the AI made mistakes, how they were detected, and how they were corrected.

---

## Key AI Prompts & Engineering Interactions

### Interaction 1: Repository Scope & Requirement Analysis
- **Goal:** Analyze `readme.md` (assignment requirements) and `promt` (Agent 1 Frontend Master Prompt).
- **Prompt Summary:** Inspect workspace, identify agent boundaries, determine frontend stack constraints (React, Tailwind, React Router, Lucide, Recharts, React Hot Toast), and recognize strict frontend-only ownership (no backend endpoints or database logic).
- **Outcome:** Clean directory architecture planning with isolated `frontend/` workspace to ensure seamless future backend development by Agent 2.

---

### Interaction 2: Tailwind CSS v4 Configuration Error & Correction (AI Error Case 1)
- **The AI Mistake:** The AI initially attempted to install standard `tailwindcss postcss autoprefixer` assuming legacy Tailwind v3 workflow using `tailwind.config.js`.
- **How Noticed:** When npm installed `tailwindcss` version `4.3.5`, standard PostCSS plugins threw deprecation notices, and Vite builds require the official `@tailwindcss/vite` plugin for first-class Vite integration in Tailwind v4.
- **How Fixed:** 
  1. Installed `@tailwindcss/vite`.
  2. Updated `vite.config.js` to import and mount `tailwindcss()` directly into Vite plugins.
  3. Configured `src/index.css` using modern Tailwind v4 `@import "tailwindcss";` and `@theme` definitions for Cabinet Grotesk, Satoshi, and brand colors.
  4. Verified successful build and stylesheet injection.

---

### Interaction 3: Lucide React Brand Icons Export Error (AI Error Case 2)
- **The AI Mistake:** During the creation of `Footer.jsx`, the AI imported `Twitter`, `Github`, and `Linkedin` from `lucide-react`.
- **How Noticed:** Running `npm run build` failed with `[MISSING_EXPORT] "Twitter" is not exported by "node_modules/lucide-react/dist/esm/lucide-react.mjs"`. In modern releases of Lucide, social media brand icons were deprecated and removed from core exports.
- **How Fixed:** 
  1. Inspected build output log.
  2. Replaced deprecated brand imports with standard universal Lucide icons (`Globe`, `MessageCircle`, `Share2`, `Mail`).
  3. Re-ran `npm run build` which succeeded cleanly without missing symbol references.

---

### Interaction 4: Neo-Brutalist Design System Implementation
- **Goal:** Implement the exact color palette (`#ffe17c`, `#171e19`, `#b7c6c2`, `#ffffff`, `#000000`), geometric fonts, 2px borders, hard non-blurred shadows (`4px 4px 0px 0px #000`), and tactile physical button press transitions.
- **Prompt Summary:** Formulate custom utility classes (`neo-btn`, `neo-card`, `neo-shadow`, `neo-input`, `bg-dots`) in `src/index.css` and verify tactile `:hover` and `:active` CSS transforms (`translate(2px, 2px)`).
- **Outcome:** Consistent, high-fidelity visual identity across all 19 views.

---

### Interaction 5: Code Verification Simulation (5 Distinct States)
- **Goal:** Implement the 5 customer code verification states mandated in Section 7 of the specification:
  1. `Valid code` (+100 or +150 points credited, confetti burst, transaction created)
  2. `Invalid code` (error toast explaining code syntax)
  3. `Already redeemed code` (shows previously claimed timestamp and email)
  4. `Expired code` (shows expiration date of promotional batch)
  5. `Loading state` (tactile spinner with simulated cryptographic delay)
- **Interactive Bonus:** Provided evaluator quick-test clickable chips in `RedeemCodePage.jsx` so testers can click once to populate and test each of the 5 states instantly.

---

### Interaction 6: Cross-Portal Synchronization via Mock Store
- **Goal:** Allow changes in Customer Portal (e.g. points earned, rewards claimed) to immediately reflect in Admin Dashboard (e.g. redemptions table, analytics), and allow Admin changes (e.g. generating new batch codes, adding products) to immediately be redeemable by customers.
- **Outcome:** Created `AppContext.jsx` synchronized with browser `localStorage`, complete with an instant "Reset All Demo Data" button.

---

### Interaction 7: Automated Linting & Build Verification (Frontend)
- **Goal:** Verify that zero compilation errors, missing dependencies, or unhandled exceptions exist across the codebase.
- **Outcome:** Ran `oxlint` and `vite build`. Resolved all unused imports. The final production bundle compiles cleanly in 1.35 seconds.

---

### Interaction 8: Agent 2 Backend Architecture & Boundary Definition
- **Goal:** Initialize isolated Node.js/Express backend strictly inside `backend/` without modifying any of Agent 1's frontend files.
- **Prompt Summary:** Establish 10 Mongoose schemas, REST controllers, middleware, and cryptographic security utilities adhering to Section 4 and Section 23 of `promt`.
- **Outcome:** Zero frontend files touched; clean separation of frontend SPA and backend API server.

---

### Interaction 9: ES Module Jest Execution Configuration (AI Error Case 3)
- **The AI Mistake:** Jest threw an error when attempting to run tests on ES modules (`SyntaxError: Cannot use import statement outside a module`).
- **How Noticed:** Executing `npm test` failed initially because Node.js requires VM experimental flags to run ES module imports natively in Jest without Babel.
- **How Fixed:** 
  1. Updated `backend/package.json` test script to: `cross-env NODE_ENV=test node --experimental-vm-modules node_modules/jest/bin/jest.js --runInBand --detectOpenHandles`.
  2. Set `"transform": {}` in Jest configuration.
  3. Re-ran test suite, enabling all 19 Supertest integration tests to execute natively in ES Modules.

---

### Interaction 10: Zero-Plaintext Code Cryptographic Storage
- **Goal:** Guarantee that physical product box codes are never stored in plaintext in MongoDB, preventing code theft in the event of database dumps.
- **Outcome:** Engineered HMAC-SHA256 keyed hashing where `codeHash` is stored, and plaintext codes are emitted strictly once in the response of `POST /api/codes/generate` for factory label printing.

---

### Interaction 11: Race Condition & Atomic Redemption Defense
- **Goal:** Ensure two simultaneous requests cannot redeem the exact same box code twice or result in duplicate loyalty points.
- **Outcome:** Implemented atomic `findOneAndUpdate({ _id: foundCode._id, status: 'unused' }, ...)` and atomic `$inc` wallet balance updates. Verified via automated test suite.

---

### Interaction 12: Backend Integration Testing & Documentation
- **Goal:** Execute full automated test suite and author comprehensive documentation.
- **Outcome:** 19/19 tests passing across 4 test suites. Authored `API_DOCUMENTATION.md`, `DATABASE_SCHEMA.md`, `SECURITY.md`, and `INTEGRATION_GUIDE.md` in `backend/docs/`.
