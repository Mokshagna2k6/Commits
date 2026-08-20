import { createWorker } from "../lib/queue";
import { prisma } from "@stackfox/prisma";

createWorker("softex", async (job) => {
  const { engagementId, quarter, year } = job.data;

  const invoices = await prisma.invoice.findMany({
    where: {
      engagementId,
      status: "PAID",
      paidAt: {
        gte: new Date(year, (quarter - 1) * 3, 1),
        lt: new Date(year, quarter * 3, 1),
      },
    },
    include: { org: true },
  });

  const softexData = invoices.map((inv) => ({
    invoiceId: inv.id,
    buyerName: (inv.org as any)?.name ?? "",
    buyerCountry: (inv.org as any)?.country ?? "IN",
    sacCode: inv.sacCode,
    amount: inv.grandTotal,
    currency: "INR",
    paidAt: inv.paidAt?.toISOString(),
  }));

  await prisma.complianceItem.create({
    data: {
      type: "SOFTEX",
      engagementId,
      period: `Q${quarter}-${year}`,
      data: softexData,
      status: "GENERATED",
    },
  });
});
