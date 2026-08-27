import express from 'express';
import * as authController from '../controllers/auth.controllers.js';
import authMiddleware from '../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', authController.signIn);
router.post('/login', authController.login);
router.get('/profile', authMiddleware, authController.getUser);
router.put('/profile', authMiddleware, authController.updateUser);
router.put('/password', authMiddleware, authController.changePassword);
router.delete('/profile', authMiddleware, authController.deleteUser);

export default router;
