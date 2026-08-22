import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { requireAuth } from "../plugins/auth";
import { getPresignedDownload, getPresignedUpload } from "../lib/storage";

export async function fileRoutes(app: FastifyInstance) {
  app.post("/files/upload", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const body = req.body as any;

    const r2Key = `files/${body.projectId ?? "general"}/${Date.now()}-${body.filename}`;
    const presigned = await getPresignedUpload(r2Key, body.contentType ?? "application/octet-stream");

    const file = await prisma.file.create({
      data: {
        name: body.filename,
        r2Key,
        sizeBytes: body.size ?? 0,
        mimeType: body.contentType ?? "application/octet-stream",
        uploadedBy: req.user!.sub,
        projectId: body.projectId,
      },
    });

    return { data: file, uploadUrl: presigned };
  });

  app.get("/files", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { projectId } = req.query as { projectId?: string };
    const where: any = {};
    if (projectId) where.projectId = projectId;
    const files = await prisma.file.findMany({ where, orderBy: { createdAt: "desc" } });
    return { data: files };
  });

  app.get("/files/:id/download", async (req, reply) => {
    const { id } = req.params as { id: string };
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return reply.code(404).send({ error: "File not found" });
    const url = await getPresignedDownload(file.r2Key);
    return { url };
  });

  app.delete("/files/:id", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return reply.code(404).send({ error: "File not found" });
    if (file.uploadedBy !== req.user!.sub) {
      return reply.code(403).send({ error: "You can only delete files you uploaded" });
    }
    await prisma.file.delete({ where: { id } });
    return { success: true };
  });

  app.post("/files/:id/comment", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const { comment } = req.body as { comment: string };

    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return reply.code(404).send({ error: "File not found" });

    const comments = Array.isArray(file.comments) ? file.comments : [];
    comments.push({ author: req.user!.sub, text: comment, at: new Date().toISOString() });

    return prisma.file.update({ where: { id }, data: { comments } });
  });

  // Credential vault
  app.post("/vault", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const body = req.body as any;

    return prisma.credentialVault.create({
      data: {
        projectId: body.projectId,
        systemName: body.systemName ?? body.label,
        encryptedBlob: Buffer.from(JSON.stringify(body.credentials ?? {})),
      },
    });
  });

  app.get("/vault", async (req) => {
    const { projectId } = req.query as { projectId: string };
    return prisma.credentialVault.findMany({
      where: { projectId },
      select: { id: true, systemName: true, accessedAt: true },
    });
  });

  app.delete("/vault/:id", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    await prisma.credentialVault.delete({ where: { id } });
    return { success: true };
  });
}
