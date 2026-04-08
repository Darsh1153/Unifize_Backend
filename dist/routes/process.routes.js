"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.processRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const processRouter = (0, express_1.Router)();
exports.processRouter = processRouter;
const createProcessSchema = zod_1.z.object({
    processName: zod_1.z.string().min(3),
    defaultOwnerId: zod_1.z.string().optional(),
    participantUserIds: zod_1.z.array(zod_1.z.string()).default([]),
    statuses: zod_1.z
        .array(zod_1.z.object({
        label: zod_1.z.string().min(1),
        mapping: zod_1.z.enum(["PENDING", "COMPLETED"])
    }))
        .min(2),
    fields: zod_1.z.array(zod_1.z.object({
        section: zod_1.z.string().min(1),
        label: zod_1.z.string().min(1),
        key: zod_1.z.string().min(1),
        type: zod_1.z.string().min(1),
        required: zod_1.z.boolean().default(false),
        options: zod_1.z.array(zod_1.z.string()).optional(),
        linkedProcess: zod_1.z.string().optional(),
        allowMultiple: zod_1.z.boolean().optional(),
        showStatus: zod_1.z.boolean().optional(),
        showOwner: zod_1.z.boolean().optional(),
        showDueDate: zod_1.z.boolean().optional()
    }))
});
processRouter.get("/", auth_1.requireAuth, async (_req, res) => {
    const processes = await prisma_1.prisma.processTemplate.findMany({
        include: {
            defaultOwner: { select: { id: true, name: true, email: true } },
            statuses: { orderBy: { order: "asc" } },
            fields: { orderBy: { order: "asc" } }
        },
        orderBy: { createdAt: "desc" }
    });
    return res.json(processes);
});
processRouter.post("/", auth_1.requireAuth, async (req, res) => {
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
    const process = await prisma_1.prisma.processTemplate.create({
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
                    mapping: status.mapping,
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
