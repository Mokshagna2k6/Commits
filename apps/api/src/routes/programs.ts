import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { requireAuth } from "../plugins/auth";
import { emitEvent } from "../lib/events";
import * as ids from "../lib/id";
import { computeHealthState } from "@stackfox/core";

export async function programRoutes(app: FastifyInstance) {
  app.post("/programs", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const body = req.body as any;
    return prisma.program.create({
      data: {
        id: ids.programId(),
        name: body.name,
        orgId: body.orgId,
        ownerId: req.user!.sub,
        status: "ACTIVE",
      },
    });
  });

  app.get("/programs/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const program = await prisma.program.findUnique({
      where: { id },
      include: { stakeholders: true },
    });
    if (!program) return reply.code(404).send({ error: "Program not found" });
    return program;
  });

  app.patch("/programs/:id", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const body = req.body as any;
    return prisma.program.update({ where: { id }, data: body });
  });

  app.get("/programs/:id/engagements", async (req) => {
    const { id } = req.params as { id: string };
    return prisma.engagement.findMany({
      where: { programId: id },
      include: { projects: true },
    });
  });

  app.get("/programs/:id/gantt", async (req) => {
    const { id } = req.params as { id: string };
    const engagements = await prisma.engagement.findMany({
      where: { programId: id },
      include: { projects: { include: { milestones: { orderBy: { number: "asc" } } } } },
    });
    return engagements.flatMap((eng) =>
      eng.projects.map((p) => ({
        projectId: p.id,
        name: p.name,
        status: p.status,
        milestones: p.milestones.map((m) => ({
          number: m.number,
          name: m.name,
          status: m.status,
          dueDate: m.dueDate,
        })),
      }))
    );
  });

  app.post("/programs/:id/qbr", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const engagements = await prisma.engagement.findMany({
      where: { programId: id },
      include: { projects: true, invoices: true },
    });

    const summary = {
      programId: id,
      totalEngagements: engagements.length,
      totalProjects: engagements.reduce((s, e) => s + e.projects.length, 0),
      totalInvoiced: engagements.reduce(
        (s, e) => s + e.invoices.reduce((si, inv) => si + (inv.grandTotal ?? 0), 0),
        0
      ),
      generatedAt: new Date().toISOString(),
    };

    await emitEvent({
      code: "QBR_GENERATED",
      payload: summary,
      actor: req.user!.sub,
    });

    return summary;
  });

  app.get("/programs/:id/health", async (req) => {
    const { id } = req.params as { id: string };
    const engagements = await prisma.engagement.findMany({
      where: { programId: id },
      include: { projects: true, invoices: true },
    });

    const activeProjects = engagements.flatMap((e) => e.projects).filter((p) => p.status === "ACTIVE");
    const totalInvoiced = engagements.reduce(
      (s, e) => s + e.invoices.reduce((si, inv) => si + (inv.grandTotal ?? 0), 0),
      0
    );

    const health = computeHealthState({
      lastActivityDaysAgo: 0,
      openTickets: 0,
      revenue90d: totalInvoiced,
      csatAvg: 4.0,
    });

    return {
      programId: id,
      health,
      activeProjects: activeProjects.length,
      totalRevenue: totalInvoiced,
    };
  });
}
