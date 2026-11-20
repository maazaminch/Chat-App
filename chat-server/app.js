import express from "express";
import cookieParser from "cookie-parser";
import morgan from 'morgan'
import mongoSanitize from "express-mongo-sanitize";
import cors from "cors";
import mongoose from "mongoose";
import errorHandler from "./src/middlewares/errorHandler.middleware.js";

import env from "./src/config/env.js";
import authRouter from "./src/routes/auth.routes.js";
import convoRouter from "./src/routes/convo.routes.js";
import messageRouter from "./src/routes/message.routes.js";
import userRouter from "./src/routes/user.routes.js";
import webhookRouter from "./src/routes/webhook.routes.js";
// import adminRouter from "./src/routes/admin.routes.js";

const app = express();
const isProd = process.env.NODE_ENV === 'production';


// cors
app.use(cors({
  origin: env.CLIENT_URL,
  credentials: true,
  // methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
  // allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(morgan(isProd ? 'combined' : 'dev'))

// Body parsers
// GitHub signs the exact request bytes, so the backend must retain the raw body before JSON parsing
app.use(express.json({
  verify: (req, res, buffer) => {
    if(req.originalUrl.split('?')[0].startsWith('/api/v1/webhooks')) {
       req.rawBody = Buffer.from(buffer);
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// cookies
app.use(cookieParser());

// Sanitize after parsing before routes
app.use((req, res, next) => {
  mongoSanitize.sanitize(req.body);
  mongoSanitize.sanitize(req.params);
  mongoSanitize.sanitize(req.headers);

  if (mongoSanitize.has(req.query)) {
    return res.status(400).json({ message: "Invalid query parameters" });
  }

  next();
});

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
app.use("/api/v1/webhooks", webhookRouter);
// app.use('/api/v1/admin', adminRouter);

app.use(errorHandler);

export default app;
