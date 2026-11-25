import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import './layouts.css';

const publicLinks = [
  { to: '/', label: 'Trang chủ', end: true },
  { to: '/movies', label: 'Phim & đánh giá' },
  { to: '/blogs', label: 'Cộng đồng' },
  { to: '/ai', label: 'CineMind AI' },
];
const adminLinks = [
  { to: '/admin', label: 'Tổng quan', end: true },
  { to: '/admin/users', label: 'Người dùng' },
  { to: '/admin/movies', label: 'Phim' },
  { to: '/admin/tmdb', label: 'Đồng bộ TMDB' },
  { to: '/admin/blogs', label: 'Kiểm duyệt bài' },
  { to: '/admin/reviews', label: 'Đánh giá' },
  { to: '/admin/analytics', label: 'Thống kê' },
  { to: '/', label: 'Trang CineMind', end: true },
];

function Brand() {
  return <Link to="/" className="cm-brand" aria-label="CineMind, về trang chủ">
    <span className="cm-brand__mark" aria-hidden="true">C</span>
    <span className="cm-brand__word">Cine<span>Mind</span></span>
  </Link>;
}

function UserMenu({ user, onLogout }) {
  if (!user) return <div className="cm-account-actions">
    <Link className="cm-link-button" to="/login">Đăng nhập</Link>
    <Link className="cm-cta" to="/register">Đăng ký</Link>
  </div>;

  return <details className="cm-user-menu">
    <summary aria-label={`Tài khoản ${user.username || 'người dùng'}`}>
      <span className="cm-user-menu__avatar" aria-hidden="true">{(user.username || 'C').trim().charAt(0).toUpperCase()}</span>
      <span className="cm-user-menu__name">{user.username || 'Tài khoản'}</span>
      <span className="cm-user-menu__chevron" aria-hidden="true">⌄</span>
    </summary>
    <div className="cm-user-menu__panel">
      <Link to="/profile">Hồ sơ cá nhân</Link>
      <Link to="/watchlist">Danh sách phim đã lưu</Link>
      <Link to="/profile/password">Bảo mật</Link>
      {user.role === 'ADMIN' && <Link to="/admin">Quản trị</Link>}
      <button type="button" onClick={onLogout}>Đăng xuất</button>
    </div>
  </details>;
}

function MobileNavigation({ user, onLogout, onNavigate, variant }) {
  const links = variant === 'admin' ? adminLinks : publicLinks;
  return <div className="cm-mobile-navigation" id="cm-mobile-navigation">
    <nav aria-label="Điều hướng chính">
      {links.map(link => <NavLink key={link.to} to={link.to} end={link.end} onClick={onNavigate}>{link.label}</NavLink>)}
      {variant !== 'admin' && <Link to="/movies" aria-label="Tìm kiếm phim" onClick={onNavigate}>
        <svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg>
        Tìm phim
      </Link>}
    </nav>
    <div className="cm-mobile-navigation__account">
      <UserMenu user={user} onLogout={() => { onLogout?.(); onNavigate(); }} />
    </div>
  </div>;
}

export function PublicHeader({ user, onLogout, variant = 'public' }) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();
  const navigationLinks = variant === 'admin' ? adminLinks : publicLinks;
  const toggleRef = useRef(null);
  function searchMovies(event) {
    event.preventDefault();
    const query = searchQuery.trim();
    if (!query) { navigate('/movies'); return; }
    navigate(`/movies?q=${encodeURIComponent(query)}`);
  }
  useEffect(() => setMenuOpen(false), [location.pathname, location.search]);
  useEffect(() => {
    if (!menuOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') {
        setMenuOpen(false);
        toggleRef.current?.focus();
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [menuOpen]);

  return <header className={`cm-site-header cm-site-header--${variant}`}>
    <div className="cm-site-header__inner">
      <Brand />
      {variant === 'admin' && <span className="cm-site-header__context">Không gian quản trị</span>}
      <nav className="cm-desktop-navigation" aria-label="Điều hướng chính">
        {navigationLinks.map(link => <NavLink key={link.to} to={link.to} end={link.end}>{link.label}</NavLink>)}
        {variant !== 'admin' && <form className="cm-header-search" role="search" onSubmit={searchMovies}>
          <input type="search" aria-label="Tìm phim" placeholder="Tìm phim…" value={searchQuery} onChange={event => setSearchQuery(event.target.value)}/>
          <button type="submit" aria-label="Tìm phim"><svg aria-hidden="true" viewBox="0 0 20 20"><circle cx="8.5" cy="8.5" r="5.5"/><path d="m13 13 4 4"/></svg></button>
        </form>}
      </nav>
      <div className="cm-site-header__account"><UserMenu user={user} onLogout={onLogout} /></div>
      <button
        ref={toggleRef}
        className="cm-menu-toggle"
        type="button"
        aria-label={menuOpen ? 'Đóng menu điều hướng' : 'Mở menu điều hướng'}
        aria-expanded={menuOpen}
        aria-controls="cm-mobile-navigation"
        onClick={() => setMenuOpen(open => !open)}
      >
        <span aria-hidden="true" className={menuOpen ? 'is-open' : ''}><i/><i/><i/></span>
      </button>
    </div>
    {menuOpen && <MobileNavigation user={user} onLogout={onLogout} onNavigate={() => setMenuOpen(false)} variant={variant} />}
  </header>;
}

export function Footer() {
  return <footer className="cm-site-footer">
    <div className="cm-site-footer__inner">
      <div className="cm-site-footer__brand">
        <Brand />
        <p>Một cộng đồng để khám phá phim và chia sẻ góc nhìn điện ảnh.</p>
      </div>
      <nav className="cm-site-footer__links" aria-label="Liên kết CineMind">
        <Link to="/movies">Khám phá phim</Link>
        <Link to="/blogs">Tạp chí</Link>
        <Link to="/ai">CineMind AI</Link>
      </nav>
      <div className="cm-tmdb-credit">
        <a href="https://www.themoviedb.org" target="_blank" rel="noreferrer">
          <img src="https://www.themoviedb.org/assets/2/v4/logos/blue_long.svg" alt="TMDB" />
        </a>
        <small>This product uses the TMDB API but is not endorsed or certified by TMDB.</small>
      </div>
    </div>
    <div className="cm-site-footer__legal"><small>© 2026 CineMind · Đồ án 2</small></div>
  </footer>;
}

export function ApplicationShell({ children, user, onLogout, variant = 'public' }) {
  return <div className={`cm-app-shell cm-app-shell--${variant}`}>
    <PublicHeader user={user} onLogout={onLogout} variant={variant} />
    <div className="cm-app-shell__content">{children}</div>
    <Footer />
  </div>;
}

export function PublicLayout(props) { return <ApplicationShell {...props} variant="public" />; }
export function AuthLayout(props) { return <ApplicationShell {...props} variant="auth" />; }
export function AdminLayout(props) { return <ApplicationShell {...props} variant="admin" />; }
