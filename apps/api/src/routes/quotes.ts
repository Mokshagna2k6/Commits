import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { requireAuth } from "../plugins/auth";

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

  app.post("/quotes", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const userId = req.user!.sub;
    const body = req.body as { items?: QuoteItem[] } | undefined;

    const items: QuoteItem[] = body?.items ?? [];
    if (items.length === 0) {
      return reply.code(400).send({ message: "Cart is empty — add items before requesting a quote." });
    }

    const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const gstAmount = Math.round(subtotal * 0.18);
    const now = new Date();
    const validUntil = new Date(now.getTime() + 15 * 24 * 60 * 60 * 1000);

    const seq = (await prisma.quote.count()) + 1;
    const quote = await prisma.quote.create({
      data: {
        quoteNumber: `SF-Q-${String(seq).padStart(4, "0")}`,
        userId,
        items,
        subtotal,
        gstAmount,
        total: subtotal + gstAmount,
        status: "draft",
        validUntil,
      },
    });

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
}
