# LOYALTYBOX Security Architecture & Anti-Fraud Policy

This document details the security mechanisms, cryptographic safeguards, and abuse defense strategies engineered into the **LOYALTYBOX** backend.

---

## 1. Cryptographic Product Code Protection

### Zero Plaintext Storage
- **Principle:** Plaintext redeemable product packaging codes (e.g. `BOX-8F92-K7L3`) are **never stored in the database**.
- **HMAC-SHA256 Keyed Hashing:**
  $$\text{CodeHash} = \text{HMAC-SHA256}(\text{CODE\_HASH\_SECRET}, \text{NormalizedCode})$$
- Even in the event of an unauthorized database dump, an attacker cannot reverse the hashes into valid redeemable physical codes.
- **One-Time Export:** Plaintext codes are emitted **strictly once** in the response payload of `POST /api/codes/generate` to enable factory box sticker printing.

---

## 2. Race Condition & Replay Defense

### Atomic Single-Use Updates
To eliminate race conditions and double-spending of codes, the verification engine uses atomic conditional updates:

```javascript
const updatedCode = await ProductCode.findOneAndUpdate(
  { _id: foundCode._id, status: 'unused' },
  {
    status: 'redeemed',
    redeemedBy: req.user._id,
    redeemedAt: new Date()
  },
  { new: true }
);
```

If multiple concurrent HTTP requests attempt to redeem the exact same code simultaneously, only the single request that matches `{ status: 'unused' }` succeeds. All subsequent requests fail with `400 Bad Request (Already Redeemed)`.

---

## 3. Heuristic Anti-Fraud Engine

| Threat Vector | Detection Rule | Automated Defense Action |
|---|---|---|
| **Brute-Force Code Guessing** | Submitting non-existent codes | Logged as `Medium` risk event in `FraudLog`. IP tracked. |
| **High Velocity Probes** | More than 5 code submissions in 1 minute | Throttled by `express-rate-limit` returning `429 Too Many Requests`. |
| **Code Replay Attempt** | Submitting an already-redeemed code | Logged as `High` risk incident with prior redemption timestamp and targeted SKU. |
| **Malicious IP Proxy Probes** | Persistent failed codes from unknown proxy/TOR | Flagged as `Critical`. Factory owner can enforce instant 1-click IP blacklist via `POST /api/admin/fraud/block-ip`. |

---

## 4. Authentication & Authorization Security

1. **Password Hashing:** Passwords hashed with `bcryptjs` using a salt work factor of 10.
2. **Access Token Lifespan:** JWT access tokens expire in 15 minutes.
3. **Secure Refresh Token Rotation:** Refresh tokens are single-use cryptographically random tokens hashed via SHA-256 in the database. When used, the old token is invalidated and a fresh pair is minted.
4. **Role Enforcement:** All admin mutations (`/api/products`, `/api/codes/generate`, `/api/admin/*`) require `restrictTo('admin')` middleware. Public registration is locked to the `customer` role only. Initial admin provisioning is isolated to a secure CLI script (`npm run seed:admin`).
5. **Security Headers:** Express app is protected with `Helmet` (Content-Security-Policy, HSTS, X-Content-Type-Options, Frameguard) and strict CORS origins.
