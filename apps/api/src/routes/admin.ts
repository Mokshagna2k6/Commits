import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { requireRole } from "../plugins/auth";

export async function adminRoutes(app: FastifyInstance) {
  app.addHook("preHandler", async (req, reply) => {
    if (!requireRole(req, reply, ["ADMIN", "SE", "SENIOR_PM"])) return;
  });

  // Service CRUD
  app.get("/admin/services", async (req) => {
    const { page = "1", limit = "50" } = req.query as Record<string, string>;
    const [items, total] = await Promise.all([
      prisma.serviceUnit.findMany({
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { id: "asc" },
      }),
      prisma.serviceUnit.count(),
    ]);
    return { items, total };
  });

  app.post("/admin/services", async (req) => {
    const body = req.body as any;
    return prisma.serviceUnit.create({ data: body });
  });

  app.patch("/admin/services/:id", async (req) => {
    const { id } = req.params as { id: string };
    const body = req.body as any;
    return prisma.serviceUnit.update({ where: { id }, data: body });
  });

  app.delete("/admin/services/:id", async (req) => {
    const { id } = req.params as { id: string };
    await prisma.serviceUnit.delete({ where: { id } });
    return { success: true };
  });

  // Feature CRUD
  app.get("/admin/features", async (req) => {
    const { serviceId } = req.query as { serviceId?: string };
    return prisma.featureUnit.findMany({
      where: serviceId ? { serviceId } : {},
      orderBy: { sortOrder: "asc" },
    });
  });

  app.post("/admin/features", async (req) => {
    return prisma.featureUnit.create({ data: req.body as any });
  });

  app.patch("/admin/features/:id", async (req) => {
    const { id } = req.params as { id: string };
    return prisma.featureUnit.update({ where: { id }, data: req.body as any });
  });

  app.delete("/admin/features/:id", async (req) => {
    const { id } = req.params as { id: string };
    await prisma.featureUnit.delete({ where: { id } });
    return { success: true };
  });

  // Dependency CRUD
  app.get("/admin/dependencies", async () => {
    return prisma.dependency.findMany();
  });

  app.post("/admin/dependencies", async (req) => {
    return prisma.dependency.create({ data: req.body as any });
  });

  app.delete("/admin/dependencies/:id", async (req) => {
    const { id } = req.params as { id: string };
    await prisma.dependency.delete({ where: { id } });
    return { success: true };
  });

  // Bundle CRUD
  app.get("/admin/bundles", async () => {
    return prisma.bundle.findMany();
  });

  app.post("/admin/bundles", async (req) => {
    return prisma.bundle.create({ data: req.body as any });
  });

  app.patch("/admin/bundles/:id", async (req) => {
    const { id } = req.params as { id: string };
    return prisma.bundle.update({ where: { id }, data: req.body as any });
  });

  app.delete("/admin/bundles/:id", async (req) => {
    const { id } = req.params as { id: string };
    await prisma.bundle.delete({ where: { id } });
    return { success: true };
  });

  // Rate Card CRUD
  app.get("/admin/rate-cards", async () => {
    return prisma.rateCard.findMany({ orderBy: { effectiveFrom: "desc" } });
  });

  app.post("/admin/rate-cards", async (req) => {
    return prisma.rateCard.create({ data: req.body as any });
  });

  app.patch("/admin/rate-cards/:id", async (req) => {
    const { id } = req.params as { id: string };
    return prisma.rateCard.update({ where: { id }, data: req.body as any });
  });

  // Flags CRUD
  app.get("/admin/flags", async () => {
    return prisma.flag.findMany();
  });

  app.post("/admin/flags", async (req) => {
    return prisma.flag.create({ data: req.body as any });
  });

  app.patch("/admin/flags/:id", async (req) => {
    const { id } = req.params as { id: string };
    return prisma.flag.update({ where: { id }, data: req.body as any });
  });

  // Notification Templates — NotificationContent rows are all templates
  // (one per event_code.channel key), there's no separate "isTemplate" flag.
  app.get("/admin/notification-templates", async () => {
    return prisma.notificationContent.findMany({ orderBy: { key: "asc" } });
  });

  app.post("/admin/notification-templates", async (req) => {
    return prisma.notificationContent.create({ data: req.body as any });
  });

  app.patch("/admin/notification-templates/:key", async (req) => {
    const { key } = req.params as { key: string };
    return prisma.notificationContent.update({ where: { key }, data: req.body as any });
  });

  // User management
  app.get("/admin/users", async (req) => {
    const { page = "1", limit = "50", role } = req.query as Record<string, string>;
    const where: any = {};
    if (role) where.role = role;
    const [items, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        select: { id: true, email: true, name: true, role: true, orgId: true, createdAt: true },
      }),
      prisma.user.count({ where }),
    ]);
    return { items, total };
  });

  app.patch("/admin/users/:id", async (req) => {
    const { id } = req.params as { id: string };
    const body = req.body as any;
    return prisma.user.update({
      where: { id },
      data: body,
      select: { id: true, email: true, name: true, role: true },
    });
  });

  // Screening queue — HOLD means "needs manual review"; PASS/FAIL are resolved.
  app.get("/admin/screening", async () => {
    return prisma.screeningResult.findMany({
      where: { result: "HOLD" },
      orderBy: { createdAt: "asc" },
    });
  });

  app.patch("/admin/screening/:id", async (req) => {
    const { id } = req.params as { id: string };
    const { result, reviewNote } = req.body as { result: string; reviewNote?: string };
    return prisma.screeningResult.update({
      where: { id },
      data: { result, reviewNote, reviewedBy: req.user!.sub, reviewedAt: new Date() },
    });
  });

  // SE queue
  app.get("/admin/se-queue", async () => {
    return prisma.workspace.findMany({
      where: { seStatus: "SE_QUEUE" },
      orderBy: { createdAt: "asc" },
    });
  });

  // Compliance calendar — statutory filings per org (GST/TDS/GSTR-1/SOFTEX/...)
  app.get("/admin/compliance", async (req) => {
    const { status } = req.query as { status?: string };
    return prisma.complianceItem.findMany({
      where: status ? { status } : {},
      include: { org: { select: { id: true, name: true } } },
      orderBy: { dueDate: "asc" },
    });
  });

  app.post("/admin/compliance", async (req) => {
    return prisma.complianceItem.create({ data: req.body as any });
  });

  app.patch("/admin/compliance/:id", async (req) => {
    const { id } = req.params as { id: string };
    return prisma.complianceItem.update({ where: { id }, data: req.body as any });
  });
}
