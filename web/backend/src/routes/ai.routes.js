import { Router } from 'express';
import { pool } from '../db/pool.js';
import { askGemini } from '../services/ai.service.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

export const aiRouter = Router();
aiRouter.use(optionalAuth);

aiRouter.post('/chat', async (req, res, next) => {
  try {
    const message = typeof req.body.message === 'string' ? req.body.message.trim() : '';
    if (!message || message.length > 2000) return res.status(400).json({ error: 'message is required (maximum 2000 characters)' });
    let context = '';
    let chatType = 'GENERAL_SEARCH';
    if (req.body.movieId !== undefined) {
      const movie = await pool.query('SELECT title, vietnamese_title, original_title, synopsis, release_year, tagline FROM movies WHERE movie_id=$1', [req.body.movieId]);
      if (!movie.rowCount) return res.status(404).json({ error: 'Movie not found' });
      context = JSON.stringify(movie.rows[0]);
      chatType = 'MOVIE_PAGE_QA';
    } else {
      const ignoredTerms = new Set(['about', 'after', 'are', 'been', 'does', 'from', 'have', 'into', 'movie', 'movies', 'that', 'the', 'this', 'what', 'when', 'which', 'with', 'film', 'films', 'phim', 'cua', 'cho', 'trong', 'nhung', 'mot', 'ten', 'nao', 'gi', 'la', 'co', 'dao', 'dien', 'su', 'nghiep']);
      const terms = [...new Set((message.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase().match(/[\p{L}\p{N}]{4,}/gu) || []).filter((term) => !ignoredTerms.has(term)))].slice(0, 6);
      if (terms.length) {
        const patterns = terms.map((term) => `%${term}%`);
        const matches = terms.map((_, index) => {
          const parameter = `$${index + 1}`;
          return `(m.title ILIKE ${parameter} OR COALESCE(m.vietnamese_title, '') ILIKE ${parameter} OR COALESCE(m.original_title, '') ILIKE ${parameter} OR EXISTS (SELECT 1 FROM movie_credits mc JOIN persons p USING(person_id) WHERE mc.movie_id=m.movie_id AND p.name ILIKE ${parameter}))`;
        });
        const result = await pool.query(
          `SELECT m.movie_id,m.title,m.vietnamese_title,m.original_title,m.release_year,m.synopsis,m.tmdb_vote_average,
           (SELECT COALESCE(jsonb_agg(jsonb_build_object('name',c.name,'role',c.credit_role,'character',c.character_name)),'[]'::jsonb)
            FROM (SELECT p.name,mc.credit_role,mc.character_name FROM movie_credits mc JOIN persons p USING(person_id)
              WHERE mc.movie_id=m.movie_id ORDER BY CASE WHEN mc.credit_role='DIRECTOR' THEN 0 ELSE 1 END,mc.credit_order NULLS LAST LIMIT 6) c) AS credits
           FROM movies m WHERE m.adult=false AND (${matches.join(' OR ')})
           ORDER BY (${matches.map((match) => `CASE WHEN ${match} THEN 1 ELSE 0 END`).join(' + ')}) DESC,m.popularity DESC NULLS LAST LIMIT 8`, patterns);
        if (result.rowCount) context = JSON.stringify({ catalogMatches: result.rows });
      }
    }
    const answer = await askGemini(message, context);
    await pool.query('INSERT INTO ai_chat_history (user_id,chat_type,user_query,ai_response) VALUES ($1,$2,$3,$4)', [req.user?.userId||null,chatType,message,answer]);
    res.json({ answer, chatType });
  } catch (error) { next(error); }
});

aiRouter.post('/recommendations', requireAuth, async (req, res, next) => {
  try {
    const mood = typeof req.body.mood === 'string' ? req.body.mood.trim().slice(0, 300) : '';
    const candidates = await pool.query(
      `SELECT m.movie_id,m.title,m.vietnamese_title,m.synopsis,m.release_year,m.tmdb_vote_average,
       COALESCE(array_agg(DISTINCT g.name) FILTER (WHERE g.name IS NOT NULL),'{}') AS genres,
       count(DISTINCT g.genre_id) FILTER (WHERE g.genre_id IN (
         SELECT genre_id FROM user_favorite_genres WHERE user_id=$1
         UNION SELECT mg2.genre_id FROM reviews r JOIN movie_genres mg2 ON mg2.movie_id=r.movie_id WHERE r.user_id=$1 AND r.rating>=4
       )) AS preference_matches
       FROM movies m LEFT JOIN movie_genres mg USING(movie_id) LEFT JOIN genres g USING(genre_id)
       WHERE m.adult=false AND NOT EXISTS (SELECT 1 FROM watchlists w WHERE w.user_id=$1 AND w.movie_id=m.movie_id)
       GROUP BY m.movie_id ORDER BY preference_matches DESC,m.popularity DESC,m.tmdb_vote_count DESC LIMIT 40`, [req.user.userId]);
    if (!candidates.rowCount) return res.status(409).json({ error: 'Movie catalog is empty. Import movies from TMDB first.' });
    const prompt = `Gợi ý tối đa 5 phim dựa trên các thể loại user đã lưu, các phim user đánh giá từ 4/5 sao và yêu cầu hiện tại${mood ? `: ${mood}` : ''}. Chỉ được chọn phim có trong danh sách, ghi tên chính xác, lý do ngắn và movieId. Nếu danh sách thiếu tín hiệu cá nhân hóa, giải thích ngắn.\nDanh sách JSON:\n${JSON.stringify(candidates.rows)}`;
    const answer = await askGemini(prompt, 'Danh sách sau là dữ liệu phim có thật trong cơ sở dữ liệu CineMind. Không thêm phim ngoài danh sách.');
    await pool.query('INSERT INTO ai_chat_history (user_id,chat_type,user_query,ai_response) VALUES ($1,$2,$3,$4)', [req.user.userId, 'GENERAL_SEARCH', `Gợi ý phim: ${mood || 'dựa trên thể loại yêu thích và đánh giá cao'}`, answer]);
    res.json({ answer, catalogCount: candidates.rowCount });
  } catch (error) { next(error); }
});
