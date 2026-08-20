import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { redis } from "../lib/redis";
import { signToken, signRefreshToken, requireAuth } from "../plugins/auth";
import { randomInt, createHash } from "crypto";
import * as ids from "../lib/id";

function hashPassword(password: string): string {
  return createHash("sha256").update(password).digest("hex");
}

export async function authRoutes(app: FastifyInstance) {
  // POST /auth/register — email + password registration
  app.post("/auth/register", async (req, reply) => {
    const { name, email, password } = req.body as { name: string; email: string; password: string };
    if (!email || !password) return reply.code(400).send({ message: "Email and password required" });

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) return reply.code(409).send({ message: "Email already registered" });

    const user = await prisma.user.create({
      data: {
        name: name || email.split("@")[0],
        email,
        role: "INDIVIDUAL_CLIENT",
        authData: { provider: "email", passwordHash: hashPassword(password), verified: false },
      },
    });

    const payload = { sub: user.id, email: user.email, role: user.role, orgId: undefined as string | undefined };
    const accessToken = signToken(payload);
    return { data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken } };
  });

  // POST /auth/login — email + password login
  app.post("/auth/login", async (req, reply) => {
    const { email, password } = req.body as { email: string; password: string };
    if (!email || !password) return reply.code(400).send({ message: "Email and password required" });

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return reply.code(401).send({ message: "Invalid credentials" });

    const authData = user.authData as Record<string, unknown> | null;
    const storedHash = authData?.passwordHash as string | undefined;
    if (!storedHash || storedHash !== hashPassword(password)) {
      return reply.code(401).send({ message: "Invalid credentials" });
    }

    const payload = { sub: user.id, email: user.email, role: user.role, orgId: user.orgId ?? undefined };
    const accessToken = signToken(payload);
    const refreshToken = signRefreshToken(payload);
    try { await redis.set(`refresh:${user.id}`, refreshToken, "EX", 604800); } catch {}

    return { data: { user: { id: user.id, name: user.name, email: user.email, role: user.role }, accessToken } };
  });

  // POST /auth/refresh-token
  app.post("/auth/refresh-token", async (req, reply) => {
    const header = req.headers.authorization;
    if (!header?.startsWith("Bearer ")) return reply.code(401).send({ message: "No token" });
    try {
      const jwt = await import("jsonwebtoken");
      const decoded = jwt.default.verify(header.slice(7), process.env.JWT_SECRET ?? process.env.NEXTAUTH_SECRET ?? "dev-secret-change-me") as { sub: string; email: string; role: string };
      const user = await prisma.user.findUnique({ where: { id: decoded.sub } });
      if (!user) return reply.code(401).send({ message: "User not found" });
      const payload = { sub: user.id, email: user.email, role: user.role, orgId: user.orgId ?? undefined };
      return { data: { accessToken: signToken(payload) } };
    } catch {
      return reply.code(401).send({ message: "Invalid token" });
    }
  });

  // POST /auth/forgot-password
  app.post("/auth/forgot-password", async (req, reply) => {
    const { email } = req.body as { email: string };
    const user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      const token = randomInt(100000, 999999).toString();
      try { await redis.set(`reset:${email}`, token, "EX", 3600); } catch {}
      app.log.info(`Reset token for ${email}: ${token}`);
    }
    return { success: true, message: "If an account exists, a reset link has been sent" };
  });

  // POST /auth/reset-password
  app.post("/auth/reset-password", async (req, reply) => {
    const { token, password, email } = req.body as { token: string; password: string; email?: string };
    if (!token || !password) return reply.code(400).send({ message: "Token and password required" });
    // In a real system, decode the token to find the email
    return { success: true, message: "Password reset" };
  });

  // POST /auth/verify-email
  app.post("/auth/verify-email", async (req, reply) => {
    const { token } = req.body as { token: string };
    // In a real system, verify the token and mark user as verified
    return { success: true, message: "Email verified" };
  });

  // POST /auth/otp/send
  app.post("/auth/otp/send", async (req, reply) => {
    const { email, phone } = req.body as { email?: string; phone?: string };
    if (!email && !phone) return reply.code(400).send({ error: "email or phone required" });

    const otp = String(randomInt(100000, 999999));
    const key = `otp:${email ?? phone}`;
    try { await redis.set(key, otp, "EX", 300); } catch {} // 5 min TTL

    // TODO: send OTP via email (Resend) or SMS/WhatsApp
    if (process.env.NODE_ENV === "development") {
      app.log.info(`OTP for ${email ?? phone}: ${otp}`);
    }

    return { success: true, message: "OTP sent" };
  });

  // POST /auth/otp/verify
  app.post("/auth/otp/verify", async (req, reply) => {
    const { email, phone, code } = req.body as {
      email?: string;
      phone?: string;
      code: string;
    };
    const identifier = email ?? phone;
    if (!identifier) return reply.code(400).send({ error: "email or phone required" });

    let stored: string | null = null;
    try { stored = await redis.get(`otp:${identifier}`); } catch {}
    if (!stored || stored !== code) {
      return reply.code(401).send({ error: "Invalid or expired OTP" });
    }

    try { await redis.del(`otp:${identifier}`); } catch {}

    let user = await prisma.user.findFirst({
      where: email ? { email } : { phone },
    });

    if (!user) {
      user = await prisma.user.create({
        data: {
          name: email?.split("@")[0] ?? phone ?? "User",
          email: email ?? `${phone}@phone.stackfox.in`,
          phone,
          role: "INDIVIDUAL_CLIENT",
        },
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.role, orgId: user.orgId ?? undefined };
    const token = signToken(payload);
    const refreshToken = signRefreshToken(payload);

    return { token, refreshToken, user: { id: user.id, name: user.name, email: user.email, role: user.role } };
  });

  // GET /auth/google/callback
  app.get("/auth/google/callback", async (req, reply) => {
    // NextAuth handles Google OAuth on the frontend
    // This endpoint validates the OAuth code if needed for API-only flows
    return reply.code(501).send({ error: "Use NextAuth on frontend for Google SSO" });
  });

  // POST /auth/whatsapp/callback
  app.post("/auth/whatsapp/callback", async (req, reply) => {
    const { phone, code } = req.body as { phone: string; code: string };
    let stored: string | null = null;
    try { stored = await redis.get(`otp:${phone}`); } catch {}
    if (!stored || stored !== code) {
      return reply.code(401).send({ error: "Invalid OTP" });
    }
    try { await redis.del(`otp:${phone}`); } catch {}

    let user = await prisma.user.findFirst({ where: { phone } });
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: "WhatsApp User",
          email: `${phone}@wa.stackfox.in`,
          phone,
          role: "INDIVIDUAL_CLIENT",
        },
      });
    }

    const payload = { sub: user.id, email: user.email, role: user.role, orgId: user.orgId ?? undefined };
    return { token: signToken(payload), refreshToken: signRefreshToken(payload) };
  });

  // POST /auth/logout
  app.post("/auth/logout", async (req, reply) => {
    // Stateless JWT — client discards token
    // Optionally blacklist token in Redis
    const header = req.headers.authorization;
    if (header?.startsWith("Bearer ")) {
      const token = header.slice(7);
      try { await redis.set(`blacklist:${token}`, "1", "EX", 86400); } catch {}
    }
    return { success: true };
  });

  // GET /auth/me
  app.get("/auth/me", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const user = await prisma.user.findUnique({
      where: { id: req.user!.sub },
      include: { org: true },
    });
    if (!user) return reply.code(404).send({ error: "User not found" });
    return { data: { user: { id: user.id, name: user.name, email: user.email, role: user.role, org: user.org } } };
  });

  // POST /orgs
  app.post("/orgs", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const body = req.body as {
      name: string;
      type: string;
      gstin?: string;
      pan?: string;
      billingAddress: Record<string, unknown>;
    };

    // TODO: validate GSTIN via GSTN API
    const org = await prisma.org.create({
      data: {
        id: ids.orgId(),
        name: body.name,
        type: body.type,
        gstin: body.gstin,
        pan: body.pan,
        billingAddress: body.billingAddress,
      },
    });

    await prisma.user.update({
      where: { id: req.user!.sub },
      data: { orgId: org.id, role: "ORG_OWNER" },
    });

    return org;
  });

  // PATCH /orgs/:id
  app.patch("/orgs/:id", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const body = req.body as Partial<{
      name: string;
      gstin: string;
      pan: string;
      billingAddress: Record<string, unknown>;
    }>;

    const org = await prisma.org.update({
      where: { id },
      data: body,
    });
    return org;
  });

  // POST /orgs/:id/members
  app.post("/orgs/:id/members", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const { email, role } = req.body as { email: string; role: string };

    let user = await prisma.user.findUnique({ where: { email } });
    if (user) {
      user = await prisma.user.update({
        where: { id: user.id },
        data: { orgId: id, role },
      });
    } else {
      user = await prisma.user.create({
        data: {
          name: email.split("@")[0],
          email,
          role,
          orgId: id,
        },
      });
    }

    return user;
  });
}
