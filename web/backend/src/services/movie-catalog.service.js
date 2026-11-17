import { pool } from '../db/pool.js';
import { tmdbGet } from './tmdb.service.js';

const image = (path, size = 'w500') => path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

export async function importTmdbMovie(tmdbId) {
  const details = await tmdbGet(`/movie/${tmdbId}`, { language: 'vi-VN', append_to_response: 'credits,videos' });
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const saved = await client.query(
      `INSERT INTO movies (tmdb_id,title,vietnamese_title,original_title,synopsis,release_year,runtime_minutes,poster_url,banner_url,trailer_url,original_language,tagline,tmdb_vote_average,tmdb_vote_count,popularity,adult,updated_at)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,now())
       ON CONFLICT (tmdb_id) DO UPDATE SET title=EXCLUDED.title,vietnamese_title=EXCLUDED.vietnamese_title,original_title=EXCLUDED.original_title,synopsis=EXCLUDED.synopsis,release_year=EXCLUDED.release_year,runtime_minutes=EXCLUDED.runtime_minutes,poster_url=EXCLUDED.poster_url,banner_url=EXCLUDED.banner_url,trailer_url=EXCLUDED.trailer_url,original_language=EXCLUDED.original_language,tagline=EXCLUDED.tagline,tmdb_vote_average=EXCLUDED.tmdb_vote_average,tmdb_vote_count=EXCLUDED.tmdb_vote_count,popularity=EXCLUDED.popularity,adult=EXCLUDED.adult,updated_at=now()
       RETURNING movie_id`, [details.id, details.title, details.title, details.original_title, details.overview, details.release_date ? Number(details.release_date.slice(0, 4)) || null : null, details.runtime || null, image(details.poster_path), image(details.backdrop_path, 'w1280'), details.videos?.results?.find((v) => v.site === 'YouTube' && v.type === 'Trailer')?.key ? `https://www.youtube.com/watch?v=${details.videos.results.find((v) => v.site === 'YouTube' && v.type === 'Trailer').key}` : null, details.original_language, details.tagline, details.vote_average ?? null, details.vote_count ?? 0, details.popularity ?? 0, details.adult ?? false]);
    const movieId = saved.rows[0].movie_id;
    for (const genre of details.genres || []) {
      const row = await client.query(`INSERT INTO genres (tmdb_id,name) VALUES ($1,$2) ON CONFLICT (tmdb_id) DO UPDATE SET name=EXCLUDED.name RETURNING genre_id`, [genre.id, genre.name]);
      await client.query('INSERT INTO movie_genres (movie_id,genre_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [movieId, row.rows[0].genre_id]);
    }
    for (const country of details.production_countries || []) {
      const row = await client.query(`INSERT INTO countries (name) VALUES ($1) ON CONFLICT (name) DO UPDATE SET name=EXCLUDED.name RETURNING country_id`, [country.name]);
      await client.query('INSERT INTO movie_countries (movie_id,country_id) VALUES ($1,$2) ON CONFLICT DO NOTHING', [movieId, row.rows[0].country_id]);
    }
    await client.query('DELETE FROM movie_credits WHERE movie_id=$1', [movieId]);
    const credits = [...(details.credits?.crew || []).filter((p) => p.job === 'Director').slice(0, 5).map((p) => ({ ...p, creditRole: 'DIRECTOR' })), ...(details.credits?.cast || []).slice(0, 20).map((p) => ({ ...p, creditRole: 'ACTOR' }))];
    for (const person of credits) {
      const personRow = await client.query(`INSERT INTO persons (tmdb_id,name) VALUES ($1,$2) ON CONFLICT (tmdb_id) DO UPDATE SET name=EXCLUDED.name RETURNING person_id`, [person.id, person.name]);
      await client.query(`INSERT INTO movie_credits (movie_id,person_id,credit_role,character_name) VALUES ($1,$2,$3,$4) ON CONFLICT DO NOTHING`, [movieId, personRow.rows[0].person_id, person.creditRole, person.character || null]);
    }
    await client.query('COMMIT');
    return { movieId, tmdbId: details.id, title: details.title };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally { client.release(); }
}

export async function syncPopularMovies(pages = 1) {
  const imported = [];
  for (let page = 1; page <= pages; page += 1) {
    const list = await tmdbGet('/movie/popular', { language: 'vi-VN', page, region: 'VN' });
    for (const movie of list.results || []) imported.push(await importTmdbMovie(movie.id));
  }
  return imported;
}
