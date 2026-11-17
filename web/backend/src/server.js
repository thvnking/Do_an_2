import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { healthRouter } from './routes/health.routes.js';
import { moviesRouter } from './routes/movies.routes.js';
import { aiRouter } from './routes/ai.routes.js';
import { tmdbRouter } from './routes/tmdb.routes.js';
import { migrate } from './db/migrate.js';
import { authRouter } from './routes/auth.routes.js';

const app = express();
const port = Number(process.env.PORT) || 10000;
app.set('trust proxy', 1);
app.use(helmet());
app.use(cors({ origin: (process.env.CORS_ORIGIN || 'http://localhost:5173').split(',').map((s) => s.trim()) }));
app.use(express.json({ limit: '1mb' }));
app.use(healthRouter);
app.use('/api/movies', moviesRouter);
app.use('/api/auth', authRouter);
const aiRequests = new Map();
app.use('/api/ai', (req, res, next) => {
  const now = Date.now();
  const key = req.ip;
  const window = aiRequests.get(key);
  if (!window || now >= window.until) aiRequests.set(key, { count: 1, until: now + 15 * 60 * 1000 });
  else if (++window.count > 15) return res.status(429).json({ error: 'Too many AI requests. Try again later.' });
  if (aiRequests.size > 10000) for (const [ip, item] of aiRequests) if (now >= item.until) aiRequests.delete(ip);
  next();
});
app.use('/api/ai', aiRouter);
app.use('/api/tmdb', tmdbRouter);
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = Number.isInteger(err.status) ? err.status : 500;
  res.status(status).json({ error: status === 503 ? err.message : status >= 500 ? 'Service temporarily unavailable' : err.message });
});
await migrate();
app.listen(port, '0.0.0.0', () => console.log(`CineMind API listening on ${port}`));
