import { Router } from "express";
import {
  registerSponsor,
  getMySponsorProfile,
} from "../controllers/sponsorController";
import { protect } from "../middleware/authMiddleware";

const router = Router();

router.get("/me", protect, getMySponsorProfile);

router.post(
  "/register",
  //  protect,
  registerSponsor
);

export default router;
