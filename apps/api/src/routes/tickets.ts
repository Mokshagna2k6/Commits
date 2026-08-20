import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { requireAuth } from "../plugins/auth";
import { emitEvent } from "../lib/events";
import * as ids from "../lib/id";

export async function ticketRoutes(app: FastifyInstance) {
  app.post("/tickets", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const body = req.body as any;
    const ticket = await prisma.ticket.create({
      data: {
        id: ids.ticketId(),
        projectId: body.projectId,
        engagementId: body.engagementId,
        subject: body.subject,
        description: body.description,
        severity: body.severity ?? "P3",
        status: "OPEN",
        raisedBy: req.user!.sub,
      },
    });

    await emitEvent({
      code: "TICKET_RAISED",
      payload: { ticketId: ticket.id, severity: ticket.severity },
      actor: req.user!.sub,
      projectId: body.projectId,
      engagementId: body.engagementId,
    });

    return ticket;
  });

  app.get("/tickets", async (req) => {
    const { projectId, engId, status, severity, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: any = {};
    if (projectId) where.projectId = projectId;
    if (engId) where.engagementId = engId;
    if (status) where.status = status;
    if (severity) where.severity = severity;

    const [items, total] = await Promise.all([
      prisma.ticket.findMany({
        where,
        skip: (parseInt(page) - 1) * parseInt(limit),
        take: parseInt(limit),
        orderBy: { createdAt: "desc" },
      }),
      prisma.ticket.count({ where }),
    ]);
    return { items, total };
  });

  app.get("/tickets/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const ticket = await prisma.ticket.findUnique({ where: { id } });
    if (!ticket) return reply.code(404).send({ error: "Ticket not found" });
    return ticket;
  });

  app.patch("/tickets/:id/acknowledge", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const updated = await prisma.ticket.update({
      where: { id },
      data: { status: "ACKNOWLEDGED", acknowledgedAt: new Date() },
    });
    await emitEvent({
      code: "TICKET_ACKNOWLEDGED",
      payload: { ticketId: id },
      actor: req.user!.sub,
    });
    return updated;
  });

  app.patch("/tickets/:id/resolve", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const { resolution } = req.body as { resolution?: string };
    const updated = await prisma.ticket.update({
      where: { id },
      data: { status: "RESOLVED", resolution, resolvedAt: new Date() },
    });
    await emitEvent({
      code: "TICKET_RESOLVED",
      payload: { ticketId: id },
      actor: req.user!.sub,
    });
    return updated;
  });

  app.patch("/tickets/:id/verify", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const { accepted } = req.body as { accepted: boolean };

    if (accepted) {
      const updated = await prisma.ticket.update({
        where: { id },
        data: { status: "CLOSED", closedAt: new Date() },
      });
      await emitEvent({ code: "TICKET_CLOSED", payload: { ticketId: id }, actor: req.user!.sub });
      return updated;
    }

    const updated = await prisma.ticket.update({
      where: { id },
      data: { status: "REOPENED" },
    });
    await emitEvent({ code: "TICKET_REOPENED", payload: { ticketId: id }, actor: req.user!.sub });
    return updated;
  });
}
