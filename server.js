// server.js
import express from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import fileRoutes from './src/routes/fileRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';
import pool from './src/configs/db.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config();

if (!fs.existsSync('uploads')) {
	fs.mkdirSync('uploads');
}

const app = express();
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/', (req, res) => {
	res.send('Finance API is running');
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
	await runMigrations();

	if (!fs.existsSync('uploads')) {
		fs.mkdirSync('uploads');
	}

	const PORT = process.env.PORT || 3000;
	app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

const runMigrations = async () => {
	const migrations = [
		'001_create_users.sql',
		'002_create_uploaded_files.sql',
		'003_create_extracted_items.sql',
		'004_create_reconciliations.sql',
	];

	for (const file of migrations) {
		const filePath = path.join(__dirname, 'src/migrations', file);
		const sql = fs.readFileSync(filePath, 'utf8');
		await pool.query(sql);
		console.log(`Migration applied: ${file}`);
	}
};

startServer();
