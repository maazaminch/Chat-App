// Sender selects an image, video, or file.
// The client uploads it over HTTP as multipart/form-data.
// The server authenticates the sender and checks they belong to the conversation.
// Multer saves the file to a private local uploads folder with a generated filename.
// The server stores a message and attachment metadata in MongoDB—not the file contents.
// The server emits the saved message over Socket.IO to the recipient and the sender’s other tabs.
// The recipient’s client fetches the attachment from an authenticated endpoint to display or download it.


import multer from "multer";
import path from "path";
import { mkdirSync } from "fs";
import { randomUUID } from "crypto";
import { fileURLToPath } from "url";
import ApiError from "../utils/apiError.js";

const currentDirectory = path.dirname(fileURLToPath(import.meta.url))
export const UPLOAD_DIR = path.resolve(currentDirectory, '../../uploads')

mkdirSync(UPLOAD_DIR, {recursive: true})

const allowedTypes = new Set([
    "image/jpeg",
    "image/png",
    "image/webp",
    "video/mp4",
    "video/webm",
    "application/pdf",
]);

const storage = multer.diskStorage({
    destination: (_req, _file, callback) => {
        callback(null, UPLOAD_DIR)
    },
    filename: (_req, _file, callback) => {
        callback(null, randomUUID())
    }
})

export const upload = multer({
    storage,
    limits: {
        fileSize: 20 * 1024 * 1024,
        files: 1   
    },
    fileFilter: (_req, file, callback) => {
        if(!allowedTypes.has(file.mimetype)) {
            return callback(new ApiError(400, "Unsupported file type"));
        }

        callback(null, true);
    }  
})
