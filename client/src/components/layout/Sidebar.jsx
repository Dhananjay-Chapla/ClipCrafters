import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart3, FolderOpen, PlusCircle, User, LogOut, ChevronLeft, ChevronRight, X, Sparkles, Film, Info, Mail, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { getInitials } from '../../utils/formatters.js';
import ThemeToggle from '../ui/ThemeToggle.jsx';
import SnowfallToggle from '../ui/SnowfallToggle.jsx';

const NAV = [
  { label: 'Dashboard', icon: BarChart3, route: '/dashboard' },
  { label: 'Projects', icon: FolderOpen, route: '/projects/create', exact: false },
  { label: 'RAG Generator', icon: Sparkles, route: '/rag-generator' },
  { label: 'Video Editor', icon: Film, route: '/video-editor' },
  { label: 'About Us', icon: Info, route: '/about' },
  { label: 'Contact', icon: Mail, route: '/contact' },
  { label: 'FAQ', icon: HelpCircle, route: '/faq' },
  { label: 'Profile', icon: User, route: '/profile' },
];

// ─── SidebarContent extracted outside component to avoid "component created during render" error ──
function SidebarContent({ mobile, collapsed, location, user, onMobileClose, onLogout, snowfallEnabled, setSnowfallEnabled }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Logo */}
      <div 
        className="shine-slow shadow-lg"
        style={{ 
          padding: collapsed ? '24px 16px' : '24px 20px', 
          borderBottom: '1px solid var(--border-default)', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: collapsed ? 'center' : 'space-between',
          background: 'var(--bg-elevated)',
        }}
      >
        {!collapsed && (
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div 
              className="shadow-neon slow-pulse"
              style={{ 
                width: 36, 
                height: 36, 
                borderRadius: 10, 
                background: 'var(--gradient-primary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0,
                boxShadow: '0 0 20px var(--primary-glow)',
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M15 10l4.553-2.276A1 1 0 0121 8.67v6.66a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <span 
              className="gradient-text-animated"
              style={{ 
                fontFamily: 'var(--font-display)', 
                fontWeight: 700, 
                fontSize: '1.1rem', 
                whiteSpace: 'nowrap',
                textShadow: '0 2px 10px var(--primary-glow)',
              }}
            >
              ClipCrafters
            </span>
          </Link>
        )}
        {mobile && (
          <button onClick={onMobileClose} className="btn-icon">
            <X size={20} />
          </button>
        )}
        {!mobile && collapsed && (
          <div 
            className="shadow-neon slow-pulse"
            style={{ 
              width: 36, 
              height: 36, 
              borderRadius: 10, 
              background: 'var(--gradient-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              boxShadow: '0 0 20px var(--primary-glow)',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.67v6.66a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        )}
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
        {NAV.map(({ label, icon: Icon, route, highlighted }) => {
          const active = location.pathname === route;
          return (
            <Link
              key={label}
              to={route}
              onClick={mobile ? onMobileClose : undefined}
              title={collapsed ? label : undefined}
              data-cursor="pointer"
              className={`nav-link ${active ? 'active' : ''} ${highlighted ? 'highlighted' : ''} hover-lift gpu-accelerated`}
              style={{
                display: 'flex', 
                alignItems: 'center', 
                gap: 12,
                padding: collapsed ? '12px' : '12px 16px',
                borderRadius: 12, 
                textDecoration: 'none',
                justifyContent: collapsed ? 'center' : 'flex-start',
                background: active ? 'var(--primary-subtle)' : highlighted ? 'var(--primary-subtle)' : 'transparent',
                border: active ? '1px solid var(--border-active)' : highlighted ? '1px solid var(--border-default)' : '1px solid transparent',
                color: active || highlighted ? 'var(--primary-light)' : 'var(--text-secondary)',
                fontFamily: 'var(--font-body)', 
                fontWeight: active ? 600 : 500,
                fontSize: '0.9rem', 
                transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                position: 'relative',
                boxShadow: active ? 'var(--shadow-md)' : 'none',
                transform: 'translateZ(0)',
              }}
            >
              {active && (
                <div 
                  className="glow-border"
                  style={{ 
                    position: 'absolute', 
                    left: 0, 
                    top: '50%', 
                    transform: 'translateY(-50%)', 
                    width: 4, 
                    height: '70%', 
                    background: 'var(--gradient-primary)', 
                    borderRadius: '0 4px 4px 0',
                    boxShadow: '0 0 10px var(--primary)',
                  }} 
                />
              )}
              <Icon size={20} style={{ flexShrink: 0 }} />
              {!collapsed && <span style={{ whiteSpace: 'nowrap' }}>{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Bottom */}
      <div 
        className="shadow-inner"
        style={{ 
          padding: collapsed ? '16px 12px' : '16px', 
          borderTop: '1px solid var(--border-default)', 
          display: 'flex', 
          flexDirection: 'column', 
          gap: 12,
          background: 'var(--bg-elevated)',
        }}
      >
        <div style={{ display: 'flex', gap: 8, justifyContent: collapsed ? 'center' : 'flex-start', flexWrap: 'wrap' }}>
          <ThemeToggle size="sm" />
          <SnowfallToggle onToggle={setSnowfallEnabled} />
        </div>

        {!collapsed && user && (
          <div 
            className="glass-card hover-lift shadow-md"
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 12, 
              padding: '12px', 
              borderRadius: 12,
              background: 'var(--primary-subtle)',
              border: '1px solid var(--border-active)',
            }}
          >
            <div 
              className="shadow-neon slow-pulse"
              style={{ 
                width: 40, 
                height: 40, 
                borderRadius: '50%', 
                background: 'var(--gradient-primary)', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                flexShrink: 0, 
                fontSize: '0.85rem', 
                fontWeight: 700, 
                color: 'white',
                boxShadow: '0 0 20px var(--primary-glow)',
              }}
            >
              {getInitials(user?.name || 'U')}
            </div>
            <div style={{ overflow: 'hidden', flex: 1, minWidth: 0 }}>
              <div style={{ 
                fontWeight: 600, 
                fontSize: '0.9rem', 
                color: 'var(--text-primary)', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                textShadow: '0 2px 4px rgba(0,0,0,0.3)',
              }}>
                {user?.name || 'User'}
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                color: 'var(--primary-light)', 
                overflow: 'hidden', 
                textOverflow: 'ellipsis', 
                whiteSpace: 'nowrap',
                fontWeight: 500,
              }}>
                {user?.role || 'Member'}
              </div>
            </div>
          </div>
        )}

        {collapsed && user && (
          <div 
            className="shadow-neon slow-pulse"
            style={{ 
              width: 40, 
              height: 40, 
              borderRadius: '50%', 
              background: 'var(--gradient-primary)', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              fontSize: '0.85rem', 
              fontWeight: 700, 
              color: 'white',
              boxShadow: '0 0 20px var(--primary-glow)',
              margin: '0 auto',
              cursor: 'pointer',
              position: 'relative',
            }}
            title={`${user?.name || 'User'} (${user?.role || 'Member'})`}
          >
            {getInitials(user?.name || 'U')}
          </div>
        )}

        <button
          onClick={onLogout}
          data-cursor="pointer"
          className="btn-danger hover-lift"
          style={{
            display: 'flex', 
            alignItems: 'center', 
            gap: 10,
            justifyContent: collapsed ? 'center' : 'flex-start',
            padding: collapsed ? '12px' : '12px 16px',
            width: '100%',
          }}
        >
          <LogOut size={18} style={{ flexShrink: 0 }} />
          {!collapsed && 'Logout'}
        </button>
      </div>
    </div>
  );
}

export default function Sidebar({ isMobileOpen, onMobileClose, snowfallEnabled, setSnowfallEnabled }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 260 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        style={{
          position: 'fixed', 
          top: 0, 
          left: 0, 
          bottom: 0,
          background: 'var(--bg-secondary)',
          borderRight: '1px solid var(--border-default)',
          zIndex: 50, 
          overflow: 'hidden',
          display: 'flex', 
          flexDirection: 'column',
          boxShadow: 'var(--shadow-xl)',
        }}
        className="sidebar-desktop gpu-accelerated"
      >
        <SidebarContent
          mobile={false}
          collapsed={collapsed}
          location={location}
          user={user}
          onMobileClose={onMobileClose}
          onLogout={handleLogout}
          snowfallEnabled={snowfallEnabled}
          setSnowfallEnabled={setSnowfallEnabled}
        />
        {/* Collapse toggle - fully visible */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          data-cursor="pointer"
          className="shadow-md hover-glow slow-motion"
          style={{
            position: 'absolute', 
            top: 80,
            right: -14,
            width: 32, 
            height: 32, 
            borderRadius: '50%',
            background: 'var(--bg-elevated)',
            border: '2px solid var(--border-default)',
            cursor: 'pointer', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            color: 'var(--primary)', 
            zIndex: 100,
            transition: 'all 0.3s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.boxShadow = '0 0 12px var(--primary-glow)';
            e.currentTarget.style.transform = 'scale(1.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.boxShadow = 'var(--shadow-md)';
            e.currentTarget.style.transform = 'scale(1)';
          }}
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={onMobileClose}
              style={{ 
                position: 'fixed', 
                inset: 0, 
                background: 'rgba(0,0,0,0.7)', 
                backdropFilter: 'blur(4px)',
                zIndex: 199 
              }}
            />
            <motion.aside
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              style={{
                position: 'fixed', 
                top: 0, 
                left: 0, 
                bottom: 0,
                width: 280,
                background: 'var(--bg-secondary)',
                borderRight: '1px solid var(--border-default)',
                zIndex: 200,
                boxShadow: 'var(--shadow-xl)',
              }}
              className="gpu-accelerated"
            >
              <SidebarContent
                mobile
                collapsed={false}
                location={location}
                user={user}
                onMobileClose={onMobileClose}
                onLogout={handleLogout}
                snowfallEnabled={snowfallEnabled}
                setSnowfallEnabled={setSnowfallEnabled}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      <style>{`
        @media (max-width: 767px) { 
          .sidebar-desktop { display: none; } 
        }
        
        .nav-link:hover {
          background: var(--primary-subtle) !important;
          border-color: var(--border-hover) !important;
          color: var(--primary-light) !important;
          box-shadow: var(--shadow-md) !important;
          transform: translateY(-2px) translateZ(0) !important;
        }
        
        .nav-link.active {
          background: var(--primary-subtle) !important;
          border-color: var(--border-active) !important;
        }
      `}</style>
    </>
  );
}
