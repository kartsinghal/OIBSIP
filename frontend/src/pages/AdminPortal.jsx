import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const CARDS = [
  {
    to: '/admin/orders',
    icon: '📋',
    label: 'Orders Management',
    description: 'View all incoming orders, update kitchen status, and track delivery flow.',
    accent: '#2563eb',
    accentBg: 'rgba(37,99,235,0.07)',
    accentBorder: 'rgba(37,99,235,0.18)',
  },
  {
    to: '/admin/inventory',
    icon: '🧅',
    label: 'Inventory Management',
    description: 'Create, update, delete ingredients. Monitor stock levels and set thresholds.',
    accent: '#FF4500',
    accentBg: 'rgba(255,69,0,0.07)',
    accentBorder: 'rgba(255,69,0,0.18)',
  },
  {
    to: '/track-order',
    icon: '📍',
    label: 'Order Status Tracking',
    description: 'Real-time order lifecycle tracker. Auto-refreshes every 12 seconds.',
    accent: '#7c3aed',
    accentBg: 'rgba(124,58,237,0.07)',
    accentBorder: 'rgba(124,58,237,0.18)',
  },
  {
    to: '/admin/inventory',
    icon: '🔔',
    label: 'Low Stock Alerts',
    description: 'Email alerts fire automatically when any ingredient drops below threshold.',
    accent: '#ca8a04',
    accentBg: 'rgba(202,138,4,0.07)',
    accentBorder: 'rgba(202,138,4,0.18)',
  },
];

function PortalCard({ to, icon, label, description, accent, accentBg, accentBorder }) {
  return (
    <Link
      to={to}
      style={{
        textDecoration: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 16,
        padding: 28,
        borderRadius: 20,
        backgroundColor: 'var(--bg-secondary)',
        border: `1px solid var(--border-color)`,
        transition: 'border-color 0.2s, transform 0.2s, box-shadow 0.2s',
        cursor: 'pointer',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = accentBorder;
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = `0 12px 32px ${accentBg}`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--border-color)';
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Icon badge */}
      <div style={{
        width: 52, height: 52, borderRadius: 14,
        backgroundColor: accentBg, border: `1px solid ${accentBorder}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 24,
      }}>
        {icon}
      </div>

      {/* Text */}
      <div>
        <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>
          {label}
        </h3>
        <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: 'var(--text-secondary)' }}>
          {description}
        </p>
      </div>

      {/* Arrow */}
      <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: accent }}>
        Open →
      </div>
    </Link>
  );
}

export default function AdminPortal() {
  const { user } = useAuth();

  return (
    <main style={{ padding: 'clamp(24px, 6vw, 48px) clamp(16px, 4vw, 40px) 80px' }}>
      {/* Header */}
      <div style={{ marginBottom: 48 }}>
        <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF4500' }}>
          Admin Portal
        </span>
        <h1 style={{ fontSize: 'clamp(28px, 3.5vw, 40px)', fontWeight: 900, color: 'var(--text-primary)', margin: '8px 0 12px', letterSpacing: '-0.02em' }}>
          Welcome back, {user?.fullName?.split(' ')[0] || 'Admin'} 👋
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', margin: 0 }}>
          Manage your restaurant operations from one place.
        </p>
      </div>

      {/* Quick nav cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: 20,
        marginBottom: 48,
      }}>
        {CARDS.map(card => <PortalCard key={card.label} {...card} />)}
      </div>

      {/* Quick links bar */}
      <div style={{
        padding: '20px 28px',
        background: 'var(--bg-secondary)',
        border: '1px solid var(--border-color)',
        borderRadius: 16,
        display: 'flex',
        gap: 24,
        flexWrap: 'wrap',
        alignItems: 'center',
      }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Quick Links
        </span>
        {[
          { to: '/admin/orders',    label: '📋 All Orders' },
          { to: '/admin/inventory', label: '🧅 Inventory' },
          { to: '/track-order',     label: '📍 Track Order' },
          { to: '/menu',            label: '🍕 Menu' },
        ].map(({ to, label }) => (
          <Link key={to} to={to} style={{
            fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
            textDecoration: 'none', transition: 'color 0.15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#FF4500'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-secondary)'}
          >
            {label}
          </Link>
        ))}
      </div>
    </main>
  );
}
