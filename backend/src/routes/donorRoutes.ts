import express from "express";
import { protect } from "../middleware/authMiddleware";
import { registerDonor } from "../controllers/donorController";

const router = express.Router();

router.post("/register", protect, registerDonor);

export default router;