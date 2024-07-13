import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

//routes import
import userRouter from "./routes/user.routes.js";
import cookieSession from "cookie-session";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  })
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));
app.use(cookieParser());

// Configure session middleware
app.use(
  cookieSession({
    name: "session",
    keys: [process.env.SESSION_KEY || "your-secret-key"], // Use the same secret key
    // Cookie options
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    secure: false, // Set to true if your site uses HTTPS
  })
);

app.use("/api/v1/users", userRouter);

export { app };
