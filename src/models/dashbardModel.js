import pool from '../configs/db.js';

export const getSummary = async (userId) => {
	const result = await pool.query(
		`
        SELECT
            COALESCE(SUM(CASE WHEN ei.amount > 0 THEN ei.amount ELSE 0 END), 0) AS total_income,
            COALESCE(SUM(CASE WHEN ei.amount < 0 THEN ABS(ei.amount) ELSE 0 END), 0) AS total_expense,
            COUNT(DISTINCT uf.id) AS total_files,
            COUNT(DISTINCT CASE WHEN uf.status = 'done' THEN uf.id END) AS processed_files,
            COUNT(DISTINCT CASE WHEN r.status = 'matched' THEN r.id END) AS matched_invoices,
            COUNT(DISTINCT CASE WHEN r.status = 'unmatched' THEN r.id END) AS unmatched_invoices
        FROM uploaded_files uf
        LEFT JOIN extracted_items ei ON ei.file_id = uf.id
        LEFT JOIN reconciliations r ON r.invoice_file_id = uf.id
        WHERE uf.user_id = $1
        `,
		[userId],
	);
	return result.rows[0];
};

export const getMonthlyBreakdown = async (userId) => {
	const result = await pool.query(
		`
        SELECT
            TO_CHAR(DATE_TRUNC('month', ei.item_date), 'YYYY-MM') AS month,
            COALESCE(SUM(CASE WHEN ei.amount > 0 THEN ei.amount ELSE 0 END),0) AS income,
            COALESCE(SUM(CASE WHEN ei.amount < 0 THEN ABS(ei.amount) ELSE 0 END),0) AS expenses
        FROM extracted_items ei
        JOIN uploaded_files uf ON uf.id = ei.file_id
        WHERE uf.user_id = $1 AND ei.item_date IS NOT NULL
        GROUP BY DATE_TRUNC('month', ei.item_date)
        ORDER BY DATE_TRUNC('month', ei.item_date) ASC
    `,
		[userId],
	);

	return result.rows;
};

export const getCategoryBreakdown = async (userID) => {
	const result = await pool.query(
		`
        SELECT ei.category, COUNT(*) AS item_count,
        COALESCE(SUM(ABS(ei.amount)),0) AS total_amount
        FROM extracted_items ei
        JOIN uploaded_files uf ON uf.id = ei.file_id
        WHERE uf.user_id = $1
        AND ei.category IS NOT NULL
        GROUP BY ei.category
        ORDER BY total_amount DESC
`,
		[userID],
	);

	return result.rows;
};
