// import { Request, Response } from "express";
// import { DIVISIONS } from "../config/division";

// export const getAllDivisions = (req: Request, res: Response) => {
//   try {
//     res.status(200).json(DIVISIONS);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: "Server Error" });
//   }
// };sdssdsd

import { Request, Response } from "express";
import pool from "../config/db";

export const getAllDivisions = async (req: Request, res: Response) => {
  try {
    const result = await pool.query(
      `SELECT id, gender, name, min_weight, max_weight
       FROM divisions
       ORDER BY id ASC`
    );

    res.status(200).json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
