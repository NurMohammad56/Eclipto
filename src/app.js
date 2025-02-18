import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

// Middleware to parse JSON and URL-encoded data
app.use(express.json({ limit: "16k" }));
app.use(express.urlencoded({ extended: true, limit: "16k" }));
app.use(express.static("public"));
app.use(cookieParser());

// Import routes
import { userRouter } from "./routes/user.routes.js";

// Routes declaration
app.use("/api/v1/users", userRouter);

export { app };
