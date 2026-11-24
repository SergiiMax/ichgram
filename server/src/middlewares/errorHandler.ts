import type { ErrorRequestHandler } from 'express';
import { AppError } from '../utils/AppError.js';
import { ZodError } from 'zod';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';
import mongoose from 'mongoose';
import multer from 'multer';

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
  } else if (err instanceof multer.MulterError) {
    const isTooLarge = err.code === 'LIMIT_FILE_SIZE';
    res.status(isTooLarge ? 413 : 400).json({
      error: {
        code: isTooLarge ? 'FILE_TOO_LARGE' : 'UPLOAD_ERROR',
        message: isTooLarge ? 'File is too large (max 5 MB)' : err.message,
      },
    });
  } else if (err instanceof Error && 'type' in err && err.type === 'entity.too.large') {
    res.status(413).json({
      error: { code: 'PAYLOAD_TOO_LARGE', message: 'Request body is too large' },
    });
  } else if (err instanceof SyntaxError && 'type' in err && err.type === 'entity.parse.failed') {
    res.status(400).json({
      error: { code: 'INVALID_JSON', message: 'Request body is not valid JSON' },
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
