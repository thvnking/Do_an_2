import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

export const watchlistRouter = Router();
watchlistRouter.use(requireAuth);
watchlistRouter.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT w.status,w.added_at,m.movie_id,m.title,m.poster_url,m.release_year,m.tmdb_vote_average FROM watchlists w JOIN movies m USING(movie_id) WHERE w.user_id=$1 ORDER BY w.added_at DESC`, [req.user.userId]);
    res.json({ data: result.rows });
  } catch (error) { next(error); }
});
watchlistRouter.post('/', async (req, res, next) => {
  try {
    const movieId = Number(req.body.movieId);
    const status = req.body.status || 'WANT_TO_WATCH';
    if (!Number.isSafeInteger(movieId) || movieId < 1 || !['WANT_TO_WATCH','WATCHED'].includes(status)) return res.status(400).json({ error: 'Valid movieId and status are required' });
    const result = await pool.query(`INSERT INTO watchlists(user_id,movie_id,status) VALUES($1,$2,$3) ON CONFLICT(user_id,movie_id) DO UPDATE SET status=EXCLUDED.status RETURNING *`, [req.user.userId,movieId,status]);
    res.status(201).json({ data: result.rows[0] });
  } catch (error) { if (error.code === '23503') return res.status(404).json({ error: 'Movie not found' }); next(error); }
});
watchlistRouter.patch('/:movieId', async (req, res, next) => {
  try {
    if (!['WANT_TO_WATCH','WATCHED'].includes(req.body.status)) return res.status(400).json({ error: 'Invalid watchlist status' });
    const result = await pool.query('UPDATE watchlists SET status=$1 WHERE user_id=$2 AND movie_id=$3 RETURNING *', [req.body.status,req.user.userId,req.params.movieId]);
    if (!result.rowCount) return res.status(404).json({ error: 'Watchlist item not found' });
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});
watchlistRouter.delete('/:movieId', async (req, res, next) => {
  try { await pool.query('DELETE FROM watchlists WHERE user_id=$1 AND movie_id=$2', [req.user.userId,req.params.movieId]); res.status(204).end(); }
  catch (error) { next(error); }
});
