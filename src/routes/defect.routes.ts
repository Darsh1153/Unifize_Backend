import { DefectCategory } from "@prisma/client";
import { Router } from "express";
import { z } from "zod";
import { AuthRequest, requireAuth } from "../middleware/auth";
import { prisma } from "../prisma";

const defectRouter = Router();

const createTaskSchema = z.object({
  title: z.string().min(1),
  statusId: z.string().min(1),
  ownerId: z.string().min(1),
  dueDate: z.string().datetime().optional()
});

const createDefectSchema = z.object({
  processId: z.string().min(1),
  title: z.string().min(1),
  ownerId: z.string().min(1).optional(),
  statusId: z.string().min(1),
  participantUserIds: z.array(z.string()).default([]),
  dateDefectReported: z.string().datetime(),
  customerId: z.string().min(1),
  description: z.string().min(1),
  category: z.enum(["FUNCTIONAL_BUGS", "LOGICAL_BUGS", "WORKFLOW_BUGS", "OTHER"]),
  screenshotUrls: z.array(z.string().url()).default([]),
  featureId: z.string().min(1),
  relatedTasks: z.array(createTaskSchema).default([])
});

defectRouter.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createDefectSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.flatten() });
  }
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const data = parsed.data;
  const ownerId = data.ownerId ?? req.user.userId;

  const process = await prisma.processTemplate.findUnique({
    where: { id: data.processId },
    include: { statuses: true }
  });
  if (!process) {
    return res.status(404).json({ message: "Process not found" });
  }

  const statusExists = process.statuses.some((s) => s.id === data.statusId);
  if (!statusExists) {
    return res.status(400).json({ message: "Selected status does not belong to this process" });
  }

  for (const task of data.relatedTasks) {
    if (!process.statuses.some((s) => s.id === task.statusId)) {
      return res.status(400).json({
        message: `Task status ${task.statusId} does not belong to process`
      });
    }
  }

  const defect = await prisma.defectConversation.create({
    data: {
      processId: data.processId,
      title: data.title,
      ownerId,
      statusId: data.statusId,
      dateDefectReported: new Date(data.dateDefectReported),
      customerId: data.customerId,
      description: data.description,
      category: data.category as DefectCategory,
      screenshotUrls: data.screenshotUrls,
      featureId: data.featureId,
      createdById: req.user.userId,
      participants: {
        create: [...new Set([req.user.userId, ...data.participantUserIds])].map((userId) => ({
          userId
        }))
      },
      relatedTasks: {
        create: data.relatedTasks.map((task) => ({
          title: task.title,
          statusId: task.statusId,
          ownerId: task.ownerId,
          dueDate: task.dueDate ? new Date(task.dueDate) : null
        }))
      }
    },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      status: true,
      participants: { include: { user: { select: { id: true, name: true, email: true } } } },
      customer: true,
      feature: true,
      relatedTasks: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
          status: true
        }
      }
    }
  });

  return res.status(201).json(defect);
});

defectRouter.get("/", requireAuth, async (_req, res) => {
  const defects = await prisma.defectConversation.findMany({
    include: {
      owner: { select: { id: true, name: true, email: true } },
      status: true,
      participants: { include: { user: { select: { id: true, name: true, email: true } } } },
      customer: true,
      feature: true,
      process: { select: { id: true, name: true } },
      relatedTasks: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
          status: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
  return res.json(defects);
});

defectRouter.get("/:id", requireAuth, async (req, res) => {
  const defectId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
  const defect = await prisma.defectConversation.findUnique({
    where: { id: defectId },
    include: {
      owner: { select: { id: true, name: true, email: true } },
      status: true,
      participants: { include: { user: { select: { id: true, name: true, email: true } } } },
      customer: true,
      feature: true,
      process: { select: { id: true, name: true } },
      relatedTasks: {
        include: {
          owner: { select: { id: true, name: true, email: true } },
          status: true
        }
      }
    }
  });

  if (!defect) {
    return res.status(404).json({ message: "Defect not found" });
  }
  return res.json(defect);
});

export { defectRouter };
