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

const allowedOrigins = (process.env.CORS_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(requestLogger);

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/notes", notesRoutes);

app.use(errorHandler);

const PLACEHOLDER_SECRETS = new Set(["replace-with-your-postgres-password", "replace-with-a-long-random-secret"]);
const MIN_JWT_SECRET_LENGTH = 32;

const assertSecretsConfigured = () => {
  if (!process.env.JWT_SECRET || PLACEHOLDER_SECRETS.has(process.env.JWT_SECRET)) {
    throw new Error("JWT_SECRET is not set to a real secret (still the .env.example placeholder)");
  }
  if (process.env.JWT_SECRET.length < MIN_JWT_SECRET_LENGTH) {
    throw new Error(`JWT_SECRET is too short (must be at least ${MIN_JWT_SECRET_LENGTH} characters)`);
  }
  if (!process.env.PG_PASSWORD || PLACEHOLDER_SECRETS.has(process.env.PG_PASSWORD)) {
    throw new Error("PG_PASSWORD is not set to a real password (still the .env.example placeholder)");
  }
};

const start = async () => {
  try {
    assertSecretsConfigured();
    await connectDB();
  } catch (err) {
    logger.error({ err }, "Server failed to start");
    process.exit(1);
    return;
  }

  const server = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });
  server.on("error", (err) => {
    logger.error({ err }, "Server failed to start");
    process.exit(1);
  });
};

start().catch((err) => {
  logger.error({ err }, "Server failed to start");
  process.exit(1);
});
