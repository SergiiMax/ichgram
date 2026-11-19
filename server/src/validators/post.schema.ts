import { z } from 'zod';

export const createPostSchema = z.object({
  caption: z.string().trim().max(2200).default(''),
});

export type CreatePostInput = z.infer<typeof createPostSchema>;
