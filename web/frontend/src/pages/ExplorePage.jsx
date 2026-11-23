import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { Button, EmptyState, ErrorState, Input, LoadingSpinner, MovieGrid, Pagination, Select } from '../components/index.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import './pages.css';

const allowedSorts = new Set(['popular', 'rating', 'newest', 'title']);

export default function ExplorePage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const userId = user?.user_id;
  const queryString = searchParams.toString();
  const filters = useMemo(() => new URLSearchParams(queryString), [queryString]);
  const query = filters.get('q') || '';
  const genre = filters.get('genre') || '';
  const year = filters.get('year') || '';
  const requestedSort = filters.get('sort') || 'popular';
  const sort = allowedSorts.has(requestedSort) ? requestedSort : 'popular';
  const page = Math.max(1, Number.parseInt(filters.get('page') || '1', 10) || 1);
  const [searchDraft, setSearchDraft] = useState(query);
  const [genres, setGenres] = useState([]);
  const [movies, setMovies] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [genreError, setGenreError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  const pendingIds = useRef(new Set());

  useEffect(() => setSearchDraft(query), [query]);

  useEffect(() => {
    let active = true;
    api('/genres').then(result => { if (active) setGenres(result.data || []); }).catch(err => { if (active) setGenreError(err); });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    let active = true;
    const params = new URLSearchParams({ limit: '24', page: String(page), sort });
    if (query) params.set('q', query);
    if (genre) params.set('genre', genre);
    if (/^\d{4}$/.test(year)) params.set('year', year);
    setLoading(true);
    setError(null);
    api(`/movies?${params}`)
      .then(result => { if (active) setMovies(result.data || []); })
      .catch(err => { if (active) { setMovies([]); setError(err); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [query, genre, year, sort, page, reloadToken]);

  useEffect(() => {
    let active = true;
    if (!user) { setSavedIds(new Set()); return undefined; }
    api('/me/watchlist').then(result => {
      if (active) setSavedIds(new Set((result.data || []).map(item => item.movie_id)));
    }).catch(() => { if (active) setSavedIds(new Set()); });
    return () => { active = false; };
  }, [userId]);

  function updateFilters(updates) {
    const next = new URLSearchParams(searchParams);
    Object.entries(updates).forEach(([key, value]) => value === '' || value == null ? next.delete(key) : next.set(key, String(value)));
    setSearchParams(next, { replace: true });
  }

  function applySearch(event) {
    event.preventDefault();
    updateFilters({ q: searchDraft.trim(), page: '1' });
  }

  return <main className="page cm-explore-page">
    <div className="page-title"><small className="eyebrow">THƯ VIỆN CINEMIND</small><h1>Tìm câu chuyện<br/><em>tiếp theo của bạn.</em></h1><p>Tìm theo tên, thể loại hoặc năm phát hành.</p></div>
    <form className="cm-explore-filters" onSubmit={applySearch} role="search">
      <Input label="Tìm phim" type="search" placeholder="Tên phim…" value={searchDraft} onChange={event => setSearchDraft(event.target.value)}/>
      <Select label="Thể loại" value={genre} onChange={event => updateFilters({ genre: event.target.value, page: '1' })}>
        <option value="">Tất cả thể loại</option>{genres.map(item => <option key={item.genre_id} value={item.name}>{item.name}</option>)}
      </Select>
      <Input label="Năm phát hành" inputMode="numeric" maxLength={4} placeholder="VD: 2024" value={year} onChange={event => updateFilters({ year: event.target.value.replace(/\D/g, '').slice(0, 4), page: '1' })}/>
      <Select label="Sắp xếp" value={sort} onChange={event => updateFilters({ sort: event.target.value, page: '1' })}>
        <option value="popular">Phổ biến</option><option value="rating">Điểm TMDB cao</option><option value="newest">Mới nhất</option><option value="title">Tên A–Z</option>
      </Select>
      <div className="cm-explore-filters__actions"><Button type="submit">Tìm phim</Button><Button variant="ghost" onClick={() => { setSearchDraft(''); setSearchParams({}, { replace: true }); }}>Xóa bộ lọc</Button></div>
    </form>
    {genreError && <ErrorState error={genreError} title="Không tải được danh sách thể loại"/>}
    <ErrorState error={error} onRetry={() => setReloadToken(value => value + 1)}/>
    {loading ? <LoadingSpinner label="Đang tìm phim…"/> : movies.length ? <MovieGrid movies={movies} savedIds={savedIds} onToggle={user ? async movieId => {
      if (pendingIds.current.has(movieId)) return;
      pendingIds.current.add(movieId);
      try {
        if (savedIds.has(movieId)) { await api(`/me/watchlist/${movieId}`, { method: 'DELETE' }); setSavedIds(ids => new Set([...ids].filter(id => id !== movieId))); }
        else { await api('/me/watchlist', { method: 'POST', body: { movieId } }); setSavedIds(ids => new Set([...ids, movieId])); }
      } catch (err) { setError(err); }
      finally { pendingIds.current.delete(movieId); }
    } : undefined}/> : !error && <EmptyState title="Không tìm thấy phim phù hợp">Hãy thử thay đổi cụm từ hoặc bộ lọc.</EmptyState>}
    {!loading && !error && <Pagination page={page} hasPrevious={page > 1} hasNext={movies.length >= 24} onPageChange={nextPage => updateFilters({ page: String(Math.max(1, nextPage)) })}/>}
    <p className="cm-explore-note"><Link to="/blogs">Đọc thêm góc nhìn từ cộng đồng CineMind →</Link></p>
  </main>;
}
