import pool from '../configs/db.js';

export const createUser = async ({ email, hash_password, full_name }) => {
	const result = await pool.query(
		`
        INSERT INTO users (email, hash_password, full_name)
        VALUES ($1, $2, $3)
        RETURNING id, email, full_name, created_at
        `,
		[email, hash_password, full_name],
	);
	return result.rows[0];
};

export const findUserByEmail = async (email) => {
	const result = await pool.query(`SELECT * FROM users WHERE email = $1`, [
		email,
	]);
	return result.rows[0];
};
