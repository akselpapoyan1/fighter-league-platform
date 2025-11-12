import { Request, Response } from "express";
import db from "../config/db";
import { RowDataPacket } from "mysql2";

interface NationFighter extends RowDataPacket {
  id: number;
  name: string;
  status: string;
  wins: number;
  losses: number;
}

export const getNationData = async (req: Request, res: Response) => {
  const { countryCode } = req.params;

  try {
    const [fighters] = await db.query<NationFighter[]>(
      'SELECT id, name, status, wins, losses FROM fighters WHERE nationality = ? AND status = "verified"',
      [countryCode]
    );

    const nationData = {
      country: countryCode,
      fighters: fighters,
    };

    res.status(200).json(nationData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
