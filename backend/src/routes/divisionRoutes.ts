import express from "express";
import { getAllDivisions } from "../controllers/divisionController";

const router = express.Router();

router.get("/", getAllDivisions);

export default router;
