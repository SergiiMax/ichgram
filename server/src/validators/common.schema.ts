import z from 'zod';

export const objectIdSchema = z.string().regex(/^[0-9a-f]{24}$/, 'Invalid id');

export const paginationQuerySchema = z.object({
  cursor: objectIdSchema.optional(),
  limit: z.coerce.number().int().min(1).max(50).default(30),
});

export type PaginationQuery = z.infer<typeof paginationQuerySchema>;
