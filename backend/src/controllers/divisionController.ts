import { Request, Response } from "express";
import { DIVISIONS } from "../config/division";

export const getAllDivisions = (req: Request, res: Response) => {
  try {
    res.status(200).json(DIVISIONS);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
