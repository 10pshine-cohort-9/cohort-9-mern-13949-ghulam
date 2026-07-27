import pinoHttp from 'pino-http';
import logger from '../logger/logger.js';

const requestLogger = pinoHttp({
  logger,
  redact: ['req.headers.authorization', 'req.headers.cookie']
});

export default requestLogger;
