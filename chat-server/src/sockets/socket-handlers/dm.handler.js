import constants from "../socket-constants/constants.js";
import ConvoService from "../../services/convo.services.js";
import MessageService from "../../services/message.services.js";

// Method	Who receives it?
// socket.emit()	Current socket only
// socket.to(room).emit()	Everyone in room except current socket
// io.to(room).emit()	Everyone in room, including current socket if present
// io.emit()	Everyone connected to the server


const dmHandler = (io, socket) => {
    // payload = What the client sends to the server.
    // callback = A function the server can use to reply to that client.
    socket.on("dm:send", async (payload, callback) => {
    const reply = typeof callback === "function" ? callback : () => {};

    try {
        const { conversationId, text } = payload || {};

        if (!conversationId || typeof text !== "string") {
            return reply({ ok: false, error: "Invalid payload" });
        }

        const savedMessage = await MessageService.createMessage(
            conversationId,
            socket.data.userId,
            text
        );
        const message = await savedMessage.populate("senderId", "name email");

        // Retrieve the conversation members.
        const conversation = await ConvoService.assertMember(
            conversationId,
            socket.data.userId
        );

        // Deliver to the other member.
        const recipientId = conversation.memberIds.find(
            id => id.toString() !== socket.data.userId
        );

        //After saving the message, the server emits dm:new to the recipient’s room:
        if (recipientId) {
            // we use io here to send message to every connections of same user
            io.to(constants.USER_ROOM(recipientId.toString()))
                .emit("dm:new", message);
        }

        // Notify other sessions belonging to the sender.
        socket.to(constants.USER_ROOM(socket.data.userId))
            .emit("dm:new", message);

        // notify the sending tab    
        return reply({ ok: true, message });
    } catch (error) {
        return reply({
            ok: false,
            error: error.message || "Message delivery failed"
        });
    }
});
}

export default dmHandler;