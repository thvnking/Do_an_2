import { Router } from 'express';
import { pool } from '../db/pool.js';

export const healthRouter = Router();
healthRouter.get('/healthz', (_req, res) => res.json({ status: 'ok' }));
healthRouter.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok', database: 'connected' });
  } catch {
    res.status(503).json({ status: 'error', database: 'unavailable' });
  }
});
