import { Request, Response } from "express";
import pool from "../config/db";

export const getPendingFighters = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT id, name, country, division, weight, gender, wins, losses, draws
            FROM fighters
            WHERE status = 'pending'
            ORDER BY id ASC
        `;
        const { rows } = await pool.query(sql);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const getVerifiedFighters = async (req: Request, res: Response) => {
    try {
        const sql = `
            SELECT id, name, country, division, weight, gender, wins, losses, draws
            FROM fighters
            WHERE status = 'verified'
            ORDER BY name ASC
        `;
        const { rows } = await pool.query(sql);
        res.status(200).json(rows);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};

export const approveFighter = async (req: Request, res: Response) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const updateFighterSql = `
            UPDATE fighters
            SET status = 'verified'
            WHERE id = $1 AND status = 'pending'
                RETURNING user_id
        `;
        const result = await client.query(updateFighterSql, [id]);

        if (result.rowCount === 0) {
            await client.query("ROLLBACK");
            return res
                .status(404)
                .json({ message: "Fighter not found or was not pending." });
        }

        const userId = result.rows[0].user_id;
        if (userId) {
            const updateUserSql = `
                UPDATE users
                SET user_type = 'FIGHTER'
                WHERE id = $1
            `;
            await client.query(updateUserSql, [userId]);
        }

        await client.query("COMMIT");
        res.status(200).json({ message: `Fighter ${id} approved.` });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    } finally {
        client.release();
    }
};

export const rejectFighter = async (req: Request, res: Response) => {
    const { id } = req.params;
    const client = await pool.connect();

    try {
        await client.query("BEGIN");

        const fighterRes = await client.query(
            "SELECT user_id FROM fighters WHERE id = $1",
            [id]
        );
        const userId = fighterRes.rows[0]?.user_id;

        const deleteFighterSql = "DELETE FROM fighters WHERE id = $1";
        const deleteResult = await client.query(deleteFighterSql, [id]);

        if (deleteResult.rowCount === 0) {
            await client.query("ROLLBACK");
            return res.status(404).json({ message: "Fighter not found." });
        }

        if (userId) {
            const deleteUserSql = "DELETE FROM users WHERE id = $1";
            await client.query(deleteUserSql, [userId]);
        }

        await client.query("COMMIT");
        res.status(200).json({ message: `Fighter ${id} deleted.` });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    } finally {
        client.release();
    }
};
