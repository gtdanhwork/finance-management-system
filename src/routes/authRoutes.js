import express from 'express';
import dotenv from 'dotenv';
import { authMiddleware } from '../middlewares/authMiddleware.js';

dotenv.config();

import { register, login } from '../controllers/authController.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);

router.get('/me', authMiddleware, (req, res) => {
	res.json({ message: 'You are authenticated', userId: req.userId });
});

export default router;
