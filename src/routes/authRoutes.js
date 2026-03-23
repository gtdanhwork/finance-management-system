import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import { authLimiter } from '../middlewares/rateLimiter.js';
import { register, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', authLimiter, register);
router.post('/login', login);
router.get('/me', authMiddleware, (req, res) => {
	res.json({ message: 'You are authenticated', userId: req.userId });
});

export default router;
