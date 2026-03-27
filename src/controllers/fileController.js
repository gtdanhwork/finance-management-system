import {
	saveFile,
	getFilesByUser,
	getExtractedItems,
	getReconciliations,
	deleteFileById,
	getFileById,
} from '../models/fileModel.js';
import processFile from '../services/extractionService.js';
import {
	reconcileStatement,
	saveBankStatements,
} from '../services/reconciliationService.js';

import fs from 'fs';

export const uploadFile = async (req, res) => {
	try {
		if (!req.file) {
			return res.status(400).json({ error: 'No file uploaded' });
		}

		const { file_type } = req.body;
		const record = await saveFile({
			user_id: req.user.userId,
			original_name: req.file.originalname,
			file_type,
			mime_type: req.file.mimetype,
			storage_path: req.file.path,
		});

		res.status(201).json({
			message: 'File uploaded successfully',
			file: record,
		});

		processFile(record.id, req.file.path, req.file.mimetype, file_type)
			.then(async (extractedItems) => {
				console.log(`Extraction completed for file ${record.id}`);
				if (file_type === 'bank statements') {
					const statement = await saveBankStatements(
						record.id,
						extractedItems,
					);
					const reconciliation = await reconcileStatement(
						req.user.userId,
						statement.id,
						statement.statement_month,
					);
					console.log(reconciliation.message);
				}
			})
			.catch((error) =>
				console.error(
					`Extraction failed for file ${record.id}:`,
					error.message,
				),
			);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getUsersFile = async (req, res) => {
	try {
		const { page, limit } = req.validatedQuery;
		const result = await getFilesByUser(req.user.userId, page, limit);
		res.json(result);
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getItems = async (req, res) => {
	try {
		const { page, limit } = req.validatedQuery;
		const result = await getExtractedItems(req.params.fileId, page, limit);
		res.json({ result });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const getReconciliationResults = async (req, res) => {
	try {
		const result = await getReconciliations(req.user.userId);
		res.json({ result });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const deleteFile = async (req, res) => {
	try {
		const { fileId } = req.params;

		const file = await getFileById(fileId, req.user.userId);

		if (!file) {
			return res.status(404).json({ error: 'File not found' });
		}

		await deleteFileById(fileId, req.user.userId);

		if (fs.existsSync(file.storage_path)) {
			fs.unlinkSync(file.storage_path);
		}
		res.json({ message: 'File deleted successfully' });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
