import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.use(express.json({ limit: "16k" }));
app.use(express.urlencoded({ extended: true, limit: "16k" }));
app.use(express.static("public"));
app.use(cookieParser());

export { app };
