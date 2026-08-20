import { createWorker } from "../lib/queue";
import { prisma } from "@stackfox/prisma";

createWorker("wipLedger", async (job) => {
  const { engagementId, projectId, hours, costRate, description } = job.data;

  const amount = hours * (costRate ?? 2000);

  await prisma.wipLedger.create({
    data: {
      engagementId,
      projectId,
      hours,
      amount,
      period: getCurrentPeriod(),
      description: description ?? `WIP entry for ${projectId}`,
    },
  });
});

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
