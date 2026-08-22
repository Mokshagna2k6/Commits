import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { requireAuth } from "../plugins/auth";
import { emitEvent } from "../lib/events";

async function participantsFor(ids: string[]) {
  const users = await prisma.user.findMany({
    where: { id: { in: ids } },
    select: { id: true, name: true, role: true },
  });
  return users.map((u) => ({ ...u, _id: u.id }));
}

export async function messageRoutes(app: FastifyInstance) {
  // List conversations the current user is part of, with a lastMessage preview
  app.get("/messages/conversations", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const convos = await prisma.conversation.findMany({
      where: { participantIds: { has: req.user!.sub } },
      include: { messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      orderBy: { createdAt: "desc" },
    });

    const conversations = await Promise.all(
      convos.map(async (c) => ({
        ...c,
        _id: c.id,
        participants: await participantsFor(c.participantIds),
        lastMessage: c.messages[0] ? { text: c.messages[0].text } : null,
      })),
    );

    return { data: { conversations } };
  });

  // Start (or reuse) a direct conversation with another user
  app.post("/messages/start", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { userId, title } = req.body as { userId?: string; title?: string };
    if (!userId) return reply.code(400).send({ message: "userId is required" });

    const existing = await prisma.conversation.findFirst({
      where: { participantIds: { hasEvery: [req.user!.sub, userId] } },
    });
    if (existing) return { data: { _id: existing.id, ...existing } };

    const convo = await prisma.conversation.create({
      data: { title, participantIds: [req.user!.sub, userId] },
    });
    return { data: { _id: convo.id, ...convo } };
  });

  // Messages within a conversation (only if the requester is a participant)
  app.get("/messages/:id", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const convo = await prisma.conversation.findUnique({ where: { id } });
    if (!convo || !convo.participantIds.includes(req.user!.sub)) {
      return reply.code(404).send({ message: "Conversation not found" });
    }

    const messages = await prisma.message.findMany({
      where: { conversationId: id },
      orderBy: { createdAt: "asc" },
    });
    const senderMap = new Map((await participantsFor(convo.participantIds)).map((p) => [p.id, p]));

    return {
      data: messages.map((m) => ({
        ...m,
        _id: m.id,
        sender: senderMap.get(m.senderId) ?? { _id: m.senderId, name: "Unknown" },
      })),
    };
  });

  app.post("/messages/send", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { conversationId, text } = req.body as { conversationId?: string; text?: string };
    if (!conversationId || !text?.trim()) {
      return reply.code(400).send({ message: "conversationId and text are required" });
    }

    const convo = await prisma.conversation.findUnique({ where: { id: conversationId } });
    if (!convo || !convo.participantIds.includes(req.user!.sub)) {
      return reply.code(404).send({ message: "Conversation not found" });
    }

    const message = await prisma.message.create({
      data: { conversationId, senderId: req.user!.sub, text: text.trim() },
    });

    await emitEvent({ code: "MESSAGE_SENT", payload: { conversationId }, actor: req.user!.sub });

    return { data: { ...message, _id: message.id } };
  });
}
