import express from "express";
import dotenv from "dotenv";

import userRouter from "./src/features/users/user.routes.js";
import ErrorHandlingMiddleware from "./src/errorHandlers/appErrorHandler.middleware.js";

dotenv.config();

const app = express();

app.use(express.json());

app.use("/api/users", userRouter);

app.use(ErrorHandlingMiddleware);

export default app;
