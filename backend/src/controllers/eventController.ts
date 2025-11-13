import { Request, Response } from "express";
import pool from "../config/db";

export const getAllEvents = async (req: Request, res: Response) => {
    const { status } = req.query;

    try {
        let sql = `SELECT id, title, event_date, location, division, status
               FROM events
               ORDER BY event_date DESC`;
        const params: string[] = [];

        if (status) {
            sql = `SELECT id, title, event_date, location, division, status
             FROM events
             WHERE status = $1
             ORDER BY event_date DESC`;
            params.push(status as string);
        }

        const result = await pool.query(sql, params);
        res.status(200).json(result.rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
