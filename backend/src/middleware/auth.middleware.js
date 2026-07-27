import jwt from 'jsonwebtoken';
import logger from '../logger/logger.js';

const authMiddleware = (req, res, next) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'authentication required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id };
    next();
  } catch (err) {
    logger.warn({ err }, 'token verification failed');
    return res.status(401).json({ message: 'invalid or expired token' });
  }
};

export default authMiddleware;
