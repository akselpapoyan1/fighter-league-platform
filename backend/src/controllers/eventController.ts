import { Request, Response } from "express";
import db from "../config/db";
import { RowDataPacket } from "mysql2";

interface EventFromDB extends RowDataPacket {
  id: number;
  title: string;
  event_date: string;
  location: string;
  division: string;
  status: "upcoming" | "completed" | "live";
}

export const getAllEvents = async (req: Request, res: Response) => {
  const { status } = req.query;

  try {
    let sql = "SELECT * FROM events ORDER BY event_date DESC";
    let params: string[] = [];

    if (status) {
      sql = "SELECT * FROM events WHERE status = ? ORDER BY event_date DESC";
      params.push(status as string);
    }

    const [events] = await db.query<EventFromDB[]>(sql, params);
    res.status(200).json(events);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
