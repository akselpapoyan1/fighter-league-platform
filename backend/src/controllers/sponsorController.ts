import { Request, Response } from "express";
import pool from "../config/db"; // PostgreSQL pool

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
        const existingResult = await pool.query(
            `SELECT id FROM sponsors WHERE user_id = $1`,
            [userId]
        );

        if (existingResult.rows.length > 0) {
            // Update existing sponsor
            const updateSql = `
                UPDATE sponsors SET
                                    company_name = $1,
                                    website = $2,
                                    logo_url = $3,
                                    contact_email = $4,
                                    description = $5,
                                    tier = $6
                WHERE user_id = $7
            `;
            await pool.query(updateSql, [
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
            // Insert new sponsor
            const insertSql = `
                INSERT INTO sponsors
                (user_id, company_name, website, logo_url, contact_email, description, tier)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING id
            `;
            const insertResult = await pool.query(insertSql, [
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
                sponsorId: insertResult.rows[0].id,
            });
        }
    } catch (error) {
        console.error("Error in createSponsorProfile:", error);
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
            SELECT id, user_id, company_name, website, logo_url, contact_email, description, tier
            FROM sponsors
            WHERE user_id = $1
        `;
        const result = await pool.query(sql, [userId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ message: "Sponsor profile not found." });
        }

        res.status(200).json(result.rows[0]);
    } catch (error) {
        console.error("Error in getMySponsorProfile:", error);
        res.status(500).json({ message: "Server Error." });
    }
};
