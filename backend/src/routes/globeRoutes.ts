import express from "express";
import { getNationData } from "../controllers/globeController";

const router = express.Router();

router.get("/nation/:countryCode", getNationData);

export default router;
