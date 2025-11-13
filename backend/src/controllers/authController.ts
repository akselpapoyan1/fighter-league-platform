import {Request, Response} from "express";
import pool from "../config/db";
import jwt from "jsonwebtoken";
import {randomBytes} from "crypto";
import bcrypt from "bcryptjs";

declare global {
    namespace Express {
        interface Request {
            user?: any;
        }
    }
}

const generateToken = (
    id: number,
    emailOrWallet: string,
    user_type: string
): string => {
    return jwt.sign(
        {id, emailOrWallet, user_type},
        process.env.JWT_SECRET as string,
        {expiresIn: "30d"}
    );
};

export const registerUser = async (req: Request, res: Response) => {
    const {name, email, password, user_type, logo_url, tier} = req.body;

    if (!email || !password || !name || !user_type) {
        return res
            .status(400)
            .json({message: "Please provide all required fields"});
    }

    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const existingRes = await client.query(
            "SELECT id FROM users WHERE email = $1",
            [email]
        );
        if ((existingRes.rowCount ?? 0) > 0) {
            await client.query("ROLLBACK");
            return res.status(409).json({ message: "User with this email already exists" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const insertUserRes = await client.query(
            `INSERT INTO users (name, email, password, user_type)
             VALUES ($1, $2, $3, $4) RETURNING id`,
            [name, email, hashedPassword, user_type]
        );

        const newUserId = insertUserRes.rows[0].id;

        if (user_type === "SPONSOR") {
            if (!logo_url) {
                await client.query("ROLLBACK");
                return res
                    .status(400)
                    .json({message: "Sponsor registration requires a logo."});
            }

            await client.query(
                `INSERT INTO sponsors
                 (user_id, company_name, website, logo_url, contact_email, description, tier)
                 VALUES ($1, $2, NULL, $3, $4, NULL, $5)`,
                [newUserId, name, logo_url, email, tier || "Partner"]
            );
        }

        await client.query("COMMIT");
        const token = generateToken(newUserId, email, user_type);
        res.status(201).json({
            message: "User registered and profile created successfully",
            token,
            user_type,
        });
    } catch (error) {
        await client.query("ROLLBACK");
        console.error("Registration Transaction Failed:", error);
        res.status(500).json({message: "Server Error during registration."});
    } finally {
        client.release();
    }
};

export const loginUser = async (req: Request, res: Response) => {
    const {email, password} = req.body;
    if (!email || !password) {
        return res.status(400).json({message: "Please provide email and password"});
    }

    try {
        const usersRes = await pool.query(
            "SELECT id, password, user_type FROM users WHERE email = $1",
            [email]
        );
        if (usersRes.rowCount === 0) {
            return res.status(401).json({message: "Invalid credentials"});
        }

        const user = usersRes.rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({message: "Invalid credentials"});
        }

        const token = generateToken(user.id, email, user.user_type);
        res.json({
            message: "Authentication successful",
            token,
            user_type: user.user_type,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
};

export const connectWallet = async (req: Request, res: Response) => {
    const {walletAddress} = req.body;
    if (!walletAddress) {
        return res.status(400).json({message: "Wallet address is required"});
    }

    try {
        const usersRes = await pool.query(
            "SELECT id, nonce FROM users WHERE wallet_address = $1",
            [walletAddress]
        );

        if (usersRes.rowCount === 0) {
            return res.status(404).json({message: "User with this wallet address not found."});
        }

        const nonce = `Sign this message to authenticate: ${randomBytes(16).toString("hex")}`;
        await pool.query(
            "UPDATE users SET nonce = $1 WHERE wallet_address = $2",
            [nonce, walletAddress]
        );

        res.status(200).json({messageToSign: nonce});
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Server Error"});
    }
};

export const verifySignature = async (req: Request, res: Response) => {
    const {walletAddress, signature} = req.body;
    try {
        const usersRes = await pool.query(
            "SELECT id, nonce, user_type FROM users WHERE wallet_address = $1",
            [walletAddress]
        );

        if (usersRes.rowCount === 0 || !usersRes.rows[0].nonce) {
            return res.status(404).json({message: "User not found or no nonce. Please connect first."});
        }

        const user = usersRes.rows[0];
        const messageToSign = user.nonce;

        const expectedSignature = `signed_message_placeholder_for_${messageToSign}`;
        if (signature !== expectedSignature) {
            return res.status(401).json({message: "Invalid signature"});
        }

        if (user.user_type === "FAN") {
            const fighterProfileRes = await pool.query(
                "SELECT status FROM fighters WHERE user_id = $1",
                [user.id]
            );
            if ((fighterProfileRes.rowCount ?? 0) > 0 && fighterProfileRes.rows[0].status === "pending") {
                return res.status(403).json({
                    message: "Your fighter profile is still pending admin approval.",
                });
            }
        }

        await pool.query("UPDATE users SET nonce = NULL WHERE id = $1", [user.id]);
        const token = generateToken(user.id, walletAddress, user.user_type);

        res.json({
            message: "Authentication successful",
            token,
            user_type: user.user_type,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({message: "Verification failed"});
    }
};

export const getCurrentUser = async (req: Request, res: Response) => {
    if (!req.user) {
        return res.status(401).json({message: "Not authorized"});
    }
    res.status(200).json(req.user);
};
