import { Router } from "express";
import { StatusMapping } from "@prisma/client";
import { z } from "zod";
import { prisma } from "../prisma";
import { AuthRequest, requireAuth } from "../middleware/auth";

const processRouter = Router();

const createProcessSchema = z.object({
  processName: z.string().min(3),
  defaultOwnerId: z.string().optional(),
  participantUserIds: z.array(z.string()).default([]),
  statuses: z
    .array(
      z.object({
        label: z.string().min(1),
        mapping: z.enum(["PENDING", "COMPLETED"])
      })
    )
    .min(2),
  fields: z.array(
    z.object({
      section: z.string().min(1),
      label: z.string().min(1),
      key: z.string().min(1),
      type: z.string().min(1),
      required: z.boolean().default(false),
      options: z.array(z.string()).optional(),
      linkedProcess: z.string().optional(),
      allowMultiple: z.boolean().optional(),
      showStatus: z.boolean().optional(),
      showOwner: z.boolean().optional(),
      showDueDate: z.boolean().optional()
    })
  )
});

processRouter.get("/", requireAuth, async (_req, res) => {
  const processes = await prisma.processTemplate.findMany({
    include: {
      defaultOwner: { select: { id: true, name: true, email: true } },
      statuses: { orderBy: { order: "asc" } },
      fields: { orderBy: { order: "asc" } }
    },
    orderBy: { createdAt: "desc" }
  });
  return res.json(processes);
});

processRouter.post("/", requireAuth, async (req: AuthRequest, res) => {
  const parsed = createProcessSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.flatten() });
  }
  if (!req.user) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const data = parsed.data;
  const hasPending = data.statuses.some((s) => s.mapping === "PENDING");
  const hasCompleted = data.statuses.some((s) => s.mapping === "COMPLETED");

  if (!hasPending || !hasCompleted) {
    return res.status(400).json({
      message: "At least one PENDING and one COMPLETED status are required"
    });
  }

  const process = await prisma.processTemplate.create({
    data: {
      name: data.processName,
      createdById: req.user.userId,
      defaultOwnerId: data.defaultOwnerId,
      participants: {
        create: [...new Set([req.user.userId, ...data.participantUserIds])].map((userId) => ({
          userId
        }))
      },
      statuses: {
        create: data.statuses.map((status, index) => ({
          label: status.label,
          mapping: status.mapping as StatusMapping,
          order: index + 1
        }))
      },
      fields: {
        create: data.fields.map((field, index) => ({
          section: field.section,
          label: field.label,
          key: field.key,
          type: field.type,
          required: field.required ?? false,
          options: field.options ?? [],
          linkedProcess: field.linkedProcess,
          allowMultiple: field.allowMultiple ?? false,
          showStatus: field.showStatus ?? false,
          showOwner: field.showOwner ?? false,
          showDueDate: field.showDueDate ?? false,
          order: index + 1
        }))
      }
    },
    include: {
      participants: { include: { user: { select: { id: true, name: true, email: true } } } },
      statuses: { orderBy: { order: "asc" } },
      fields: { orderBy: { order: "asc" } }
    }
  });

  return res.status(201).json(process);
});

export { processRouter };
