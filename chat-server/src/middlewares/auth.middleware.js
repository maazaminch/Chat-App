import jwt from "jsonwebtoken";
import env from "../config/env.js";
import User from "../models/user.model.js";


const verifyToken = async (req, res, next) => {
    try {
    
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;
    if(!token){
        return res.status(401).json({ message: "No token provided" });
    }
    
    const decoded = jwt.verify(token , env.JWT_ACCESS_SECRET);
    if(!decoded){
        return res.status(401).json({ message: "Invalid token" });
    }

    const user = await User.findById(decoded.id).select("-password");
    if(!user){
        return res.status(404).json({ message: "User not found" });
    }

    req.user = user;
    next();

    } catch (error) {
        if (error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError ||
            error instanceof jwt.NotBeforeError) {
            return res.status(401).json({
                message: "Invalid or expired token",
            });
        }

        next(error);
    }
}

export default verifyToken;
export { verifyToken as verifyJWT };