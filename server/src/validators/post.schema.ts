import { z } from 'zod';

export const createPostSchema = z.object({
  caption: z.string().trim().max(2200).default(''),
});

export const updatePostSchema = z.object({
  caption: z.string().trim().max(2200).optional(),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
export type UpdatePostInput = z.infer<typeof updatePostSchema>;
