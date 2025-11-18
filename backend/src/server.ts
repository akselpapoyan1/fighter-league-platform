import dotenv from "dotenv";
import express, { Express, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";

import globeRoutes from "./routes/globeRoutes";
import fighterRoutes from "./routes/fighterRoutes";
import authRoutes from "./routes/authRoutes";
import divisionRoutes from "./routes/divisionRoutes";
import eventRoutes from "./routes/eventRoutes";
import adminRoutes from "./routes/adminRoutes";
import sponsorRoutes from "./routes/sponsorRoutes";
import donorRoutes from "./routes/donorRoutes";

dotenv.config();
const app: Express = express();

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/globe", globeRoutes);
app.use("/api/v1/fighters", fighterRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/divisions", divisionRoutes);
app.use("/api/v1/events", eventRoutes);
app.use("/api/v1/dashboard/admin", adminRoutes);
app.use("/api/v1/sponsor", sponsorRoutes);
app.use("/api/v1/donor", donorRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
