import { createWorker } from "../lib/queue";
import { generateContent } from "../lib/gemini";
import { prisma } from "@stackfox/prisma";

createWorker("activityTranslator", async (job) => {
  const { eventId } = job.data;

  const event = await prisma.event.findUnique({ where: { id: eventId } });
  if (!event) return;

  const prompt = `Translate this technical event into a simple, human-readable activity update for a non-technical client:
Event code: ${event.code}
Payload: ${JSON.stringify(event.payload)}
Write a single sentence that a business stakeholder would understand.`;

  const translation = await generateContent(prompt);

  await prisma.event.update({
    where: { id: eventId },
    data: { humanReadable: translation },
  });
});
