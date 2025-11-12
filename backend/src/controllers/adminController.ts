import { Request, Response } from "express";
import db from "../config/db";
import { RowDataPacket, OkPacket } from "mysql2";

export const getPendingFighters = async (req: Request, res: Response) => {
  try {
    const sql = `
      SELECT id, name, country, division, weight, gender, wins, losses, draws
      FROM fighters
      WHERE status = 'pending'
      ORDER BY id ASC
    `;
    const [fighters] = await db.query<RowDataPacket[]>(sql);
    res.status(200).json(fighters);
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
    const [fighters] = await db.query<RowDataPacket[]>(sql);
    res.status(200).json(fighters);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const approveFighter = async (req: Request, res: Response) => {
  const { id } = req.params;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const updateFighterSql = `
      UPDATE fighters 
      SET status = 'verified' 
      WHERE id = ? AND status = 'pending'
    `;
    const [result] = await connection.query<OkPacket>(updateFighterSql, [id]);

    if (result.affectedRows === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ message: "Fighter not found or was not pending." });
    }

    const [rows] = await connection.query<RowDataPacket[]>(
      "SELECT user_id FROM fighters WHERE id = ?",
      [id]
    );
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
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    connection.release();
  }
};

export const rejectFighter = async (req: Request, res: Response) => {
  const { id } = req.params;
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [rows] = await connection.query<RowDataPacket[]>(
      "SELECT user_id FROM fighters WHERE id = ?",
      [id]
    );
    const userId = rows[0]?.user_id;

    const deleteFighterSql = "DELETE FROM fighters WHERE id = ?";
    const [result] = await connection.query<OkPacket>(deleteFighterSql, [id]);

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
  } catch (error) {
    await connection.rollback();
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    connection.release();
  }
};
