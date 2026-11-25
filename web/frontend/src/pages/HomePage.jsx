import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { BlogCard, Button, EmptyState, ErrorState, HorizontalCarousel, LoadingSpinner, MovieBackdrop, MovieGrid, MovieMetadata, MoviePoster } from '../components/index.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import './pages.css';

function getYouTubeEmbedUrl(value) {
  if (typeof value !== 'string' || !value.trim()) return null;
  try {
    if (/^[A-Za-z0-9_-]{11}$/.test(value.trim())) {
      const id = value.trim();
      const params = new URLSearchParams({ autoplay: '1', mute: '1', controls: '0', loop: '1', playlist: id, playsinline: '1', rel: '0', modestbranding: '1' });
      return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
    }
    const url = new URL(value);
    const host = url.hostname.toLowerCase().replace(/^www\./, '');
    let id = '';
    if (host === 'youtu.be') id = url.pathname.split('/').filter(Boolean)[0] || '';
    else if (host === 'youtube.com' || host === 'm.youtube.com' || host === 'youtube-nocookie.com') {
      id = url.searchParams.get('v') || url.pathname.match(/^\/(?:embed|shorts|live)\/([^/?]+)/)?.[1] || '';
    }
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) return null;
    const params = new URLSearchParams({ autoplay: '1', mute: '1', controls: '0', loop: '1', playlist: id, playsinline: '1', rel: '0', modestbranding: '1' });
    return `https://www.youtube-nocookie.com/embed/${id}?${params}`;
  } catch { return null; }
}

function SectionHeading({ eyebrow, title, to, linkLabel }) {
  return <div className="section-head cm-page-section__head">
    <div><small className="eyebrow">{eyebrow}</small><h2>{title}</h2></div>
    {to && <Link to={to}>{linkLabel || 'Xem tất cả →'}</Link>}
  </div>;
}

export default function HomePage() {
  const { user } = useAuth();
  const [popular, setPopular] = useState([]);
  const [topRated, setTopRated] = useState([]);
  const [heroSelection, setHeroSelection] = useState(0);
  const [heroPaused, setHeroPaused] = useState(false);
  const [newReleases, setNewReleases] = useState([]);
  const [posts, setPosts] = useState([]);
  const [genres, setGenres] = useState([]);
  const [savedIds, setSavedIds] = useState(new Set());
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [reloadToken, setReloadToken] = useState(0);
  const pendingIds = useRef(new Set());
  const userId = user?.user_id;

  useEffect(() => {
    let current = true;
    setLoading(true);
    const requests = [
      api('/movies?limit=8&sort=popular'),
      api('/movies?limit=8&sort=rating'),
      api('/movies?limit=8&sort=newest'),
      api('/blogs?limit=3'),
      api('/genres'),
    ];
    Promise.allSettled(requests).then(results => {
      if (!current) return;
      const failures = {};
      if (results[0].status === 'fulfilled') setPopular(results[0].value.data || []); else failures.popular = results[0].reason;
      if (results[1].status === 'fulfilled') setTopRated(results[1].value.data || []); else failures.topRated = results[1].reason;
      if (results[2].status === 'fulfilled') setNewReleases(results[2].value.data || []); else failures.newReleases = results[2].reason;
      if (results[3].status === 'fulfilled') setPosts(results[3].value.data || []); else failures.posts = results[3].reason;
      if (results[4].status === 'fulfilled') setGenres(results[4].value.data || []); else failures.genres = results[4].reason;
      setErrors(currentErrors => ({ ...Object.fromEntries(Object.entries(currentErrors).filter(([key]) => key === 'watchlist' || key === 'watchlistAction')), ...failures }));
    }).finally(() => { if (current) setLoading(false); });
    return () => { current = false; };
  }, [reloadToken]);

  useEffect(() => {
    let current = true;
    if (!user) { setSavedIds(new Set()); setErrors(items => { const { watchlist, watchlistAction, ...rest } = items; return rest; }); return undefined; }
    api('/me/watchlist').then(result => { if (current) setSavedIds(new Set((result.data || []).map(item => item.movie_id))); })
      .catch(error => { if (current) setErrors(items => ({ ...items, watchlist: error })); });
    return () => { current = false; };
  }, [userId]);

  async function toggleWatchlist(movieId) {
    if (!user || pendingIds.current.has(movieId)) return;
    pendingIds.current.add(movieId);
    try {
      if (savedIds.has(movieId)) {
        await api(`/me/watchlist/${movieId}`, { method: 'DELETE' });
        setSavedIds(ids => new Set([...ids].filter(id => id !== movieId)));
      } else {
        await api('/me/watchlist', { method: 'POST', body: { movieId } });
        setSavedIds(ids => new Set([...ids, movieId]));
      }
      setErrors(items => { const { watchlistAction, ...rest } = items; return rest; });
    } catch (error) {
      setErrors(items => ({ ...items, watchlistAction: error }));
    } finally {
      pendingIds.current.delete(movieId);
    }
  }

  const heroMovies = popular.slice(0, 5);
  const featuredIndex = heroMovies.length ? heroSelection % heroMovies.length : 0;
  const featured = heroMovies[featuredIndex];
  const prefersReducedMotion = typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
  const trailerEmbedUrl = getYouTubeEmbedUrl(featured?.trailer_url);
  const [trailerFailed, setTrailerFailed] = useState(false);

  useEffect(() => setHeroSelection(index => heroMovies.length ? index % heroMovies.length : 0), [heroMovies.length]);
  useEffect(() => { setTrailerFailed(false); }, [featured?.movie_id]);
  useEffect(() => {
    if (heroMovies.length < 2 || heroPaused || prefersReducedMotion) return undefined;
    const timer = window.setInterval(() => {
      if (document.visibilityState === 'visible') setHeroSelection(index => (index + 1) % heroMovies.length);
    }, 12000);
    return () => window.clearInterval(timer);
  }, [heroMovies.length, heroPaused, prefersReducedMotion]);

  function chooseHero(index) {
    if (!heroMovies.length) return;
    setHeroSelection((index + heroMovies.length) % heroMovies.length);
    setHeroPaused(true);
  }

  return <main className="cm-home-page">
    <MovieBackdrop key={featured?.movie_id || 'empty-hero'} src={featured?.banner_url || featured?.poster_url} title={null} alt={featured ? `Ảnh nền ${featured.title}` : ''} className="cm-home-hero">
      <div className="cm-home-hero__content" onPointerEnter={event => { if (!event.target.closest('button, a')) setHeroPaused(true); }}>
        <small className="eyebrow">CINEMIND · CỘNG ĐỒNG ĐIỆN ẢNH</small>
        <div className={`cm-home-hero__panel${trailerEmbedUrl && !trailerFailed ? ' has-trailer' : ''}`} key={featured?.movie_id || 'empty-hero'}>
          {featured && <MoviePoster src={featured.poster_url} fallback={featured.vietnamese_title || featured.title} alt={`Poster ${featured.title}`} className="cm-home-hero__poster"/>}
          <div className="cm-home-hero__copy">
            <small className="cm-home-hero__kicker">{featured ? 'PHIM NỔI BẬT' : 'CỘNG ĐỒNG ĐIỆN ẢNH'}</small>
            <h1>{featured ? (featured.vietnamese_title || featured.title) : 'Mỗi bộ phim mở ra một thế giới.'}</h1>
            {featured ? <>
              <MovieMetadata year={featured.release_year} genres={featured.genres || []} tmdbRating={featured.tmdb_vote_average}/>
              <p className="cm-home-hero__synopsis">{featured.synopsis || 'Khám phá câu chuyện điện ảnh này và chia sẻ góc nhìn cùng cộng đồng CineMind.'}</p>
            </> : <p>Khám phá phim, lưu những câu chuyện yêu thích và chia sẻ góc nhìn cùng cộng đồng CineMind.</p>}
            <div className="cm-home-hero__actions">
              <Link className="primary" to={featured ? `/movies/${featured.movie_id}` : '/movies'}>{featured ? 'Xem chi tiết phim' : 'Khám phá phim'} <span aria-hidden="true">↗</span></Link>
              {featured?.trailer_url && <a className="plain" href={featured.trailer_url} target="_blank" rel="noreferrer">Xem trailer ↗</a>}
              <Link className="plain" to="/ai">Hỏi CineMind AI →</Link>
            </div>
          </div>
          {trailerEmbedUrl && !trailerFailed && <div className="cm-home-hero__video"><iframe key={featured?.movie_id} src={trailerEmbedUrl} title={`Trailer ${featured?.vietnamese_title || featured?.title || 'phim nổi bật'}`} allow="autoplay; encrypted-media; picture-in-picture" allowFullScreen loading="eager" onError={() => setTrailerFailed(true)}/></div>}
          {heroMovies.length > 1 && <div className="cm-home-hero__controls" aria-label="Chọn phim nổi bật">
            <Button variant="outline" size="sm" onClick={() => chooseHero(featuredIndex - 1)} aria-label="Phim nổi bật trước">←</Button>
            {heroMovies.map((movie, index) => <button key={movie.movie_id} className="cm-home-hero__indicator" type="button" aria-label={`Chọn phim ${movie.vietnamese_title || movie.title}`} aria-pressed={index === featuredIndex} onClick={() => chooseHero(index)}><span/></button>)}
            <Button variant="outline" size="sm" onClick={() => chooseHero(featuredIndex + 1)} aria-label="Phim nổi bật tiếp theo">→</Button>
            <Button variant="ghost" size="sm" disabled={prefersReducedMotion} onClick={() => setHeroPaused(paused => !paused)} aria-label={prefersReducedMotion ? 'Tự động chuyển đã tắt theo cài đặt giảm chuyển động' : heroPaused ? 'Bật tự động chuyển phim' : 'Tạm dừng tự động chuyển phim'}>{prefersReducedMotion ? '↻' : heroPaused ? '▶' : 'Ⅱ'}</Button>
          </div>}
        </div>
      </div>
    </MovieBackdrop>

    <div className="page cm-home-content">
      {Object.entries(errors).map(([source, error]) => <ErrorState key={source} error={error} title="Một phần nội dung chưa tải được" onRetry={() => {
        if (source === 'popular' || source === 'topRated' || source === 'newReleases' || source === 'posts' || source === 'genres') setReloadToken(value => value + 1);
        else if (user) api('/me/watchlist').then(result => { setSavedIds(new Set((result.data || []).map(item => item.movie_id))); setErrors(items => { const { watchlist, watchlistAction, ...rest } = items; return rest; }); }).catch(err => setErrors(items => ({ ...items, watchlist: err })));
      }}/>)}

      <section className="section cm-page-section">
        <SectionHeading eyebrow="ĐANG ĐƯỢC QUAN TÂM" title="Phim thịnh hành" to="/movies"/>
        {loading ? <LoadingSpinner label="Đang tải phim…"/> : popular.length ? <HorizontalCarousel label="phim thịnh hành"><MovieGrid className="cm-home-movie-track" movies={popular} savedIds={savedIds} onToggle={user ? toggleWatchlist : undefined}/></HorizontalCarousel> : !errors.popular && <EmptyState>Chưa có phim trong danh mục.</EmptyState>}
      </section>

      <section className="section cm-page-section">
        <SectionHeading eyebrow="ĐIỂM TMDB" title="Được đánh giá cao" to="/movies?sort=rating"/>
        {loading ? <LoadingSpinner label="Đang tải danh sách phim…"/> : topRated.length ? <HorizontalCarousel label="phim điểm cao"><MovieGrid className="cm-home-movie-track" movies={topRated} savedIds={savedIds} onToggle={user ? toggleWatchlist : undefined}/></HorizontalCarousel> : !errors.topRated && <EmptyState>Chưa có dữ liệu xếp hạng.</EmptyState>}
      </section>

      <section className="section cm-page-section">
        <SectionHeading eyebrow="MỚI TRONG DANH MỤC" title="Phim mới phát hành" to="/movies?sort=newest"/>
        {loading ? <LoadingSpinner label="Đang tải phim mới…"/> : newReleases.length ? <HorizontalCarousel label="phim mới"><MovieGrid className="cm-home-movie-track" movies={newReleases} savedIds={savedIds} onToggle={user ? toggleWatchlist : undefined}/></HorizontalCarousel> : !errors.newReleases && <EmptyState>Chưa có phim mới trong danh mục.</EmptyState>}
      </section>

      {genres.length > 0 && <section className="section cm-page-section">
        <SectionHeading eyebrow="TÌM THEO SỞ THÍCH" title="Khám phá thể loại" to="/movies"/>
        <nav className="cm-home-genres" aria-label="Thể loại phim">
          {genres.map(genre => <Link key={genre.genre_id} to={`/movies?genre=${encodeURIComponent(genre.name)}`}>{genre.name}</Link>)}
        </nav>
      </section>}

      <section className="cm-home-community">
        <div><small className="eyebrow">CỘNG ĐỒNG CINE MIND</small><h2>Điện ảnh là để cùng nhau kể.</h2><p>Đọc những bài viết và cảm nhận được chia sẻ bởi cộng đồng.</p></div>
        <Link className="primary" to="/blogs">Ghé thăm tạp chí →</Link>
      </section>

      <section className="section cm-page-section">
        <SectionHeading eyebrow="TỪ CỘNG ĐỒNG CINEMIND" title="Bài viết mới" to="/blogs" linkLabel="Đọc tạp chí →"/>
        {loading ? <LoadingSpinner label="Đang tải bài viết…"/> : posts.length ? <HorizontalCarousel label="bài viết mới"><div className="cm-home-blog-track">{posts.map(post => <BlogCard key={post.post_id} post={post}/>)}</div></HorizontalCarousel> : !errors.posts && <EmptyState>Chưa có bài viết đã xuất bản.</EmptyState>}
      </section>
    </div>
  </main>;
}
