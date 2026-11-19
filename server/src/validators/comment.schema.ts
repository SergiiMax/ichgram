import { z } from 'zod';

export const createCommentSchema = z.object({
  text: z.string().trim().min(1).max(500),
});

export type CreateCommentInput = z.infer<typeof createCommentSchema>;
