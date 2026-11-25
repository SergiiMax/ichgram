import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { pinoHttp } from 'pino-http';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { notFound } from './middlewares/notFound.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { logger } from './utils/logger.js';
import swaggerUi from 'swagger-ui-express';
import { openApiDocument } from './docs/openapi.js';

export const app = express();

app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(cookieParser());
app.use(express.json({ limit: '100kb' }));
app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === '/api/v1/health' },
  }),
);

app.get('/api/docs.json', (_req, res) => {
  res.json(openApiDocument);
});
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(openApiDocument));

app.use('/api/v1', apiRouter);
app.use(notFound);
app.use(errorHandler);
