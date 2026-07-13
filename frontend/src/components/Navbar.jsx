import { useState, useEffect } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { useAuthModal } from '../context/AuthModalContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const NAV_LINKS = [
  { label: 'Menu', to: '/menu' },
  { label: 'Track Order', to: '/track-order' },
  { label: 'About', to: '/about' },
];

function NavItem({ label, to, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <NavLink
      to={to}
      onClick={onClick}
      style={({ isActive }) => ({
        textDecoration: 'none',
        fontSize: 14,
        fontWeight: 500,
        color: isActive || hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
        transition: 'color 0.2s ease',
        letterSpacing: '-0.01em',
        position: 'relative',
        paddingBottom: 2,
      })}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {({ isActive }) => (
        <>
          {label}
          <span style={{
            position: 'absolute',
            bottom: -6,
            left: '50%',
            transform: 'translateX(-50%)',
            width: isActive ? 4 : 0,
            height: 4,
            borderRadius: '50%',
            background: '#FF4500',
            transition: 'width 0.25s ease',
            display: 'block',
          }} />
        </>
      )}
    </NavLink>
  );
}

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={toggleTheme}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} mode`}
      style={{
        background: 'transparent',
        border: `1px solid ${hovered ? 'var(--border-focus)' : 'var(--border-color)'}`,
        borderRadius: '50%',
        width: 36,
        height: 36,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        color: hovered ? 'var(--text-primary)' : 'var(--text-secondary)',
        position: 'relative',
        overflow: 'hidden',
        padding: 0,
        outline: 'none',
        transition: 'border-color 0.3s ease, color 0.3s ease',
        flexShrink: 0,
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '200%',
          position: 'absolute',
          top: theme === 'dark' ? '0%' : '-100%',
          transition: 'top 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Moon Icon (dark theme) */}
        <div style={{ height: '50%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
          </svg>
        </div>
        {/* Sun Icon (light theme) */}
        <div style={{ height: '50%', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        </div>
      </div>
    </button>
  );
}

export default function Navbar() {
  const { open: openAuth } = useAuthModal();
  const { user, isAuthenticated, logout } = useAuth();
  const { totalItems } = useCart();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [ctaHovered, setCtaHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 48);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const handleMobileLogout = () => {
    setMobileOpen(false);
    logout();
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .navbar-desktop-nav { display: none !important; }
          .navbar-desktop-controls { display: none !important; }
          .navbar-hamburger { display: flex !important; }
        }
        @media (min-width: 769px) {
          .navbar-mobile-menu { display: none !important; }
          .navbar-hamburger { display: none !important; }
        }
      `}</style>

      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 50,
          transition: 'background 0.5s ease, border-color 0.5s ease',
          background: scrolled || mobileOpen ? 'var(--bg-navbar)' : 'transparent',
          backdropFilter: scrolled || mobileOpen ? 'saturate(180%) blur(24px)' : 'none',
          WebkitBackdropFilter: scrolled || mobileOpen ? 'saturate(180%) blur(24px)' : 'none',
          borderBottom: `1px solid ${scrolled || mobileOpen ? 'var(--navbar-border)' : 'transparent'}`,
        }}
      >
        {/* ── Desktop: 3-column flex ── */}
        <div style={{
          maxWidth: 1400,
          margin: '0 auto',
          padding: '0 24px',
          height: 72,
          display: 'flex',
          alignItems: 'center',
          gap: 16,
        }}>
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none', flexShrink: 0 }}>
            <span style={{ fontWeight: 900, fontSize: 19, letterSpacing: '-0.035em', color: 'var(--text-primary)' }}>
              INFERNO<span style={{ color: '#FF4500' }}>.</span>
            </span>
          </Link>

          {/* Center nav — desktop only */}
          <nav className="navbar-desktop-nav" style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 36,
            minWidth: 0,
          }}>
            {NAV_LINKS.map(link => (
              <NavItem key={link.to} {...link} />
            ))}
          </nav>

          {/* Right controls — desktop only */}
          <div className="navbar-desktop-controls" style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}>
            <ThemeToggle />

            {isAuthenticated ? (
              <>
                <Link
                  to="/cart"
                  style={{
                    background: 'transparent', border: 'none',
                    fontSize: 13, fontWeight: 500,
                    color: 'var(--text-secondary)',
                    letterSpacing: '-0.01em',
                    transition: 'color 0.2s ease',
                    padding: '8px 4px', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', gap: 5,
                    textDecoration: 'none', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                  </svg>
                  Cart ({totalItems})
                </Link>

                <span style={{
                  fontSize: 13, fontWeight: 500,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.01em',
                  padding: '8px 4px',
                  display: 'flex', alignItems: 'center', gap: 5,
                  whiteSpace: 'nowrap',
                }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  {user?.fullName?.split(' ')[0] || 'Profile'}
                </span>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin"
                    style={{
                      textDecoration: 'none', fontSize: 12, fontWeight: 700,
                      color: '#fff', background: '#FF4500',
                      padding: '7px 14px', borderRadius: 100,
                      letterSpacing: '0.01em',
                      transition: 'background 0.2s ease',
                      display: 'inline-flex', alignItems: 'center', gap: 4,
                      whiteSpace: 'nowrap',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#DC3800'}
                    onMouseLeave={e => e.currentTarget.style.background = '#FF4500'}
                  >
                    ⬡ Admin
                  </Link>
                )}

                <button
                  onClick={logout}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    fontSize: 13, fontWeight: 600,
                    color: 'var(--text-primary)',
                    padding: '7px 14px', borderRadius: 100,
                    letterSpacing: '-0.01em',
                    transition: 'border-color 0.2s ease, background 0.2s ease',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={openAuth}
                  style={{
                    background: 'transparent', border: 'none',
                    fontSize: 13, fontWeight: 500,
                    color: 'var(--text-secondary)',
                    letterSpacing: '-0.01em',
                    transition: 'color 0.2s ease',
                    padding: '8px 4px', cursor: 'pointer',
                  }}
                  onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
                  onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                >
                  Login
                </button>

                <button
                  onClick={openAuth}
                  style={{
                    background: 'transparent',
                    border: '1px solid var(--border-color)',
                    fontSize: 13, fontWeight: 600,
                    color: 'var(--text-primary)',
                    padding: '7px 14px', borderRadius: 100,
                    letterSpacing: '-0.01em',
                    transition: 'border-color 0.2s ease, background 0.2s ease',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--border-focus)'; e.currentTarget.style.background = 'var(--bg-tertiary)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.background = 'transparent'; }}
                >
                  Sign Up
                </button>
              </>
            )}

            <Link
              to="/menu"
              style={{
                textDecoration: 'none', fontSize: 13, fontWeight: 600,
                color: '#ffffff',
                background: ctaHovered ? '#DC3800' : '#FF4500',
                padding: '9px 20px', borderRadius: 100,
                transition: 'background 0.2s ease, transform 0.15s ease',
                letterSpacing: '-0.01em',
                transform: ctaHovered ? 'scale(0.97)' : 'scale(1)',
                whiteSpace: 'nowrap', flexShrink: 0,
              }}
              onMouseEnter={() => setCtaHovered(true)}
              onMouseLeave={() => setCtaHovered(false)}
            >
              Order Now
            </Link>
          </div>

          {/* Mobile right: theme + cart badge + hamburger */}
          <div className="navbar-hamburger" style={{
            display: 'none',
            marginLeft: 'auto',
            alignItems: 'center',
            gap: 8,
          }}>
            <ThemeToggle />

            {isAuthenticated && (
              <Link
                to="/cart"
                style={{
                  position: 'relative',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 36, height: 36,
                  color: 'var(--text-secondary)',
                  textDecoration: 'none',
                }}
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="9" cy="21" r="1"></circle>
                  <circle cx="20" cy="21" r="1"></circle>
                  <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                {totalItems > 0 && (
                  <span style={{
                    position: 'absolute', top: 2, right: 2,
                    width: 14, height: 14,
                    background: '#FF4500', color: '#fff',
                    borderRadius: '50%', fontSize: 9, fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {totalItems > 9 ? '9+' : totalItems}
                  </span>
                )}
              </Link>
            )}

            {/* Hamburger button */}
            <button
              onClick={() => setMobileOpen(o => !o)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              style={{
                background: 'transparent',
                border: '1px solid var(--border-color)',
                borderRadius: 8,
                width: 36, height: 36,
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                gap: 5, cursor: 'pointer', padding: 0, flexShrink: 0,
              }}
            >
              <span style={{
                display: 'block', width: 16, height: 1.5,
                background: 'var(--text-primary)', borderRadius: 2,
                transition: 'transform 0.25s ease, opacity 0.25s ease',
                transform: mobileOpen ? 'rotate(45deg) translate(4px, 4px)' : 'none',
              }} />
              <span style={{
                display: 'block', width: 16, height: 1.5,
                background: 'var(--text-primary)', borderRadius: 2,
                transition: 'opacity 0.25s ease',
                opacity: mobileOpen ? 0 : 1,
              }} />
              <span style={{
                display: 'block', width: 16, height: 1.5,
                background: 'var(--text-primary)', borderRadius: 2,
                transition: 'transform 0.25s ease, opacity 0.25s ease',
                transform: mobileOpen ? 'rotate(-45deg) translate(4px, -4px)' : 'none',
              }} />
            </button>
          </div>
        </div>

        {/* ── Mobile drawer menu ── */}
        <div
          className="navbar-mobile-menu"
          style={{
            display: 'block',
            background: 'var(--bg-navbar)',
            borderTop: '1px solid var(--navbar-border)',
            padding: mobileOpen ? '12px 24px 20px' : '0 24px',
            overflow: 'hidden',
            maxHeight: mobileOpen ? 600 : 0,
            transition: 'max-height 0.35s cubic-bezier(0.16, 1, 0.3, 1), padding 0.3s ease',
          }}
        >
          {/* Nav links */}
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 20 }}>
            {NAV_LINKS.map(link => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setMobileOpen(false)}
                style={({ isActive }) => ({
                  textDecoration: 'none',
                  fontSize: 15,
                  fontWeight: isActive ? 700 : 500,
                  color: isActive ? '#FF4500' : 'var(--text-primary)',
                  padding: '9px 0',
                  borderBottom: '1px solid var(--border-color)',
                  letterSpacing: '-0.01em',
                })}
              >
                {link.label}
              </NavLink>
            ))}
          </nav>

          {/* Auth actions */}
          {isAuthenticated ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {user?.role === 'admin' && (
                <Link
                  to="/admin"
                  onClick={() => setMobileOpen(false)}
                  style={{
                    textDecoration: 'none', fontSize: 14, fontWeight: 700,
                    color: '#fff', background: '#FF4500',
                    padding: '12px 20px', borderRadius: 10,
                    textAlign: 'center',
                  }}
                >
                  ⬡ Admin Portal
                </Link>
              )}
              <Link
                to="/menu"
                onClick={() => setMobileOpen(false)}
                style={{
                  textDecoration: 'none', fontSize: 14, fontWeight: 700,
                  color: '#fff', background: '#FF4500',
                  padding: '12px 20px', borderRadius: 10,
                  textAlign: 'center',
                }}
              >
                Order Now
              </Link>
              <button
                onClick={handleMobileLogout}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  fontSize: 14, fontWeight: 600,
                  color: 'var(--text-primary)',
                  padding: '11px 20px', borderRadius: 10,
                  cursor: 'pointer', textAlign: 'center',
                }}
              >
                Logout
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <Link
                to="/menu"
                onClick={() => setMobileOpen(false)}
                style={{
                  textDecoration: 'none', fontSize: 14, fontWeight: 700,
                  color: '#fff', background: '#FF4500',
                  padding: '12px 20px', borderRadius: 10,
                  textAlign: 'center',
                }}
              >
                Order Now
              </Link>
              <button
                onClick={() => { setMobileOpen(false); openAuth(); }}
                style={{
                  background: 'transparent',
                  border: '1px solid var(--border-color)',
                  fontSize: 14, fontWeight: 600,
                  color: 'var(--text-primary)',
                  padding: '11px 20px', borderRadius: 10,
                  cursor: 'pointer',
                }}
              >
                Login / Sign Up
              </button>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
