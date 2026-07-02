import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { to: '/admin',           label: 'Overview',    icon: '⬡', exact: true },
  { to: '/admin/orders',    label: 'Orders',      icon: '📋' },
  { to: '/admin/inventory', label: 'Inventory',   icon: '🧅' },
];

export default function AdminLayout() {
  const { user, loading } = useAuth();

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
      <div style={{ width: 24, height: 24, border: '2px solid rgba(255,69,0,0.15)', borderTopColor: '#FF4500', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingTop: 72 }}>

      {/* ── Sidebar ──────────────────────────────────────────────────────── */}
      <aside style={{
        width: 220,
        flexShrink: 0,
        borderRight: '1px solid var(--border-color)',
        backgroundColor: 'var(--bg-secondary)',
        padding: '32px 0',
        position: 'sticky',
        top: 72,
        height: 'calc(100vh - 72px)',
        display: 'flex',
        flexDirection: 'column',
      }}>
        {/* Brand label */}
        <div style={{ padding: '0 24px 24px', borderBottom: '1px solid var(--border-color)', marginBottom: 16 }}>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.15em', textTransform: 'uppercase', color: '#FF4500', marginBottom: 4 }}>
            Admin Portal
          </div>
          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
            {user?.fullName || 'Admin'}
          </div>
        </div>

        {/* Nav links */}
        <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 4, padding: '0 12px' }}>
          {ADMIN_NAV.map(({ to, label, icon, exact }) => (
            <NavLink
              key={to}
              to={to}
              end={exact}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 10,
                textDecoration: 'none',
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? '#FF4500' : 'var(--text-secondary)',
                backgroundColor: isActive ? 'rgba(255,69,0,0.08)' : 'transparent',
                border: isActive ? '1px solid rgba(255,69,0,0.15)' : '1px solid transparent',
                transition: 'all 0.15s',
              })}
              onMouseEnter={e => {
                if (!e.currentTarget.style.color.includes('232')) {
                  e.currentTarget.style.color = 'var(--text-primary)';
                  e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)';
                }
              }}
              onMouseLeave={e => {
                if (!e.currentTarget.getAttribute('aria-current')) {
                  e.currentTarget.style.color = 'var(--text-secondary)';
                  e.currentTarget.style.backgroundColor = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: 16 }}>{icon}</span>
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-color)' }}>
          <NavLink to="/" style={{ fontSize: 12, color: 'var(--text-tertiary)', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-primary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
          >
            ← Back to Site
          </NavLink>
        </div>
      </aside>

      {/* ── Page content ─────────────────────────────────────────────────── */}
      <main style={{ flex: 1, overflowY: 'auto', minWidth: 0 }}>
        <Outlet />
      </main>
    </div>
  );
}
