import express from "express";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";

import userRouter from "./src/features/users/users.routes.js";
import postsRouter from "./src/features/posts/posts.routes.js";
import ErrorHandlingMiddleware from "./src/errorHandlers/appErrorHandler.middleware.js";
import jwtAuth from "./src/middlewares/jwtAuth.middleware.js";
import commentsRouter from "./src/features/comments/comments.routes.js";
import otpRouter from "./src/features/otp/otp.routes.js";
import likesRouter from "./src/features/likes/likes.routes.js";
import friendsRouter from "./src/features/friendship/friendship.routes.js";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use("/uploads", express.static(path.join(__dirname, "src", "uploads")));

app.use("/api/users", userRouter);
app.use("/api/posts", jwtAuth, postsRouter);
app.use("/api/comments", jwtAuth, commentsRouter);
app.use("/api/likes", jwtAuth, likesRouter);
app.use("/api/friends", jwtAuth, friendsRouter);
app.use("/api/otp", otpRouter);

app.use(ErrorHandlingMiddleware);

export default app;
