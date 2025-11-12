"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getNationData = void 0;
const db_1 = __importDefault(require("../config/db"));
const getNationData = async (req, res) => {
    const { countryCode } = req.params;
    try {
        const [fighters] = await db_1.default.query('SELECT id, name, status, wins, losses FROM fighters WHERE nationality = ? AND status = "verified"', [countryCode]);
        const nationData = {
            country: countryCode,
            fighters: fighters,
        };
        res.status(200).json(nationData);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getNationData = getNationData;
