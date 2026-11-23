import { z } from 'zod';
import { objectIdSchema } from '../validators/common.schema.js';

const ERROR_DESCRIPTIONS: Record<number, string> = {
  400: 'Invalid request data',
  401: 'Not authenticated',
  403: 'Forbidden',
  404: 'Not found',
  409: 'Already exists',
  413: 'File too large',
  429: 'Too many requests',
};

export const idParam = z.object({ id: objectIdSchema });
export const usernameParam = z.object({ username: z.string() });

export function jsonBody(schema: z.ZodType) {
  return { content: { 'application/json': { schema } } };
}

export function imageForm(field: string, fields: z.ZodObject = z.object({})) {
  return {
    content: {
      'multipart/form-data': {
        schema: fields.extend({
          [field]: z.file().mime(['image/jpeg', 'image/png', 'image/webp']),
        }),
      },
    },
  };
}

export function errors(...codes: number[]) {
  return Object.fromEntries(
    codes.map((code) => [String(code), { description: ERROR_DESCRIPTIONS[code] ?? 'Error' }]),
  );
}
