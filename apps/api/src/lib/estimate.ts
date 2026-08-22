// Instant Estimate Engine — tier pricing bands (Product Bible §4.4).
// Mirrors client/src/lib/estimate.js so the frontend's live preview and the
// authoritative value frozen on the Quote at creation always agree.
export interface EstimateRange {
  format: "flat" | "range" | "range_plus";
  tier: string;
  low: number;
  mid: number;
  high: number;
}

export function computeEstimateRange(subtotal: number, tier: string): EstimateRange {
  if (tier === "STARTER") {
    return { format: "flat", tier, low: subtotal, mid: subtotal, high: subtotal };
  }
  if (tier === "PREMIUM") {
    return {
      format: "range_plus",
      tier,
      low: Math.round(subtotal * 0.85),
      mid: subtotal,
      high: Math.round(subtotal * 1.5),
    };
  }
  return {
    format: "range",
    tier,
    low: Math.round(subtotal * 0.85),
    mid: subtotal,
    high: Math.round(subtotal * 1.15),
  };
}
