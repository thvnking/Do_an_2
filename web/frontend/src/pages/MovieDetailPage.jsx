import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { api } from '../api.js';
import { Button, ErrorState, LoadingSpinner, MovieBackdrop, MovieMetadata, MoviePoster, Rating, ReviewForm, ReviewList } from '../components/index.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import './pages.css';

export default function MovieDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const userId = user?.user_id;
  const [movie, setMovie] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [watchStatus, setWatchStatus] = useState(null);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [savingReview, setSavingReview] = useState(false);
  const [savingWatchlist, setSavingWatchlist] = useState(false);
  const [error, setError] = useState(null);
  const [reviewError, setReviewError] = useState(null);
  const [notice, setNotice] = useState('');
  const reviewLock = useRef(false);
  const watchlistLock = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setMovie(null);
    setError(null);
    setReviewError(null);
    Promise.allSettled([api(`/movies/${id}`), api(`/movies/${id}/reviews`)]).then(results => {
      if (!active) return;
      if (results[0].status === 'fulfilled') setMovie(results[0].value.data);
      else setError(results[0].reason);
      if (results[1].status === 'fulfilled') setReviews(results[1].value.data || []);
      else setReviewError(results[1].reason);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  useEffect(() => {
    let active = true;
    if (!user) { setWatchStatus(null); return undefined; }
    api('/me/watchlist').then(result => {
      if (active) setWatchStatus(result.data?.find(item => String(item.movie_id) === String(id))?.status || null);
    }).catch(err => { if (active) setError(err); });
    return () => { active = false; };
  }, [id, userId]);

  const ownReview = user ? reviews.find(item => item.username === user.username) : null;
  useEffect(() => {
    if (ownReview) {
      setRating(Number(ownReview.rating));
      setComment(ownReview.comment_text || '');
    } else {
      setRating(5);
      setComment('');
    }
  }, [id, ownReview?.review_id, user?.username]);

  async function changeWatchlist() {
    if (!user || savingWatchlist || watchlistLock.current) return;
    watchlistLock.current = true;
    setSavingWatchlist(true);
    setError(null);
    try {
      if (watchStatus) {
        await api(`/me/watchlist/${id}`, { method: 'DELETE' });
        setWatchStatus(null);
      } else {
        const result = await api('/me/watchlist', { method: 'POST', body: { movieId: Number(id) } });
        setWatchStatus(result.data?.status || 'WANT_TO_WATCH');
      }
    } catch (err) { setError(err); }
    finally { watchlistLock.current = false; setSavingWatchlist(false); }
  }

  async function saveReview(event) {
    event.preventDefault();
    if (!user || savingReview || reviewLock.current) return;
    reviewLock.current = true;
    setSavingReview(true);
    setReviewError(null);
    setNotice('');
    try {
      await api(`/movies/${id}/review`, { method: 'PUT', body: { rating: Number(rating), commentText: comment } });
      setNotice(ownReview ? 'Đã cập nhật đánh giá của bạn.' : 'Đã gửi đánh giá của bạn.');
      const results = await Promise.allSettled([api(`/movies/${id}`), api(`/movies/${id}/reviews`)]);
      if (results[0].status === 'fulfilled') setMovie(results[0].value.data);
      if (results[1].status === 'fulfilled') setReviews(results[1].value.data || []);
      const refreshFailure = results.find(result => result.status === 'rejected');
      if (refreshFailure) setReviewError(refreshFailure.reason);
    } catch (err) { setReviewError(err); }
    finally { reviewLock.current = false; setSavingReview(false); }
  }

  if (loading) return <main className="page cm-movie-detail"><LoadingSpinner label="Đang tải thông tin phim…"/></main>;
  if (error && !movie) return <main className="page cm-movie-detail"><ErrorState error={error} title="Không tải được phim"/><Link to="/movies">← Trở lại danh mục</Link></main>;
  if (!movie) return <main className="page cm-movie-detail"><ErrorState error="Không tìm thấy phim."/><Link to="/movies">← Trở lại danh mục</Link></main>;

  return <main className="cm-movie-detail">
    <MovieBackdrop src={movie.banner_url} alt={`Ảnh nền ${movie.title}`} title={movie.vietnamese_title || movie.title} className="cm-movie-detail__backdrop">
      <p>{movie.tagline || movie.release_year || ''}</p>
    </MovieBackdrop>
    <div className="page cm-movie-detail__content">
      <Link className="cm-back-link" to="/movies">← Trở lại danh mục phim</Link>
      <section className="cm-movie-detail__summary">
        <MoviePoster src={movie.poster_url} title={movie.vietnamese_title || movie.title} alt={`Poster ${movie.title}`}/>
        <div className="cm-movie-detail__information">
          <small className="eyebrow">{(movie.genres || []).join(' · ') || 'CINEMIND MOVIE'}</small>
          <h1>{movie.vietnamese_title || movie.title}</h1>
          {movie.original_title && movie.original_title !== movie.title && <p className="cm-movie-detail__original">{movie.original_title}</p>}
          <MovieMetadata year={movie.release_year} genres={movie.genres || []}/>
          {(movie.runtime_minutes || movie.countries?.length > 0) && <p className="cm-movie-detail__facts">{movie.runtime_minutes ? `${movie.runtime_minutes} phút` : ''}{movie.runtime_minutes && movie.countries?.length ? ' · ' : ''}{movie.countries?.length ? movie.countries.join(' · ') : ''}</p>}
          <div className="cm-movie-ratings">
            <div><small>Đánh giá CineMind</small><Rating value={movie.community_rating ?? undefined} label="Điểm CineMind" showValue/></div>
            <div><small>Điểm TMDB</small><span className="cm-movie-ratings__tmdb">{movie.tmdb_vote_average == null ? '—' : `${Number(movie.tmdb_vote_average).toLocaleString('vi-VN', { maximumFractionDigits: 1 })}/10`}</span></div>
          </div>
          <p className="cm-movie-detail__synopsis">{movie.synopsis || 'Chưa có tóm tắt cho phim này.'}</p>
          {error && <ErrorState error={error}/>}
          {user ? <Button loading={savingWatchlist} variant={watchStatus ? 'outline' : 'primary'} onClick={changeWatchlist}>{watchStatus ? (watchStatus === 'WATCHED' ? 'Đã xem · Bỏ khỏi danh sách' : 'Đã lưu · Bỏ lưu') : 'Thêm vào danh sách xem'}</Button> : <p><Link to="/login">Đăng nhập</Link> để quản lý danh sách phim.</p>}
          {movie.trailer_url && <p><a className="plain" href={movie.trailer_url} target="_blank" rel="noreferrer">▶ Xem trailer</a></p>}
        </div>
      </section>
      {movie.credits?.length > 0 && <section className="content-section cm-movie-detail__credits"><h2>Diễn viên và đoàn phim</h2><p>{movie.credits.slice(0, 12).map(person => `${person.name} (${person.role === 'DIRECTOR' ? 'Đạo diễn' : person.character || 'Diễn viên'})`).join(' · ')}</p></section>}

      <section className="content-section cm-movie-reviews" aria-labelledby="cm-movie-reviews-title">
        <div className="section-head"><h2 id="cm-movie-reviews-title">Đánh giá cộng đồng <span>({movie.review_count || reviews.length})</span></h2></div>
        {reviewError && <ErrorState error={reviewError} title="Không tải được đánh giá" onRetry={() => api(`/movies/${id}/reviews`).then(result => { setReviews(result.data || []); setReviewError(null); }).catch(setReviewError)}/>}
        {user ? <div className="cm-movie-reviews__form"><h3>{ownReview ? 'Cập nhật đánh giá của bạn' : 'Chia sẻ cảm nhận'}</h3><ReviewForm rating={rating} onRatingChange={setRating} comment={comment} onCommentChange={setComment} onSubmit={saveReview} submitting={savingReview} submitLabel={ownReview ? 'Cập nhật đánh giá' : 'Gửi đánh giá'} error={reviewError}/>{notice && <p className="success-box" role="status">{notice}</p>}</div> : <p className="cm-movie-reviews__login"><Link to="/login">Đăng nhập</Link> để viết đánh giá.</p>}
        <ReviewList items={reviews.map(review => ({ id: review.review_id, author: review.username, avatar: review.avatar_url, rating: Number(review.rating), content: review.comment_text, createdAt: review.created_at }))} emptyState="Phim này chưa có đánh giá. Hãy chia sẻ cảm nhận đầu tiên."/>
      </section>
    </div>
  </main>;
}
