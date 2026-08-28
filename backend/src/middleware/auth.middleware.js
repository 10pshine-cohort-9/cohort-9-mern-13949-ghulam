import jwt from 'jsonwebtoken';
import logger from '../logger/logger.js';
import * as authService from '../services/auth.services.js';

const authMiddleware = async (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'authentication required' });
  }

  let decoded;
  try {
    decoded = jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    logger.warn({ err }, 'token verification failed');
    return res.status(401).json({ message: 'invalid or expired token' });
  }

  try {
    const tokenVersion = await authService.getTokenVersion(decoded.id);
    if (tokenVersion === null || decoded.tv !== tokenVersion) {
      return res.status(401).json({ message: 'invalid or expired token' });
    }
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    next(err);
  }
};

export default authMiddleware;
