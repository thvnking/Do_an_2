import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { BlogCard, EmptyState, ErrorState, LoadingSpinner, MovieBackdrop, MovieGrid } from '../components/index.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import './pages.css';

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
      api('/blogs?limit=3'),
      api('/genres'),
    ];
    Promise.allSettled(requests).then(results => {
      if (!current) return;
      const failures = {};
      if (results[0].status === 'fulfilled') setPopular(results[0].value.data || []); else failures.popular = results[0].reason;
      if (results[1].status === 'fulfilled') setTopRated(results[1].value.data || []); else failures.topRated = results[1].reason;
      if (results[2].status === 'fulfilled') setPosts(results[2].value.data || []); else failures.posts = results[2].reason;
      if (results[3].status === 'fulfilled') setGenres(results[3].value.data || []); else failures.genres = results[3].reason;
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

  const featured = popular[0];
  return <main className="cm-home-page">
    <MovieBackdrop src={featured?.banner_url} title={null} alt={featured ? `Ảnh nền ${featured.title}` : ''} className="cm-home-hero">
      <div className="cm-movie-backdrop__content cm-home-hero__content">
        <small className="eyebrow">CINEMIND · CỘNG ĐỒNG ĐIỆN ẢNH</small>
        <h1>Mỗi bộ phim<br/>mở ra <em>một thế giới.</em></h1>
        <p>Khám phá phim, lưu những câu chuyện yêu thích và chia sẻ góc nhìn cùng cộng đồng CineMind.</p>
        {featured && <p className="cm-home-hero__featured">Đang nổi bật: <Link to={`/movies/${featured.movie_id}`}>{featured.vietnamese_title || featured.title}</Link>{featured.release_year ? ` · ${featured.release_year}` : ''}</p>}
        <div className="cm-home-hero__actions">
          <Link className="primary" to={featured ? `/movies/${featured.movie_id}` : '/movies'}>{featured ? 'Khám phá phim nổi bật' : 'Khám phá phim'} <span aria-hidden="true">↗</span></Link>
          <Link className="plain" to="/ai">Hỏi CineMind AI →</Link>
        </div>
      </div>
    </MovieBackdrop>

    <div className="page cm-home-content">
      {Object.entries(errors).map(([source, error]) => <ErrorState key={source} error={error} title="Một phần nội dung chưa tải được" onRetry={() => {
        if (source === 'popular' || source === 'topRated' || source === 'posts' || source === 'genres') setReloadToken(value => value + 1);
        else if (user) api('/me/watchlist').then(result => { setSavedIds(new Set((result.data || []).map(item => item.movie_id))); setErrors(items => { const { watchlist, watchlistAction, ...rest } = items; return rest; }); }).catch(err => setErrors(items => ({ ...items, watchlist: err })));
      }}/>)}

      <section className="section cm-page-section">
        <SectionHeading eyebrow="ĐƯỢC CỘNG ĐỒNG QUAN TÂM" title="Phim phổ biến" to="/movies"/>
        {loading ? <LoadingSpinner label="Đang tải phim…"/> : popular.length ? <MovieGrid movies={popular.slice(0, 4)} savedIds={savedIds} onToggle={user ? toggleWatchlist : undefined}/> : !errors.popular && <EmptyState>Chưa có phim trong danh mục.</EmptyState>}
      </section>

      {loading ? <section className="section cm-page-section"><LoadingSpinner label="Đang tải danh sách phim…"/></section> : topRated.length > 0 && <section className="section cm-page-section">
        <SectionHeading eyebrow="ĐIỂM TMDB" title="Được đánh giá cao" to="/movies?sort=rating"/>
        <MovieGrid movies={topRated.slice(0, 4)} savedIds={savedIds} onToggle={user ? toggleWatchlist : undefined}/>
      </section>}

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
        {loading ? <LoadingSpinner label="Đang tải bài viết…"/> : posts.length ? <div className="post-grid">{posts.map(post => <BlogCard key={post.post_id} post={post}/>)}</div> : !errors.posts && <EmptyState>Chưa có bài viết đã xuất bản.</EmptyState>}
      </section>
    </div>
  </main>;
}
