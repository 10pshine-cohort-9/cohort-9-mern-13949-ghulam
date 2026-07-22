import dotenv from 'dotenv';
import app from './app.js';
import pool from './config/db.config.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

pool.connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database', err);
    process.exit(1);
  });
