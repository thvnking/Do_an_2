import { Router } from 'express';
import { tmdbGet } from '../services/tmdb.service.js';
import { importTmdbMovie, syncPopularMovies } from '../services/movie-catalog.service.js';

export const tmdbRouter = Router();

tmdbRouter.get('/search', async (req, res, next) => {
  try {
    const query = typeof req.query.query === 'string' ? req.query.query.trim() : '';
    if (!query) return res.status(400).json({ error: 'query is required' });
    const result = await tmdbGet('/search/movie', { query, language: 'vi-VN', page: Math.min(Math.max(Number(req.query.page) || 1, 1), 500) });
    res.json({ page: result.page, totalPages: result.total_pages, results: result.results });
  } catch (error) { next(error); }
});

tmdbRouter.post('/import/:tmdbId', async (req, res, next) => {
  try {
    if (!process.env.TMDB_SYNC_SECRET || req.get('x-sync-secret') !== process.env.TMDB_SYNC_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    const tmdbId = Number(req.params.tmdbId);
    if (!Number.isSafeInteger(tmdbId) || tmdbId < 1) return res.status(400).json({ error: 'Invalid TMDB movie id' });
    res.json({ data: await importTmdbMovie(tmdbId) });
  } catch (error) { next(error); }
});

tmdbRouter.post('/sync/popular', async (req, res, next) => {
  try {
    if (!process.env.TMDB_SYNC_SECRET || req.get('x-sync-secret') !== process.env.TMDB_SYNC_SECRET) return res.status(401).json({ error: 'Unauthorized' });
    const pages = Math.min(Math.max(Number(req.body.pages) || 1, 1), 5);
    const imported = await syncPopularMovies(pages);
    res.json({ imported: imported.length, data: imported });
  } catch (error) { next(error); }
});
