import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import mongoose from "mongoose";
import errorHandler from "./src/middlewares/errorHandler.middleware.js";

import env from "./src/config/env.js";
import authRouter from "./src/routes/auth.routes.js";
import convoRouter from "./src/routes/convo.routes.js";
import messageRouter from "./src/routes/message.routes.js";
import userRouter from "./src/routes/user.routes.js";
// import adminRouter from "./src/routes/admin.routes.js";

const app = express();

app.use(express.json());

app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true
}));
app.use(cookieParser());


app.get("/health", (req, res) => {
  const isDatabaseConnected = mongoose.connection.readyState === 1;

  return res
    .status(isDatabaseConnected ? 200 : 503)
    .json({ status: isDatabaseConnected ? "ok" : "unavailable" });
});


app.use('/api/v1/auth', authRouter);
app.use('/api/v1/convo', convoRouter);
app.use('/api/v1/message', messageRouter);
app.use('/api/v1/user', userRouter);
// app.use('/api/v1/admin', adminRouter);

app.use(errorHandler);

export default app;
