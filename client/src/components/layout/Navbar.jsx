import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { LayoutDashboard, User, LogOut, Menu, X, ChevronRight } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { useScrollY } from '../../hooks/index.js';
import { getInitials } from '../../utils/formatters.js';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import SnowfallToggle from '../ui/SnowfallToggle.jsx';

const Logo = () => (
  <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
    <div style={{
      width: 36, height: 36, borderRadius: 10,
      background: 'var(--gradient-gold)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 0 20px var(--gold-glow)',
      flexShrink: 0,
    }}>
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path d="M15 10l4.553-2.276A1 1 0 0121 8.67v6.66a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="#0a0806" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
    <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.15rem', color: 'var(--text-primary)' }}>
      ClipCrafters<span style={{ background: 'var(--gradient-gold)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text' }}>Crafters</span>
    </span>
  </Link>
);

export default function Navbar({ snowfallEnabled, setSnowfallEnabled }) {
  const { user, isAuthenticated, logout } = useAuth();
  const scrollY = useScrollY();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [dropOpen, setDropOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const dropRef = useRef(null);
  const isHome = location.pathname === '/';

  const scrolled = scrollY > 20;

  useEffect(() => {
    const handler = (e) => { if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);


  const scrollTo = (id) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  const handleLogout = () => { logout(); navigate('/'); setMobileOpen(false); };

  return (
    <>
      <motion.nav
        initial={{ y: -10, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          height: 'var(--navbar-height)',
          zIndex: 100,
          display: 'flex', alignItems: 'center',
          padding: '0 24px',
          background: scrolled ? 'var(--bg-navbar)' : 'transparent',
          backdropFilter: scrolled ? 'blur(20px)' : 'none',
          WebkitBackdropFilter: scrolled ? 'blur(20px)' : 'none',
          borderBottom: scrolled ? '1px solid var(--border-default)' : '1px solid transparent',
          transition: 'background 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease',
          boxShadow: scrolled ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none',
        }}
      >
        <Logo />

        {/* Center nav — home page only */}
        {isHome && (
          <div style={{ display: 'flex', gap: 32, margin: '0 auto', alignItems: 'center' }} className="desktop-only">
            {['features', 'pricing', 'demo'].map((id) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                data-cursor="pointer"
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: 'var(--text-secondary)', fontFamily: 'var(--font-body)',
                  fontSize: '0.9rem', fontWeight: 500,
                  textTransform: 'capitalize', transition: 'color 0.2s',
                  padding: '4px 0',
                }}
                onMouseEnter={(e) => e.target.style.color = 'var(--gold-light)'}
                onMouseLeave={(e) => e.target.style.color = 'var(--text-secondary)'}
              >
                {id}
              </button>
            ))}
          </div>
        )}

        {/* Right side */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginLeft: 'auto' }}>
          <div className="desktop-only"><ThemeToggle /></div>
          <div className="desktop-only"><SnowfallToggle onToggle={setSnowfallEnabled} /></div>

          {isAuthenticated ? (
            <div ref={dropRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setDropOpen(!dropOpen)}
                data-cursor="pointer"
                style={{
                  width: 38, height: 38, borderRadius: '50%',
                  background: 'var(--gradient-gold)',
                  border: 'none', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '0.85rem', fontWeight: 700,
                  color: 'var(--text-inverse)', fontFamily: 'var(--font-body)',
                }}
                title={user?.name}
              >
                {getInitials(user?.name || 'U')}
              </button>
              <AnimatePresence>
                {dropOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 8, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 8, scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="glass-card"
                    style={{
                      position: 'absolute', top: 46, right: 0,
                      width: 200, padding: '8px 0',
                      boxShadow: 'var(--shadow-glow)',
                    }}
                  >
                    <div style={{ padding: '8px 16px 12px', borderBottom: '1px solid var(--border-default)' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{user?.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                    </div>
                    {[
                      { label: 'My Dashboard', icon: LayoutDashboard, route: '/dashboard' },
                      { label: 'Profile', icon: User, route: '/profile' },
                    ].map(({ label, icon: Icon, route }) => (
                      <button
                        key={route}
                        onClick={() => { navigate(route); setDropOpen(false); }}
                        data-cursor="pointer"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '0.875rem', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--bg-elevated)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <Icon size={15} /> {label}
                      </button>
                    ))}
                    <div style={{ borderTop: '1px solid var(--border-default)', marginTop: 4 }}>
                      <button
                        onClick={handleLogout}
                        data-cursor="pointer"
                        style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', background: 'none', border: 'none', cursor: 'pointer', color: '#f87171', fontFamily: 'var(--font-body)', fontSize: '0.875rem', transition: 'background 0.15s' }}
                        onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(239,68,68,0.08)'}
                        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                      >
                        <LogOut size={15} /> Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <Link to="/login" className="btn-ghost btn-sm" data-cursor="pointer">Log in</Link>
              <Link to="/register" className="btn-primary btn-sm" data-cursor="pointer">Get Started <ChevronRight size={14} /></Link>
            </div>
          )}

          {/* Mobile hamburger */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="mobile-only btn-icon"
            data-cursor="pointer"
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            style={{
              position: 'fixed', top: 0, right: 0, bottom: 0,
              width: '80%', maxWidth: 320,
              background: 'var(--bg-secondary)',
              zIndex: 200,
              padding: '80px 24px 40px',
              display: 'flex', flexDirection: 'column', gap: 8,
              borderLeft: '1px solid var(--border-default)',
            }}
          >
            <ThemeToggle />
            <div style={{ height: 16 }} />
            {isHome && ['features', 'pricing', 'demo'].map((id) => (
              <button key={id} onClick={() => scrollTo(id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-primary)', fontFamily: 'var(--font-body)', fontSize: '1.1rem', textAlign: 'left', padding: '12px 0', textTransform: 'capitalize', borderBottom: '1px solid var(--border-default)' }}>
                {id}
              </button>
            ))}
            <div style={{ marginTop: 'auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" className="btn-ghost" style={{ textAlign: 'center' }}>Dashboard</Link>
                  <button onClick={handleLogout} className="btn-danger">Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn-ghost" style={{ textAlign: 'center' }}>Log in</Link>
                  <Link to="/register" className="btn-primary" style={{ textAlign: 'center' }}>Get Started</Link>
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 199 }}
          />
        )}
      </AnimatePresence>

      <style>{`
        @media (min-width: 768px) { .mobile-only { display: none !important; } }
        @media (max-width: 767px) { .desktop-only { display: none !important; } }
      `}</style>
    </>
  );
}
