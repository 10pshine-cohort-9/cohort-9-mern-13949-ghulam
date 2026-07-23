const express = require('express');
const cors = require('cors');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const authRoutes = require('./routes/auth.routes');

const app = express();

app.disable('x-powered-by');

const allowedOrigins = (process.env.CORS_ORIGIN || '').split(',').filter(Boolean);

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());
app.use(requestLogger);

app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.use('/api/auth', authRoutes);

app.use(errorHandler);

module.exports = app;
