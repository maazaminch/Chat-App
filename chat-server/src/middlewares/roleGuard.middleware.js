import ApiError from "../utils/apiError.js";

// Middleware to check if user has required role
const roleGuard = (...allowedRoles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new ApiError(401, "User not authenticated"));
        }

        if (!allowedRoles.includes(req.user.role)) {
            return next(new ApiError(403, "Access denied - insufficient permissions"));
        }

        next();
    };
};

export default roleGuard;
