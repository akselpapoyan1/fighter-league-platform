import { Request, Response } from "express";
import db from "../config/db";

import express from "express";
import {
  registerFighter,
  getAllFighters,
  getFighterById,
  getMyFighterProfile,
} from "../controllers/fighterController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.get("/", getAllFighters);

router.get("/:id", getFighterById);

router.post("/register", registerFighter);

router.get(
  "/me",
  //  protect,
  getMyFighterProfile
);

router.post(
  "/register",
  // protect,
  registerFighter
);

export default router;
