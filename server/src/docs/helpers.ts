import type { z } from 'zod';

const ERROR_DESCRIPTIONS: Record<number, string> = {
  400: 'Invalid request data',
  401: 'Not authenticated',
  403: 'Forbidden',
  404: 'Not found',
  409: 'Already exists',
  413: 'File too large',
  429: 'Too many requests',
};

export function jsonBody(schema: z.ZodType) {
  return { content: { 'application/json': { schema } } };
}

export function errors(...codes: number[]) {
  return Object.fromEntries(
    codes.map((code) => [String(code), { description: ERROR_DESCRIPTIONS[code] ?? 'Error' }]),
  );
}
