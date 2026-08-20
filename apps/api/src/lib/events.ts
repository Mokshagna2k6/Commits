import { prisma } from "@stackfox/prisma";
import { queues } from "./queue";

export interface EmitOptions {
  code: string;
  payload?: Record<string, unknown>;
  actor: string;
  projectId?: string;
  engagementId?: string;
  programId?: string;
}

export async function emitEvent(opts: EmitOptions) {
  const event = await prisma.event.create({
    data: {
      code: opts.code,
      payload: opts.payload ?? {},
      actor: opts.actor,
      projectId: opts.projectId,
      engagementId: opts.engagementId,
      programId: opts.programId,
    },
  });

  await queues.notifications.add("notify", {
    eventSeq: Number(event.seq),
    code: opts.code,
    payload: opts.payload,
    actor: opts.actor,
    projectId: opts.projectId,
    engagementId: opts.engagementId,
  });

  await queues.webhookDispatcher.add("dispatch", {
    eventSeq: Number(event.seq),
    code: opts.code,
    payload: opts.payload,
    projectId: opts.projectId,
    engagementId: opts.engagementId,
  });

  return event;
}
