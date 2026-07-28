const logger = require('../logger/logger');

const errorHandler = (err, req, res, next) => {
  logger.error({ err }, err.message);
  const status = Number.isInteger(err.status) && err.status >= 400 && err.status <= 599 ? err.status : 500;
  const message = status >= 500 ? 'Internal Server Error' : err.message || 'Internal Server Error';
  res.status(status).json({ message });
};

module.exports = errorHandler;
