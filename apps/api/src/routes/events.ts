import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";

export async function eventRoutes(app: FastifyInstance) {
  app.get("/events", async (req) => {
    const { engId, projectId, code, page = "1", limit = "50" } = req.query as Record<string, string>;
    const where: any = {};
    if (engId) where.engagementId = engId;
    if (projectId) where.projectId = projectId;
    if (code) where.code = code;

    const [items, total] = await Promise.all([
      prisma.event.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.event.count({ where }),
    ]);
    return { items, total };
  });
}
