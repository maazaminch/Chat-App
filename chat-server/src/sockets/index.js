// Initialize Socket.IO and register socket middleware and handlers for one-to-one chat

import { Server } from "socket.io";
import env from "../config/env.js";
import authSocketMiddleware from "./socket-middleware/auth.js";
import typingHandlers from "./socket-handlers/typing.handler.js";
import { presenceHandler,
     addUserToOnline,
    removeUserFromOnline } from "./socket-handlers/presence.handler.js";
import dmHandler from "./socket-handlers/dm.handler.js";
import constants from "./socket-constants/constants.js";



const initializeSocket = (httpServer) => {
    const io = new Server(httpServer, {
        cors: { origin: env.CLIENT_URL, credentials: true }
    });

    // Register socket middleware
    io.use(authSocketMiddleware);

    // Event Listeners
    io.on("connection", async (socket) => {
        console.log(`User connected: ${socket.id}`);

        const userId = socket.data.userId;
        if (!userId) {
            console.error(`Socket ${socket.id} connected without an authenticated userId`);
            socket.disconnect(true);
            return;
        }

        try {
            await addUserToOnline(userId, socket.id, socket.data.name);
            await presenceHandler(io);
        } catch (error) {
            console.error("Failed to update online presence on connect:", error);
            socket.disconnect(true);
            return;
        }

        // Join user's personal room for DMs
        socket.join(constants.USER_ROOM(userId));

        // Emit welcome message to the connecting client
        socket.emit("server:welcome", {
            id: socket.id,
            userId: userId
        });


        // Broadcast online users to all clients
        // presenceHandler(io).catch((error) => {
        //     console.error("Failed to broadcast online users:", error);
        // });

        // Register typing handlers
        typingHandlers(io, socket);

        // Register DM handler
        dmHandler(io, socket);

        // Handle disconnect
        socket.on('disconnect', async (reason)=> {
            try {
                await removeUserFromOnline(userId, socket.id)
                await presenceHandler(io)
            } catch (error) {
                console.error('Failed to update online presence on disconnect:', error)
            }
            
            console.log(`User disconnected: ${socket.id} - Reason: ${reason}`);
        })

        // socket.on("disconnect", (reason) => {
        //     presenceHandler(io).catch((error) => {
        //         console.error("Failed to broadcast online users:", error);
        //     });
        //     console.log(`User disconnected: ${socket.id} - Reason: ${reason}`);
        // });
    });

    return io;
};

export default initializeSocket;
