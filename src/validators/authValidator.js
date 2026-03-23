import { z } from 'zod';

export const registerSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Invalid email format' })
		.toLowerCase(),

	password: z
		.string({ required_error: 'Password is required' })
		.min(6, { message: 'Password must be at least 6 characters' })
		.max(100, { message: 'Password must be less than 100 characters' }),

	full_name: z
		.string({ required_error: 'Full name is required' })
		.min(2, { message: 'Full name must be at least 2 characters' })
		.max(100, { message: 'Full name must be less than 100 characters' })
		.optional(),
});

export const loginSchema = z.object({
	email: z
		.string({ required_error: 'Email is required' })
		.email({ message: 'Invalid email format' })
		.toLowerCase(),

	password: z
		.string({ required_error: 'Password is required' })
		.min(1, { message: 'Password is required' }),
});
