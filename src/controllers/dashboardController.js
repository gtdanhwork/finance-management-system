import {
	getSummary,
	getMonthlyBreakdown,
	getCategoryBreakdown,
} from '../models/dashbardModel.js';

export const summary = async (req, res) => {
	try {
		const data = await getSummary(req.user.userId);
		res.json({ summary: data });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const monthly = async (req, res) => {
	try {
		const data = await getMonthlyBreakdown(req.user.userId);
		res.json({ monthly: data });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};

export const categories = async (req, res) => {
	try {
		const data = await getCategoryBreakdown(req.user.userId);
		res.json({ categories: data });
	} catch (error) {
		res.status(500).json({ error: error.message });
	}
};
