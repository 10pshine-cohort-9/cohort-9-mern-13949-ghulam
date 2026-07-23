const logger = require('../logger/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({ err }, err.message);
  const status = err.status || 500;
  res.status(status).json({ message: err.message || 'Internal Server Error' });
};

module.exports = errorHandler;
