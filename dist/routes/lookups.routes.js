"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.lookupsRouter = void 0;
const express_1 = require("express");
const zod_1 = require("zod");
const prisma_1 = require("../prisma");
const auth_1 = require("../middleware/auth");
const lookupsRouter = (0, express_1.Router)();
exports.lookupsRouter = lookupsRouter;
const createLookupSchema = zod_1.z.object({
    name: zod_1.z.string().min(1)
});
lookupsRouter.get("/customers", auth_1.requireAuth, async (_req, res) => {
    const data = await prisma_1.prisma.customer.findMany({ orderBy: { name: "asc" } });
    return res.json(data);
});
lookupsRouter.post("/customers", auth_1.requireAuth, async (req, res) => {
    const parsed = createLookupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.flatten() });
    }
    const customer = await prisma_1.prisma.customer.create({ data: parsed.data });
    return res.status(201).json(customer);
});
lookupsRouter.get("/features", auth_1.requireAuth, async (_req, res) => {
    const data = await prisma_1.prisma.feature.findMany({ orderBy: { name: "asc" } });
    return res.json(data);
});
lookupsRouter.post("/features", auth_1.requireAuth, async (req, res) => {
    const parsed = createLookupSchema.safeParse(req.body);
    if (!parsed.success) {
        return res.status(400).json({ message: parsed.error.flatten() });
    }
    const feature = await prisma_1.prisma.feature.create({ data: parsed.data });
    return res.status(201).json(feature);
});
