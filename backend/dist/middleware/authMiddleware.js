"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const db_1 = __importDefault(require("../config/db"));
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")) {
        try {
            token = req.headers.authorization.split(" ")[1];
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const [rows] = await db_1.default.query("SELECT id, wallet_address, nationality, is_military FROM users WHERE id = ?", [decoded.id]);
            if (rows.length === 0) {
                return res
                    .status(401)
                    .json({ message: "Not authorized, user not found" });
            }
            req.user = rows[0];
            next();
            return;
        }
        catch (error) {
            console.error(error);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }
    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }
    next();
};
exports.protect = protect;
