import { Router } from "express";
import { z } from "zod";
import { prisma } from "../prisma";
import { requireAuth } from "../middleware/auth";

const lookupsRouter = Router();

const createLookupSchema = z.object({
  name: z.string().min(1)
});

lookupsRouter.get("/customers", requireAuth, async (_req, res) => {
  const data = await prisma.customer.findMany({ orderBy: { name: "asc" } });
  return res.json(data);
});

lookupsRouter.post("/customers", requireAuth, async (req, res) => {
  const parsed = createLookupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.flatten() });
  }
  const customer = await prisma.customer.create({ data: parsed.data });
  return res.status(201).json(customer);
});

lookupsRouter.get("/features", requireAuth, async (_req, res) => {
  const data = await prisma.feature.findMany({ orderBy: { name: "asc" } });
  return res.json(data);
});

lookupsRouter.post("/features", requireAuth, async (req, res) => {
  const parsed = createLookupSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: parsed.error.flatten() });
  }
  const feature = await prisma.feature.create({ data: parsed.data });
  return res.status(201).json(feature);
});

export { lookupsRouter };
