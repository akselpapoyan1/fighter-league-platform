import { Request, Response } from "express";
import pool from "../config/db";

export const getAllDivisions = async (req: Request, res: Response) => {
    try {
        const result = await pool.query(
            `SELECT id, gender, name, weight_max
       FROM divisions
       ORDER BY id ASC`
        );

        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
