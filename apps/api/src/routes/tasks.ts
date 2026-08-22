import type { FastifyInstance } from "fastify";
import { prisma } from "@stackfox/prisma";
import { requireAuth } from "../plugins/auth";

function serializeTask(t: any) {
  return { ...t, _id: t.id, project: t.project ? { projectNumber: t.project.id } : null };
}

export async function taskRoutes(app: FastifyInstance) {
  app.get("/tasks/my", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const tasks = await prisma.task.findMany({
      where: { assigneeId: req.user!.sub },
      include: { project: true },
      orderBy: { createdAt: "desc" },
    });
    return { data: { tasks: tasks.map(serializeTask) } };
  });

  app.post("/tasks", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { title, description, assigneeId, projectId, priority, dueDate } = req.body as {
      title?: string;
      description?: string;
      assigneeId?: string;
      projectId?: string;
      priority?: string;
      dueDate?: string;
    };
    if (!title || !assigneeId) {
      return reply.code(400).send({ message: "title and assigneeId are required" });
    }
    const task = await prisma.task.create({
      data: {
        title,
        description,
        assigneeId,
        projectId,
        priority: priority ?? "medium",
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });
    return { data: serializeTask(task) };
  });

  app.put("/tasks/:id", async (req, reply) => {
    if (!requireAuth(req, reply)) return;
    const { id } = req.params as { id: string };
    const { status, priority, title, description, dueDate } = req.body as {
      status?: string;
      priority?: string;
      title?: string;
      description?: string;
      dueDate?: string;
    };
    const data: any = {};
    if (status !== undefined) data.status = status;
    if (priority !== undefined) data.priority = priority;
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description;
    if (dueDate !== undefined) data.dueDate = dueDate ? new Date(dueDate) : null;

    const task = await prisma.task.update({ where: { id }, data, include: { project: true } });
    return { data: serializeTask(task) };
  });
}
