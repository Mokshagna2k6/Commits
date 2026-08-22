import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { requireAuth } from "../plugins/auth";
import { computeEstimateRange } from "../lib/estimate";
import { createRazorpayOrder, verifyRazorpaySignature } from "../lib/payments";
import { emitEvent } from "../lib/events";

interface QuoteItem {
  name: string;
  price: number;
  quantity: number;
  itemId?: string;
  itemType?: string;
}

function serializeQuote(q: any) {
  return { ...q, _id: q.id };
}

export async function quoteRoutes(app: FastifyInstance) {
  app.get("/quotes", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const userId = req.user!.sub;
    const { limit } = req.query as { limit?: string };

    const quotes = await prisma.quote.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      take: limit ? parseInt(limit) : undefined,
    });
    return { data: quotes.map(serializeQuote) };
  });

  app.get("/quotes/:id", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote || quote.userId !== req.user!.sub) {
      return reply.code(404).send({ message: "Quote not found" });
    }
    return { data: serializeQuote(quote) };
  });

  app.post("/quotes", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const userId = req.user!.sub;
    const body = req.body as { items?: QuoteItem[]; tier?: string } | undefined;

    const items: QuoteItem[] = body?.items ?? [];
    if (items.length === 0) {
      return reply.code(400).send({ message: "Cart is empty — add items before requesting a quote." });
    }
    const tier = ["STARTER", "GROWTH", "PREMIUM"].includes(body?.tier ?? "") ? body!.tier! : "GROWTH";

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const gstAmount = Math.round(subtotal * 0.18);
    const now = new Date();
    const validUntil = new Date(now.getTime() + (tier === "STARTER" ? 30 : 15) * 24 * 60 * 60 * 1000);

    const seq = (await prisma.quote.count()) + 1;
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: `SF-Q-${String(seq).padStart(4, "0")}`,
        userId,
        items,
        subtotal,
        gstAmount,
        total: subtotal + gstAmount,
        tier,
        estimateRange: computeEstimateRange(subtotal, tier) as any,
        status: "draft",
        validUntil,
      },
    });

    return { data: serializeQuote(quote) };
  });

  // PATCH /quotes/:id — save checkout wizard step data (account/engagement/payment-terms)
  app.patch("/quotes/:id", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const { checkoutDetails, tier } = req.body as { checkoutDetails?: Record<string, unknown>; tier?: string };

    const existing = await prisma.quote.findUnique({ where: { id } });
    if (!existing || existing.userId !== req.user!.sub) {
      return reply.code(404).send({ message: "Quote not found" });
    }

    const data: any = { status: "checkout" };
    if (checkoutDetails) {
      data.checkoutDetails = { ...(existing.checkoutDetails as any), ...checkoutDetails };
    }
    if (tier && ["STARTER", "GROWTH", "PREMIUM"].includes(tier)) {
      data.tier = tier;
      data.estimateRange = computeEstimateRange(existing.subtotal, tier) as any;
    }

    const quote = await prisma.quote.update({ where: { id }, data });
    return { data: serializeQuote(quote) };
  });

  app.patch("/quotes/:id/status", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: string };
    const quote = await prisma.quote.update({ where: { id }, data: { status } }).catch(() => null);
    if (!quote) return reply.code(404).send({ error: "Quote not found" });
    return { data: serializeQuote(quote) };
  });

  // POST /quotes/:id/pay — create a Razorpay order for the final checkout step.
  // The amount is computed here from the quote's own total and the payment
  // mode, never taken from the client — a client-supplied amount would let
  // anyone pay whatever they want for a project of any size.
  app.post("/quotes/:id/pay", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const { paymentMode } = req.body as { paymentMode?: string };
    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote || quote.userId !== req.user!.sub) {
      return reply.code(404).send({ message: "Quote not found" });
    }
    if (quote.status === "paid") {
      return reply.code(400).send({ message: "This quote has already been paid." });
    }

    const mode = ["MILESTONE", "UPFRONT", "FULL"].includes(paymentMode ?? "") ? paymentMode! : "FULL";
    const amount = mode === "UPFRONT" ? Math.round(quote.total * 0.95)
      : mode === "MILESTONE" ? Math.round(quote.total * 0.3)
      : quote.total;

    let order;
    try {
      order = await createRazorpayOrder(amount * 100, "INR", `quote_${quote.id}`, { quoteId: quote.id, paymentMode: mode });
    } catch (err: any) {
      const description: string | undefined = err?.error?.description ?? err?.message;
      const statusCode: number | undefined = err?.statusCode;
      req.log.error({ razorpayError: err?.error ?? err, statusCode }, "Razorpay order creation failed");
      const authFailure = statusCode === 401 || /key_id|key_secret|auth/i.test(description ?? "");
      return reply.code(authFailure ? 401 : 500).send({ message: description ?? "Failed to create Razorpay order" });
    }

    await prisma.quote.update({ where: { id }, data: { razorpayOrderId: order.id, status: "checkout" } });

    return {
      data: {
        orderId: order.id,
        amount: order.amount,
        currency: order.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        quoteId: quote.id,
        quoteNumber: quote.quoteNumber,
      },
    };
  });

  // POST /quotes/:id/verify — verify signature and mark the quote paid
  app.post("/quotes/:id/verify", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body as {
      razorpay_order_id?: string;
      razorpay_payment_id?: string;
      razorpay_signature?: string;
    };

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return reply.code(400).send({ message: "razorpay_order_id, razorpay_payment_id and razorpay_signature are all required" });
    }

    const quote = await prisma.quote.findUnique({ where: { id } });
    if (!quote || quote.userId !== req.user!.sub) {
      return reply.code(404).send({ message: "Quote not found" });
    }
    if (quote.razorpayOrderId !== razorpay_order_id) {
      return reply.code(400).send({ message: "Order does not match this quote" });
    }

    const valid = verifyRazorpaySignature(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (!valid) {
      return reply.code(400).send({ message: "Signature verification failed" });
    }

    const updated = await prisma.quote.update({ where: { id }, data: { status: "paid", paidAt: new Date() } });
    await emitEvent({ code: "QUOTE_PAID", payload: { quoteId: id, razorpayPaymentId: razorpay_payment_id }, actor: req.user!.sub });

    return { data: serializeQuote(updated) };
  });
}
