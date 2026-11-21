import { z } from 'zod';
import { objectIdSchema } from './common.schema.js';

export const createConversationSchema = z.object({
  userId: objectIdSchema,
});
