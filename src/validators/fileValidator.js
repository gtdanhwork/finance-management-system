import { z } from 'zod';

export const uploadSchema = z.object({
	file_type: z.enum(['invoices', 'bank statements', 'report'], {
		errorMap: () => ({
			message:
				'Invalid file type. Must be one of: invoices, bank statements, report',
		}),
	}),
});

export const paginationSchema = z.object({
	page: z
		.string()
		.optional()
		.default('1')
		.refine((val) => !isNaN(parseInt(val)) && parseInt(val) >= 1, {
			message: 'Page must be a positive integer',
		})
		.transform((val) => parseInt(val)),

	limit: z
		.string()
		.optional()
		.default('10')
		.refine(
			(val) =>
				!isNaN(parseInt(val)) &&
				parseInt(val) >= 1 &&
				parseInt(val) <= 100,
			{
				message: 'Limit must be a positive integer',
			},
		)
		.transform((val) => parseInt(val)),
});
