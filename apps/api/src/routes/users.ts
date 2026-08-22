import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { requireRole } from "../plugins/auth";
import { emitEvent } from "../lib/events";
import { createHash } from "crypto";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

function serializeUser(u: any) {
  return { ...u, _id: u.id };
}

export async function userRoutes(app: FastifyInstance) {
  app.get("/users", async (req, reply) => {
    if (!requireRole(req, reply, ["ADMIN"])) return;
    const { role, search, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: any = {};
    if (role && role !== "all") where.role = { equals: role, mode: "insensitive" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }

    const users = await prisma.user.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
    });
    return { data: users.map(serializeUser) };
  });

  app.post("/users", async (req, reply) => {
    if (!requireRole(req, reply, ["ADMIN"])) return;
    const { name, email, password, role } = req.body as {
      name?: string;
      email?: string;
      password?: string;
      role?: string;
    };
    if (!name || !email || !password) {
      return reply.code(400).send({ message: "name, email and password are required" });
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return reply.code(409).send({ message: "Email already registered" });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: role ?? "INDIVIDUAL_CLIENT",
        authData: { provider: "email", passwordHash: hashPassword(password), verified: false },
      },
    });

    await emitEvent({ code: "USER_CREATED", payload: { userId: user.id, role: user.role }, actor: req.user!.sub });

    return { data: serializeUser(user) };
  });

  // Promote/demote (role change) and activate/deactivate — same endpoint,
  // since both are just field updates an admin makes to a user record.
  app.put("/users/:id", async (req, reply) => {
    if (!requireRole(req, reply, ["ADMIN"])) return;
    const { id } = req.params as { id: string };
    const { role, isActive } = req.body as { role?: string; isActive?: boolean };

    const data: any = {};
    if (role !== undefined) data.role = role;
    if (isActive !== undefined) data.isActive = isActive;
    if (Object.keys(data).length === 0) {
      return reply.code(400).send({ message: "Nothing to update" });
    }

    const user = await prisma.user.update({ where: { id }, data });

    await emitEvent({
      code: role !== undefined ? "USER_ROLE_CHANGED" : "USER_STATUS_CHANGED",
      payload: { userId: id, role, isActive },
      actor: req.user!.sub,
    });

    return { data: serializeUser(user) };
  });
}
