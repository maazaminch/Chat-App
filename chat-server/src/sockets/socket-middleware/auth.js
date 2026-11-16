import jwt from "jsonwebtoken";
import env from "../../config/env.js";
import User from "../../models/user.model.js";

const authSocketMiddleware = async (socket, next) => {
    
    try {
     const token = socket.handshake.auth.token;
     if(!token) {
        return next(new Error("Unauthorized"));
     }
     
     const decoded = jwt.verify(token, env.JWT_ACCESS_SECRET);
     if(!decoded) {
        return next(new Error("Unauthorized"));
     }
     
     const user = await User.findById(decoded.id).select("-password");
     if(!user) {
        return next(new Error("Unauthorized"));
     }
     
     socket.data.userId = user._id.toString();
     socket.data.name = user.name;
     next();
    } catch (error) {
        if (
            error instanceof jwt.JsonWebTokenError ||
            error instanceof jwt.TokenExpiredError ||
            error instanceof jwt.NotBeforeError
        ) {
            return next(new Error("Unauthorized"));
        }

        return next(new Error("Internal server error"));
    }
}

export default authSocketMiddleware;