import { Request, Response } from "express";
import pool from "../config/db";

export const getNationData = async (req: Request, res: Response) => {
    const { countryCode } = req.params;

    try {
        const result = await pool.query(
            `SELECT id, name, status, wins, losses 
       FROM fighters 
       WHERE country = $1 AND status = 'verified'`,
            [countryCode]
        );

        const nationData = {
            country: countryCode,
            fighters: result.rows,
        };

        res.status(200).json(nationData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
