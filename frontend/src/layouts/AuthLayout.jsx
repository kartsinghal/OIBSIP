import { Outlet, Link } from 'react-router-dom';

export default function AuthLayout() {
  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: 'var(--bg-primary)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        position: 'relative',
      }}
    >
      {/* Ambient glow behind form */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '60vh',
          background: 'radial-gradient(ellipse at 50% -10%, rgba(255,69,0, 0.07) 0%, transparent 65%)',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      {/* Logo */}
      <Link
        to="/"
        style={{
          textDecoration: 'none',
          marginBottom: 48,
          position: 'relative',
          zIndex: 1,
        }}
      >
        <span
          style={{
            fontWeight: 900,
            fontSize: 22,
            letterSpacing: '-0.04em',
            color: 'var(--text-primary)',
          }}
        >
          INFERNO<span style={{ color: '#FF4500' }}>.</span>
        </span>
      </Link>

      {/* Page content */}
      <div style={{ position: 'relative', zIndex: 1, width: '100%', maxWidth: 420 }}>
        <Outlet />
      </div>
    </div>
  );
}
