// Instant Estimate Engine — tier pricing bands (Product Bible §4.4).
// Starter is a fixed flat price; Growth/Premium show a range around the
// selected-items subtotal, since scope firms up during discovery.
export const TIERS = ['STARTER', 'GROWTH', 'PREMIUM'];

export const TIER_LABELS = {
  STARTER: 'Starter',
  GROWTH: 'Growth',
  PREMIUM: 'Premium',
};

export function computeEstimateRange(subtotal, tier) {
  if (tier === 'STARTER') {
    return { format: 'flat', tier, low: subtotal, mid: subtotal, high: subtotal };
  }
  if (tier === 'PREMIUM') {
    return {
      format: 'range_plus',
      tier,
      low: Math.round(subtotal * 0.85),
      mid: subtotal,
      high: Math.round(subtotal * 1.5),
    };
  }
  // GROWTH (default) — ±15% tolerance from mid-range
  return {
    format: 'range',
    tier,
    low: Math.round(subtotal * 0.85),
    mid: subtotal,
    high: Math.round(subtotal * 1.15),
  };
}
