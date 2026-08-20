import { createWorker } from "../lib/queue";
import { prisma } from "@stackfox/prisma";

createWorker("revRec", async (job) => {
  const { invoiceId, amount, engagementId, milestoneRef } = job.data;

  await prisma.revrecLedger.create({
    data: {
      engagementId,
      invoiceId,
      amount,
      period: getCurrentPeriod(),
      type: "RECOGNIZED",
      description: `Revenue recognized for ${milestoneRef ?? invoiceId}`,
    },
  });
});

function getCurrentPeriod(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
}
