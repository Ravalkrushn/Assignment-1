export const initialFraudAlerts = [
  {
    id: "FRAUD-401",
    customerName: "Unknown Guest / IP 185.220.101.5",
    email: "bot_attempt_99@tempmail.xyz",
    type: "Brute Force Code Guessing",
    riskLevel: "Critical",
    attemptsCount: 42,
    timestamp: "2026-11-14 18:42",
    status: "Blocked by Firewall",
    location: "TOR Exit Node (Netherlands)",
    pattern: "Sequential alphanumeric probe of batch BATCH-2026-Q4 with rapid 0.3s intervals.",
    targetedProduct: "Industrial Heavy Duty Bearing Box",
    actionTaken: "IP address and fingerprint throttled; automated captcha trigger engaged."
  },
  {
    id: "FRAUD-398",
    customerName: "Rohit K. (Suspended)",
    email: "rohit.k998@gmail.com",
    type: "Duplicate Redemption Attempt",
    riskLevel: "High",
    attemptsCount: 6,
    timestamp: "2026-11-14 14:15",
    status: "Under Review",
    location: "Surat, Gujarat",
    pattern: "Tried to redeem already scanned batch code BOX-USED-5521 from 3 separate mobile browser user agents.",
    targetedProduct: "Copper Armature Motor Winding Spool",
    actionTaken: "Account redemption capabilities locked for 48 hours."
  },
  {
    id: "FRAUD-387",
    customerName: "Manoj Workshop Support",
    email: "manoj.workshop@indiamart.org",
    type: "High Velocity Scanning",
    riskLevel: "Medium",
    attemptsCount: 14,
    timestamp: "2026-11-13 21:05",
    status: "Verified Legitimate (Wholesaler)",
    location: "Ghaziabad, Uttar Pradesh",
    pattern: "14 codes submitted within 8 minutes. Customer provided retail invoice copy.",
    targetedProduct: "Precision Hydraulic Valve Seal Pack",
    actionTaken: "Flag cleared after manual dealer invoice cross-verification."
  },
  {
    id: "FRAUD-364",
    customerName: "Anonymous Android Client",
    email: "guest_redemptions@proxy.lan",
    type: "Expired Code Entry Loop",
    riskLevel: "Low",
    attemptsCount: 3,
    timestamp: "2026-11-12 11:30",
    status: "Warning Issued",
    location: "Bengaluru, Karnataka",
    pattern: "Repeated attempts entering promotional codes from previous 2025 seasonal batch.",
    targetedProduct: "Pneumatic Quick-Connect Coupler Kit",
    actionTaken: "System displayed notification informing batch expiration."
  }
];
