import express from "express";
import {
  connectWallet,
  verifySignature,
  getCurrentUser,
  registerUser,
  loginUser,
} from "../controllers/authController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login/email", loginUser);

router.post("/nonce", connectWallet);
router.post("/login", verifySignature);
router.get("/me", protect, getCurrentUser); 

export default router;
