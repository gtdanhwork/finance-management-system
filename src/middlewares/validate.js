export const validate = (schema) => (req, res, next) => {
	const result = schema.safeParse(req.body);

	if (!result.success) {
		const errors = result.error.errors.map((err) => ({
			field: err.path.join('.'),
			message: err.message,
		}));
		return res.status(400).json({ errors });
	}

	req.body = result.data; // Use the parsed and validated data
	next();
};

export const validateQuery = (schema) => (req, res, next) => {
	const result = schema.safeParse(req.query);

	if (!result.success) {
		// const errors = result.error?.errors?.map((err) => ({
		// 	field: err.path.join('.'),
		// 	message: err.message,
		// })) ?? [{field: 'query', message: 'Invalid query parameters'}];
		// return res.status(400).json({ errors });

		const defaultResult = schema.safeParse({});
		req.validatedQuery = defaultResult.success;
	} else {
		req.validatedQuery = result.data;
	}

	next();
};
