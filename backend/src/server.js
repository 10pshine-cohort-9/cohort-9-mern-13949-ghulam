import "dotenv/config";
import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import logger from "./logger/logger.js";
import requestLogger from "./middleware/requestLogger.js";
import errorHandler from "./middleware/errorHandler.js";
import authRoutes from "./routes/auth.routes.js";
import notesRoutes from "./routes/notes.routes.js";

const app = express();
const PORT = process.env.PORT || 5000;

app.disable("x-powered-by");

app.use(cors({ origin: process.env.CORS_ORIGIN }));
app.use(express.json());
app.use(requestLogger);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/", authRoutes);
app.use("/notes", notesRoutes);

app.use(errorHandler);

try {
  await connectDB();

  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
} catch (error) {
  logger.error(error, "Failed to start server");
  process.exit(1);
}

export default app;