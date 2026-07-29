import "dotenv/config";
import app from "./app.js";
import { connectDB } from "./config/db.js";
import logger from "./logger/logger.js";

const PORT = process.env.PORT || 5000;

try {
  await connectDB();

  const httpServer = app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT}`);
  });

  httpServer.on("error", (err) => {
    logger.error({ err }, "Failed to start server");
    process.exit(1);
  });
} catch (error) {
  logger.error(error, "Failed to start server");
  process.exit(1);
}

export default app;