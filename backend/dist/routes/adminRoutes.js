"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const authMiddleware_1 = require("../middleware/authMiddleware");
const router = express_1.default.Router();
router.use((req, res, next) => {
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
    if (req.method === "OPTIONS") {
        res.sendStatus(204);
        return;
    }
    next();
});
router.get("/fighters/pending", authMiddleware_1.protect, adminController_1.getPendingFighters);
router.patch("/fighters/:id/approve", authMiddleware_1.protect, adminController_1.approveFighter);
router.delete("/fighters/:id", authMiddleware_1.protect, adminController_1.rejectFighter);
router.get("/fighters/verified", authMiddleware_1.protect, adminController_1.getVerifiedFighters);
exports.default = router;
