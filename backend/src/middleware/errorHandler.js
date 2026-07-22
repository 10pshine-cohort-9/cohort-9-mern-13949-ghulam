import logger from '../config/logger.config.js';

export function notFoundHandler(req, res, next) {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(err, req, res, _next) {
  const status = err.status || 500;

  logger.error({ err, status, path: req.originalUrl }, err.message);

  res.status(status).json({
    error: {
      message: err.message || 'Internal Server Error',
    },
  });
}
