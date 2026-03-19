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
	return result.rows[0];
};

export const getFilesByUser = async (user_id) => {
	const result = await pool.query(
		`SELECT * FROM uploaded_files WHERE user_id = $1`,
		[user_id],
	);
	return result.rows;
};
