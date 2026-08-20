import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { requireAuth } from "../plugins/auth";
import { emitEvent } from "../lib/events";

export async function timesheetRoutes(app: FastifyInstance) {
  app.get("/timesheets", async (req) => {
    const { engId } = req.query as { engId?: string };
    return prisma.timesheet.findMany({
      where: engId ? { engagementId: engId } : {},
      include: { lines: true },
      orderBy: { weekStart: "desc" },
    });
  });

  app.get("/timesheets/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const ts = await prisma.timesheet.findUnique({
      where: { id },
      include: { lines: true },
    });
    if (!ts) return reply.code(404).send({ error: "Timesheet not found" });
    return ts;
  });

  app.post("/timesheets/:id/approve-all", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };

    await prisma.timesheetLine.updateMany({
      where: { timesheetId: id, status: "PENDING" },
      data: { status: "APPROVED", locked: true },
    });

    const updated = await prisma.timesheet.update({
      where: { id },
      data: { status: "APPROVED", resolvedAt: new Date() },
    });

    const ts = await prisma.timesheet.findUnique({ where: { id } });
    await emitEvent({
      code: "TSHEET_APPROVED",
      payload: { timesheetId: id },
      actor: req.user!.sub,
      engagementId: ts?.engagementId,
    });

    return updated;
  });

  app.post("/timesheets/:id/query-line", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const { lineId, note } = req.body as { lineId: string; note: string };

    await prisma.timesheetLine.update({
      where: { id: lineId },
      data: { status: "QUERIED", queryNote: note },
    });

    await prisma.timesheet.update({
      where: { id },
      data: { status: "PARTIAL" },
    });

    return { success: true };
  });

  app.post("/timesheets/:id/resolve-line", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { lineId } = req.body as { lineId: string };

    await prisma.timesheetLine.update({
      where: { id: lineId },
      data: { status: "APPROVED", locked: true, queryNote: null },
    });

    return { success: true };
  });
}
