import { Request, Response } from "express";
import db from "../config/db";
import jwt from "jsonwebtoken";

interface FighterFromDB {
  id: number;
  user_id: number | null;
  name: string;
  country: string;
  division: string;
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

const generateToken = (
  id: number,
  emailOrWallet: string,
  user_type: string
) => {
  return jwt.sign(
    { id, emailOrWallet, user_type },
    process.env.JWT_SECRET as string,
    { expiresIn: "30d" }
  );
};

const createRecordString = (w: number, l: number, d: number): string =>
  `${w}-${l}-${d}`;

export const registerFighter = async (req: Request, res: Response) => {
  const {
    name,
    country,
    weight,
    gender,
    division,
    bio,
    image,
    wins,
    losses,
    draws,
    walletAddress,
    achievements,
  } = req.body;

  if (
    !name ||
    !country ||
    !weight ||
    !gender ||
    !division ||
    wins === null ||
    losses === null ||
    draws === null
  ) {
    return res.status(400).json({ message: "Missing required fields." });
  }

  const numericWeight = parseFloat(weight);
  if (isNaN(numericWeight))
    return res.status(400).json({ message: "Weight must be a valid number." });
  if (gender !== "male" && gender !== "female")
    return res
      .status(400)
      .json({ message: 'Gender must be "male" or "female".' });

  const client = await db.connect();
  try {
    await client.query("BEGIN");

    let userId: number | null = null;
    let token: string | null = null;
    let user_type = "FAN";

    if (walletAddress) {
      const usersResult = await client.query(
        "SELECT id, user_type FROM users WHERE wallet_address = $1",
        [walletAddress]
      );
      if (usersResult.rows.length > 0) {
        userId = usersResult.rows[0].id;
        user_type = usersResult.rows[0].user_type;

        const fighterCheck = await client.query(
          "SELECT id FROM fighters WHERE user_id = $1",
          [userId]
        );
        if (fighterCheck.rows.length > 0) {
          await client.query("ROLLBACK");
          return res.status(409).json({
            message:
              "A fighter profile is already associated with this wallet.",
          });
        }
      } else {
        const insertUser = await client.query(
          "INSERT INTO users (wallet_address, user_type, name) VALUES ($1, $2, $3) RETURNING id",
          [walletAddress, "FAN", name]
        );
        userId = insertUser.rows[0].id;
      }
    }

    const achievementsJSON = JSON.stringify(achievements || []);
    const insertFighter = await client.query(
      `INSERT INTO fighters 
        (user_id, name, country, division, weight, gender, wins, losses, draws, image, bio, achievements, sponsors, status) 
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) RETURNING id`,
      [
        userId,
        name,
        country,
        division,
        numericWeight,
        gender,
        Number(wins),
        Number(losses),
        Number(draws),
        image || null,
        bio || null,
        achievementsJSON,
        "[]",
        "pending",
      ]
    );

    await client.query("COMMIT");

    if (userId && walletAddress)
      token = generateToken(userId, walletAddress, user_type);

    res.status(201).json({
      message: "Fighter registration submitted for verification.",
      fighterId: insertFighter.rows[0].id,
      token,
      user_type,
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  } finally {
    client.release();
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
  const { limit, sortBy, nationality } = req.query;

  try {
    let params: any[] = [];
    let sql = `
        SELECT id, name, country, division, weight, gender,
               wins, losses, draws, image, ranking, bio, achievements, sponsors, status
        FROM fighters
        WHERE status = 'verified'
    `;

    if (nationality) {
      params.push(nationality);
      sql += ` AND country = $${params.length}`;
    }

    sql +=
      sortBy === "ranking" ? " ORDER BY ranking ASC" : " ORDER BY name ASC";

    if (limit) {
      params.push(parseInt(limit as string, 10));
      sql += ` LIMIT $${params.length}`;
    }

    const { rows: fightersFromDB } = await db.query<FighterFromDB>(sql, params);

    const fighters = fightersFromDB.map((f) => ({
      id: f.id.toString(),
      name: f.name,
      country: f.country,
      division: f.division,
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
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

export const getFighterById = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const sql = `
      SELECT id, name, country, division, weight, gender,
             wins, losses, draws, image, ranking, bio, 
             achievements, sponsors, status
      FROM fighters
      WHERE id = $1 AND status = 'verified'
    `;

    const { rows } = await db.query(sql, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: "Fighter not found" });
    }

    const f = rows[0];

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
      division: f.division,
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
    console.error("getFighterById error:", err);
    return res.status(500).json({ message: "Server Error" });
  }
};

export const getMyFighterProfile = async (req: Request, res: Response) => {
  const userId = req.user?.id;

  if (!userId) return res.status(401).json({ message: "Not authorized" });

  try {
    const sql = `
            SELECT id, name, country, division, weight, gender,
                   wins, losses, draws, image, ranking, bio, achievements, sponsors, status
            FROM fighters
            WHERE user_id = $1
        `;
    const { rows } = await db.query<FighterFromDB>(sql, [userId]);

    if (rows.length === 0)
      return res
        .status(404)
        .json({ message: "Fighter profile not found for this user." });

    const f = rows[0];

    if (f.status === "pending") {
      return res.status(403).json({
        message: "Your fighter profile is still pending admin approval.",
      });
    }

    const fighter = {
      id: f.id.toString(),
      name: f.name,
      country: f.country,
      division: f.division,
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
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
