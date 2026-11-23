import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

export const reviewsRouter = Router();
reviewsRouter.get('/movies/:movieId/reviews', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT r.review_id,r.rating,r.comment_text,r.created_at,u.username,u.avatar_url FROM reviews r JOIN users u USING(user_id) WHERE r.movie_id=$1 ORDER BY r.created_at DESC LIMIT 100`, [req.params.movieId]);
    res.json({ data: result.rows });
  } catch (error) { next(error); }
});
reviewsRouter.put('/movies/:movieId/review', requireAuth, async (req, res, next) => {
  try {
    const rating = Number(req.body.rating);
    const comment = typeof req.body.commentText === 'string' ? req.body.commentText.trim().slice(0, 5000) : null;
    if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ error: 'Rating must be an integer from 1 to 5' });
    const result = await pool.query(`INSERT INTO reviews(movie_id,user_id,rating,comment_text) VALUES($1,$2,$3,$4) ON CONFLICT(movie_id,user_id) DO UPDATE SET rating=EXCLUDED.rating,comment_text=EXCLUDED.comment_text,created_at=now() RETURNING review_id,rating,comment_text,created_at`, [req.params.movieId,req.user.userId,rating,comment]);
    res.json({ data: result.rows[0] });
  } catch (error) { if (error.code === '23503') return res.status(404).json({ error: 'Movie not found' }); next(error); }
});
reviewsRouter.delete('/movies/:movieId/review', requireAuth, async (req, res, next) => {
  try { await pool.query('DELETE FROM reviews WHERE movie_id=$1 AND user_id=$2', [req.params.movieId,req.user.userId]); res.status(204).end(); }
  catch (error) { next(error); }
});
