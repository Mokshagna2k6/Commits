import { Queue, Worker, type Job, type WorkerOptions } from "bullmq";
import { redis } from "./redis";

// BullMQ needs the full connection (password/tls included — Upstash requires both)
// and maxRetriesPerRequest:null, or Queue/Worker connections hang instead of erroring.
const connection = {
  host: redis.options.host,
  port: redis.options.port,
  username: redis.options.username,
  password: redis.options.password,
  tls: redis.options.tls,
  maxRetriesPerRequest: null as null,
  connectTimeout: 5000,
};

export function createQueue(name: string) {
  return new Queue(name, { connection });
}

export function createWorker<T>(
  name: string,
  processor: (job: Job<T>) => Promise<void>,
  opts?: Partial<WorkerOptions>,
) {
  const worker = new Worker<T>(name, processor, {
    connection,
    concurrency: opts?.concurrency ?? 5,
    ...opts,
  });

  worker.on("failed", (job, err) => {
    console.error(`[${name}] Job ${job?.id} failed:`, err.message);
  });

  return worker;
}

export const queues = {
  docGen: createQueue("doc-gen"),
  notifications: createQueue("notifications"),
  webhookDispatcher: createQueue("webhook-dispatcher"),
  activityTranslator: createQueue("activity-translator"),
  reconciliation: createQueue("reconciliation"),
  dunning: createQueue("dunning"),
  slaCron: createQueue("sla-cron"),
  timesheetCompiler: createQueue("timesheet-compiler"),
  revRec: createQueue("rev-rec"),
  wipLedger: createQueue("wip-ledger"),
  renewalScanner: createQueue("renewal-scanner"),
  softex: createQueue("softex"),
  sandboxRebuild: createQueue("sandbox-rebuild"),
  harvestReminder: createQueue("harvest-reminder"),
  archiveRetention: createQueue("archive-retention"),
  previewGen: createQueue("preview-gen"),
  referralProcessor: createQueue("referral-processor"),
  whatsappCommerce: createQueue("whatsapp-commerce"),
};
