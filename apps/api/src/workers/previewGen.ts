import { createWorker } from "../lib/queue";
import { prisma } from "@stackfox/prisma";
import { generateContent } from "../lib/gemini";
import { uploadFile } from "../lib/storage";

createWorker("previewGen", async (job) => {
  const { serviceId, tier } = job.data;

  const service = await prisma.serviceUnit.findUnique({
    where: { id: serviceId },
    include: { features: true },
  });
  if (!service) return;

  const prompt = `Generate a detailed preview/mockup description for the IT service "${service.name}" at ${tier} tier.
Features included: ${service.features.map((f) => f.name).join(", ")}
Create a realistic preview that shows what the client will receive.
Return as JSON with: title, description, sections (array of {heading, content}), estimatedTimeline, keyDeliverables.`;

  const result = await generateContent(prompt);

  const preview = await prisma.preview.create({
    data: {
      serviceId,
      tier,
      content: result,
      status: "READY",
    },
  });

  const key = `previews/${serviceId}/${tier}/${preview.id}.json`;
  await uploadFile(key, Buffer.from(result), "application/json");
});
