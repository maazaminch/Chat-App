import ApiError from "../utils/apiError.js";
import ApiResponse from "../utils/apiResponse.js";
import mongoose from "mongoose";
import multer from "multer";
import { ZodError } from "zod";

// Error Handler concept
// Remember “Catch, Translate, Respond, Log”:

// Catch: all errors land in one place
// Translate: convert Zod/DB/JWT errors into your ApiError style
// Respond: send a clean, consistent response, hiding internals
// Log: record the full details on the server

const errorHandler = (err, req, res, next) => {
    
    console.error("Original error:", err);

    // If headers are already sent, pass error to default handler
    if(res.headersSent) {
        return next(err);
    }

    let error = err;

    if(!(error instanceof ApiError)){
        if(error instanceof ZodError){
            // zod provide array of issues
            const errors = error.issues.map((i) => ({
                field: i.path.join('.'),
                message: i.message
            }));
            error = new ApiError(400, "Validation error", errors);
        }
        else if(error instanceof multer.MulterError){
            const statusCode = error.code === "LIMIT_FILE_SIZE" ? 413 : 400;
            error = new ApiError(statusCode, error.message);
        }
        else if(error instanceof mongoose.Error.ValidationError){
            // mongoose provide object of errors
            const errors = Object.values(error.errors).map((e) => ({
                field: e.path,
                message: e.message
            }));
            error = new ApiError(400, "Validation error", errors);
        }
        else if(error instanceof mongoose.Error.CastError){
            error = new ApiError(400, `Invalid ${error.path}: ${error.value}`);
        }
        else if(error.code === 11000){
            const field = Object.keys(error.keyValue)[0];
            error = new ApiError(409, `Duplicate key error: ${field}`);
        }
        else if(error.name === "JsonWebTokenError"){
            error = new ApiError(401, "Invalid token");
        }
        else if(error.name === "TokenExpiredError"){
            error = new ApiError(401, "Token expired");
        }
        else {
            error = new ApiError(500, "Internal server error");
        }
    }

    // log error
    console.error("Error:", error);

    return res
        .status(error.statusCode)
        .json(new ApiResponse(error.statusCode, error.data, error.message));

}

export default errorHandler;