// server.js
import express from 'express';
import fs from 'fs';
import dotenv from 'dotenv';
import authRoutes from './src/routes/authRoutes.js';
import fileRoutes from './src/routes/fileRoutes.js';
import dashboardRoutes from './src/routes/dashboardRoutes.js';

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

app.listen(PORT, () => {
	console.log(`Server is running on port ${PORT}`);
});
