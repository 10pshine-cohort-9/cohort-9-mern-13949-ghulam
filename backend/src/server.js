import 'dotenv/config';
import app from './app.js';
import pool from './config/db.config.js';

const PORT = process.env.PORT || 5000;

pool.query('SELECT 1')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to connect to database', err);
    process.exit(1);
  });
