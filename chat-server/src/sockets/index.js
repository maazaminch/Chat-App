// Initialize Socket.IO and register socket middleware and handlers for one-to-one chat

import { Server } from "socket.io";
import env from "../config/env.js";
import authSocketMiddleware from "./socket-middleware/auth.js";
import typingHandlers from "./socket-handlers/typing.handler.js";
import { presenceHandler } from "./socket-handlers/presence.handler.js";
import dmHandler from "./socket-handlers/dm.handler.js";
import constants from "./socket-constants/constants.js";



const initializeSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: { origin: env.CLIENT_URL, credentials: true }
    });

    // Register socket middleware
    io.use(authSocketMiddleware);

    // Event Listeners
    io.on("connection", (socket) => {
        console.log(`User connected: ${socket.id}`);

        const userId = socket.data.userId;
        if (!userId) {
            console.error(`Socket ${socket.id} connected without an authenticated userId`);
            socket.disconnect(true);
            return;
        }

        // Add user to online list
        // addUserToOnline(userId);

        // Join user's personal room for DMs
        socket.join(constants.USER_ROOM(userId));

        // Emit welcome message to the connecting client
        socket.emit("server:welcome", {
            id: socket.id,
            userId: userId
        });

        // Broadcast online users to all clients
        presenceHandler(io).catch((error) => {
            console.error("Failed to broadcast online users:", error);
        });

        // Register typing handlers
        typingHandlers(io, socket);

        // Register DM handler
        dmHandler(io, socket);

        // Handle disconnect
        socket.on("disconnect", (reason) => {

            // Remove user from online list
            // removeUserFromOnline(userId);
            
            presenceHandler(io).catch((error) => {
                console.error("Failed to broadcast online users:", error);
            });
            console.log(`User disconnected: ${socket.id} - Reason: ${reason}`);
        });
    });

    return io;
};

export default initializeSocket;
