/**
 * Rule-Based Fraud Risk Scorer
 * Deterministic, transparent evaluation of code scanning anomalies.
 */
export const calculateRiskScore = ({
  eventType,
  previousAttempts = 0,
  isBlacklistedIp = false,
  isBlockedUser = false,
  isRateLimited = false
}) => {
  let score = 20; // baseline

  // 1. Event Type Severity
  switch (eventType) {
    case 'Brute Force Code Guessing':
      score = 45;
      break;
    case 'Duplicate Redemption Attempt':
      score = 55;
      break;
    case 'High Velocity Scanning':
      score = 65;
      break;
    case 'Expired Code Entry Loop':
      score = 30;
      break;
    case 'Blocked Code Usage Attempt':
      score = 80;
      break;
    default:
      score = 35;
  }

  // 2. Frequency / Repeat Multiplier (+10 per prior incident up to +30)
  const repeatPoints = Math.min(30, previousAttempts * 10);
  score += repeatPoints;

  // 3. Rate-limit or prior blacklist triggers
  if (isRateLimited) score += 15;
  if (isBlacklistedIp || isBlockedUser) score += 25;

  // Clamp 0 - 100
  score = Math.max(0, Math.min(100, score));

  // Determine Level
  let riskLevel = 'Low';
  if (score >= 80) riskLevel = 'Critical';
  else if (score >= 60) riskLevel = 'High';
  else if (score >= 30) riskLevel = 'Medium';

  return { score, riskLevel };
};
