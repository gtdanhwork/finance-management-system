import express from 'express';
import { upload } from '../configs/multer.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
	uploadFile,
	getUsersFile,
	getItems,
	getReconciliationResults,
} from '../controllers/fileController.js';
import { fileUploadLimiter } from '../middlewares/rateLimiter.js';
import { validate } from '../middlewares/validate.js';
import { uploadSchema } from '../validators/fileValidator.js';

const router = express.Router();

router.post(
	'/upload',
	fileUploadLimiter,
	authMiddleware,
	upload.single('file'),
	validate(uploadSchema),
	uploadFile,
);
router.get('/', authMiddleware, getUsersFile);
router.get('/:fileId/items', authMiddleware, getItems);
router.get('/reconciliations', authMiddleware, getReconciliationResults);

export default router;
