// Message Emitters
// socket.emit(...) goes to only this one client.
// socket.broadcast.emit(...) goes to everyone except this client.
// io.emit(...) goes to everyone, including this client.

import MessageService from "../../services/message.services.js";
import constants from "../socket-constants/constants.js";

const createMessageHandlers = (io, socket) => {
    socket.on("message:send", (payload, callback) => {
      const reply = typeof callback === 'function' ? callback : () => {};
     
      try {
        const { conversationId, text } = payload;
       
        const senderId = socket.user._id;
        
        const message = MessageService.createMessage(conversationId, senderId, text);

            
    } catch (error) {
        reply({ ok: false, error: error.message });
      }
    })
}

export default createMessageHandlers;