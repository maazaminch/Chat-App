import User from "../../models/user.model.js";
import ApiError from "../../utils/apiError.js";
import ApiResponse from "../../utils/apiResponse.js";
import asyncHandler from "../../utils/asyncHandler.js";

class UserController {

    static getAllUsers = asyncHandler(async (req, res) => {
        const users = await User.find({
            _id: { $ne: req.user._id }
        })
            .select("name email lastSeen")
            .sort({ name: 1 });

        return res.status(200).json(
            new ApiResponse(200, users, "Users retrieved successfully")
        );
    });

    static getUserById = asyncHandler(async (req, res) => {
        const user = await User.findById(req.params.userId)
            .select("name email lastSeen");

        if (!user) {
            throw new ApiError(404, "User not found");
        }

        return res.status(200).json(
            new ApiResponse(200, user, "User retrieved successfully")
        );
    });

    static searchUsers = asyncHandler(async (req, res) => {
        const { search } = req.query;
        
        if (!search) {
            throw new ApiError(400, "Search query is required");
        }

        const users = await User.find({
            $or: [
                { name: { $regex: search, $options: "i" } },
                { email: { $regex: search, $options: "i" } }
            ],
            _id: { $ne: req.user._id }
        })
            .select("name email lastSeen")
            .sort({ name: 1 });

        return res.status(200).json(
            new ApiResponse(200, users, "Users searched successfully")
        );
    });

}

export default UserController;