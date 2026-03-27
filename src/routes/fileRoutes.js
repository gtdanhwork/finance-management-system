import express from 'express';
import { upload } from '../configs/multer.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
	uploadFile,
	getUsersFile,
	getItems,
	getReconciliationResults,
	deleteFile,
} from '../controllers/fileController.js';
import { fileUploadLimiter } from '../middlewares/rateLimiter.js';
import { validate, validateQuery } from '../middlewares/validate.js';
import { paginationSchema, uploadSchema } from '../validators/fileValidator.js';

const router = express.Router();

router.post(
	'/upload',
	fileUploadLimiter,
	authMiddleware,
	upload.single('file'),
	validate(uploadSchema),
	uploadFile,
);
router.get('/', authMiddleware, validateQuery(paginationSchema), getUsersFile);
router.get(
	'/:fileId/items',
	authMiddleware,
	validate(paginationSchema),
	getItems,
);
router.get('/reconciliations', authMiddleware, getReconciliationResults);
router.delete('/:fileId', authMiddleware, deleteFile);

export default router;
