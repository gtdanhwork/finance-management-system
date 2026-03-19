import { saveFile, getFilesByUser } from '../models/fileModel.js';

export const uploadFile = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		const { file_type } = req.body;
		const allowed_type = ['invoices', 'bank statements', 'report'];

		if (!allowed_type.includes(file_type)) {
			return res.status(400).json({ error: 'Invalid file type' });
		}

		const record = await saveFile({
			user_id: req.user.userId,
			original_name: req.file.originalname,
			file_type,
			mime_type: req.file.mimetype,
			storage_path: req.file.path,
		});

		res.status(201).json({ message: 'File uploaded successfully', record });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getUsersFile = async (req, res) => {
	try {
		const file = await getFilesByUser(req.user.userId);
		res.json(file);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
