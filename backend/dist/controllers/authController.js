"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCurrentUser = exports.verifySignature = exports.connectWallet = exports.loginUser = exports.registerUser = void 0;
const db_1 = __importDefault(require("../config/db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const crypto_1 = require("crypto");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const generateToken = (id, emailOrWallet, user_type) => {
    return jsonwebtoken_1.default.sign({ id, emailOrWallet, user_type }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};
const registerUser = async (req, res) => {
    const { name, email, password, user_type, logo_url, tier } = req.body;
    if (!email || !password || !name || !user_type) {
        return res
            .status(400)
            .json({ message: "Please provide all required fields" });
    }
    const connection = await db_1.default.getConnection();
    try {
        await connection.beginTransaction();
        const [existing] = await connection.query("SELECT id FROM users WHERE email = ?", [email]);
        if (existing.length > 0) {
            await connection.rollback();
            return res
                .status(409)
                .json({ message: "User with this email already exists" });
        }
        const salt = await bcryptjs_1.default.genSalt(10);
        const hashedPassword = await bcryptjs_1.default.hash(password, salt);
        const [userResult] = await connection.query("INSERT INTO users (name, email, password, user_type) VALUES (?, ?, ?, ?)", [name, email, hashedPassword, user_type]);
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
    }
    catch (error) {
        await connection.rollback();
        console.error("Registration Transaction Failed:", error);
        res.status(500).json({ message: "Server Error during registration." });
    }
    finally {
        connection.release();
    }
};
exports.registerUser = registerUser;
const loginUser = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res
            .status(400)
            .json({ message: "Please provide email and password" });
    }
    try {
        const [users] = await db_1.default.query("SELECT id, password, user_type FROM users WHERE email = ?", [email]);
        if (users.length === 0) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const user = users[0];
        const isMatch = await bcryptjs_1.default.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = generateToken(user.id, email, user.user_type);
        res.json({
            message: "Authentication successful",
            token: token,
            user_type: user.user_type,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.loginUser = loginUser;
const connectWallet = async (req, res) => {
    const { walletAddress } = req.body;
    if (!walletAddress) {
        return res.status(400).json({ message: "Wallet address is required" });
    }
    try {
        let [users] = await db_1.default.query("SELECT id, nonce FROM users WHERE wallet_address = ?", [walletAddress]);
        if (users.length === 0) {
            return res
                .status(404)
                .json({ message: "User with this wallet address not found." });
        }
        let user = users[0];
        const nonce = `Sign this message to authenticate: ${(0, crypto_1.randomBytes)(16).toString("hex")}`;
        await db_1.default.query("UPDATE users SET nonce = ? WHERE wallet_address = ?", [
            nonce,
            walletAddress,
        ]);
        user = { ...users[0], nonce };
        res.status(200).json({ messageToSign: user.nonce });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.connectWallet = connectWallet;
const verifySignature = async (req, res) => {
    const { walletAddress, signature } = req.body;
    try {
        const [users] = await db_1.default.query("SELECT id, nonce, user_type FROM users WHERE wallet_address = ?", [walletAddress]);
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
            const [fighterProfile] = await db_1.default.query("SELECT status FROM fighters WHERE user_id = ?", [user.id]);
            if (fighterProfile.length > 0 && fighterProfile[0].status === "pending") {
                return res.status(403).json({
                    message: "Your fighter profile is still pending admin approval.",
                });
            }
        }
        await db_1.default.query("UPDATE users SET nonce = NULL WHERE id = ?", [user.id]);
        const token = generateToken(user.id, walletAddress, user.user_type);
        res.json({
            message: "Authentication successful",
            token: token,
            user_type: user.user_type,
        });
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Verification failed" });
    }
};
exports.verifySignature = verifySignature;
const getCurrentUser = async (req, res) => {
    if (!req.user) {
        return res.status(401).json({ message: "Not authorized" });
    }
    res.status(200).json(req.user);
};
exports.getCurrentUser = getCurrentUser;
