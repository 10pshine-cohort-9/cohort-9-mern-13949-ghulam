const pinoHttp = require('pino-http');
const logger = require('../logger/logger');

const requestLogger = pinoHttp({
  logger,
  redact: ['req.headers.authorization', 'req.headers.cookie']
});

module.exports = requestLogger;
