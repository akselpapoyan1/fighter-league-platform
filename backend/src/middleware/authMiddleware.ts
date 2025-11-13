import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import db from "../config/db";

export const protect = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    let token;

    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            token = req.headers.authorization.split(" ")[1];

            const decoded = jwt.verify(
                token,
                process.env.JWT_SECRET as string
            ) as JwtPayload;

            const result = await db.query(
                "SELECT id, wallet_address, nationality, is_military FROM users WHERE id = $1",
                [decoded.id]
            );

            const rows = result.rows;

            if (rows.length === 0) {
                return res
                    .status(401)
                    .json({ message: "Not authorized, user not found" });
            }

            req.user = rows[0];
            next();
            return;
        } catch (error) {
            console.error(error);
            return res.status(401).json({ message: "Not authorized, token failed" });
        }
    }

    if (!token) {
        return res.status(401).json({ message: "Not authorized, no token" });
    }

    next();
};
