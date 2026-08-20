import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { requireAuth } from "../plugins/auth";
import { uploadFile, getPresignedDownload, getPresignedUpload, deleteFile } from "../lib/storage";
import { sha256 } from "../lib/hash";

export async function fileRoutes(app: FastifyInstance) {
  app.post("/files/upload", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const body = req.body as any;

    const key = `files/${body.engagementId ?? "general"}/${Date.now()}-${body.filename}`;
    const presigned = await getPresignedUpload(key, body.contentType ?? "application/octet-stream");

    const file = await prisma.file.create({
      data: {
        name: body.filename,
        key,
        bucket: "stackfox-files",
        size: body.size ?? 0,
        mime: body.contentType ?? "application/octet-stream",
        uploadedBy: req.user!.sub,
        engagementId: body.engagementId,
        projectId: body.projectId,
      },
    });

    return { file, uploadUrl: presigned };
  });

  app.get("/files", async (req) => {
    const { engId, projectId } = req.query as { engId?: string; projectId?: string };
    const where: any = {};
    if (engId) where.engagementId = engId;
    if (projectId) where.projectId = projectId;
    return prisma.file.findMany({ where, orderBy: { createdAt: "desc" } });
  });

  app.get("/files/:id/download", async (req, reply) => {
    const { id } = req.params as { id: string };
    const file = await prisma.file.findUnique({ where: { id } });
    if (!file) return reply.code(404).send({ error: "File not found" });
    const url = await getPresignedDownload(file.key);
    return { url };
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
    const encrypted = sha256(JSON.stringify(body.credentials));

    return prisma.credentialVault.create({
      data: {
        engagementId: body.engagementId,
        label: body.label,
        encryptedBlob: encrypted,
        addedBy: req.user!.sub,
      },
    });
  });

  app.get("/vault", async (req) => {
    const { engId } = req.query as { engId: string };
    return prisma.credentialVault.findMany({
      where: { engagementId: engId },
      select: { id: true, label: true, createdAt: true, addedBy: true },
    });
  });

  app.delete("/vault/:id", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    await prisma.credentialVault.delete({ where: { id } });
    return { success: true };
  });
}
