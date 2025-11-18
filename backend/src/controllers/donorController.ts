import { Request, Response } from "express";
import pool from "../config/db";

interface DonorRegistrationPayload {
  email: string;
  walletAddress?: string;
  logo_url?: string;
}

export const registerDonor = async (
  req: Request<{}, {}, DonorRegistrationPayload>,
  res: Response
) => {
  const { email, walletAddress, logo_url } = req.body;

  if (!email) {
    return res.status(400).json({
      message: "Missing required field: user email.",
    });
  }

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
        SET user_type = 'DONOR', wallet_address = $1
        WHERE id = $2 
        RETURNING id;
    `;
    await pool.query(updateUserQuery, [walletAddress, userId]);

    const insertDonorQuery = `
        INSERT INTO donors (
            email, password, user_id, logo_url
        ) 
        VALUES ($1, $2, $3, $4) 
        RETURNING id;
    `;

    const donorInsertResult = await pool.query(insertDonorQuery, [
      userEmail,
      userPassword,
      userId,
      logo_url,
    ]);

    await pool.query("COMMIT");

    res.status(201).json({
      message: "Donor profile created successfully and user profile updated.",
      donorId: donorInsertResult.rows[0].id,
    });
  } catch (error: any) {
    await pool.query("ROLLBACK");
    console.error("Donor registration failed:", error);

    if (error.code === "23505") {
      return res
        .status(409)
        .json({ message: "This user is already registered as a donor." });
    }

    res.status(500).json({
      message: "An internal server error occurred during registration.",
    });
  }
};
