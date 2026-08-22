import "./env";

import Fastify from "fastify";
import cors from "@fastify/cors";
import helmet from "@fastify/helmet";
import rateLimit from "@fastify/rate-limit";

import { authPlugin } from "./plugins/auth";
import { authRoutes } from "./routes/auth";
import { catalogueRoutes } from "./routes/catalogue";
import { workspaceRoutes } from "./routes/workspaces";
import { estimateRoutes } from "./routes/estimates";
import { checkoutRoutes } from "./routes/checkout";
import { contractRoutes } from "./routes/contracts";
import { engagementRoutes } from "./routes/engagements";
import { projectRoutes } from "./routes/projects";
import { timesheetRoutes } from "./routes/timesheets";
import { programRoutes } from "./routes/programs";
import { rfpRoutes } from "./routes/rfps";
import { eventRoutes } from "./routes/events";
import { financeRoutes } from "./routes/finance";
import { paymentRoutes } from "./routes/payments";
import { feedbackRoutes } from "./routes/feedback";
import { changeRequestRoutes } from "./routes/changeRequests";
import { userRoutes } from "./routes/users";
import { assistantRoutes } from "./routes/assistant";
import { fileRoutes } from "./routes/files";
import { ticketRoutes } from "./routes/tickets";
import { notificationRoutes } from "./routes/notifications";
import { publicApiRoutes } from "./routes/publicApi";
import { adminRoutes } from "./routes/admin";
import { toolRoutes } from "./routes/tools";
import { blogRoutes } from "./routes/blog";
import { cartRoutes } from "./routes/cart";
import { quoteRoutes } from "./routes/quotes";

const app = Fastify({
  logger: {
    transport:
      process.env.NODE_ENV === "development"
        ? { target: "pino-pretty" }
        : undefined,
  },
});

async function start() {
  await app.register(cors, {
    origin: process.env.CORS_ORIGIN ?? "http://localhost:3000",
  });
  await app.register(helmet);
  await app.register(rateLimit, { max: 100, timeWindow: "1 minute" });

  // Auth plugin (decorators + hooks)
  await app.register(authPlugin);

  // Health check
  app.get("/health", async () => ({ status: "ok", ts: Date.now() }));

  // Route modules
  await app.register(authRoutes, { prefix: "/" });
  await app.register(catalogueRoutes, { prefix: "/" });
  await app.register(workspaceRoutes, { prefix: "/" });
  await app.register(estimateRoutes, { prefix: "/" });
  await app.register(checkoutRoutes, { prefix: "/" });
  await app.register(contractRoutes, { prefix: "/" });
  await app.register(engagementRoutes, { prefix: "/" });
  await app.register(projectRoutes, { prefix: "/" });
  await app.register(timesheetRoutes, { prefix: "/" });
  await app.register(programRoutes, { prefix: "/" });
  await app.register(rfpRoutes, { prefix: "/" });
  await app.register(eventRoutes, { prefix: "/" });
  await app.register(financeRoutes, { prefix: "/" });
  await app.register(paymentRoutes, { prefix: "/" });
  await app.register(feedbackRoutes, { prefix: "/" });
  await app.register(changeRequestRoutes, { prefix: "/" });
  await app.register(userRoutes, { prefix: "/" });
  await app.register(assistantRoutes, { prefix: "/" });
  await app.register(fileRoutes, { prefix: "/" });
  await app.register(ticketRoutes, { prefix: "/" });
  await app.register(notificationRoutes, { prefix: "/" });
  await app.register(publicApiRoutes, { prefix: "/" });
  await app.register(adminRoutes, { prefix: "/" });
  await app.register(toolRoutes, { prefix: "/" });
  await app.register(blogRoutes, { prefix: "/" });
  await app.register(cartRoutes, { prefix: "/" });
  await app.register(quoteRoutes, { prefix: "/" });

  const port = Number(process.env.PORT) || 4000;
  const host = process.env.HOST ?? "0.0.0.0";

  await app.listen({ port, host });
  app.log.info(`API listening on ${host}:${port}`);
}

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
