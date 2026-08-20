import type { FastifyInstance } from "fastify";
import { requireAuth } from "../plugins/auth";

interface QuoteItem {
  name: string;
  price: number;
  quantity: number;
  itemId?: string;
  itemType?: string;
}

interface Quote {
  _id: string;
  quoteNumber: string;
  userId: string;
  items: QuoteItem[];
  subtotal: number;
  gstAmount: number;
  total: number;
  status: string;
  createdAt: string;
  validUntil: string;
}

const quotes: Quote[] = [];
let quoteSeq = 1;

export async function quoteRoutes(app: FastifyInstance) {
  app.get("/quotes", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const userId = req.user!.sub;
    const { limit } = req.query as { limit?: string };
    let userQuotes = quotes.filter((q) => q.userId === userId);
    if (limit) userQuotes = userQuotes.slice(0, parseInt(limit));
    return { data: userQuotes };
  });

  app.post("/quotes", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const userId = req.user!.sub;
    const body = req.body as { items?: QuoteItem[] } | undefined;

    const items: QuoteItem[] = body?.items ?? [];
    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const gstAmount = Math.round(subtotal * 0.18);
    const now = new Date();
    const validUntil = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const quote: Quote = {
      _id: `quote_${Date.now()}`,
      quoteNumber: `SF-Q-${String(quoteSeq++).padStart(4, "0")}`,
      userId,
      items,
      subtotal,
      gstAmount,
      total: subtotal + gstAmount,
      status: "draft",
      createdAt: now.toISOString(),
      validUntil: validUntil.toISOString(),
    };

    quotes.push(quote);
    return { data: quote };
  });

  app.patch("/quotes/:id/status", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const { status } = req.body as { status: string };
    const quote = quotes.find((q) => q._id === id);
    if (!quote) return reply.code(404).send({ error: "Quote not found" });
    quote.status = status;
    return { data: quote };
  });
}
