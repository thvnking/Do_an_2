import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { api } from '../api.js';
import { BlogCard, Button, CommentThread, EmptyState, ErrorState, HorizontalCarousel, Input, LikeButton, LoadingSpinner, Pagination, Select, Textarea } from '../components/index.js';
import { useAuth } from '../contexts/AuthContext.jsx';
import './pages.css';

export function BlogListPage() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const page = Math.max(1, Number.parseInt(searchParams.get('page') || '1', 10) || 1);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadToken, setReloadToken] = useState(0);
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    api(`/blogs?limit=12&page=${page}`)
      .then(result => { if (active) setPosts(result.data || []); })
      .catch(err => { if (active) { setPosts([]); setError(err); } })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [page, reloadToken]);

  const editorialGroups = [];
  const groupLookup = new Map();
  for (const post of posts) {
    const movieTitle = typeof post.movie_title === 'string' ? post.movie_title.trim() : '';
    const key = movieTitle ? `movie:${movieTitle.toLocaleLowerCase('vi-VN')}` : 'general';
    let group = groupLookup.get(key);
    if (!group) {
      group = { key, title: movieTitle || 'Câu chuyện điện ảnh', movie: Boolean(movieTitle), posts: [] };
      groupLookup.set(key, group);
      editorialGroups.push(group);
    }
    group.posts.push(post);
  }

  return <main className="page cm-blog-list-page">
    <div className="page-title"><small className="eyebrow">TẠP CHÍ CINEMIND</small><h1>Điện ảnh là để<br/><em>cùng nhau kể.</em></h1><p>Bài viết, phân tích và cảm nhận từ cộng đồng yêu phim.</p>{user && <Link className="primary" to="/blogs/new">Viết bài mới</Link>}</div>
    <ErrorState error={error} onRetry={() => setReloadToken(value => value + 1)}/>
    {loading ? <LoadingSpinner label="Đang tải bài viết…"/> : editorialGroups.length ? <div className="cm-blog-editorial-groups">{editorialGroups.map(group => <section className="cm-blog-editorial-section" key={group.key}>
      <header className="cm-blog-editorial-section__heading"><div><small className="eyebrow">{group.movie ? 'CHỦ ĐỀ PHIM' : 'CINEMIND STORIES'}</small><h2>{group.title}</h2></div><span>{group.posts.length} bài viết</span></header>
      <HorizontalCarousel label={`bài viết ${group.movie ? `về ${group.title}` : 'chủ đề điện ảnh'}`}><div className="cm-blog-editorial-track">{group.posts.map(post => <BlogCard key={post.post_id} post={post}/>)}</div></HorizontalCarousel>
    </section>)}</div> : !error && <EmptyState title="Chưa có bài viết đã xuất bản">Các bài được duyệt sẽ xuất hiện tại đây.</EmptyState>}
    {!loading && !error && <Pagination page={page} hasPrevious={page > 1} hasNext={posts.length === 12} onPageChange={nextPage => { const next = new URLSearchParams(searchParams); if (nextPage > 1) next.set('page', String(nextPage)); else next.delete('page'); setSearchParams(next); }}/>}
  </main>;
}

function toCommentTree(comments = []) {
  const nodes = new Map(comments.map(comment => [String(comment.comment_id), {
    id: comment.comment_id,
    author: comment.author,
    avatar: comment.avatar_url,
    content: comment.content,
    createdAt: comment.created_at,
    parentId: comment.parent_comment_id,
    replies: [],
  }]));
  const roots = [];
  for (const node of nodes.values()) {
    const parent = node.parentId == null ? null : nodes.get(String(node.parentId));
    if (parent) parent.replies.push(node);
    else roots.push(node);
  }
  return roots;
}

export function BlogDetailPage() {
  const { id } = useParams();
  return <BlogArticle id={id}/>;
}

function BlogArticle({ id }) {
  const { user } = useAuth();
  const [post, setPost] = useState(null);
  const [comment, setComment] = useState('');
  const [reply, setReply] = useState(null);
  const [liked, setLiked] = useState(null);
  const [loading, setLoading] = useState(true);
  const [commentBusy, setCommentBusy] = useState(false);
  const [likeBusy, setLikeBusy] = useState(false);
  const [error, setError] = useState(null);
  const likeLock = useRef(false);
  const commentLock = useRef(false);
  const mutationId = post?.post_id || id;

  async function loadPost(active = () => true) {
    const result = await api(`/blogs/${id}`);
    if (active()) setPost(result.data);
    return result.data;
  }
  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    setPost(null);
    setLiked(null);
    loadPost(() => active).catch(err => { if (active) setError(err); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [id]);

  async function submitComment(event) {
    event.preventDefault();
    if (!user || commentBusy || commentLock.current || !comment.trim()) return;
    commentLock.current = true;
    setCommentBusy(true);
    setError(null);
    try {
      const result = await api(`/blogs/${mutationId}/comments`, { method: 'POST', body: { content: comment.trim(), parentCommentId: reply || undefined } });
      const newComment = { ...result.data, author: user.username, avatar_url: user.avatar_url };
      setPost(current => ({ ...current, comments: [...(current.comments || []), newComment] }));
      setComment('');
      setReply(null);
    } catch (err) { setError(err); }
    finally { commentLock.current = false; setCommentBusy(false); }
  }

  async function toggleLike() {
    if (!user || likeLock.current) return;
    likeLock.current = true;
    setLikeBusy(true);
    setError(null);
    try {
      if (liked) {
        await api(`/blogs/${mutationId}/like`, { method: 'DELETE' });
        setLiked(false);
        setPost(current => ({ ...current, like_count: Math.max(0, Number(current.like_count || 0) - 1) }));
      } else {
        const result = await api(`/blogs/${mutationId}/like`, { method: 'PUT' });
        setLiked(result.liked === true);
        if (result.changed) setPost(current => ({ ...current, like_count: Number(current.like_count || 0) + 1 }));
      }
    } catch (err) { setError(err); }
    finally { likeLock.current = false; setLikeBusy(false); }
  }

  if (loading) return <main className="page cm-blog-detail-page"><LoadingSpinner label="Đang tải bài viết…"/></main>;
  if (error && !post) return <main className="page cm-blog-detail-page"><ErrorState error={error} title="Không tải được bài viết"/><Link to="/blogs">← Trở lại tạp chí</Link></main>;
  if (!post) return <main className="page cm-blog-detail-page"><EmptyState title="Không tìm thấy bài viết"/><Link to="/blogs">← Trở lại tạp chí</Link></main>;
  const comments = toCommentTree(post.comments);

  return <main className="page cm-blog-detail-page">
    <Link className="cm-back-link" to="/blogs">← Tạp chí CineMind</Link>
    <article className="cm-blog-article">
      <header className="cm-blog-article__header"><small className="eyebrow">{post.movie_title || 'GÓC NHÌN ĐIỆN ẢNH'}</small><h1>{post.title}</h1>
        <p className="muted">Bởi {post.author || 'CineMind'} · <time dateTime={post.created_at}>{post.created_at ? new Date(post.created_at).toLocaleDateString('vi-VN') : 'Ngày chưa có'}</time> · {post.view_count || 0} lượt xem</p>
      </header>
      <div className="cm-blog-article__body">{post.content}</div>
      <div className="cm-blog-article__like">
        {user ? <LikeButton liked={liked === true} count={post.like_count} onToggle={toggleLike} pending={likeBusy} label={liked ? 'Bỏ thích' : 'Thích'}/> : <><LikeButton liked={false} count={post.like_count} disabled label="Thích"/><Link to="/login">Đăng nhập để thích bài viết</Link></>}
      </div>
    </article>
    {error && <ErrorState error={error}/>}
    <section className="content-section cm-blog-discussion" aria-labelledby="cm-blog-comments-title">
      <div className="section-head"><h2 id="cm-blog-comments-title">Thảo luận <span>({post.comments?.length || 0})</span></h2></div>
      {user ? <form className="stack-form cm-comment-form" onSubmit={submitComment}>
        {reply && <p className="cm-comment-form__reply">Đang trả lời bình luận <Button variant="ghost" size="sm" onClick={() => setReply(null)}>Hủy</Button></p>}
        <Textarea label="Bình luận" maxLength={3000} value={comment} onChange={event => setComment(event.target.value)} placeholder="Viết bình luận…" required disabled={commentBusy}/>
        <Button type="submit" loading={commentBusy} disabled={!comment.trim()}>Gửi bình luận</Button>
      </form> : <p className="cm-blog-discussion__login"><Link to="/login">Đăng nhập</Link> để tham gia thảo luận.</p>}
      <CommentThread comments={comments} onReply={user ? item => setReply(item.id) : undefined} emptyState="Chưa có bình luận. Hãy mở đầu cuộc trò chuyện."/>
    </section>
  </main>;
}

export function BlogEditorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [movieId, setMovieId] = useState('');
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(Boolean(editId));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const submitLock = useRef(false);

  useEffect(() => {
    let active = true;
    if (!user) { setLoading(false); return undefined; }
    const requests = [editId ? api('/blogs/mine') : Promise.resolve({ data: [] }), editId ? Promise.resolve({ data: [] }) : api('/movies?limit=100')];
    Promise.allSettled(requests).then(([mineResult, movieResult]) => {
      if (!active) return;
      if (!editId && movieResult.status === 'fulfilled') setMovies(movieResult.value.data || []);
      if (editId && mineResult.status === 'rejected') { setError(mineResult.reason); return; }
      const existing = editId && mineResult.value.data.find(post => String(post.post_id) === String(editId));
      if (editId && !existing) setError(new Error('Không tìm thấy bài viết trong danh sách của bạn.'));
      if (existing) { setTitle(existing.title || ''); setContent(existing.content || ''); setMovieId(existing.movie_id ? String(existing.movie_id) : ''); }
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [editId, user]);

  async function submit(event) {
    event.preventDefault();
    if (!user || busy || submitLock.current) return;
    submitLock.current = true;
    setBusy(true);
    setError(null);
    try {
      const result = editId
        ? await api(`/blogs/${editId}`, { method: 'PATCH', body: { title, content } })
        : await api('/blogs', { method: 'POST', body: { title, content, movieId: movieId || undefined } });
      const notice = editId ? `Đã lưu thay đổi. Trạng thái bài viết: ${result.data.status}.` : `Bài viết đã gửi duyệt: ${result.data.status}.`;
      navigate('/profile?tab=blogs', { state: { notice } });
    } catch (err) { setError(err); }
    finally { submitLock.current = false; setBusy(false); }
  }

  if (!user) return <main className="page"><EmptyState title="Cần đăng nhập">Đăng nhập để gửi hoặc quản lý bài viết. <Link to="/login">Đăng nhập →</Link></EmptyState></main>;
  if (loading) return <main className="page"><LoadingSpinner label="Đang tải bài viết…"/></main>;
  return <main className="page cm-blog-editor-page">
    <div className="page-title"><small className="eyebrow">CHIA SẺ GÓC NHÌN</small><h1>{editId ? 'Chỉnh sửa bài viết' : 'Viết bài mới'}</h1><p>{editId ? 'Các thay đổi của bài đã xuất bản có thể được gửi lại để duyệt theo quy tắc hiện tại.' : 'Bài viết mới sẽ ở trạng thái chờ duyệt trước khi xuất hiện công khai.'}</p></div>
    <ErrorState error={error}/>
    {!error && <form className="stack-form cm-blog-editor-form" onSubmit={submit}>
      <Input label="Tiêu đề" required minLength={5} maxLength={240} value={title} onChange={event => setTitle(event.target.value)}/>
      {!editId && <Select label="Liên kết phim (không bắt buộc)" value={movieId} onChange={event => setMovieId(event.target.value)}><option value="">Không liên kết</option>{movies.map(movie => <option key={movie.movie_id} value={movie.movie_id}>{movie.title}</option>)}</Select>}
      <Textarea label="Nội dung" required minLength={30} maxLength={50000} rows={14} value={content} onChange={event => setContent(event.target.value)}/>
      <div className="cm-blog-editor-form__actions"><Button type="submit" loading={busy}>{editId ? 'Lưu thay đổi' : 'Gửi bài để duyệt'}</Button><Button variant="ghost" onClick={() => navigate('/profile?tab=blogs')}>Hủy</Button></div>
    </form>}
  </main>;
}
