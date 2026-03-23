import { z } from 'zod';

export const uploadSchema = z.object({
	file_type: z.enum(['invoices', 'bank statements', 'report'], {
		errorMap: () => ({
			message:
				'Invalid file type. Must be one of: invoices, bank statements, report',
		}),
	}),
});

