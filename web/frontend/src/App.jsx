import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate } from 'react-router-dom';
import { api } from './api.js';
import { Button, ErrorState as ErrorBox, LoadingSpinner as Loading } from './components/index.js';
import { AdminLayout, AuthLayout, PublicLayout } from './layouts/index.jsx';
import { AuthProvider, useAuth } from './contexts/AuthContext.jsx';
import HomePage from './pages/HomePage.jsx';
import ExplorePage from './pages/ExplorePage.jsx';
import MovieDetailPage from './pages/MovieDetailPage.jsx';
import { BlogDetailPage, BlogEditorPage, BlogListPage } from './pages/BlogPages.jsx';
import { PasswordChangePage, ProfilePage, WatchlistPage } from './pages/ProfilePages.jsx';
import { AdminBlogsPage, AdminDashboardPage, AdminMoviesPage, AdminReviewsPage, AdminTmdbPage, AdminUsersPage } from './pages/AdminPages.jsx';

function AI() {
  const [message, setMessage] = useState('');
  const [movieId, setMovieId] = useState('');
  const [movies, setMovies] = useState([]);
  const [messages, setMessages] = useState([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [mood, setMood] = useState('');
  const [backdropFailed, setBackdropFailed] = useState(false);
  const [posterFailed, setPosterFailed] = useState(false);
  useEffect(() => { let active = true; api('/movies?limit=100').then(result => { if (active) setMovies(result.data || []); }).catch(() => {}); return () => { active = false; }; }, []);

  const selectedMovie = movies.find(movie => String(movie.movie_id) === String(movieId));
  const backgroundImage = (!backdropFailed && selectedMovie?.banner_url) || (!posterFailed && selectedMovie?.poster_url);
  useEffect(() => { setBackdropFailed(false); setPosterFailed(false); }, [selectedMovie?.movie_id]);

  async function send(event) {
    event.preventDefault();
    const text = message.trim();
    if (!text || busy) return;
    setMessages(current => [...current, { role: 'user', text }]);
    setMessage('');
    setBusy(true);
    setError(null);
    try {
      const result = await api('/ai/chat', { method: 'POST', body: { message: text, ...(movieId ? { movieId: Number(movieId) } : {}) } });
      setMessages(current => [...current, { role: 'assistant', text: result.answer }]);
    } catch (reason) { setError(reason); }
    finally { setBusy(false); }
  }

  async function recommend(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const result = await api('/ai/recommendations', { method: 'POST', body: { mood } });
      setMessages(current => [...current, { role: 'assistant', text: result.answer }]);
    } catch (reason) { setError(reason); }
    finally { setBusy(false); }
  }

  return <main className="cm-ai-page">
    {backgroundImage && <img className="cm-ai-page__backdrop" src={backgroundImage} alt="" aria-hidden="true" onError={() => {
      if (selectedMovie?.banner_url && backgroundImage === selectedMovie.banner_url) setBackdropFailed(true);
      else setPosterFailed(true);
    }}/>}
    <div className="cm-ai-page__scrim" aria-hidden="true"/>
    <section className="cm-ai-chat" aria-labelledby="cm-ai-title">
      <header className="cm-ai-chat__header"><div><small className="eyebrow">CINEMIND AI · GEMINI</small><h1 id="cm-ai-title">Trò chuyện về điện ảnh</h1><p>{selectedMovie ? `Đang trò chuyện về ${selectedMovie.vietnamese_title || selectedMovie.title}.` : 'Khám phá những câu chuyện điện ảnh cùng CineMind.'}</p></div>
        <label className="cm-ai-movie-select">Bối cảnh phim <select value={movieId} onChange={event => setMovieId(event.target.value)}><option value="">Chat tổng quát</option>{movies.map(movie => <option key={movie.movie_id} value={movie.movie_id}>{movie.vietnamese_title || movie.title}</option>)}</select></label>
      </header>
      <div className="cm-ai-chat__history" role="log" aria-label="Lịch sử trò chuyện" aria-live="polite">
        {messages.map((item, index) => <article className={`cm-ai-message cm-ai-message--${item.role}`} key={`${item.role}-${index}`}><small>{item.role === 'user' ? 'Bạn' : 'CineMind'}</small><p>{item.text}</p></article>)}
        {busy && <p className="cm-ai-thinking" role="status">CineMind đang suy nghĩ…</p>}
        {!messages.length && <div className="cm-ai-welcome"><span aria-hidden="true">✦</span><h2>Một câu hỏi có thể mở ra cả thế giới.</h2><p>Hỏi về phim, nhân vật hoặc chọn phim phía trên để bắt đầu cuộc trò chuyện.</p><div className="cm-ai-prompts">{['Gợi ý phim nhẹ nhàng cuối tuần','Sci-fi giàu cảm xúc','Phim trinh thám hấp dẫn'].map(prompt => <button key={prompt} type="button" onClick={() => setMessage(prompt)}>{prompt}</button>)}</div></div>}
      </div>
      {error && <ErrorBox error={error}/>}
      <form className="cm-ai-composer" onSubmit={send}><input aria-label="Tin nhắn cho CineMind" value={message} onChange={event => setMessage(event.target.value)} placeholder="Hỏi CineMind về phim ảnh…"/><Button type="submit" loading={busy} disabled={!message.trim()}>Gửi <span aria-hidden="true">↑</span></Button></form>
      <form className="cm-ai-recommend" onSubmit={recommend}><label htmlFor="cm-ai-mood">Gợi ý theo tâm trạng</label><input id="cm-ai-mood" value={mood} onChange={event => setMood(event.target.value)} placeholder="Ví dụ: muốn xem điều gì nhẹ nhàng…"/><Button type="submit" variant="ghost" disabled={busy}>Gợi ý phim</Button></form>
      <small className="cm-ai-disclaimer">Chat tổng quát dùng được không cần đăng nhập. Gợi ý cá nhân hóa yêu cầu tài khoản.</small>
    </section>
  </main>;
}

function AuthPage({register=false}){const {user,authenticate}=useAuth();const nav=useNavigate();const [form,setForm]=useState({});const [error,setError]=useState(null);const [busy,setBusy]=useState(false);if(user)return <main className="auth"><h1>Bạn đã đăng nhập</h1><Link to="/profile">Vào hồ sơ →</Link></main>;async function submit(e){e.preventDefault();setBusy(true);try{const u=await authenticate(register?'/auth/register':'/auth/login',register?{username:form.username,email:form.email,password:form.password,fullName:form.fullName}:{identity:form.identity,password:form.password});nav(u.role==='ADMIN'?'/admin':'/profile')}catch(e){setError(e)}finally{setBusy(false)}}
 return <main className="auth"><small className="eyebrow">CINEMIND COMMUNITY</small><h1>{register?'Tạo tài khoản':'Đăng nhập'}</h1><p>{register?'Tham gia cộng đồng yêu điện ảnh.':'Chào mừng bạn quay lại CineMind.'}</p><ErrorBox error={error}/><form onSubmit={submit}>{register&&<><label>Tên người dùng<input required minLength={3} maxLength={50} value={form.username||''} onChange={e=>setForm({...form,username:e.target.value})}/></label><label>Họ tên<input maxLength={150} value={form.fullName||''} onChange={e=>setForm({...form,fullName:e.target.value})}/></label><label>Email<input type="email" required value={form.email||''} onChange={e=>setForm({...form,email:e.target.value})}/></label></>} {!register&&<label>Email hoặc tên người dùng<input required value={form.identity||''} onChange={e=>setForm({...form,identity:e.target.value})}/></label>}<label>Mật khẩu<input type="password" required minLength={8} value={form.password||''} onChange={e=>setForm({...form,password:e.target.value})}/></label><button className="primary" disabled={busy}>{busy?'Đang xử lý…':register?'Tạo tài khoản →':'Đăng nhập →'}</button></form><p>{register?'Đã có tài khoản? ':'Chưa có tài khoản? '}<Link to={register?'/login':'/register'}>{register?'Đăng nhập':'Đăng ký'}</Link></p></main>;
}


function NotFound(){return <main className="auth"><h1>Không tìm thấy trang</h1><Link to="/">Về trang chủ →</Link></main>}
function AdminAccess(){const {user}=useAuth();const location=useLocation();if(!user)return <Navigate to="/login" state={{from:location}} replace/>;if(user.role!=='ADMIN')return <main className="page cm-admin-access"><h1>Không có quyền truy cập</h1><p>Khu vực này chỉ dành cho Admin.</p><Link to="/">Về CineMind →</Link></main>;return <Outlet/>;}
function AppRoutes(){const {user,ready,logout}=useAuth();const location=useLocation();if(!ready)return <Loading/>;const isAdminRoute=location.pathname.startsWith('/admin');const Layout=isAdminRoute&&user?.role==='ADMIN'?AdminLayout:location.pathname==='/login'||location.pathname==='/register'?AuthLayout:PublicLayout;return <Layout user={user} onLogout={logout}><Routes><Route path="/" element={<HomePage/>}/><Route path="/movies" element={<ExplorePage/>}/><Route path="/movies/:id" element={<MovieDetailPage/>}/><Route path="/blogs" element={<BlogListPage/>}/><Route path="/blogs/new" element={<BlogEditorPage/>}/><Route path="/blogs/:id" element={<BlogDetailPage/>}/><Route path="/ai" element={<AI/>}/><Route path="/login" element={<AuthPage/>}/><Route path="/register" element={<AuthPage register/>}/><Route path="/profile" element={<ProfilePage/>}/><Route path="/profile/password" element={<PasswordChangePage/>}/><Route path="/watchlist" element={<WatchlistPage/>}/><Route path="/admin" element={<AdminAccess/>}><Route index element={<AdminDashboardPage/>}/><Route path="users" element={<AdminUsersPage/>}/><Route path="movies" element={<AdminMoviesPage/>}/><Route path="tmdb" element={<AdminTmdbPage/>}/><Route path="blogs" element={<AdminBlogsPage/>}/><Route path="reviews" element={<AdminReviewsPage/>}/><Route path="analytics" element={<AdminDashboardPage analytics/>}/></Route><Route path="*" element={<NotFound/>}/></Routes></Layout>}
export default function App(){return <AuthProvider><AppRoutes/></AuthProvider>}


