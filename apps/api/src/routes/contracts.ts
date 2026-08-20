import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { requireAuth, requireRole } from "../plugins/auth";
import { emitEvent } from "../lib/events";
import { getPresignedDownload } from "../lib/storage";

export async function contractRoutes(app: FastifyInstance) {
  // GET /contracts
  app.get("/contracts", async (req) => {
    const { orderId, engId } = req.query as { orderId?: string; engId?: string };
    const where: any = {};
    if (orderId) where.orderId = orderId;
    if (engId) where.engagementId = engId;
    return prisma.contract.findMany({ where, include: { signatures: true } });
  });

  // GET /contracts/:id
  app.get("/contracts/:id", async (req, reply) => {
    const { id } = req.params as { id: string };
    const contract = await prisma.contract.findUnique({
      where: { id },
      include: { signatures: true, order: true, engagement: true },
    });
    if (!contract) return reply.code(404).send({ error: "Contract not found" });
    return contract;
  });

  // GET /contracts/:id/pdf
  app.get("/contracts/:id/pdf", async (req, reply) => {
    const { id } = req.params as { id: string };
    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract) return reply.code(404).send({ error: "Contract not found" });
    if (!contract.fileKey) return reply.code(404).send({ error: "PDF not yet generated" });

    const url = await getPresignedDownload(contract.fileKey);
    return { url };
  });

  // POST /contracts/:id/countersign — StackFox side
  app.post("/contracts/:id/countersign", async (req, reply) => {
    if (!requireRole(req, reply, ["PM", "SENIOR_PM", "ADMIN", "CEO"])) return;
    const { id } = req.params as { id: string };

    const contract = await prisma.contract.findUnique({ where: { id } });
    if (!contract) return reply.code(404).send({ error: "Contract not found" });
    if (contract.status !== "CLIENT_SIGNED") {
      return reply.code(409).send({ error: "Contract must be client-signed first" });
    }

    // Create StackFox signature
    await prisma.signature.create({
      data: {
        contractId: id,
        signerUserId: req.user!.sub,
        side: "STACKFOX",
        rail: "CLICK",
        evidence: { method: "internal", timestamp: new Date().toISOString() },
      },
    });

    const updated = await prisma.contract.update({
      where: { id },
      data: { status: "EXECUTED", executedAt: new Date() },
    });

    await emitEvent({
      code: "CONTRACT_EXECUTED",
      payload: { contractId: id },
      actor: req.user!.sub,
      engagementId: contract.engagementId ?? undefined,
    });

    return updated;
  });
}
