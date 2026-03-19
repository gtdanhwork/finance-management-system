import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads/');
	},
	filename: (req, file, cb) => {
		const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
		const ext = path.extname(file.originalname);
		cb(null, `${unique}${ext}`);
	},
});

const fileFilter = (req, file, cb) => {
	const allowed = ['image/jpeg', 'image/png', 'application/pdf'];
	if (allowed.includes(file.mimetype)) {
		cb(null, true);
	} else {
		cb(new Error('Only PDF, JPG, and PNG files are allowed'), false);
	}
};

export const upload = multer({
	storage,
	fileFilter,
	limits: { fileSize: 1024 * 1024 * 10 },
});
