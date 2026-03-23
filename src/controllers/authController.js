import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail } from '../models/userModel.js';

const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET_KEY, {
		expiresIn: '1h',
	});
};

export const register = async (req, res) => {
	try {
		const { email, password, full_name } = req.body;

		const isExisting = await findUserByEmail(email);

		if (isExisting) {
			return res.status(409).json({ error: 'User already exists' });
		}

		const hash_password = await bcrypt.hash(password, 10);

		const user = await createUser({ email, hash_password, full_name });

		const token = generateToken(user.id);

		res.status(201).json({
			message: 'Account successfully created',
			token,
			user: { id: user.id, email: user.email, full_name: user.full_name },
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		const user = await findUserByEmail(email);

		if (!user) {
			return res.status(404).json({ error: 'Email not existing' });
		}

		const isMatch = await bcrypt.compare(password, user.hash_password);

		if (!isMatch) {
			return res.status(401).json({ error: 'Password incorrect' });
		}

		const token = generateToken(user.id);

		res.json({
			message: 'Logged in Successfully',
			token,
			user: { id: user.id, email: user.email, full_name: user.full_name },
		});
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
