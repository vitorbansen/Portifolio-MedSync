import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { env } from './lib/env';
import { router } from './routes';
import { errorHandler } from './middlewares/errorHandler';

export const app = express();

const isProd = env.NODE_ENV === 'production';

app.disable('x-powered-by');
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'"],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", env.CORS_ORIGIN],
        objectSrc: ["'none'"],
        frameAncestors: ["'none'"],
      },
    },
    crossOriginResourcePolicy: { policy: 'same-site' },
    referrerPolicy: { policy: 'no-referrer' },
    hsts: isProd ? { maxAge: 31536000, includeSubDomains: true, preload: false } : false,
  }),
);
app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
app.use(express.json({ limit: '100kb' }));
app.use(morgan(env.NODE_ENV === 'development' ? 'dev' : 'combined'));

app.use('/api', router);

app.use(errorHandler);
