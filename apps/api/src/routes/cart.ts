import type { FastifyInstance } from "fastify";
import { requireAuth } from "../plugins/auth";

interface CartItem {
  _id: string;
  itemId: string;
  itemType: string;
  name: string;
  price: number;
  quantity: number;
  notes?: string;
}

const carts = new Map<string, CartItem[]>();

function calcTotals(items: CartItem[]) {
  const subtotal = items.reduce((s, i) => s + i.price * i.quantity, 0);
  const gstRate = 18;
  const gstAmount = Math.round(subtotal * (gstRate / 100));
  return {
    items,
    subtotal,
    gstRate,
    gstAmount,
    total: subtotal + gstAmount,
    itemCount: items.reduce((c, i) => c + i.quantity, 0),
  };
}

export async function cartRoutes(app: FastifyInstance) {
  app.get("/cart", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const userId = req.user!.sub;
    const items = carts.get(userId) ?? [];
    return { data: { cart: calcTotals(items) } };
  });

  app.post("/cart/add", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const userId = req.user!.sub;
    const { itemId, itemType, name, price, quantity = 1, notes } = req.body as any;
    const items = carts.get(userId) ?? [];

    const idx = items.findIndex((i) => i.itemId === itemId && i.itemType === itemType);
    if (idx >= 0) {
      items[idx].quantity = Math.min(99, items[idx].quantity + quantity);
    } else {
      items.push({
        _id: `cart_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        itemId,
        itemType: itemType ?? "service",
        name,
        price,
        quantity,
        notes,
      });
    }

    carts.set(userId, items);
    return { data: { cart: calcTotals(items) } };
  });

  app.post("/cart/remove", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const userId = req.user!.sub;
    const { cartItemId } = req.body as { cartItemId: string };
    const items = (carts.get(userId) ?? []).filter((i) => i._id !== cartItemId);
    carts.set(userId, items);
    return { data: { cart: calcTotals(items) } };
  });

  app.post("/cart/update-quantity", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const userId = req.user!.sub;
    const { cartItemId, quantity } = req.body as { cartItemId: string; quantity: number };
    const items = carts.get(userId) ?? [];
    const item = items.find((i) => i._id === cartItemId);
    if (item) item.quantity = Math.max(1, Math.min(99, quantity));
    carts.set(userId, items);
    return { data: { cart: calcTotals(items) } };
  });

  app.post("/cart/clear", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const userId = req.user!.sub;
    carts.set(userId, []);
    return { data: { cart: calcTotals([]) } };
  });
}
