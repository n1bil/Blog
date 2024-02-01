import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserAuth } from "../types/authenticatedCreatePostRequest";

interface AuthenticatedRequest extends Request {
    user?: UserAuth;
}

export const auth = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];

    if (token == null) {
        return res.status(401).json({ error: "No access token" });
    }

    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {      // decoded: { _id: '65a4628006cb0a2a3c3c83e6', iat: 1705506687 }
        if (err) {
            return res.status(403).json({ error: "Access token is invalid" });
        }
        
        req.user = decoded as UserAuth;
        next();
    });
};