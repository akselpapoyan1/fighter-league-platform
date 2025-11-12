"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const globeRoutes_1 = __importDefault(require("./routes/globeRoutes"));
const fighterRoutes_1 = __importDefault(require("./routes/fighterRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const divisionRoutes_1 = __importDefault(require("./routes/divisionRoutes"));
const eventRoutes_1 = __importDefault(require("./routes/eventRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const sponsorRoutes_1 = __importDefault(require("./routes/sponsorRoutes"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cors_1.default)({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use((0, helmet_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
app.use("/api/v1/globe", globeRoutes_1.default);
app.use("/api/v1/fighters", fighterRoutes_1.default);
app.use("/api/v1/auth", authRoutes_1.default);
app.use("/api/v1/divisions", divisionRoutes_1.default);
app.use("/api/v1/events", eventRoutes_1.default);
app.use("/api/v1/dashboard/admin", adminRoutes_1.default);
app.use("/api/v1/dashboard/fighter", fighterRoutes_1.default);
app.use("/api/v1/dashboard/sponsor", sponsorRoutes_1.default);
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
