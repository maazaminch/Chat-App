import asyncHandler from "../../../utils/asyncHandler.js";
import ApiResponse from "../../../utils/apiResponse.js";
import AdminService from "../../services/admin.services.js";

class AdminController {

    static getAllConversations = asyncHandler(async (req, res) => {
        const page = req.validatedData?.query?.page || 1;
        const limit = req.validatedData?.query?.limit || 20;

        const result = await AdminService.getAllConversations(page, limit);

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "All conversations retrieved successfully"
            )
        );
    });

    static deleteMessage = asyncHandler(async (req, res) => {
        const { messageId } = req.params;

        const result = await AdminService.deleteMessage(messageId);

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Message deleted successfully"
            )
        );
    });

    static banUser = asyncHandler(async (req, res) => {
        const { userId } = req.params;

        const result = await AdminService.banUser(userId);

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "User banned successfully"
            )
        );
    });

    static getAllUsersWithStats = asyncHandler(async (req, res) => {
        const result = await AdminService.getAllUsersWithStats();

        return res.status(200).json(
            new ApiResponse(
                200,
                result,
                "Admin stats retrieved successfully"
            )
        );
    });
}

export default AdminController;