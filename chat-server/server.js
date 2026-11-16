import http from "http";
import app from "./app.js";
import env from "./src/config/env.js";
import { connectDB } from "./src/config/db.js";

import initializeSocket from "./src/sockets/index.js";

await connectDB();

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);


// Start server
server.listen(env.PORT, () => {
  console.log(`Server is running on port ${env.PORT} in ${env.NODE_ENV} mode`);
});