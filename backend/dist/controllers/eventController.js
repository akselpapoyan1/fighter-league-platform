"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllEvents = void 0;
const db_1 = __importDefault(require("../config/db"));
const getAllEvents = async (req, res) => {
    const { status } = req.query;
    try {
        let sql = "SELECT * FROM events ORDER BY event_date DESC";
        let params = [];
        if (status) {
            sql = "SELECT * FROM events WHERE status = ? ORDER BY event_date DESC";
            params.push(status);
        }
        const [events] = await db_1.default.query(sql, params);
        res.status(200).json(events);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getAllEvents = getAllEvents;
