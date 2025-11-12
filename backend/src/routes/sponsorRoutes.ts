import express from "express";
import { protect } from "../middleware/authMiddleware";
import {
  createSponsorProfile,
  getMySponsorProfile,
} from "../controllers/sponsorController";

const router = express.Router();

router.get("/me", protect, getMySponsorProfile);

router.post("/me", protect, createSponsorProfile);

export default router;
