import express from "express";
import { getAllEvents } from "../controllers/eventController";

const router = express.Router();

router.get("/", getAllEvents);

export default router;
