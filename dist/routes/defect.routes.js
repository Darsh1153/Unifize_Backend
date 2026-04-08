"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.defectRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const auth_1 = require("../middleware/auth");
const prisma_1 = require("../prisma");
const defectRouter = (0, express_1.Router)();
exports.defectRouter = defectRouter;
const createTaskSchema = zod_1.z.object({
    title: zod_1.z.string().min(1),
    statusId: zod_1.z.string().min(1),
    ownerId: zod_1.z.string().min(1),
    dueDate: zod_1.z.string().datetime().optional()
});
const createDefectSchema = zod_1.z.object({
    processId: zod_1.z.string().min(1),
    title: zod_1.z.string().min(1),
    ownerId: zod_1.z.string().min(1).optional(),
    statusId: zod_1.z.string().min(1),
    participantUserIds: zod_1.z.array(zod_1.z.string()).default([]),
    dateDefectReported: zod_1.z.string().datetime(),
    customerId: zod_1.z.string().min(1),
    description: zod_1.z.string().min(1),
    category: zod_1.z.enum(["FUNCTIONAL_BUGS", "LOGICAL_BUGS", "WORKFLOW_BUGS", "OTHER"]),
    screenshotUrls: zod_1.z.array(zod_1.z.string().url()).default([]),
    featureId: zod_1.z.string().min(1),
    relatedTasks: zod_1.z.array(createTaskSchema).default([])
});
defectRouter.post("/", auth_1.requireAuth, async (req, res) => {
    const parsed = createDefectSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.flatten() });
    }
    if (!req.user) {
        return res.status(401).json({ message: "Unauthorized" });
    }
    const data = parsed.data;
    const ownerId = data.ownerId ?? req.user.userId;
    const process = await prisma_1.prisma.processTemplate.findUnique({
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
    const defect = await prisma_1.prisma.defectConversation.create({
        data: {
            processId: data.processId,
            title: data.title,
            ownerId,
            statusId: data.statusId,
            dateDefectReported: new Date(data.dateDefectReported),
            customerId: data.customerId,
            description: data.description,
            category: data.category,
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
defectRouter.get("/", auth_1.requireAuth, async (_req, res) => {
    const defects = await prisma_1.prisma.defectConversation.findMany({
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
defectRouter.get("/:id", auth_1.requireAuth, async (req, res) => {
    const defectId = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
    const defect = await prisma_1.prisma.defectConversation.findUnique({
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
