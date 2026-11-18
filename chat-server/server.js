import http from "http";
import app from "./app.js";
import env from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";


import initializeSocket from "./src/sockets/index.js";
import { clearOnlineUsers } from "./src/sockets/socket-handlers/presence.handler.js";

await connectDB();

const server = http.createServer(app);

// Initialize Socket.IO
// initializeSocket(server);

await clearOnlineUsers()

// upload file
const io = initializeSocket(server);
app.set('io', io)


// Start server
server.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});