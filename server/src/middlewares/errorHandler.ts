import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import mongoose from 'mongoose';

export const errorHandler: ErrorRequestHandler = (err, req, res, _next) => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
  } else if (err instanceof mongoose.mongo.MongoServerError && err.code === 11000) {
    const field = Object.keys(err.keyValue ?? {})[0] ?? 'field';
    res.status(409).json({
      error: {
        code: `${field.toUpperCase()}_TAKEN`,
        message: `${field} is already taken`,
      },
    });
  } else if (err instanceof ZodError) {
    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid request data',
        details: err.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      },
    });
  } else {
    logger.error({ err }, 'Unhandled error');
    res.status(500).json({
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Internal server error',
        ...(env.NODE_ENV === 'development' && err instanceof Error ? { stack: err.stack } : {}),
      },
    });
  }
};
