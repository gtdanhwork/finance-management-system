import express from 'express';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
	summary,
	monthly,
	categories,
} from '../controllers/dashboardController.js';

const router = express.Router();

router.get('/summary', authMiddleware, summary);
router.get('/monthly', authMiddleware, monthly);
router.get('/categories', authMiddleware, categories);

export default router;
