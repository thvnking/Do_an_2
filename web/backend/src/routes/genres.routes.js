import { Router } from 'express';
import { pool } from '../db/pool.js';

export const genresRouter = Router();
genresRouter.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query('SELECT genre_id,name FROM genres ORDER BY name');
    res.json({ data: result.rows });
  } catch (error) { next(error); }
});
