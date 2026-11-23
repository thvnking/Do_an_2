import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api.js';
import { Avatar, Badge, Button, Checkbox, EmptyState, ErrorState, Input, LoadingSpinner, MovieCard, MovieGrid, Select } from '../components/index.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import './pages.css';

function statusVariant(status) {
  return status === 'PUBLISHED' ? 'success' : status === 'REJECTED' ? 'danger' : status === 'PENDING' ? 'warning' : 'neutral';
}

export function ProfilePage() {
  const { user, setUser } = useAuth();
  const userId = user?.user_id;
  const location = useLocation();
  const [profile, setProfile] = useState(null);
  const [genres, setGenres] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [history, setHistory] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errors, setErrors] = useState([]);
  const [notice, setNotice] = useState(location.state?.notice || '');
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const deleteLock = useRef(false);
  const favoriteIds = useMemo(() => new Set((profile?.favorite_genre_ids || []).map(Number)), [profile?.favorite_genre_ids]);

  useEffect(() => {
    let active = true;
    if (!user) { setLoading(false); return undefined; }
    const requests = [api('/users/me'), api('/genres'), api('/blogs/mine'), api('/users/me/history'), api('/me/watchlist')];
    Promise.allSettled(requests).then(results => {
      if (!active) return;
      const failures = [];
      if (results[0].status === 'fulfilled') setProfile(results[0].value.user); else failures.push(results[0].reason);
      if (results[1].status === 'fulfilled') setGenres(results[1].value.data || []); else failures.push(results[1].reason);
      if (results[2].status === 'fulfilled') setBlogs(results[2].value.data || []); else failures.push(results[2].reason);
      if (results[3].status === 'fulfilled') setHistory(results[3].value.data || []); else failures.push(results[3].reason);
      if (results[4].status === 'fulfilled') setWatchlist(results[4].value.data || []); else failures.push(results[4].reason);
      setErrors(failures);
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [userId]);

  function toggleGenre(genreId) {
    if (!profile) return;
    const ids = [...favoriteIds];
    const nextIds = favoriteIds.has(Number(genreId)) ? ids.filter(id => id !== Number(genreId)) : [...ids, Number(genreId)];
    setProfile(current => ({ ...current, favorite_genre_ids: nextIds }));
  }

  async function saveProfile(event) {
    event.preventDefault();
    if (!profile || saving) return;
    setSaving(true);
    setErrors([]);
    setNotice('');
    try {
      const result = await api('/users/me', { method: 'PATCH', body: { fullName: profile.full_name || '' } });
      setProfile(current => ({ ...current, ...result.user }));
      setUser(result.user);
      await api('/users/me/favorite-genres', { method: 'PUT', body: { genreIds: (profile.favorite_genre_ids || []).map(Number) } });
      setNotice('Đã lưu thông tin và thể loại yêu thích.');
    } catch (error) { setErrors([error]); }
    finally { setSaving(false); }
  }

  async function deleteBlog(postId) {
    if (deleteLock.current) return;
    if (!window.confirm('Bạn có muốn xóa bài viết này?')) return;
    deleteLock.current = true;
    setDeletingId(postId);
    try {
      await api(`/blogs/${postId}`, { method: 'DELETE' });
      setBlogs(items => items.filter(item => String(item.post_id) !== String(postId)));
    } catch (error) { setErrors(items => [...items, error]); }
    finally { deleteLock.current = false; setDeletingId(null); }
  }

  if (!user) return <main className="page"><EmptyState title="Hồ sơ cá nhân">Vui lòng <Link to="/login">đăng nhập</Link> để xem thông tin hồ sơ.</EmptyState></main>;
  if (loading) return <main className="page"><LoadingSpinner label="Đang tải hồ sơ…"/></main>;

  return <main className="page cm-profile-page">
    <header className="cm-profile-heading"><Avatar src={profile?.avatar_url} name={profile?.full_name || user.username} size="lg"/><div><small className="eyebrow">HỒ SƠ CÁ NHÂN</small><h1>Xin chào, <em>{user.username}</em></h1><p>{profile?.full_name || 'Thành viên CineMind'} · Tham gia {profile?.created_at ? new Date(profile.created_at).toLocaleDateString('vi-VN') : 'CineMind'}</p></div></header>
    {errors.map((error, index) => <ErrorState key={`${error?.message || 'error'}-${index}`} error={error}/>)}
    {notice && <p className="success-box" role="status">{notice}</p>}

    <section className="cm-profile-panel" aria-labelledby="cm-profile-details-title">
      <div className="section-head"><h2 id="cm-profile-details-title">Thông tin và sở thích</h2></div>
      {profile && <form className="stack-form cm-profile-form" onSubmit={saveProfile}>
        <Input label="Tên người dùng" value={profile.username || user.username} disabled/>
        <Input label="Email" type="email" value={profile.email || ''} disabled/>
        <Input label="Họ tên" maxLength={150} value={profile.full_name || ''} onChange={event => setProfile(current => ({ ...current, full_name: event.target.value }))}/>
        <fieldset className="cm-profile-genres"><legend>Thể loại yêu thích</legend><div>{genres.map(genre => <Checkbox key={genre.genre_id} label={genre.name} checked={favoriteIds.has(Number(genre.genre_id))} onChange={() => toggleGenre(genre.genre_id)}/>)}</div></fieldset>
        <Button type="submit" loading={saving}>Lưu hồ sơ</Button>
      </form>}
    </section>

    <section className="content-section cm-profile-section"><div className="section-head"><h2>Bài viết của tôi</h2><Link className="primary" to="/blogs/new">Viết bài mới</Link></div>
      {blogs.length ? <div className="cm-profile-blogs">{blogs.map(blog => <article className="cm-profile-row" key={blog.post_id}>
        <div className="cm-profile-row__main">{blog.status === 'PUBLISHED' ? <Link to={`/blogs/${blog.slug || blog.post_id}`}>{blog.title}</Link> : <span>{blog.title}</span>}<small>{new Date(blog.created_at).toLocaleDateString('vi-VN')}</small></div>
        <Badge variant={statusVariant(blog.status)}>{blog.status}</Badge>
        <div className="cm-profile-row__actions"><Link className="text-button" to={`/blogs/new?edit=${blog.post_id}`}>Sửa</Link><Button variant="ghost" size="sm" loading={deletingId === blog.post_id} disabled={deletingId !== null && deletingId !== blog.post_id} onClick={() => deleteBlog(blog.post_id)}>Xóa</Button></div>
      </article>)}</div> : errors.length ? <p className="cm-profile-load-note">Không thể tải danh sách bài viết lúc này.</p> : <EmptyState>Chưa có bài viết của bạn. <Link to="/blogs/new">Bắt đầu viết bài →</Link></EmptyState>}
    </section>

    <section className="content-section cm-profile-section"><div className="section-head"><h2>Danh sách phim</h2><Link to="/watchlist">Xem danh sách →</Link></div>
      {watchlist.length ? <MovieGrid movies={watchlist.slice(0, 4)} /> : errors.length ? <p className="cm-profile-load-note">Không thể tải danh sách phim lúc này.</p> : <EmptyState>Danh sách đang trống. <Link to="/movies">Tìm phim để lưu →</Link></EmptyState>}
    </section>

    <section className="content-section cm-profile-section"><div className="section-head"><h2>Lịch sử xem</h2></div>
      {history.length ? <div className="cm-profile-blogs">{history.slice(0, 12).map(item => <div className="cm-profile-row" key={`${item.movie_id}-${item.viewed_at}`}><Link to={`/movies/${item.movie_id}`}>{item.title}</Link><small>{new Date(item.viewed_at).toLocaleString('vi-VN')}</small></div>)}</div> : errors.length ? <p className="cm-profile-load-note">Không thể tải lịch sử xem lúc này.</p> : <EmptyState>Chưa có lịch sử xem phim.</EmptyState>}
    </section>
    <p className="cm-profile-limitation">Lịch sử đánh giá cá nhân chưa có API tương ứng trong backend hiện tại.</p>
  </main>;
}

export function WatchlistPage() {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('WANT_TO_WATCH');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const busyLock = useRef(false);
  useEffect(() => {
    let active = true;
    if (!user) { setLoading(false); return undefined; }
    api('/me/watchlist').then(result => { if (active) setItems(result.data || []); }).catch(err => { if (active) setError(err); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user?.user_id]);

  async function updateItem(movieId, operation) {
    if (busyLock.current) return;
    busyLock.current = true;
    setBusyId(movieId);
    setError(null);
    try {
      if (operation.type === 'remove') {
        await api(`/me/watchlist/${movieId}`, { method: 'DELETE' });
        setItems(current => current.filter(item => String(item.movie_id) !== String(movieId)));
      } else {
        await api(`/me/watchlist/${movieId}`, { method: 'PATCH', body: { status: operation.status } });
        setItems(current => current.map(item => String(item.movie_id) === String(movieId) ? { ...item, status: operation.status } : item));
      }
    } catch (err) { setError(err); }
    finally { busyLock.current = false; setBusyId(null); }
  }

  if (!user) return <main className="page"><EmptyState title="Cần đăng nhập">Đăng nhập để quản lý danh sách phim. <Link to="/login">Đăng nhập →</Link></EmptyState></main>;
  if (loading) return <main className="page"><LoadingSpinner label="Đang tải danh sách…"/></main>;
  const visible = items.filter(item => item.status === filter);
  return <main className="page cm-watchlist-page">
    <div className="page-title"><small className="eyebrow">DANH SÁCH CÁ NHÂN</small><h1>Phim đã lưu</h1><p>Theo dõi phim bạn muốn xem và những bộ phim đã xem.</p></div>
    <div className="cm-watchlist-tabs" role="group" aria-label="Lọc trạng thái danh sách phim">
      <Button variant={filter === 'WANT_TO_WATCH' ? 'secondary' : 'ghost'} aria-pressed={filter === 'WANT_TO_WATCH'} onClick={() => setFilter('WANT_TO_WATCH')}>Muốn xem <span>({items.filter(item => item.status === 'WANT_TO_WATCH').length})</span></Button>
      <Button variant={filter === 'WATCHED' ? 'secondary' : 'ghost'} aria-pressed={filter === 'WATCHED'} onClick={() => setFilter('WATCHED')}>Đã xem <span>({items.filter(item => item.status === 'WATCHED').length})</span></Button>
    </div>
    <ErrorState error={error}/>
    {visible.length ? <MovieGrid>{visible.map(movie => <article className="cm-watchlist-item" key={movie.movie_id}>
      <MovieCard movie={movie}/>
      <Select label={`Trạng thái phim ${movie.title}`} value={movie.status} disabled={busyId !== null} onChange={event => updateItem(movie.movie_id, { type: 'status', status: event.target.value })}>
        <option value="WANT_TO_WATCH">Muốn xem</option><option value="WATCHED">Đã xem</option>
      </Select>
      <Button variant="ghost" size="sm" loading={busyId === movie.movie_id} disabled={busyId !== null && busyId !== movie.movie_id} onClick={() => updateItem(movie.movie_id, { type: 'remove' })}>Xóa khỏi danh sách</Button>
    </article>)}</MovieGrid> : !error && <EmptyState title={filter === 'WATCHED' ? 'Chưa có phim đã xem' : 'Danh sách đang trống'}>Khám phá phim và lưu vào danh sách của bạn. <Link to="/movies">Tìm phim →</Link></EmptyState>}
  </main>;
}

export function PasswordChangePage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState('');
  const [busy, setBusy] = useState(false);
  async function submit(event) {
    event.preventDefault();
    if (newPassword !== confirm) { setError(new Error('Mật khẩu xác nhận chưa khớp')); return; }
    setBusy(true);
    setError(null);
    try {
      await api('/users/me/password', { method: 'PATCH', body: { currentPassword, newPassword } });
      setNotice('Đã đổi mật khẩu.');
      setCurrentPassword(''); setNewPassword(''); setConfirm('');
    } catch (err) { setError(err); }
    finally { setBusy(false); }
  }
  if (!user) return <main className="page"><EmptyState title="Cần đăng nhập">Đăng nhập để cập nhật mật khẩu. <Link to="/login">Đăng nhập →</Link></EmptyState></main>;
  return <main className="page cm-password-page"><div className="page-title"><small className="eyebrow">BẢO MẬT TÀI KHOẢN</small><h1>Đổi mật khẩu</h1></div>
    <ErrorState error={error}/>{notice && <p className="success-box" role="status">{notice}</p>}
    <form className="stack-form" onSubmit={submit}>
      <Input label="Mật khẩu hiện tại" type="password" autoComplete="current-password" required value={currentPassword} onChange={event => setCurrentPassword(event.target.value)}/>
      <Input label="Mật khẩu mới" type="password" autoComplete="new-password" minLength={8} maxLength={100} required value={newPassword} onChange={event => setNewPassword(event.target.value)}/>
      <Input label="Nhập lại mật khẩu mới" type="password" autoComplete="new-password" required value={confirm} onChange={event => setConfirm(event.target.value)}/>
      <Button type="submit" loading={busy}>Cập nhật mật khẩu</Button>
    </form>
  </main>;
}
