import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
	try {
		// Get Token From Header
		const authHeader = req.headers.authorization;

		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ error: 'No token provided' });
		}

		// Extract Token
		const token = authHeader.split(' ')[1];

		//Verify Token
		const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

		req.user = decoded;

		//Continue to next Handler
		next();
	} catch (error) {
		console.log(error);
		res.status(401).json({ error: 'Unauthorized' });
	}
};
