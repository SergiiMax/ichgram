import { z } from 'zod';

export const passwordSchema = z.string().min(8).max(72);

export const usernameSchema = z
  .string()
  .trim()
  .toLowerCase()
  .min(1)
  .max(30)
  .regex(/^[a-z0-9._]+$/, 'Only lowercase letters, numbers, dots and underscores');

export const fullNameSchema = z.string().trim().min(1).max(50);

export const registerSchema = z.object({
  email: z.email(),
  username: usernameSchema,
  fullName: fullNameSchema,
  password: passwordSchema,
});

export const loginSchema = z.object({
  login: z.string().trim().toLowerCase().min(3),
  password: z.string().min(1),
});

export const forgotPasswordSchema = z.object({
  login: z.string().trim().toLowerCase().min(3),
});

export const resetPasswordSchema = z.object({
  token: z
    .string()
    .length(64)
    .regex(/^[0-9a-f]+$/),
  password: passwordSchema,
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
