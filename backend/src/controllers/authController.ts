import { Request, Response } from "express";
import db from "../config/db";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";
import { QueryResult } from "pg";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const generateToken = (
  id: number,
  email: string,
  user_type: string,
  name?: string
): string => {
  return jwt.sign(
    { id, email, user_type, name },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "30d",
    }
  );
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, user_type } = req.body;

  if (!email || !password || !name || !user_type) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  try {
    const existingResult: QueryResult = await db.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingResult.rows.length > 0) {
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const insertResult: QueryResult = await db.query(
      `INSERT INTO users (
          name, 
          email, 
          password, 
          user_type, 
          wallet_address, 
          nonce,
          country,
          is_military
       ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
       RETURNING id`,
      [name, email, hashedPassword, user_type, null, null, null, false]
    );

    const newUserId = insertResult.rows[0].id;

    const token = generateToken(newUserId, email, user_type, name);

    res.status(201).json({
      message: "User registered successfully",
      token: token,
      user_type: user_type,
    });
  } catch (error) {
    console.error("Registration failed:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const loginUser = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(400)
      .json({ message: "Please provide email and password" });
  }

  try {
    const usersResult: QueryResult = await db.query(
      "SELECT id, name, email, password, user_type, wallet_address, name FROM users WHERE email = $1",
      [email]
    );

    if (usersResult.rows.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const user = usersResult.rows[0];

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const userEmail = user.email;
    const token = generateToken(user.id, userEmail, user.user_type, user.name);

    res.json({
      message: "Authentication successful",
      token: token,
      user_type: user.user_type,

      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        wallet_address: user.wallet_address,
        user_type: user.user_type,
      },
    });
  } catch (error) {
    console.error("Login failed:", error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const connectWallet = async (req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented for Postgres yet" });
};

export const verifySignature = async (req: Request, res: Response) => {
  res.status(501).json({ message: "Not implemented for Postgres yet" });
};

export const getCurrentUser = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  res.status(200).json(req.user);
};
