"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.rejectFighter = exports.approveFighter = exports.getVerifiedFighters = exports.getPendingFighters = void 0;
const db_1 = __importDefault(require("../config/db"));
const getPendingFighters = async (req, res) => {
    try {
        const sql = `
      SELECT id, name, country, division, weight, gender, wins, losses, draws
      FROM fighters
      WHERE status = 'pending'
      ORDER BY id ASC
    `;
        const [fighters] = await db_1.default.query(sql);
        res.status(200).json(fighters);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getPendingFighters = getPendingFighters;
const getVerifiedFighters = async (req, res) => {
    try {
        const sql = `
      SELECT id, name, country, division, weight, gender, wins, losses, draws
      FROM fighters
      WHERE status = 'verified'
      ORDER BY name ASC
    `;
        const [fighters] = await db_1.default.query(sql);
        res.status(200).json(fighters);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getVerifiedFighters = getVerifiedFighters;
const approveFighter = async (req, res) => {
    const { id } = req.params;
    const connection = await db_1.default.getConnection();
    try {
        await connection.beginTransaction();
        const updateFighterSql = `
      UPDATE fighters 
      SET status = 'verified' 
      WHERE id = ? AND status = 'pending'
    `;
        const [result] = await connection.query(updateFighterSql, [id]);
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res
                .status(404)
                .json({ message: "Fighter not found or was not pending." });
        }
        const [rows] = await connection.query("SELECT user_id FROM fighters WHERE id = ?", [id]);
        const userId = rows[0]?.user_id;
        if (userId) {
            const updateUserSql = `
        UPDATE users 
        SET user_type = 'FIGHTER' 
        WHERE id = ?
      `;
            await connection.query(updateUserSql, [userId]);
        }
        await connection.commit();
        res.status(200).json({ message: `Fighter ${id} approved.` });
    }
    catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
    finally {
        connection.release();
    }
};
exports.approveFighter = approveFighter;
const rejectFighter = async (req, res) => {
    const { id } = req.params;
    const connection = await db_1.default.getConnection();
    try {
        await connection.beginTransaction();
        const [rows] = await connection.query("SELECT user_id FROM fighters WHERE id = ?", [id]);
        const userId = rows[0]?.user_id;
        const deleteFighterSql = "DELETE FROM fighters WHERE id = ?";
        const [result] = await connection.query(deleteFighterSql, [id]);
        if (result.affectedRows === 0) {
            await connection.rollback();
            return res.status(404).json({ message: "Fighter not found." });
        }
        if (userId) {
            const deleteUserSql = "DELETE FROM users WHERE id = ?";
            await connection.query(deleteUserSql, [userId]);
        }
        await connection.commit();
        res.status(200).json({ message: `Fighter ${id} deleted.` });
    }
    catch (error) {
        await connection.rollback();
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
    finally {
        connection.release();
    }
};
exports.rejectFighter = rejectFighter;
