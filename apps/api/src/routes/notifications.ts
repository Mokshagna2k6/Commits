import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { requireAuth } from "../plugins/auth";

export async function notificationRoutes(app: FastifyInstance) {
  app.get("/notifications", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { unread, page = "1", limit = "30" } = req.query as Record<string, string>;
    const where: any = { userId: req.user!.sub };
    if (unread === "true") where.readAt = null;

    const [items, total] = await Promise.all([
      prisma.notificationContent.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.notificationContent.count({ where }),
    ]);
    return { items, total, unread: await prisma.notificationContent.count({ where: { userId: req.user!.sub, readAt: null } }) };
  });

  app.patch("/notifications/read", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { ids } = req.body as { ids: string[] };
    await prisma.notificationContent.updateMany({
      where: { id: { in: ids }, userId: req.user!.sub },
      data: { readAt: new Date() },
    });
    return { success: true };
  });

  app.get("/notifications/preferences", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      select: { notificationPrefs: true },
    });
    return user?.notificationPrefs ?? {};
  });

  app.patch("/notifications/preferences", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const prefs = req.body as any;
    await prisma.user.update({
      where: { id: req.user!.sub },
      data: { notificationPrefs: prefs },
    });
    return { success: true };
  });
}
