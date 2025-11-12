"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDivisions = void 0;
const division_1 = require("../config/division");
const getAllDivisions = (req, res) => {
    try {
        res.status(200).json(division_1.DIVISIONS);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getAllDivisions = getAllDivisions;
