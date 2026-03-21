import pool from '../configs/db.js';

export const saveBankStatements = async (fileId, extractedItems) => {
	const dates = extractedItems
		.filter((item) => item.item_date)
		.map((item) => new Date(item.item_date));

	if (dates.length === 0) {
		throw new Error('No dates found in bank statement');
	}

	const earlistDate = new Date(Math.min(...dates));

	const statementMonth = new Date(
		earlistDate.getFullYear(),
		earlistDate.getMonth(),
		1,
	);
	const result = await pool.query(
		`INSERT INTO bank_statements (file_id, statement_month) VALUES ($1, $2) RETURNING *`,
		[fileId, statementMonth],
	);

	return result.rows[0];
};

const getInvoicesForMonth = async (userId, statementMonth) => {
	const result = await pool.query(
		`SELECT uf.id, ei.amount, ei.item_date
        FROM uploaded_files uf JOIN extracted_items ei ON ei.file_id = uf.id
        WHERE uf.user_id = $1
        AND uf.file_type = 'invoices'
        AND DATE_TRUNC('month', ei.item_date) = DATE_TRUNC('month', $2::date)`,
		[userId, statementMonth],
	);

	return result.rows;
};

const getBankTransactions = async (statementId) => {
	const result = await pool.query(
		`SELECT ei.amount, ei.item_date
        FROM extracted_items ei
        JOIN uploaded_files uf ON uf.id = ei.file_id
        JOIN bank_statements bs ON bs.file_id = uf.id
        WHERE bs.id = $1`,
		[statementId],
	);

	return result.rows;
};

const matchInvoices = (invoices, bankTransactions) => {
	const results = [];
	for (const invoice of invoices) {
		const match = bankTransactions.find(
			(tx) => Math.abs(Number(tx.amount) - Number(invoice.amount)) < 0.01,
		);

		results.push({
			invoice_file_id: invoice.id,
			status: match ? 'matched' : 'unmatched',
			matched_at: match ? new Date() : null,
		});
	}

	return results;
};

const saveReconciliationResults = async (results, statementId) => {
	const saved = [];
	for (const result of results) {
		const row = await pool.query(
			`
            INSERT INTO reconciliations (invoice_file_id,statement_id, status, matched_at)
            VALUES ($1, $2, $3, $4)
            RETURNING *
            `,
			[
				result.invoice_file_id,
				statementId,
				result.status,
				result.matched_at,
			],
		);
		saved.push(row.rows[0]);
	}
	return saved;
};

export const reconcileStatement = async (
	userId,
	statementId,
	statementMonth,
) => {
	try {
		const invoices = await getInvoicesForMonth(userId, statementMonth);

		if (invoices.length === 0) {
			return {
				message: `No invoices found for ${statementMonth}`,
				results: [],
			};
		}

		const bankTransactions = await getBankTransactions(statementId);

		const matchResults = matchInvoices(invoices, bankTransactions);

		const saved = await saveReconciliationResults(
			matchResults,
			statementId,
		);

		const matched = saved.filter((r) => r.status === 'matched').length;
		const unmatched = saved.filter((r) => r.status === 'unmatched').length;

		return {
			message: `Reconciliation completed - ${matched} matched, ${unmatched} unmatched}`,
			results: saved,
		};
	} catch (error) {
		throw new Error(`Reconciliation failed: ${error.message}`);
	}
};
