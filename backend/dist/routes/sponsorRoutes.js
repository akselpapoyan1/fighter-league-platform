"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const authMiddleware_1 = require("../middleware/authMiddleware");
const sponsorController_1 = require("../controllers/sponsorController");
const router = express_1.default.Router();
router.get("/me", authMiddleware_1.protect, sponsorController_1.getMySponsorProfile);
router.post("/me", authMiddleware_1.protect, sponsorController_1.createSponsorProfile);
exports.default = router;
