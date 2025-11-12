import { Request, Response } from "express";
import db from "../config/db";
import jwt from "jsonwebtoken";
import { RowDataPacket, OkPacket } from "mysql2";
import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}
interface UserForNonce extends RowDataPacket {
  id: number;
  nonce: string;
}

const generateToken = (
  id: number,
  emailOrWallet: string,
  user_type: string
): string => {
  return jwt.sign(
    { id, emailOrWallet, user_type },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "30d",
    }
  );
};

export const registerUser = async (req: Request, res: Response) => {
  const { name, email, password, user_type, logo_url, tier } = req.body;

  if (!email || !password || !name || !user_type) {
    return res
      .status(400)
      .json({ message: "Please provide all required fields" });
  }

  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const [existing] = await connection.query<RowDataPacket[]>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      await connection.rollback();
      return res
        .status(409)
        .json({ message: "User with this email already exists" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    const [userResult] = await connection.query<OkPacket>(
      "INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)",
      [name, email, hashedPassword, user_type]
    );
    const newUserId = userResult.insertId;

    if (user_type === "SPONSOR") {
      if (!logo_url) {
        await connection.rollback();
        return res
          .status(400)
          .json({ message: "Sponsor registration requires a logo." });
      }

      const insertSponsorSql = `
            INSERT INTO sponsors 
            (user_id, company_name, website, logo_url, contact_email, description, tier) 
            VALUES (?, ?, NULL, ?, ?, NULL, ?)
        `;
      await connection.query(insertSponsorSql, [
        newUserId,
        name,
        logo_url,
        email,
        tier || "Partner",
      ]);
    }

    await connection.commit();

    const token = generateToken(newUserId, email, user_type);
    res.status(201).json({
      message: "User registered and profile created successfully",
      token: token,
      user_type: user_type,
    });
  } catch (error) {
    await connection.rollback();
    console.error("Registration Transaction Failed:", error);
    res.status(500).json({ message: "Server Error during registration." });
  } finally {
    connection.release();
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
    const [users] = await db.query<RowDataPacket[]>(
      "SELECT id, password, user_type FROM users WHERE email = ?",
      [email]
    );
    if (users.length === 0) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const user = users[0];
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = generateToken(user.id, email, user.user_type);
    res.json({
      message: "Authentication successful",
      token: token,
      user_type: user.user_type,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const connectWallet = async (req: Request, res: Response) => {
  const { walletAddress } = req.body;
  if (!walletAddress) {
    return res.status(400).json({ message: "Wallet address is required" });
  }
  try {
    let [users] = await db.query<UserForNonce[]>(
      "SELECT id, nonce FROM users WHERE wallet_address = ?",
      [walletAddress]
    );
    if (users.length === 0) {
      return res
        .status(404)
        .json({ message: "User with this wallet address not found." });
    }
    let user = users[0];
    const nonce = `Sign this message to authenticate: ${randomBytes(
      16
    ).toString("hex")}`;
    await db.query("UPDATE users SET nonce = ? WHERE wallet_address = ?", [
      nonce,
      walletAddress,
    ]);
    user = { ...users[0], nonce };
    res.status(200).json({ messageToSign: user.nonce });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};

export const verifySignature = async (req: Request, res: Response) => {
  const { walletAddress, signature } = req.body;
  try {
    const [users] = await db.query<RowDataPacket[]>(
      "SELECT id, nonce, user_type FROM users WHERE wallet_address = ?",
      [walletAddress]
    );
    if (users.length === 0 || !users[0].nonce) {
      return res
        .status(404)
        .json({ message: "User not found or no nonce. Please connect first." });
    }
    const user = users[0];
    const messageToSign = user.nonce;

    const expectedSignature = `signed_message_placeholder_for_${messageToSign}`;

    if (signature !== expectedSignature) {
      return res.status(401).json({ message: "Invalid signature" });
    }

    if (user.user_type === "FAN") {
      const [fighterProfile] = await db.query<RowDataPacket[]>(
        "SELECT status FROM fighters WHERE user_id = ?",
        [user.id]
      );

      if (fighterProfile.length > 0 && fighterProfile[0].status === "pending") {
        return res.status(403).json({
          message: "Your fighter profile is still pending admin approval.",
        });
      }
    }

    await db.query("UPDATE users SET nonce = NULL WHERE id = ?", [user.id]);
    const token = generateToken(user.id, walletAddress, user.user_type);

    res.json({
      message: "Authentication successful",
      token: token,
      user_type: user.user_type,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Verification failed" });
  }
};

export const getCurrentUser = async (req: Request, res: Response) => {
  if (!req.user) {
    return res.status(401).json({ message: "Not authorized" });
  }
  res.status(200).json(req.user);
};
