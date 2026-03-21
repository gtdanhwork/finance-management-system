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

export const getFilesByUser = async (user_id) => {
	const result = await pool.query(
		`SELECT * FROM uploaded_files WHERE user_id = $1`,
		[user_id],
	);
	return result.rows;
};

export const getExtractedItems = async (fileId) => {
	const result = await pool.query(
		`SELECT * FROM extracted_items WHERE file_id = $1 ORDER BY item_date ASC`,
		[fileId],
	);

	return result.rows;
};
