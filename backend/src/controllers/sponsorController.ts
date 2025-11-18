import { Request, Response } from "express";
import pool from "../config/db";

interface SponsorRegistrationPayload {
  email: string;
  companyName: string;
  logoUrl: string;
  description: string;
  tier: string;
  walletAddress?: string;
  user_type: string;
}

export const registerSponsor = async (
  req: Request<{}, {}, SponsorRegistrationPayload>,
  res: Response
) => {
  const { email, companyName, logoUrl, description, tier, walletAddress } =
    req.body;
  console.log('AAAAAAAAA')
  if (!email || !companyName || !logoUrl) {
    return res.status(400).json({
      message:
        "Missing required fields: user email, company name, and logo URL.",
    });
  }

  const sponsorTier = tier || "Partner";

  try {
    await pool.query("BEGIN");
    const userResult = await pool.query(
      "SELECT id, email, password FROM users WHERE email = $1",
      [email]
    );

    if (userResult.rows.length === 0) {
      await pool.query("ROLLBACK");
      return res.status(404).json({ message: "User not found." });
    }

    const userId = userResult.rows[0].id;
    const userEmail = userResult.rows[0].email;
    const userPassword = userResult.rows[0].password;

    const updateUserQuery = `
        UPDATE users 
        SET user_type = 'SPONSOR', wallet_address = $1
        WHERE id = $2 
        RETURNING id;
    `;
    await pool.query(updateUserQuery, [walletAddress, userId]);

    const insertSponsorQuery = `
        INSERT INTO sponsors (
            email, password, user_id, company_name, logo_url, description, tier
        ) 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING id;
    `;

    const sponsorInsertResult = await pool.query(insertSponsorQuery, [
      userEmail,
      userPassword,
      userId,
       companyName,
      logoUrl,
      description,
      sponsorTier,
    ]);

    await pool.query("COMMIT");

    res.status(201).json({
      message:
        "Sponsor registration completed successfully and user profile updated.",
      sponsorId: sponsorInsertResult.rows[0].id,
    });
  } catch (error: any) {
    await pool.query("ROLLBACK");
    console.error("Sponsor registration failed:", error);

    if (error.code === "23505") {
      return res.status(409).json({
        message:
          "This user is already registered as a sponsor or the contact email is already used.",
      });
    }

    res.status(500).json({
      message: "An internal server error occurred during registration.",
    });
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
