import { Request, Response } from "express";
import db from "../config/db";
import jwt, { JwtPayload } from "jsonwebtoken";
import { QueryResult } from "pg";
interface FighterFromDB {
  id: number;
  user_id: number | null;
  name: string;
  country: string;
  division_name: string;
  weight: number;
  gender: "male" | "female";
  wins: number;
  losses: number;
  draws: number;
  image: string;
  ranking: number | null;
  bio: string | null;
  achievements: string | null;
  sponsors: string | null;
  status: "pending" | "verified" | "inactive";
}

const divisionMap: { [key: string]: number } = {
  Lightweight: 1,
  Welterweight: 2,
  "Light Heavyweight": 3,
  Heavyweight: 4,
  Flyweight: 5,
  Bantamweight: 6,
  "Open/Heavyweight": 7,
};

const generateToken = (id: number, email: string, user_type: string) => {
  return jwt.sign({ id, email, user_type }, process.env.JWT_SECRET as string, {
    expiresIn: "30d",
  });
};

const createRecordString = (w: number, l: number, d: number): string =>
  `${w}-${l}-${d}`;

export const registerFighter = async (
  req: Request<{}, {}, any>,
  res: Response
) => {
  const {
    email,
    country,
    walletAddress,
    weight,
    gender,
    division,
    wins,
    losses,
    draws,
    image,
    bio,
    achievements,
  } = req.body;

  if (!email || !country || !weight || !gender || !division || !image) {
    return res
      .status(400)
      .json({ message: "Missing required fighter fields." });
  }

  const divisionId = divisionMap[division];

  if (!divisionId) {
    return res.status(400).json({ message: "Invalid division name provided." });
  }

  const achievementsJson = JSON.stringify(achievements || []);

  try {
    await db.query("BEGIN");

    const userResult = await db.query(
      "SELECT id, name FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      await db.query("ROLLBACK");
      return res.status(404).json({ message: "User not found." });
    }

    const userId = userResult.rows[0].id;
    const userName = userResult.rows[0].name;

    const updateUserQuery = `
            UPDATE users 
            SET user_type = 'FIGHTER', wallet_address = $1, country = $2
            WHERE id = $3;
        `;
    await db.query(updateUserQuery, [walletAddress, country, userId]);

    const insertFighterQuery = `
            INSERT INTO fighters (
                user_id, name, country, division_id, division, weight, gender, 
                wins, losses, draws, image, bio, achievements, status
            ) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, 'pending')
            RETURNING id;
        `;

    const fighterInsertResult = await db.query(insertFighterQuery, [
      userId,
      userName,
      country,
      divisionId,
      division,
      weight,
      gender,
      wins || 0,
      losses || 0,
      draws || 0,
      image,
      bio,
      achievementsJson,
    ]);

    await db.query("COMMIT");

    res.status(201).json({
      message:
        "Fighter registration submitted successfully and user profile updated.",
      fighterId: fighterInsertResult.rows[0].id,
    });
  } catch (error) {
    await db.query("ROLLBACK");
    console.error("Fighter registration failed:", error);
    res.status(500).json({
      message: "An internal server error occurred during registration.",
    });
  }
};

const safeParseJSON = (value: string | null): any[] => {
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [parsed];
  } catch {
    return [value];
  }
};

export const getAllFighters = async (req: Request, res: Response) => {
  const { limit, sortBy, country } = req.query;

  try {
    let params: any[] = [];
    let sql = `
          SELECT 
          f.id, 
          f.name, 
          f.country, 
          f.weight, 
          f.gender,
          f.wins, 
          f.losses, 
          f.draws, 
          f.image, 
          f.ranking, 
          f.bio, 
          f.achievements, 
          f.status,
          f.sponsors,
          d.name AS division_name
        FROM fighters f
        JOIN divisions d ON f.division_id = d.id
        WHERE f.status = 'verified'

    `;

    if (country) {
      params.push(country);
      sql += ` AND f.country = $${params.length}`;
    }

    sql +=
      sortBy === "ranking" ? " ORDER BY f.ranking ASC" : " ORDER BY f.name ASC";

    if (limit) {
      params.push(parseInt(limit as string, 10));
      sql += ` LIMIT $${params.length}`;
    }

    const result: QueryResult = await db.query(sql, params);

    const fighters = result.rows.map((f: any) => ({
      id: f.id.toString(),
      name: f.name,
      country: f.country,
      division: f.division_name,
      weight: f.weight,
      gender: f.gender,
      record: createRecordString(f.wins, f.losses, f.draws),
      wins: f.wins,
      losses: f.losses,
      draws: f.draws,
      image: f.image,
      ranking: f.ranking || undefined,
      bio: f.bio || undefined,
      achievements: safeParseJSON(f.achievements),
      sponsors: safeParseJSON(f.sponsors),
    }));

    res.status(200).json(fighters);
  } catch (err) {
    console.error("Error in getAllFighters (PostgreSQL):", err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getFighterById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const sql = `
      SELECT 
        f.id, 
        f.name, 
        f.country, 
        f.weight, 
        f.gender,
        f.wins, 
        f.losses, 
        f.draws, 
        f.image, 
        f.ranking, 
        f.bio, 
        f.achievements, 
        f.sponsors, 
        f.status,
        d.name AS division_name
      FROM fighters f
      JOIN divisions d ON f.division_id = d.id
      WHERE f.id = $1 AND f.status = 'verified'
    `;

    const result: QueryResult = await db.query(sql, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Fighter not found" });
    }

    const f = result.rows[0];

    const safeParse = (value: any) => {
      if (Array.isArray(value)) return value;
      if (!value) return [];
      try {
        return typeof value === "string" ? JSON.parse(value) : value;
      } catch {
        return [];
      }
    };

    const fighter = {
      id: f.id.toString(),
      name: f.name,
      country: f.country,
      division: f.division_name,
      weight: f.weight,
      gender: f.gender,
      record: `${f.wins}-${f.losses}-${f.draws}`,
      wins: f.wins,
      losses: f.losses,
      draws: f.draws,
      image: f.image,
      ranking: f.ranking || undefined,
      bio: f.bio || undefined,
      achievements: safeParse(f.achievements),
      sponsors: safeParse(f.sponsors),
    };

    return res.status(200).json(fighter);
  } catch (err) {
    console.error("getFighterById error (PostgreSQL):", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getMyFighterProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Not authorized" });

  try {
    const sql = `
            SELECT 
                f.id, 
                f.name, 
                f.country, 
                f.weight, 
                f.gender,
                f.wins, 
                f.losses, 
                f.draws, 
                f.image, 
                f.ranking, 
                f.bio, 
                f.achievements, 
                f.sponsors, 
                f.status,
                d.name AS division_name
            FROM fighters f
            JOIN divisions d ON f.division_id = d.id
            WHERE f.user_id = $1
        `;

    const result: QueryResult = await db.query(sql, [userId]);

    if (result.rows.length === 0)
      return res
        .status(404)
        .json({ message: "Fighter profile not found for this user." });

    const f = result.rows[0];

    if (f.status === "pending") {
      return res.status(403).json({
        message: "Your fighter profile is still pending admin approval.",
      });
    }

    const fighter = {
      id: f.id.toString(),
      name: f.name,
      country: f.country,
      division: f.division_name,
      weight: f.weight,
      gender: f.gender,
      record: createRecordString(f.wins, f.losses, f.draws),
      wins: f.wins,
      losses: f.losses,
      draws: f.draws,
      image: f.image,
      ranking: f.ranking || undefined,
      bio: f.bio || undefined,
      achievements: JSON.parse(f.achievements || "[]"),
      sponsors: JSON.parse(f.sponsors || "[]"),
    };

    res.status(200).json(fighter);
  } catch (err) {
    console.error("getMyFighterProfile error (PostgreSQL):", err);
    res.status(500).json({ message: "Server Error" });
  }
};
