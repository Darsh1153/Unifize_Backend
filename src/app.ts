import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { authRouter } from "./routes/auth.routes";
import { processRouter } from "./routes/process.routes";
import { defectRouter } from "./routes/defect.routes";
import { lookupsRouter } from "./routes/lookups.routes";

export const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/auth", authRouter);
app.use("/lookups", lookupsRouter);
app.use("/processes", processRouter);
app.use("/defects", defectRouter);
