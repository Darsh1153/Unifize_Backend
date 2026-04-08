"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.app = void 0;
const cors_1 = __importDefault(require("cors"));
const express_1 = __importDefault(require("express"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const auth_routes_1 = require("./routes/auth.routes");
const process_routes_1 = require("./routes/process.routes");
const defect_routes_1 = require("./routes/defect.routes");
const lookups_routes_1 = require("./routes/lookups.routes");
exports.app = (0, express_1.default)();
exports.app.use((0, helmet_1.default)());
exports.app.use((0, cors_1.default)());
exports.app.use(express_1.default.json());
exports.app.use((0, morgan_1.default)("dev"));
exports.app.get("/health", (_req, res) => {
    res.json({ ok: true });
});
exports.app.use("/auth", auth_routes_1.authRouter);
exports.app.use("/lookups", lookups_routes_1.lookupsRouter);
exports.app.use("/processes", process_routes_1.processRouter);
exports.app.use("/defects", defect_routes_1.defectRouter);
