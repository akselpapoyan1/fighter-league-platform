"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMyFighterProfile = exports.getFighterById = exports.getAllFighters = exports.registerFighter = void 0;
const db_1 = __importDefault(require("../config/db"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const generateToken = (id, emailOrWallet, user_type) => {
    return jsonwebtoken_1.default.sign({ id, emailOrWallet, user_type }, process.env.JWT_SECRET, {
        expiresIn: "30d",
    });
};
const createRecordString = (w, l, d) => {
    return `${w}-${l}-${d}`;
};
const registerFighter = async (req, res) => {
    const { name, country, weight, gender, division, bio, image, wins, losses, draws, walletAddress, achievements, } = req.body;
    if (!name ||
        !country ||
        !weight ||
        !gender ||
        !division ||
        wins === null ||
        losses === null ||
        draws === null) {
        return res.status(400).json({
            message: "Missing required fields: name, country, weight, gender, division, wins, losses, draws.",
        });
    }
    const numericWeight = parseFloat(weight);
    if (isNaN(numericWeight)) {
        return res.status(400).json({ message: "Weight must be a valid number." });
    }
    if (gender !== "male" && gender !== "female") {
        return res
            .status(400)
            .json({ message: 'Gender must be "male" or "female".' });
    }
    const connection = await db_1.default.getConnection();
    try {
        await connection.beginTransaction();
        let userId = null;
        let token = null;
        let user_type = "FAN";
        if (walletAddress) {
            const [users] = await connection.query("SELECT id, user_type FROM users WHERE wallet_address = ?", [walletAddress]);
            if (users.length > 0) {
                userId = users[0].id;
                user_type = users[0].user_type;
                const [existingFighter] = await connection.query("SELECT id FROM fighters WHERE user_id = ?", [userId]);
                if (existingFighter.length > 0) {
                    await connection.rollback();
                    return res
                        .status(409)
                        .json({
                        message: "A fighter profile is already associated with this wallet.",
                    });
                }
            }
            else {
                const [result] = await connection.query("INSERT INTO users (wallet_address, user_type, name) VALUES (?, ?, ?)", [walletAddress, "FAN", name]);
                userId = result.insertId;
                user_type = "FAN";
            }
        }
        const sql = `
      INSERT INTO fighters 
      (user_id, name, country, division, weight, gender, wins, losses, draws, image, bio, achievements, sponsors, status) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
        const achievementsJSON = JSON.stringify(achievements || []);
        const [result] = await connection.query(sql, [
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
        ]);
        await connection.commit();
        if (userId && walletAddress) {
            token = generateToken(userId, walletAddress, user_type);
        }
        res.status(201).json({
            message: "Fighter registration submitted for verification.",
            fighterId: result.insertId,
            token: token,
            user_type: user_type,
        });
    }
    catch (error) {
        await connection.rollback();
        console.error(error);
        if (error.code === "ER_DUP_ENTRY") {
            return res.status(409).json({
                message: "A fighter with this name may already exist.",
            });
        }
        res.status(500).json({ message: "Server Error" });
    }
    finally {
        connection.release();
    }
};
exports.registerFighter = registerFighter;
const getAllFighters = async (req, res) => {
    const { limit, sortBy, nationality } = req.query;
    try {
        let params = [];
        let sql = `
        SELECT 
          id, name, country, division, weight, gender, 
          wins, losses, draws, image, ranking, bio, achievements, sponsors, status
        FROM fighters
        WHERE status = 'verified'
    `;
        if (nationality) {
            sql += " AND country = ?";
            params.push(nationality);
        }
        if (sortBy === "ranking") {
            sql += " ORDER BY ranking ASC";
        }
        else {
            sql += " ORDER BY name ASC";
        }
        if (limit) {
            sql += " LIMIT ?";
            params.push(parseInt(limit, 10));
        }
        const [fightersFromDB] = await db_1.default.query(sql, params);
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
            achievements: JSON.parse(f.achievements || "[]"),
            sponsors: JSON.parse(f.sponsors || "[]"),
        }));
        res.status(200).json(fighters);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getAllFighters = getAllFighters;
const getFighterById = async (req, res) => {
    const { id } = req.params;
    try {
        const sql = `
        SELECT 
          id, name, country, division, weight, gender, 
          wins, losses, draws, image, ranking, bio, achievements, sponsors, status
        FROM fighters
        WHERE id = ? AND status = 'verified'
    `;
        const [rows] = await db_1.default.query(sql, [id]);
        if (rows.length === 0) {
            return res.status(404).json({ message: "Fighter not found" });
        }
        const f = rows[0];
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getFighterById = getFighterById;
const getMyFighterProfile = async (req, res) => {
    const userId = req.user?.id;
    if (!userId) {
        return res.status(401).json({ message: "Not authorized" });
    }
    try {
        const sql = `
        SELECT 
          id, name, country, division, weight, gender, 
          wins, losses, draws, image, ranking, bio, achievements, sponsors, status
        FROM fighters
        WHERE user_id = ?
    `;
        const [rows] = await db_1.default.query(sql, [userId]);
        if (rows.length === 0) {
            return res
                .status(404)
                .json({ message: "Fighter profile not found for this user." });
        }
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
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: "Server Error" });
    }
};
exports.getMyFighterProfile = getMyFighterProfile;
