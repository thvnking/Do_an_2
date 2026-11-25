import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { BlogAuthor } from '../components/community.jsx';
import { Avatar, Badge, Button, ConfirmDialog, EmptyState, ErrorState, Input, LoadingSpinner, Modal, MoviePoster, Select, Textarea } from '../components/index.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import './admin-pages.css';

function AdminHeading({ eyebrow = 'CINEMIND ADMIN', title, description, action }) {
  return <header className="cm-admin-heading"><div><small className="eyebrow">{eyebrow}</small><h1>{title}</h1>{description && <p>{description}</p>}</div>{action}</header>;
}

function useAdminLoad(loader, dependencies = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const reload = useCallback(async () => {
    setLoading(true); setError(null);
    try { setData(await loader()); }
    catch (reason) { setError(reason); }
    finally { setLoading(false); }
  // The loader is stable per page; caller dependencies determine when its query changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, dependencies);
  useEffect(() => { reload(); }, [reload]);
  return { data, setData, loading, error, reload };
}

const metrics = [
  ['users', 'Tài khoản'], ['movies', 'Phim'], ['pending_posts', 'Bài chờ duyệt'],
  ['published_posts', 'Bài đã xuất bản'], ['reviews', 'Đánh giá'], ['comments', 'Bình luận'],
];

export function AdminDashboardPage({ analytics = false }) {
  const { data, loading, error, reload } = useAdminLoad(async () => (await api('/admin/summary')).data);
  return <main className="page cm-admin-page"><AdminHeading title={analytics ? 'Thống kê hệ thống' : 'Tổng quan quản trị'} description="Số liệu tổng hợp do hệ thống cung cấp."/>
    {loading ? <LoadingSpinner label="Đang tải số liệu…"/> : error ? <ErrorState error={error} onRetry={reload}/> : data && <div className="cm-admin-stats" aria-label="Thống kê hệ thống">
      {metrics.map(([key, label]) => <article className="cm-admin-stat" key={key}><span>{label}</span><strong>{Number(data[key] ?? 0).toLocaleString('vi-VN')}</strong></article>)}
    </div>}
    {!loading && !error && data && <p className="cm-admin-note">API hiện chỉ cung cấp số liệu tổng hợp, chưa có dữ liệu hoạt động gần đây hoặc chuỗi thời gian để hiển thị biểu đồ.</p>}
  </main>;
}

export function AdminUsersPage() {
  const { user } = useAuth();
  const { data, setData, loading, error, reload } = useAdminLoad(async () => (await api('/admin/users?limit=200')).data);
  const [query, setQuery] = useState('');
  const [target, setTarget] = useState(null);
  const [roleChoices, setRoleChoices] = useState({});
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState('');
  const [mutationError, setMutationError] = useState(null);
  const lock = useRef(false);
  const users = (data || []).filter(item => `${item.username || ''} ${item.email || ''} ${item.full_name || ''}`.toLocaleLowerCase('vi-VN').includes(query.trim().toLocaleLowerCase('vi-VN')));

  async function changeRole() {
    if (!target || lock.current || String(target.user.user_id) === String(user?.user_id)) return;
    lock.current = true; setBusy(true); setMutationError(null); setNotice('');
    try {
      const result = await api(`/admin/users/${target.user.user_id}/role`, { method: 'PATCH', body: { role: target.role } });
      setData(items => items.map(item => String(item.user_id) === String(result.data.user_id) ? { ...item, ...result.data } : item));
      setRoleChoices(current => { const next = { ...current }; delete next[result.data.user_id]; return next; });
      setNotice(`Đã cập nhật vai trò của ${result.data.username}.`); setTarget(null);
    } catch (reason) { setRoleChoices(current => ({ ...current, [target.user.user_id]: target.user.role })); setMutationError(reason); }
    finally { lock.current = false; setBusy(false); }
  }
  function cancelRoleChange() {
    if (busy) return;
    if (target) setRoleChoices(current => ({ ...current, [target.user.user_id]: target.user.role }));
    setTarget(null);
  }

  return <main className="page cm-admin-page"><AdminHeading title="Người dùng" description="Danh sách tài khoản và vai trò hiện tại."/>
    {notice && <p className="cm-admin-notice" role="status">{notice}</p>}{mutationError && <ErrorState error={mutationError}/>}
    <div className="cm-admin-toolbar"><Input label="Tìm trong danh sách đã tải" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tên, email…"/><Button variant="outline" onClick={reload} loading={loading}>Tải lại</Button></div>
    {loading ? <LoadingSpinner label="Đang tải người dùng…"/> : error ? <ErrorState error={error} onRetry={reload}/> : !users.length ? <EmptyState title="Không tìm thấy người dùng">Thử thay đổi nội dung tìm kiếm.</EmptyState> : <div className="cm-admin-table-wrap"><table className="cm-admin-table"><thead><tr><th>Tài khoản</th><th>Email</th><th>Ngày tham gia</th><th>Vai trò</th></tr></thead><tbody>{users.map(item => <tr key={item.user_id}>
      <td><span className="cm-admin-person"><Avatar name={item.full_name || item.username} size="sm"/><span><strong>{item.full_name || item.username}</strong><small>@{item.username}</small></span></span></td>
      <td>{item.email || '—'}</td><td>{item.created_at ? new Date(item.created_at).toLocaleDateString('vi-VN') : '—'}</td>
      <td>{String(item.user_id) === String(user?.user_id) ? <Badge variant="accent">ADMIN · Bạn</Badge> : <Select aria-label={`Vai trò của ${item.username}`} value={roleChoices[item.user_id] || item.role} disabled={busy} onChange={event => { setRoleChoices(current => ({ ...current, [item.user_id]: event.target.value })); setTarget({ user: item, role: event.target.value }); }}><option value="USER">USER</option><option value="ADMIN">ADMIN</option></Select>}</td>
    </tr>)}</tbody></table></div>}
    <p className="cm-admin-note">Backend trả tối đa 200 tài khoản, không có tìm kiếm hoặc phân trang phía máy chủ; ô tìm kiếm lọc trên danh sách đã tải. Không hỗ trợ khóa hoặc xóa tài khoản.</p>
    <ConfirmDialog open={Boolean(target)} onClose={cancelRoleChange} onConfirm={changeRole} busy={busy} title="Xác nhận đổi vai trò" confirmLabel="Cập nhật" variant="primary">Đổi {target?.user.username} sang vai trò {target?.role}? Thao tác được ghi nhận bởi backend.</ConfirmDialog>
  </main>;
}

const emptyMovie = { title: '', vietnameseTitle: '', synopsis: '', releaseYear: '', runtimeMinutes: '', posterUrl: '', bannerUrl: '', trailerUrl: '' };
function movieForm(movie) {
  return movie ? { title: movie.title || '', vietnameseTitle: movie.vietnamese_title || '', synopsis: movie.synopsis || '', releaseYear: movie.release_year || '', runtimeMinutes: movie.runtime_minutes || '', posterUrl: movie.poster_url || '', bannerUrl: movie.banner_url || '', trailerUrl: movie.trailer_url || '' } : { ...emptyMovie };
}
function moviePayload(form) {
  return { title: form.title.trim(), vietnameseTitle: form.vietnameseTitle.trim() || null, synopsis: form.synopsis.trim() || null,
    releaseYear: form.releaseYear === '' ? null : Number(form.releaseYear), runtimeMinutes: form.runtimeMinutes === '' ? null : Number(form.runtimeMinutes),
    posterUrl: form.posterUrl.trim() || null, bannerUrl: form.bannerUrl.trim() || null, trailerUrl: form.trailerUrl.trim() || null };
}

export function AdminMoviesPage() {
  const [query, setQuery] = useState(''); const [submitted, setSubmitted] = useState(''); const [page, setPage] = useState(1);
  const [editor, setEditor] = useState(null); const [editorOpen, setEditorOpen] = useState(false); const [form, setForm] = useState(emptyMovie); const [formError, setFormError] = useState(null);
  const [busy, setBusy] = useState(false); const [deleting, setDeleting] = useState(null); const [notice, setNotice] = useState(''); const [mutationError, setMutationError] = useState(null);
  const lock = useRef(false); const limit = 20;
  const { data, loading, error, reload } = useAdminLoad(async () => (await api(`/movies?q=${encodeURIComponent(submitted)}&page=${page}&limit=${limit}`)).data || [], [submitted, page]);
  function openEditor(movie = null) { setForm(movieForm(movie)); setEditor(movie); setEditorOpen(true); setFormError(null); setMutationError(null); }
  async function saveMovie(event) {
    event.preventDefault(); if (lock.current) return; if (!form.title.trim()) { setFormError('Vui lòng nhập tên phim.'); return; }
    for (const field of ['releaseYear', 'runtimeMinutes']) if (form[field] !== '' && !Number.isSafeInteger(Number(form[field]))) { setFormError('Năm phát hành và thời lượng phải là số nguyên.'); return; }
    lock.current = true; setBusy(true); setFormError(null); setMutationError(null); setNotice('');
    try { const body = moviePayload(form); if (editor) await api(`/admin/movies/${editor.movie_id}`, { method: 'PATCH', body }); else await api('/admin/movies', { method: 'POST', body });
      setEditor(null); setEditorOpen(false); setNotice(editor ? 'Đã cập nhật phim.' : 'Đã thêm phim.'); await reload();
    } catch (reason) { setFormError(reason); }
    finally { lock.current = false; setBusy(false); }
  }
  async function deleteMovie() {
    if (!deleting || lock.current) return; lock.current = true; setBusy(true); setMutationError(null); setNotice('');
    try { await api(`/admin/movies/${deleting.movie_id}`, { method: 'DELETE' }); setDeleting(null); setNotice('Đã xóa phim.'); await reload(); }
    catch (reason) { setMutationError(reason); }
    finally { lock.current = false; setBusy(false); }
  }

  return <main className="page cm-admin-page"><AdminHeading title="Quản lý phim" description="Tìm và quản lý các phim có trong danh mục CineMind." action={<Button onClick={() => openEditor()}>Thêm phim</Button>}/>
    {notice && <p className="cm-admin-notice" role="status">{notice}</p>}{mutationError && <ErrorState error={mutationError}/>}
    <form className="cm-admin-toolbar" onSubmit={event => { event.preventDefault(); setPage(1); setSubmitted(query.trim()); }}><Input label="Tìm phim" type="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Tên phim…"/><Button type="submit" loading={loading}>Tìm kiếm</Button><Button type="button" variant="outline" onClick={reload} loading={loading}>Tải lại</Button></form>
    {loading ? <LoadingSpinner label="Đang tải phim…"/> : error ? <ErrorState error={error} onRetry={reload}/> : !data?.length ? <EmptyState title="Không có phim phù hợp">Thử tìm bằng tên khác hoặc thêm phim mới.</EmptyState> : <div className="cm-admin-movie-list">{data.map(movie => <article className="cm-admin-movie-row" key={movie.movie_id}>
      <MoviePoster src={movie.poster_url} title={movie.vietnamese_title || movie.title} className="cm-admin-movie-poster"/><div className="cm-admin-movie-copy"><Link to={`/movies/${movie.movie_id}`}><h2>{movie.vietnamese_title || movie.title}</h2></Link><p>{movie.release_year || 'Chưa rõ năm'}{movie.tmdb_id ? ` · TMDB ${movie.tmdb_id}` : ' · Nhập thủ công'}</p>{movie.synopsis && <p className="cm-admin-clamp">{movie.synopsis}</p>}</div><div className="cm-admin-actions"><Button variant="outline" size="sm" onClick={() => openEditor(movie)}>Chỉnh sửa</Button><Button variant="ghost" size="sm" onClick={() => setDeleting(movie)}>Xóa</Button></div>
    </article>)}</div>}
    <nav className="cm-admin-pager" aria-label="Phân trang phim"><Button variant="outline" size="sm" disabled={page <= 1 || loading} onClick={() => setPage(value => value - 1)}>← Trước</Button><span>Trang {page}</span><Button variant="outline" size="sm" disabled={loading || (data?.length || 0) < limit} onClick={() => setPage(value => value + 1)}>Tiếp →</Button></nav>
    <Modal open={editorOpen} onClose={() => !busy && setEditorOpen(false)} title={editor ? 'Chỉnh sửa phim' : 'Thêm phim'}><form className="cm-admin-form" onSubmit={saveMovie}>
      <Input label="Tên phim *" required maxLength={255} value={form.title} onChange={event => setForm(value => ({ ...value, title: event.target.value }))}/><Input label="Tên tiếng Việt" maxLength={255} value={form.vietnameseTitle} onChange={event => setForm(value => ({ ...value, vietnameseTitle: event.target.value }))}/><Textarea label="Tóm tắt" rows={5} value={form.synopsis} onChange={event => setForm(value => ({ ...value, synopsis: event.target.value }))}/><div className="cm-admin-form-grid"><Input label="Năm phát hành" type="number" value={form.releaseYear} onChange={event => setForm(value => ({ ...value, releaseYear: event.target.value }))}/><Input label="Thời lượng (phút)" type="number" value={form.runtimeMinutes} onChange={event => setForm(value => ({ ...value, runtimeMinutes: event.target.value }))}/></div><Input label="URL poster" type="url" value={form.posterUrl} onChange={event => setForm(value => ({ ...value, posterUrl: event.target.value }))}/><Input label="URL ảnh nền" type="url" value={form.bannerUrl} onChange={event => setForm(value => ({ ...value, bannerUrl: event.target.value }))}/><Input label="URL trailer" type="url" value={form.trailerUrl} onChange={event => setForm(value => ({ ...value, trailerUrl: event.target.value }))}/><ErrorState error={formError}/><div className="cm-admin-actions"><Button type="button" variant="ghost" disabled={busy} onClick={() => setEditorOpen(false)}>Hủy</Button><Button type="submit" loading={busy}>Lưu phim</Button></div>
    </form></Modal>
    <ConfirmDialog open={Boolean(deleting)} onClose={() => !busy && setDeleting(null)} onConfirm={deleteMovie} busy={busy} title="Xóa phim" confirmLabel="Xóa phim">Bạn muốn xóa “{deleting?.title}”? Thao tác này không có chức năng hoàn tác trong giao diện.</ConfirmDialog>
  </main>;
}

export function AdminTmdbPage() {
  const [query, setQuery] = useState(''); const [results, setResults] = useState([]); const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false); const [error, setError] = useState(null); const [selected, setSelected] = useState(null); const [busy, setBusy] = useState(false); const [notice, setNotice] = useState('');
  const lock = useRef(false);
  async function search(event) { event.preventDefault(); if (!query.trim() || loading) return; setLoading(true); setError(null); setNotice('');
    try { const result = await api(`/tmdb/search?query=${encodeURIComponent(query.trim())}`); setResults(result.results || []); setSearched(true); }
    catch (reason) { setError(reason); } finally { setLoading(false); }
  }
  async function importMovie() { if (!selected || lock.current) return; lock.current = true; setBusy(true); setError(null); setNotice('');
    try { const result = await api('/admin/sync-tmdb', { method: 'POST', body: { tmdbId: selected.id } }); setNotice(`Backend đã đồng bộ “${result.data?.title || selected.title}” (TMDB ${result.data?.tmdbId || selected.id}).`); setSelected(null); }
    catch (reason) { setError(reason); } finally { lock.current = false; setBusy(false); }
  }
  return <main className="page cm-admin-page"><AdminHeading title="Đồng bộ TMDB" description="Tìm phim từ TMDB và xác nhận nhập từng phim vào CineMind."/>
    {notice && <p className="cm-admin-notice" role="status">{notice}</p>}{error && <ErrorState error={error}/>}
    <form className="cm-admin-toolbar" onSubmit={search}><Input label="Tìm phim trên TMDB" value={query} onChange={event => setQuery(event.target.value)} placeholder="Nhập tên phim…"/><Button type="submit" loading={loading} disabled={!query.trim()}>Tìm kiếm</Button></form>
    {loading ? <LoadingSpinner label="Đang tìm trên TMDB…"/> : searched && !results.length ? <EmptyState title="Không có kết quả">Hãy thử từ khóa khác.</EmptyState> : results.length > 0 && <div className="cm-admin-movie-list">{results.map(movie => <article className="cm-admin-movie-row" key={movie.id}><MoviePoster src={movie.poster_path ? `https://image.tmdb.org/t/p/w342${movie.poster_path}` : null} title={movie.title} className="cm-admin-movie-poster"/><div className="cm-admin-movie-copy"><h2>{movie.title}</h2><p>{movie.release_date || 'Chưa rõ ngày phát hành'} · TMDB {movie.id}</p><p className="cm-admin-clamp">{movie.overview || 'TMDB không có phần tóm tắt.'}</p></div><Button variant="outline" size="sm" onClick={() => setSelected(movie)}>Xem và đồng bộ</Button></article>)}</div>}
    <p className="cm-admin-note">Kết quả tìm kiếm là dữ liệu TMDB. Thao tác đồng bộ gọi endpoint Admin; chỉ báo thành công sau khi API xác nhận. Mỗi lần chỉ nhập một phim.</p>
    <ConfirmDialog open={Boolean(selected)} onClose={() => !busy && setSelected(null)} onConfirm={importMovie} busy={busy} title="Xác nhận đồng bộ" confirmLabel="Đồng bộ phim" variant="primary">Đồng bộ “{selected?.title}” (TMDB {selected?.id}) vào danh mục CineMind? Backend có thể cập nhật phim CineMind đã liên kết với mã TMDB này.</ConfirmDialog>
  </main>;
}

export function AdminBlogsPage() {
  const { data, setData, loading, error, reload } = useAdminLoad(async () => (await api('/blogs/admin/queue?status=PENDING')).data || []);
  const [selected, setSelected] = useState(null); const [confirm, setConfirm] = useState(null); const [busy, setBusy] = useState(false); const [notice, setNotice] = useState(''); const [mutationError, setMutationError] = useState(null);
  const lock = useRef(false);
  async function moderate() { if (!confirm || lock.current) return; lock.current = true; setBusy(true); setMutationError(null); setNotice('');
    try { const result = await api(`/blogs/admin/${confirm.post_id}/moderation`, { method: 'PATCH', body: { action: confirm.action } });
      setData(items => items.filter(item => String(item.post_id) !== String(confirm.post_id))); setNotice(`Backend đã cập nhật trạng thái bài viết: ${result.data.status}.`); setConfirm(null); setSelected(null);
    } catch (reason) { setMutationError(reason); } finally { lock.current = false; setBusy(false); }
  }
  return <main className="page cm-admin-page"><AdminHeading title="Kiểm duyệt bài viết" description="Danh sách bài đang chờ duyệt theo trạng thái PENDING."/>
    {notice && <p className="cm-admin-notice" role="status">{notice}</p>}{mutationError && <ErrorState error={mutationError}/>}
    {loading ? <LoadingSpinner label="Đang tải hàng chờ…"/> : error ? <ErrorState error={error} onRetry={reload}/> : !data?.length ? <EmptyState title="Không có bài chờ duyệt">Hàng chờ hiện không có bài viết PENDING.</EmptyState> : <div className="cm-admin-blog-list">{data.map(blog => <article className="cm-admin-blog" key={blog.post_id}><div className="cm-admin-blog-meta"><BlogAuthor name={blog.author}/><time>{blog.created_at ? new Date(blog.created_at).toLocaleString('vi-VN') : '—'}</time><Badge variant="warning">{blog.status || 'PENDING'}</Badge></div><h2>{blog.title}</h2><p>{blog.content || 'Bài viết chưa có nội dung.'}</p><div className="cm-admin-actions"><Button variant="outline" size="sm" onClick={() => setSelected(blog)}>Xem bài</Button><Button size="sm" onClick={() => setConfirm({ ...blog, action: 'approve' })}>Duyệt</Button><Button variant="danger" size="sm" onClick={() => setConfirm({ ...blog, action: 'reject' })}>Từ chối</Button></div></article>)}</div>}
    <Modal open={Boolean(selected)} onClose={() => setSelected(null)} title={selected?.title || 'Nội dung bài viết'}><div className="cm-admin-article-preview"><div className="cm-admin-blog-meta"><BlogAuthor name={selected?.author}/>{selected?.created_at && <time>{new Date(selected.created_at).toLocaleString('vi-VN')}</time>}</div><p>{selected?.content}</p></div></Modal>
    <ConfirmDialog open={Boolean(confirm)} onClose={() => !busy && setConfirm(null)} onConfirm={moderate} busy={busy} title={confirm?.action === 'approve' ? 'Duyệt bài viết' : 'Từ chối bài viết'} confirmLabel={confirm?.action === 'approve' ? 'Duyệt' : 'Từ chối'} variant={confirm?.action === 'approve' ? 'primary' : 'danger'}>Xác nhận {confirm?.action === 'approve' ? 'duyệt' : 'từ chối'} “{confirm?.title}”? Backend sẽ quyết định trạng thái cuối cùng.</ConfirmDialog>
  </main>;
}

export function AdminReviewsPage() {
  const { data, loading, error, reload } = useAdminLoad(async () => (await api('/admin/reviews')).data || []);
  return <main className="page cm-admin-page"><AdminHeading title="Đánh giá phim" description="Danh sách đánh giá do API Admin cung cấp. Hiện chỉ hỗ trợ xem."/>
    {loading ? <LoadingSpinner label="Đang tải đánh giá…"/> : error ? <ErrorState error={error} onRetry={reload}/> : !data?.length ? <EmptyState title="Chưa có đánh giá">API chưa trả về đánh giá nào.</EmptyState> : <div className="cm-admin-table-wrap"><table className="cm-admin-table"><thead><tr><th>Phim</th><th>Người dùng</th><th>Điểm</th><th>Nội dung</th><th>Ngày</th></tr></thead><tbody>{data.map(review => <tr key={review.review_id}><td>{review.title || '—'}</td><td>{review.username || '—'}</td><td><Badge variant="accent">{review.rating}/5</Badge></td><td className="cm-admin-review-text">{review.comment_text || '—'}</td><td>{review.created_at ? new Date(review.created_at).toLocaleDateString('vi-VN') : '—'}</td></tr>)}</tbody></table></div>}
    <p className="cm-admin-note">API hiện giới hạn tối đa 200 đánh giá và không cung cấp cập nhật, moderation hoặc xóa.</p>
  </main>;
}
