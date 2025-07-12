import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import userRouter from "./src/features/users/user.routes.js";
import postsRouter from "./src/features/posts/post.routes.js";
import ErrorHandlingMiddleware from "./src/errorHandlers/appErrorHandler.middleware.js";
import jwtAuth from "./src/middlewares/jwtAuth.js";
import commentsRouter from "./src/features/comments/comments.routes.js";
import otpRouter from "./src/features/otp/otp.routes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

app.use("/api/users", userRouter);
app.use("/api/posts", jwtAuth, postsRouter);
app.use("/api/comments", jwtAuth, commentsRouter);
app.use("/api/otp", otpRouter);

app.use(ErrorHandlingMiddleware);

export default app;
