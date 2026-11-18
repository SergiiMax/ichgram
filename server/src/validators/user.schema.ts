import { z } from 'zod';
import { usernameSchema, fullNameSchema } from './auth.schema.js';

export const updateProfileSchema = z
  .object({
    fullName: fullNameSchema.optional(),
    username: usernameSchema.optional(),
    bio: z.string().trim().max(150).optional(),
    website: z
      .url({ protocol: /^https?$/ })
      .or(z.literal(''))
      .optional(),
  })
  .refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field is required',
  });

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
