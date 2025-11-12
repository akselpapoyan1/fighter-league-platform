import express from "express";
import {
  registerFighter,
  getAllFighters,
  getFighterById,
  getMyFighterProfile,
} from "../controllers/fighterController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post(
  "/register",
  // protect, // Keep this commented if registration is open
  registerFighter
);

router.get("/", getAllFighters);

router.get("/me", protect, getMyFighterProfile);

router.get("/:id", getFighterById);

export default router;
