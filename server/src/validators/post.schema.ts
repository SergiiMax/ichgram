import { z } from 'zod';
import { objectIdSchema } from './common.schema.js';

export const createPostSchema = z.object({
  caption: z.string().trim().max(2200).default(''),
});

export const updatePostSchema = z.object({
  caption: z.string().trim().max(2200).optional(),
});

export const exploreQuerySchema = z.object({
  limit: z.coerce.number().int().min(1).max(50).default(30),
  exclude: z
    .string()
    .optional()
    .transform((value) => (value ? value.split(',') : []))
    .pipe(z.array(objectIdSchema).max(300)),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
export type ExploreQuery = z.infer<typeof exploreQuerySchema>;
