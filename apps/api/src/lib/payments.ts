import Razorpay from "razorpay";

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID ?? "",
  key_secret: process.env.RAZORPAY_KEY_SECRET ?? "",
});

export async function createRazorpayOrder(
  amountPaise: number,
  currency = "INR",
  receipt?: string,
  notes?: Record<string, string>,
) {
  return razorpay.orders.create({
    amount: amountPaise,
    currency,
    receipt: receipt ?? `rcpt_${Date.now()}`,
    notes: notes ?? {},
  });
}

export function verifyRazorpaySignature(
  orderId: string,
  paymentId: string,
  signature: string,
): boolean {
  const { createHmac } = require("crypto");
  const body = `${orderId}|${paymentId}`;
  const expected = createHmac("sha256", process.env.RAZORPAY_KEY_SECRET ?? "")
    .update(body)
    .digest("hex");
  return expected === signature;
}

// Stripe integration
let stripe: any = null;

export function getStripe() {
  if (!stripe && process.env.STRIPE_SECRET_KEY) {
    const Stripe = require("stripe");
    stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
  }
  return stripe;
}

export async function createStripePaymentIntent(
  amountPaise: number,
  currency = "inr",
  metadata?: Record<string, string>,
) {
  const s = getStripe();
  if (!s) throw new Error("Stripe not configured");
  return s.paymentIntents.create({
    amount: amountPaise,
    currency,
    metadata: metadata ?? {},
  });
}
