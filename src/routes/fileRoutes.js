import express from 'express';
import { upload } from '../configs/multer.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';
import {
	uploadFile,
	getUsersFile,
	getItems,
} from '../controllers/fileController.js';

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('file'), uploadFile);
router.get('/', authMiddleware, getUsersFile);
router.get('/:fileId/items', authMiddleware, getItems);

export default router;
