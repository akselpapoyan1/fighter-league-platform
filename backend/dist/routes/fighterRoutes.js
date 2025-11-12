"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const fighterController_1 = require("../controllers/fighterController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.post("/register", 
// protect, // Keep this commented if registration is open
fighterController_1.registerFighter);
router.get("/", fighterController_1.getAllFighters);
router.get("/me", authMiddleware_1.protect, fighterController_1.getMyFighterProfile);
router.get("/:id", fighterController_1.getFighterById);
exports.default = router;
