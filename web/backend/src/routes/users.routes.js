import { Router } from 'express';
import { pool } from '../db/pool.js';
import { requireAuth } from '../middleware/auth.js';
import bcrypt from 'bcryptjs';

export const usersRouter = Router();
usersRouter.use(requireAuth);

usersRouter.get('/me', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT u.user_id,u.username,u.email,u.full_name,u.avatar_url,u.role,u.created_at,
       COALESCE(array_agg(DISTINCT g.genre_id) FILTER (WHERE g.genre_id IS NOT NULL),'{}') AS favorite_genre_ids,
       COALESCE(array_agg(DISTINCT g.name) FILTER (WHERE g.name IS NOT NULL),'{}') AS favorite_genres
       FROM users u LEFT JOIN user_favorite_genres f USING(user_id) LEFT JOIN genres g USING(genre_id)
       WHERE u.user_id=$1 GROUP BY u.user_id`, [req.user.userId]);
    if (!result.rowCount) return res.status(404).json({ error: 'User not found' });
    res.json({ user: result.rows[0] });
  } catch (error) { next(error); }
});

usersRouter.patch('/me', async (req, res, next) => {
  try {
    const fullName = typeof req.body.fullName === 'string' ? req.body.fullName.trim().slice(0, 150) : null;
    const avatarUrl = typeof req.body.avatarUrl === 'string' ? req.body.avatarUrl.trim().slice(0, 1000) : null;
    if (req.body.fullName !== undefined && typeof req.body.fullName !== 'string') return res.status(400).json({ error: 'fullName must be a string' });
    if (req.body.avatarUrl && !/^https?:\/\//i.test(avatarUrl || '')) return res.status(400).json({ error: 'avatarUrl must be an http(s) URL' });
    const result = await pool.query('UPDATE users SET full_name=COALESCE($1,full_name),avatar_url=COALESCE($2,avatar_url) WHERE user_id=$3 RETURNING user_id,username,email,full_name,avatar_url,role', [fullName, avatarUrl, req.user.userId]);
    res.json({ user: result.rows[0] });
  } catch (error) { next(error); }
});

usersRouter.patch('/me/password', async (req,res,next) => {
  try {
    const currentPassword=typeof req.body.currentPassword==='string'?req.body.currentPassword:'';
    const newPassword=typeof req.body.newPassword==='string'?req.body.newPassword:'';
    if(newPassword.length<8||newPassword.length>100)return res.status(400).json({error:'New password must be 8–100 characters'});
    const result=await pool.query('SELECT password_hash FROM users WHERE user_id=$1',[req.user.userId]);
    if(!result.rowCount||!(await bcrypt.compare(currentPassword,result.rows[0].password_hash)))return res.status(401).json({error:'Current password is incorrect'});
    const hash=await bcrypt.hash(newPassword,12);
    await pool.query('UPDATE users SET password_hash=$1 WHERE user_id=$2',[hash,req.user.userId]);
    res.json({message:'Password updated'});
  }catch(error){next(error);}
});

usersRouter.put('/me/favorite-genres', async (req, res, next) => {
  const genreIds = Array.isArray(req.body.genreIds) ? [...new Set(req.body.genreIds.map(Number).filter((id) => Number.isSafeInteger(id) && id > 0))].slice(0, 30) : null;
  if (!genreIds) return res.status(400).json({ error: 'genreIds must be an array of IDs' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const found = await client.query('SELECT genre_id FROM genres WHERE genre_id=ANY($1::bigint[])', [genreIds]);
    if (found.rowCount !== genreIds.length) { await client.query('ROLLBACK'); return res.status(400).json({ error: 'One or more genres do not exist' }); }
    await client.query('DELETE FROM user_favorite_genres WHERE user_id=$1', [req.user.userId]);
    if (genreIds.length) await client.query('INSERT INTO user_favorite_genres(user_id,genre_id) SELECT $1, unnest($2::bigint[])', [req.user.userId, genreIds]);
    await client.query('COMMIT');
    res.json({ genreIds });
  } catch (error) { await client.query('ROLLBACK'); next(error); }
  finally { client.release(); }
});

usersRouter.get('/me/history', async (req, res, next) => {
  try {
    const result = await pool.query(`SELECT h.viewed_at,m.movie_id,m.title,m.poster_url,m.release_year FROM movie_view_history h JOIN movies m USING(movie_id) WHERE h.user_id=$1 ORDER BY h.viewed_at DESC LIMIT 100`, [req.user.userId]);
    res.json({ data: result.rows });
  } catch (error) { next(error); }
});
