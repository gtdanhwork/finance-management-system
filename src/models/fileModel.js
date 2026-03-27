import { file } from 'zod';
import pool from '../configs/db.js';

export const saveFile = async ({
	user_id,
	original_name,
	file_type,
	mime_type,
	storage_path,
}) => {
	const result = await pool.query(
		`INSERT INTO uploaded_files (user_id, original_name, file_type, mime_type, storage_path) VALUES ($1, $2, $3, $4, $5) RETURNING *`,
		[user_id, original_name, file_type, mime_type, storage_path],
	);

	console.log('Query result rows:', result.rows);
	return result.rows[0];
};

export const getFilesByUser = async (user_id, page = 1, limit = 10) => {
	const offset = (page - 1) * limit;

	const result = await pool.query(
		`SELECT * FROM uploaded_files
		WHERE user_id = $1
		ORDER BY uploaded_at DESC
		LIMIT $2 OFFSET $3`,
		[user_id, limit, offset],
	);

	const countResult = await pool.query(
		`SELECT COUNT(*) FROM uploaded_files WHERE user_id = $1`,
		[user_id],
	);

	const total = parseInt(countResult.rows[0].count, 10);
	const totalPages = Math.ceil(total / limit);

	return {
		files: result.rows,
		pagination: {
			total,
			totalPages,
			currentPage: page,
			hasNextPage: page < totalPages,
			hasPrevpage: page > 1,
		},
	};
};

export const getExtractedItems = async (fileId) => {
	const result = await pool.query(
		`SELECT * FROM extracted_items WHERE file_id = $1`,
		[fileId],
	);

	return result.rows;
};

export const getReconciliations = async (userId) => {
	const result = await pool.query(
		`
		SELECT r.*, uf.original_name, bs.statement_month
		FROM reconciliations r
		JOIN uploaded_files uf ON uf.id = r.invoice_file_id
		JOIN bank_statements bs ON bs.id = r.statement_id
		WHERE uf.user_id = $1
		ORDER BY r.created_at DESC
`,
		[userId],
	);
	return result.rows;
};

export const deleteFileById = async (fileId, userId) => {
	const result = await pool.query(
		`
		DELETE FROM uploaded_files
		WHERE id = $1 AND user_id = $2
		RETURNING *`,
		[fileId, userId],
	);
	return result.rows[0];
};

export const getFileById = async (fileId, userId) => {
	const result = await pool.query(
		`
		SELECT * FROM uploaded_files
		WHERE id = $1 and user_id = $2`,
		[fileId, userId],
	);
	return result.rows[0];
};
