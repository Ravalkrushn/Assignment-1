# ASSUMPTIONS.md — Customer Loyalty Rewards System

This document details all business and engineering assumptions made during the design and development of the **LOYALTYBOX** Customer Loyalty Rewards Platform.

---

## 1. Product Nature & Physical Packaging
- **Assumption:** The factory produces boxed physical industrial equipment and spare parts (such as bearings, hydraulic seals, CNC drill bits, armature wire, and pneumatics) sold through wholesalers, distributors, and retail hardware stores.
- **Why chosen:** Industrial and mechanical spare parts have high aftermarket counterfeit risk and indirect distribution channels where manufacturers rarely have direct relationships with workshops and mechanics.
- **Physical Code Placement:** Every physical product box contains a single-use alphanumeric code printed on a scratch-off security label located on the inside flap of the box lid. Customers cannot scan the code without opening the box, ensuring code security prior to retail sale.

---

## 2. Customer Proof of Purchase & Authenticity
- **Assumption:** Revealing and entering the inner box code constitutes cryptographic proof of purchase.
- **Why chosen:** Traditional invoice scanning requires manual OCR or manual receipt audits that mechanics find tedious. Entering an inner-box tamper-evident code provides zero-friction instant verification.
- **Wholesale Exception:** High-volume wholesale buyers redeeming more than 10 codes in under 10 minutes can be flagged for optional invoice proof verification in the Fraud Monitoring Center.

---

## 3. Fraud Prevention & Code Replay Defense
- **Assumption:** Codes are single-use, 12-character alphanumeric tokens (e.g. `BOX-GOLD-8899`) that permanently transition to `Redeemed` state on first validation.
- **Mitigations Implemented:**
  1. **Single-Use Enforcement:** Once redeemed, any subsequent attempt triggers an `ALREADY_REDEEMED` notification showing the previous redemption timestamp.
  2. **Expiration Enforcement:** Codes carry an expiration timestamp (default: 12 months from batch production). Expired attempts display an `EXPIRED` message.
  3. **Brute-Force Rate Limiting:** Consecutive invalid submissions trigger an IP cooldown and log an alert in the Admin Fraud Monitoring Center.
  4. **Suspicious Batch Detection:** Cloned or flagged codes display a `SUSPICIOUS` alert advising the buyer to contact factory security.

---

## 4. Points & Reward Economics
- **Assumption:** 1 point equals roughly ₹1 in customer redemption value.
- **Points Awarded:** Scaled based on product value (e.g. 50 pts for ₹920 Hydraulic Seal pack, 100 pts for ₹1,850 Bearing Box, 200 pts for ₹4,950 Motor Armature).
- **Points Expiry:** Earned loyalty points remain valid for 12 months.
- **Rewards Catalog:** Offers instant digital discount coupons (₹50, ₹100), free factory replacement spares (150 pts), workshop tool bags (300 pts), and factory VIP gift crates (500 pts).

---

## 5. Architectural Separation (Agent 1 vs Agent 2 & Agent 3)
- **Assumption:** Agent 1 owns the complete frontend user experience, UI components, Neo-Brutalist design tokens, route navigation, and realistic simulated client-side state with `localStorage` persistence.
- **Why chosen:** Ensures strict modular separation so Agent 2 can independently implement backend microservices, databases (MongoDB), and HSM cryptographic signing without merge conflicts or code overwrites. Agent 3 serves as the integration and testing specialist unifying client-server contracts.

---

## 6. Reward Fulfillment Lifecycle & Point Refund Guarantees
- **Assumption:** Reward redemptions for physical items undergo a formal factory fulfillment pipeline (`Pending` &rarr; `Approved` &rarr; `Processing` &rarr; `Shipped` &rarr; `Delivered`), while orders that cannot be fulfilled must be rejected with an explicit mandatory reason.
- **Atomic Refund Guarantee:** Upon rejection by an administrator, points are atomically credited back to the customer's wallet ledger and the reward item's physical inventory stock is restored in the database.
- **Customer Tracking Transparency:** Customers can track their order's courier provider, tracking number, expected delivery date, and chronological progress timeline in real-time.

---

## 7. Administrative Audit Logging & Compliance
- **Assumption:** Every mutating administrative action (creating/updating/deleting products, creating rewards, generating codes, modifying fulfillment, changing system settings, blocking customers) must be permanently logged in an immutable `AuditLog` collection.
- **Data Protection:** Passwords, tokens, and cryptographic secrets are sanitized and redacted from audit metadata prior to database persistence.
- **Role-Based Access Control:** Only users with `admin` role are permitted to query audit trail records.

---

## 8. Heuristic Threat Scoring & Account Safety
- **Assumption:** Threat severity should not be a subjective guess; it is calculated deterministically on a transparent 0–100 scale based on event type, past anomaly count within 24 hours, and suspicious velocity.
- **Account Blocking:** When an administrator blocks a customer account due to verified fraud, the customer's status is set to `suspended`. The customer's active sessions cannot scan new codes, and subsequent redemption attempts are rejected with an explicit suspension notification.

---

## 9. Marketing Campaigns & Dynamic Point Calculations
- **Assumption:** Marketing campaigns can boost customer scan rates via multipliers (e.g. 2x Double Points) and flat bonus points (e.g. +50 bonus points) during specific date windows.
- **Backend as Source of Truth:** Campaign eligibility and point calculations are executed strictly on the backend during `redeemCode`. Frontend displays active campaign banners for awareness but never calculates or controls points.

---

## 10. Customer Support Ticketing & Internal Notes Privacy
- **Assumption:** Customer inquiries and disputes (illegible scratch codes, delayed reward delivery, points disputes) require collaborative communication between mechanics and factory support staff.
- **Staff Privacy Isolation:** Administrative operators can record private internal investigation notes within the ticket thread. The backend API strictly strips all internal notes when serving tickets to customer accounts, ensuring internal staff deliberation remains completely confidential.

---

## 11. Security Remediation & Concurrency Assumptions (Phase 2)
- **Zero-Trust Client Access Control:** The frontend client SPA cannot be trusted to self-police access. While `<ProtectedRoute>` guards client navigation to avoid UI flash, all mutating operations and sensitive analytics must still be defended by JWT bearer token decoding and role checking (`protect`, `restrictTo('admin')`) on the backend.
- **Single-Document Concurrency Over Distributed Locks:** Standalone MongoDB deployments and test environments do not inherently support multi-document replica set transactions without complex orchestration. By leveraging single-document atomic conditions (`findOneAndUpdate({ _id, availablePoints: { $gte: points } })`), the system guarantees 100% thread safety against double-redemption race conditions across all environments.
- **Dual Authentication Token Portability:** While modern production browsers benefit from `httpOnly`, `Secure`, `SameSite=Strict` cookies to mitigate XSS risks, maintaining JSON payload token return ensures backward compatibility for API integration tests, mobile apps, and external test harnesses.
- **Graceful Password Recovery Fallback:** In environments where external SMTP credentials (`SMTP_HOST`, `SMTP_USER`) are not configured, password reset tokens are logged to secure development audit streams rather than failing the HTTP request, allowing full end-to-end evaluation without requiring real mail server setup.
