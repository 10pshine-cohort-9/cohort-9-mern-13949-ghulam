const pinoHttp = require('pino-http');
const logger = require('../logger/logger');

const requestLogger = pinoHttp({ logger });

module.exports = requestLogger;
