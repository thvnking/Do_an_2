import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/index.jsx';

export function MoviePoster({ src, alt, title, fallback, className = '', loading = 'lazy' }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) return <div className={`poster cm-movie-poster cm-movie-poster--fallback ${className}`} role="img" aria-label={alt || title || 'Poster phim'}>
    <span aria-hidden="true">{title?.trim()?.[0]?.toLocaleUpperCase('vi-VN') || 'C'}</span><strong>{fallback || title || 'Chưa có poster'}</strong>
  </div>;
  return <div className={`poster poster-image cm-movie-poster ${className}`}>
    <img src={src} alt={alt || title || 'Poster phim'} loading={loading} onError={() => setFailed(true)}/>
    {title && <span className="poster-label">{title}</span>}
  </div>;
}

export function MovieBackdrop({ src, alt = '', title, children, className = '' }) {
  const [failed, setFailed] = useState(false);
  return <section className={`cm-movie-backdrop ${className}`}>
    {src && !failed && <img className="cm-movie-backdrop__preload" src={src} alt={alt} onError={() => setFailed(true)}/>}
    {title && <div className="cm-movie-backdrop__content"><h2>{title}</h2>{children}</div>}{!title && children}
  </section>;
}

export function Rating({ value, max = 5, label = 'Đánh giá', showValue = false, className = '' }) {
  const numeric = Number(value);
  const valid = Number.isFinite(numeric) && numeric >= 0 && numeric <= max;
  if (!valid) return <span className={`cm-rating cm-rating--unavailable ${className}`} aria-label={`${label}: chưa có dữ liệu`}>—</span>;
  const rounded = Math.round(numeric);
  return <span className={`cm-rating ${className}`} role="img" aria-label={`${label}: ${numeric} trên ${max}`}>
    <span aria-hidden="true">{Array.from({ length: max }, (_, i) => <span key={i} className={i < rounded ? 'is-filled' : ''}>★</span>)}</span>
    {showValue && <span className="cm-rating__value">{numeric.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}/{max}</span>}
  </span>;
}

export function MovieMetadata({ year, genres = [], rating, tmdbRating, className = '' }) {
  const genreList = Array.isArray(genres) ? genres : [];
  return <div className={`cm-movie-metadata ${className}`}>
    <span>{year || '—'}{genreList.length ? ` · ${genreList.slice(0, 2).join(' · ')}` : ''}</span>
    {rating !== undefined && <span><Rating value={rating} label="Điểm phim" showValue/></span>}
    {tmdbRating !== undefined && tmdbRating !== null && <span className="cm-movie-metadata__tmdb" aria-label={`Điểm TMDB ${tmdbRating} trên 10`}>★ {tmdbRating}/10 TMDB</span>}
  </div>;
}

export function MovieCard({ movie, href, saved = false, onToggle, className = '' }) {
  if (!movie) return null;
  const title = movie.vietnamese_title || movie.title || 'Chưa có tiêu đề';
  const destination = href || `/movies/${movie.movie_id}`;
  const genres = movie.genres || [];
  const rating = movie.community_rating;
  return <div className={`movie-wrap cm-movie-wrap ${className}`}>
    <article className="movie cm-movie-card">
      <Link to={destination} aria-label={`Xem phim ${title}`}><MoviePoster src={movie.poster_url} title={title} alt={`Poster ${title}`}/></Link>
      <MovieMetadata year={movie.release_year} genres={genres} rating={rating} tmdbRating={movie.tmdb_vote_average}/>
      <Link className="movie-title" to={destination}>{title}</Link>
    </article>
    {onToggle && <Button variant="icon" className="save" onClick={() => onToggle(movie.movie_id)} aria-label={saved ? 'Bỏ khỏi danh sách lưu' : 'Lưu phim'} aria-pressed={saved}>{saved ? '♥' : '♡'}</Button>}
  </div>;
}

export function MovieGrid({ movies, children, className = '', columns = 'auto', savedIds, onToggle, ...props }) {
  const savedSet = savedIds instanceof Set ? savedIds : new Set(savedIds || []);
  return <div className={`movie-grid cm-movie-grid ${className}`} data-columns={columns} {...props}>
    {children ?? movies?.map(movie => <MovieCard key={movie.movie_id} movie={movie} saved={savedSet.has(movie.movie_id)} onToggle={onToggle}/>) }
  </div>;
}
