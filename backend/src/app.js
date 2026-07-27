import express from "express";
import cors from "cors";
import requestLogger from "./middleware/requestLogger.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import notesRoutes from "./routes/notes.routes.js";

const app = express();

app.disable("x-powered-by");

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(requestLogger);

app.use("/", authRoutes);
app.use("/notes", notesRoutes);

app.use(errorHandler);

export default app;
