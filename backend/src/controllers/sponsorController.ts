import { Request, Response } from "express";
import db from "../config/db";
import { RowDataPacket, OkPacket } from "mysql2";

interface SponsorFromDB extends RowDataPacket {
  id: number;
  user_id: number;
  company_name: string;
  website: string | null;
  logo_url: string | null;
  contact_email: string;
  description: string | null;
  tier: "Gold" | "Silver" | "Bronze" | "Partner";
}

export const createSponsorProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  const { company_name, website, logo_url, contact_email, description, tier } =
    req.body;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  if (!company_name || !contact_email) {
    return res
      .status(400)
      .json({ message: "Company name and contact email are required." });
  }

  try {
    const [existing] = await db.query<SponsorFromDB[]>(
      "SELECT id FROM sponsors WHERE user_id = ?",
      [userId]
    );

    if (existing.length > 0) {
      const updateSql = `
        UPDATE sponsors SET 
        company_name = ?, website = ?, logo_url = ?, contact_email = ?, 
        description = ?, tier = ? 
        WHERE user_id = ?
      `;
      await db.query(updateSql, [
        company_name,
        website || null,
        logo_url || null,
        contact_email,
        description || null,
        tier || "Partner",
        userId,
      ]);
      return res
        .status(200)
        .json({ message: "Sponsor profile updated successfully." });
    } else {
      const insertSql = `
        INSERT INTO sponsors 
        (user_id, company_name, website, logo_url, contact_email, description, tier) 
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;
      const [result] = await db.query<OkPacket>(insertSql, [
        userId,
        company_name,
        website || null,
        logo_url || null,
        contact_email,
        description || null,
        tier || "Partner",
      ]);

      return res.status(201).json({
        message: "Sponsor profile created successfully.",
        sponsorId: result.insertId,
      });
    }
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "Server Error during profile creation/update." });
  }
};

export const getMySponsorProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) {
    return res.status(401).json({ message: "Authentication required." });
  }

  try {
    const sql = `
        SELECT 
          id, 
          user_id, 
          company_name, 
          website, 
          logo_url, 
          contact_email, 
          description, 
          tier
        FROM sponsors 
        WHERE user_id = ?
    `;

    const [rows] = await db.query<RowDataPacket[]>(sql, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Sponsor profile not found." });
    }

    res.status(200).json(rows[0]);
  } catch (error) {
    console.error("Error in getMySponsorProfile:", error);
    res.status(500).json({ message: "Server Error." });
  }
};
