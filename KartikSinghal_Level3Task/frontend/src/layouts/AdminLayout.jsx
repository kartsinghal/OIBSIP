import { useState } from 'react';
import { NavLink, Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ADMIN_NAV = [
  { to: '/admin',           label: 'Overview',    icon: '⬡', exact: true },
  { to: '/admin/orders',    label: 'Orders',      icon: '📋' },
  { to: '/admin/inventory', label: 'Inventory',   icon: '🧅' },
];

export default function AdminLayout() {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'var(--bg-primary)' }}>
      <div style={{ width: 24, height: 24, border: '2px solid rgba(255,69,0,0.15)', borderTopColor: '#FF4500', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  if (!user || user.role !== 'admin') return <Navigate to="/" replace />;

  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-primary)', paddingTop: 72 }}>
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Mobile overlay for sidebar */
        .admin-sidebar-overlay {
          display: none;
        }
        @media (max-width: 768px) {
          .admin-sidebar {
            position: fixed !important;
            top: 72px !important;
            left: 0 !important;
            height: calc(100vh - 72px) !important;
            z-index: 40 !important;
            transform: translateX(-100%);
            transition: transform 0.3s ease !important;
            box-shadow: 4px 0 24px rgba(0,0,0,0.15);
          }
          .admin-sidebar.open {
            transform: translateX(0) !important;
          }
          .admin-sidebar-overlay {
            display: block;
            position: fixed;
            inset: 0;
            top: 72px;
            background: rgba(0,0,0,0.5);
            z-index: 39;
          }
          .admin-mobile-topbar {
            display: flex !important;
          }
        }
        @media (min-width: 769px) {
          .admin-mobile-topbar { display: none !important; }
        }
      `}</style>

      {/* Mobile top bar */}
      <div className="admin-mobile-topbar" style={{
        display: 'none',
        position: 'fixed',
        top: 72,
        left: 0,
        right: 0,
        zIndex: 38,
        background: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-color)',
        padding: '10px 16px',
        alignItems: 'center',
        gap: 12,
      }}>
        <button
          onClick={() => setSidebarOpen(o => !o)}
          style={{
            background: 'transparent',
            border: '1px solid var(--border-color)',
            borderRadius: 8,
            width: 36, height: 36,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: 'var(--text-primary)', fontSize: 18,
            flexShrink: 0,
          }}
        >
          ☰
        </button>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#FF4500', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
          Admin Portal
        </span>
      </div>

      {/* Sidebar overlay (mobile) */}
      {sidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside className={`admin-sidebar${sidebarOpen ? ' open' : ''}`} style={{
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
        transition: 'transform 0.3s ease',
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
              onClick={() => setSidebarOpen(false)}
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

      {/* ── Page content ── */}
      <main style={{
        flex: 1,
        overflowY: 'auto',
        minWidth: 0,
        // On mobile, push content down past the mobile topbar
      }}>
        <style>{`
          @media (max-width: 768px) {
            .admin-main-content { padding-top: 52px !important; }
          }
        `}</style>
        <div className="admin-main-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
