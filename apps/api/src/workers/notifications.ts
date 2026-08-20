import { createWorker } from "../lib/queue";
import { prisma } from "@stackfox/prisma";

createWorker("notifications", async (job) => {
  const { code, payload, engagementId, projectId } = job.data;

  const subscribers = await getSubscribers(engagementId, projectId);

  for (const userId of subscribers) {
    const prefs = await getUserPrefs(userId);
    const channels = resolveChannels(code, prefs);

    if (channels.includes("in_app")) {
      await prisma.notificationContent.create({
        data: {
          userId,
          channel: "IN_APP",
          eventCode: code,
          title: formatTitle(code),
          body: JSON.stringify(payload),
        },
      });
    }

    if (channels.includes("email")) {
      // Queue email via external service
      console.log(`[notifications] email to ${userId} for ${code}`);
    }

    if (channels.includes("whatsapp")) {
      console.log(`[notifications] whatsapp to ${userId} for ${code}`);
    }
  }
});

async function getSubscribers(engagementId?: string, projectId?: string): Promise<string[]> {
  const userIds = new Set<string>();

  if (engagementId) {
    const eng = await prisma.engagement.findUnique({
      where: { id: engagementId },
      include: { client: { include: { members: true } } },
    });
    eng?.client?.members?.forEach((m: any) => userIds.add(m.id));
  }

  if (projectId) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: { engagement: { include: { client: { include: { members: true } } } } },
    });
    project?.engagement?.client?.members?.forEach((m: any) => userIds.add(m.id));
  }

  return Array.from(userIds);
}

async function getUserPrefs(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { notificationPrefs: true },
  });
  return (user?.notificationPrefs as any) ?? {};
}

function resolveChannels(code: string, prefs: any): string[] {
  if (prefs[code]?.channels) return prefs[code].channels;
  return ["in_app"];
}

function formatTitle(code: string): string {
  return code.replace(/_/g, " ").toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}
