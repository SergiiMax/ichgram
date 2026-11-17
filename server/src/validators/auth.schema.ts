import { z } from 'zod';

const passwordSchema = z.string().min(8).max(72);

export const registerSchema = z.object({
  email: z.email(),
  username: z
    .string()
    .trim()
    .toLowerCase()
    .min(3)
    .max(30)
    .regex(/^[a-z0-9._]+$/, 'Only lowercase letters, numbers, dots and underscores'),
  fullName: z.string().trim().min(1).max(50),
  password: passwordSchema,
});

export const loginSchema = z.object({
  login: z.string().trim().toLowerCase().min(1),
  password: z.string().min(1),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
