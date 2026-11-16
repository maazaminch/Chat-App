import constants from "../socket-constants/constants.js";
import ConvoService from "../../services/convo.services.js";

const typingHandlers = (io, socket) => {

    // here in payload we will get to only the user id of the user we are typing to
    socket.on("typing:start", (payload, callback) => {
        try {
            const senderId = socket.data.userId;
            const receiverId = payload;
            
            if(!receiverId || typeof receiverId !== 'string') {
                return callback?.({ ok: false, message: "Invalid receiver ID" });
            }
            if(senderId === receiverId) {
                return callback?.({ ok: false, message: "Cannot type to yourself" });
            }

            io.to(constants.USER_ROOM(receiverId)).emit("typing:start", 
                { userId: senderId });
            callback?.({ ok: true, message: "Typing started" });

        } catch (error) {
            callback?.({ ok: false, message: "Failed to send typing indicator" });
        }
    });

    socket.on("typing:stop", (payload, callback) => {
        try {
            const senderId = socket.data.userId;
            const receiverId = payload;
            
            if(!receiverId || typeof receiverId !== 'string') {
                return callback?.({ ok: false, message: "Invalid receiver ID" });
            }
            if(senderId === receiverId) {
                return callback?.({ ok: false, message: "Cannot stop typing to yourself" });
            }

            io.to(constants.USER_ROOM(receiverId)).emit("typing:stop", 
                { userId: senderId });
            callback?.({ ok: true, message: "Typing stopped" });

        } catch (error) {
            callback?.({ ok: false, message: "Failed to send typing indicator" });
        }
    });
}

export default typingHandlers;