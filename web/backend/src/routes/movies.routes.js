import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';

export const moviesRouter = Router();
moviesRouter.get('/', async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 20, 1), 100);
    const page = Math.min(Math.max(Number.parseInt(req.query.page, 10) || 1, 1), 10000);
    const offset = (page - 1) * limit;
    const conditions = ['m.adult=false'];
    const params = [];
    if (typeof req.query.q === 'string' && req.query.q.trim()) {
      params.push(`%${req.query.q.trim().slice(0, 100)}%`);
      conditions.push(`(m.title ILIKE $${params.length} OR m.vietnamese_title ILIKE $${params.length} OR m.original_title ILIKE $${params.length})`);
    }
    if (/^\d{4}$/.test(String(req.query.year || ''))) { params.push(Number(req.query.year)); conditions.push(`m.release_year=$${params.length}`); }
    if (typeof req.query.genre === 'string' && req.query.genre.trim()) {
      params.push(req.query.genre.trim().slice(0, 80));
      conditions.push(`EXISTS (SELECT 1 FROM movie_genres x JOIN genres g ON g.genre_id=x.genre_id WHERE x.movie_id=m.movie_id AND g.name ILIKE $${params.length})`);
    }
    const orderBy = ({ popular: 'm.popularity DESC', rating: 'm.tmdb_vote_average DESC NULLS LAST', newest: 'm.release_year DESC NULLS LAST', title: 'm.title ASC' })[req.query.sort] || 'm.popularity DESC';
    params.push(limit, offset);
    const result = await pool.query(
      `SELECT m.movie_id,m.tmdb_id,m.title,m.vietnamese_title,m.original_title,m.synopsis,m.release_year,m.runtime_minutes,m.poster_url,m.banner_url,m.trailer_url,m.tmdb_vote_average,m.tmdb_vote_count,
       COALESCE(array_agg(DISTINCT g.name) FILTER (WHERE g.name IS NOT NULL),'{}') AS genres
       FROM movies m LEFT JOIN movie_genres mg USING(movie_id) LEFT JOIN genres g USING(genre_id)
       WHERE ${conditions.join(' AND ')} GROUP BY m.movie_id ORDER BY ${orderBy} LIMIT $${params.length - 1} OFFSET $${params.length}`, params);
    res.json({ page, limit, data: result.rows });
  } catch (error) { next(error); }
});

moviesRouter.get('/:id', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT m.*, COALESCE((SELECT jsonb_agg(DISTINCT g.name) FROM movie_genres mg JOIN genres g USING(genre_id) WHERE mg.movie_id=m.movie_id),'[]') AS genres,
       COALESCE((SELECT jsonb_agg(DISTINCT c.name) FROM movie_countries mc JOIN countries c USING(country_id) WHERE mc.movie_id=m.movie_id),'[]') AS countries,
       COALESCE((SELECT jsonb_agg(jsonb_build_object('name',p.name,'role',cr.credit_role,'character',cr.character_name)) FROM movie_credits cr JOIN persons p USING(person_id) WHERE cr.movie_id=m.movie_id),'[]') AS credits,
       (SELECT round(avg(rating)::numeric,2) FROM reviews WHERE movie_id=m.movie_id) AS community_rating,
       (SELECT count(*) FROM reviews WHERE movie_id=m.movie_id) AS review_count
       FROM movies m WHERE m.movie_id=$1`, [req.params.id]);
    if (!result.rowCount) return res.status(404).json({ error: 'Movie not found' });
    res.json({ data: result.rows[0] });
  } catch (error) { next(error); }
});

moviesRouter.post('/:id/views', requireAuth, async (req,res,next) => {
  try {
    await pool.query('INSERT INTO movie_view_history(user_id,movie_id) SELECT $1,movie_id FROM movies WHERE movie_id=$2',[req.user.userId,req.params.id]);
    res.status(204).end();
  } catch(error){next(error);}
});
