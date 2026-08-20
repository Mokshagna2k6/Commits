import { createWorker } from "../lib/queue";
import { prisma } from "@stackfox/prisma";
import { isSlaBreached, SLA_TARGETS } from "@stackfox/core";
import { emitEvent } from "../lib/events";

createWorker("slaCron", async (job) => {
  const openTickets = await prisma.ticket.findMany({
    where: { status: { in: ["OPEN", "ACKNOWLEDGED"] } },
  });

  for (const ticket of openTickets) {
    const severity = (ticket.severity as keyof typeof SLA_TARGETS) ?? "P3";
    const target = SLA_TARGETS[severity];
    if (!target) continue;

    const elapsedMs = Date.now() - ticket.createdAt.getTime();
    const responseHours = elapsedMs / 3600000;

    if (isSlaBreached(severity, responseHours, "response")) {
      await emitEvent({
        code: "SLA_BREACHED",
        payload: {
          ticketId: ticket.id,
          severity,
          metric: "response",
          elapsed: responseHours.toFixed(1),
          target: target.responseHours,
        },
        actor: "system",
        projectId: ticket.projectId ?? undefined,
        engagementId: ticket.engagementId ?? undefined,
      });
    }
  }
});
