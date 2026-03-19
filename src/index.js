import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import cors from 'cors';
import pool from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import { authMiddleware } from './middlewares/authMiddleware.js';

const app = express();

//Midlewares
app.use(cors());
app.use(express.json());

//Routes
app.get('/', (req, res) => {
	res.send('API is running...');
});

app.use('/auth', authRoutes);

app.get('/db-test', async (req, res) => {
	try {
		const client = await pool.connect();
		const result = await client.query('SELECT NOW()');
		client.release();
		res.json(result.rows[0]);
	} catch (error) {
		console.error(error);
		res.status(500).json({ error: 'Internal server error' });
	}
});

app.get('/me', authMiddleware, (req, res) =>
	res.json({
		message: 'You accessed protected route',
		user: req.user,
	}),
);

