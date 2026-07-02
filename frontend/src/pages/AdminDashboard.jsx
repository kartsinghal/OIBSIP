import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import apiClient from '../services/apiClient';
import { useAuth } from '../context/AuthContext';

// ── Human-readable status labels (maps DB value → display) ──────────────────
const STATUS_LABELS = {
  pending:          'Order Received',
  confirmed:        'In Kitchen',
  preparing:        'Preparing',
  baking:           'Baking',
  out_for_delivery: 'Sent to Delivery',
  delivered:        'Delivered',
  cancelled:        'Cancelled',
};

// ── Frontend-enforced state machine (mirrors backend orderStateMachine.js) ───
const NEXT_STATES = {
  pending:          ['confirmed', 'cancelled'],
  confirmed:        ['preparing', 'cancelled'],
  preparing:        ['baking',    'cancelled'],
  baking:           ['out_for_delivery'],
  out_for_delivery: ['delivered'],
  delivered:        [],
  cancelled:        [],
};

const STATUS_COLORS = {
  pending:          { bg: 'rgba(234,179,8,0.1)',   border: 'rgba(234,179,8,0.3)',   text: '#ca8a04' },
  confirmed:        { bg: 'rgba(37,99,235,0.1)',   border: 'rgba(37,99,235,0.3)',   text: '#2563eb' },
  preparing:        { bg: 'rgba(124,58,237,0.1)',  border: 'rgba(124,58,237,0.3)',  text: '#7c3aed' },
  baking:           { bg: 'rgba(234,88,12,0.1)',   border: 'rgba(234,88,12,0.3)',   text: '#ea580c' },
  out_for_delivery: { bg: 'rgba(8,145,178,0.1)',   border: 'rgba(8,145,178,0.3)',   text: '#0891b2' },
  delivered:        { bg: 'rgba(22,163,74,0.1)',   border: 'rgba(22,163,74,0.3)',   text: '#16a34a' },
  cancelled:        { bg: 'rgba(239,68,68,0.1)',   border: 'rgba(239,68,68,0.3)',   text: '#dc2626' },
};

const POLL_INTERVAL_MS = 8000; // 8 seconds — admin dashboard refreshes more aggressively

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.pending;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      fontSize: 11, fontWeight: 700, padding: '3px 10px',
      borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em',
      backgroundColor: c.bg, border: `1px solid ${c.border}`, color: c.text,
    }}>
      {STATUS_LABELS[status] || status}
    </span>
  );
}

// ── Status advance button + cancel ───────────────────────────────────────────
function StatusControls({ order, onUpdate, busy }) {
  const nextStates = NEXT_STATES[order.orderStatus] || [];
  const [advancing, setAdvancing] = useState(false);

  if (nextStates.length === 0) {
    return <span style={{ fontSize: 12, color: 'var(--text-tertiary)' }}>Terminal</span>;
  }

  // Primary action = first next state (advance), secondary = cancel (if present)
  const primary    = nextStates.find(s => s !== 'cancelled');
  const canCancel  = nextStates.includes('cancelled');

  const handleAdvance = async () => {
    if (!primary || advancing || busy) return;
    setAdvancing(true);
    await onUpdate(order._id, primary);
    setAdvancing(false);
  };

  const handleCancel = async () => {
    if (!window.confirm('Cancel this order? This will restore inventory.')) return;
    await onUpdate(order._id, 'cancelled');
  };

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
      {primary && (
        <button
          onClick={handleAdvance}
          disabled={advancing || busy}
          style={{
            fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8,
            backgroundColor: '#FF4500', color: '#fff', border: 'none',
            cursor: advancing || busy ? 'not-allowed' : 'pointer',
            opacity: advancing || busy ? 0.6 : 1,
            transition: 'background-color 0.2s, opacity 0.2s',
            whiteSpace: 'nowrap',
          }}
          onMouseEnter={e => { if (!advancing && !busy) e.currentTarget.style.backgroundColor = '#DC3800'; }}
          onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FF4500'}
        >
          {advancing ? '...' : `→ ${STATUS_LABELS[primary]}`}
        </button>
      )}
      {canCancel && (
        <button
          onClick={handleCancel}
          disabled={busy}
          style={{
            fontSize: 11, fontWeight: 600, padding: '5px 12px', borderRadius: 8,
            backgroundColor: 'rgba(239,68,68,0.08)', color: '#dc2626',
            border: '1px solid rgba(239,68,68,0.25)',
            cursor: busy ? 'not-allowed' : 'pointer',
            opacity: busy ? 0.5 : 1,
          }}
        >
          Cancel
        </button>
      )}
    </div>
  );
}

// ── Order row ─────────────────────────────────────────────────────────────────
function OrderRow({ order, onUpdate, onPaymentUpdate, busy }) {
  return (
    <tr style={{ borderBottom: '1px solid var(--border-color)', transition: 'background-color 0.15s' }}
      onMouseEnter={e => e.currentTarget.style.backgroundColor = 'var(--bg-tertiary)'}
      onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
    >
      {/* Order ID + time */}
      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
        <div style={{ fontFamily: 'Courier New, monospace', fontSize: 13, color: 'var(--text-primary)', fontWeight: 600 }}>
          ...{order._id.slice(-8)}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 3 }}>
          {new Date(order.createdAt).toLocaleString()}
        </div>
      </td>

      {/* Customer */}
      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {order.user?.fullName || 'Unknown'}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
          {order.user?.email || '—'}
        </div>
      </td>

      {/* Items */}
      <td style={{ padding: '16px 20px', verticalAlign: 'top', maxWidth: 200 }}>
        {order.items.map((item, i) => (
          <div key={i} style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            {item.pizza?.name || 'Pizza'} × {item.quantity}
            <span style={{ color: 'var(--text-tertiary)' }}> ({item.size})</span>
          </div>
        ))}
      </td>

      {/* Amount + payment */}
      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>
          ₹{order.totalPrice.toFixed(2)}
        </div>
        <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 6 }}>
          <span style={{
            fontSize: 10, fontWeight: 600, padding: '3px 8px', borderRadius: 100,
            backgroundColor: 
              order.paymentStatus === 'paid' ? 'rgba(22,163,74,0.1)' : 
              order.paymentStatus === 'failed' ? 'rgba(239,68,68,0.1)' : 
              order.paymentStatus === 'refunded' ? 'rgba(107,114,128,0.1)' : 
              'rgba(234,179,8,0.1)',
            color: 
              order.paymentStatus === 'paid' ? '#16a34a' : 
              order.paymentStatus === 'failed' ? '#dc2626' : 
              order.paymentStatus === 'refunded' ? '#4b5563' : 
              '#ca8a04',
            border: `1px solid ${
              order.paymentStatus === 'paid' ? 'rgba(22,163,74,0.25)' : 
              order.paymentStatus === 'failed' ? 'rgba(239,68,68,0.25)' : 
              order.paymentStatus === 'refunded' ? 'rgba(107,114,128,0.25)' : 
              'rgba(234,179,8,0.25)'
            }`,
          }}>
            {order.paymentMethod === 'cod' ? 'COD' : 'ONLINE'} · {order.paymentStatus.toUpperCase()}
          </span>

          {order.paymentMethod === 'cod' && order.paymentStatus !== 'paid' && (
            <button
              onClick={() => onPaymentUpdate(order._id, 'paid')}
              disabled={busy}
              style={{
                fontSize: 11, fontWeight: 600, padding: '4px 10px', borderRadius: 6,
                backgroundColor: 'var(--bg-secondary)', color: 'var(--text-secondary)',
                border: '1px solid var(--border-color)', cursor: busy ? 'not-allowed' : 'pointer',
                transition: 'border-color 0.2s, color 0.2s',
                opacity: busy ? 0.5 : 1,
              }}
              onMouseEnter={e => { if(!busy) { e.currentTarget.style.borderColor = '#16a34a'; e.currentTarget.style.color = '#16a34a'; } }}
              onMouseLeave={e => { if(!busy) { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; } }}
            >
              Mark as Paid
            </button>
          )}
        </div>
      </td>

      {/* Current status */}
      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
        <StatusBadge status={order.orderStatus} />
      </td>

      {/* Actions */}
      <td style={{ padding: '16px 20px', verticalAlign: 'top' }}>
        <StatusControls order={order} onUpdate={onUpdate} busy={busy} />
      </td>
    </tr>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, accent }) {
  return (
    <div style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
      borderRadius: 16, padding: '20px 24px',
    }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 800, color: accent || 'var(--text-primary)' }}>
        {value}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const [orders,       setOrders]      = useState([]);
  const [loading,      setLoading]     = useState(true);
  const [busy,         setBusy]        = useState(false);
  const [error,        setError]       = useState('');
  const [feedback,     setFeedback]    = useState('');
  const [searchId,     setSearchId]    = useState('');
  const [statusFilter, setStatusFilter] = useState('active');
  const [lastPoll,     setLastPoll]    = useState(null);
  const pollRef = useRef(null);

  const fetchOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      setError('');
      const res = await apiClient.get('/orders');
      setOrders(res.data.data);
      setLastPoll(new Date());
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || 'Failed to fetch orders');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user?.role === 'admin') {
      fetchOrders();
      // Auto-poll every 8 seconds
      pollRef.current = setInterval(() => fetchOrders(true), POLL_INTERVAL_MS);
      return () => clearInterval(pollRef.current);
    }
  }, [authLoading, user, fetchOrders]);

  const handleStatusUpdate = async (orderId, newStatus) => {
    setBusy(true);
    setError('');
    try {
      const res = await apiClient.patch(`/orders/${orderId}/status`, { status: newStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? res.data.data : o));
      const label = STATUS_LABELS[newStatus] || newStatus;
      setFeedback(`Order ...${orderId.slice(-6)} → ${label}`);
      setTimeout(() => setFeedback(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update status');
      setTimeout(() => setError(''), 5000);
    } finally {
      setBusy(false);
    }
  };

  const handlePaymentUpdate = async (orderId, newPaymentStatus) => {
    setBusy(true);
    setError('');
    try {
      const res = await apiClient.patch(`/orders/${orderId}/payment-status`, { paymentStatus: newPaymentStatus });
      setOrders(prev => prev.map(o => o._id === orderId ? res.data.data : o));
      setFeedback(`Order ...${orderId.slice(-6)} marked as Paid`);
      setTimeout(() => setFeedback(''), 3500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update payment status');
      setTimeout(() => setError(''), 5000);
    } finally {
      setBusy(false);
    }
  };

  if (authLoading) return <div style={{ padding: 80, textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</div>;

  // ── Filtering ───────────────────────────────────────────────────────────────
  const TERMINAL = ['delivered', 'cancelled'];
  const filtered = orders.filter(o => {
    const matchId = searchId === '' || o._id.toLowerCase().includes(searchId.toLowerCase());
    const matchStatus =
      statusFilter === 'all'       ? true :
      statusFilter === 'active'    ? !TERMINAL.includes(o.orderStatus) :
      o.orderStatus === statusFilter;
    return matchId && matchStatus;
  });

  // ── Stats ───────────────────────────────────────────────────────────────────
  const active    = orders.filter(o => !TERMINAL.includes(o.orderStatus)).length;
  const todayRev  = orders
    .filter(o => {
      const d = new Date(o.createdAt); const now = new Date();
      return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth() && d.getDate() === now.getDate();
    })
    .reduce((s, o) => s + o.totalPrice, 0);
  const pending   = orders.filter(o => o.orderStatus === 'pending').length;
  const delivered = orders.filter(o => o.orderStatus === 'delivered').length;

  const TH_STYLE = {
    padding: '12px 20px', textAlign: 'left', fontSize: 11, fontWeight: 700,
    color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.07em',
    background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-color)',
  };

  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', minHeight: '90vh', padding: '40px 0 80px' }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 24px' }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 36, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.18em', textTransform: 'uppercase', color: '#FF4500' }}>
              Admin
            </span>
            <h1 style={{ fontSize: 'clamp(26px, 3.5vw, 38px)', fontWeight: 900, color: 'var(--text-primary)', margin: '6px 0 0', letterSpacing: '-0.02em' }}>
              Orders Dashboard
            </h1>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
            {lastPoll && (
              <span style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                ↻ Auto-refresh · {lastPoll.toLocaleTimeString()}
              </span>
            )}
            <button
              onClick={() => fetchOrders()}
              style={{
                fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 10,
                border: '1px solid var(--border-color)', background: 'var(--bg-secondary)',
                color: 'var(--text-primary)', cursor: 'pointer',
              }}
            >
              ↻ Refresh
            </button>
            <Link to="/admin/inventory" style={{
              fontSize: 13, fontWeight: 600, padding: '8px 18px', borderRadius: 10,
              background: '#FF4500', color: '#fff', textDecoration: 'none',
              display: 'inline-flex', alignItems: 'center', gap: 6,
            }}>
              🧅 Inventory
            </Link>
          </div>
        </div>

        {/* ── Stat cards ── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16, marginBottom: 32 }}>
          <StatCard label="Active Orders"  value={active}          accent="#FF4500" />
          <StatCard label="Awaiting Accept" value={pending}         accent="#ca8a04" />
          <StatCard label="Delivered Today" value={delivered}        accent="#16a34a" />
          <StatCard label="Today's Revenue" value={`₹${todayRev.toFixed(0)}`} accent="#2563eb" />
          <StatCard label="Total Orders"    value={orders.length}   />
        </div>

        {/* ── Feedback / Error ── */}
        {feedback && (
          <div style={{ marginBottom: 20, padding: '12px 20px', borderRadius: 12, background: 'rgba(22,163,74,0.07)', border: '1px solid rgba(22,163,74,0.2)', color: '#15803d', fontSize: 13, fontWeight: 600 }}>
            ✓ {feedback}
          </div>
        )}
        {error && (
          <div style={{ marginBottom: 20, padding: '12px 20px', borderRadius: 12, background: 'rgba(239,68,68,0.07)', border: '1px solid rgba(239,68,68,0.2)', color: '#dc2626', fontSize: 13 }}>
            {error}
          </div>
        )}

        {/* ── Filters ── */}
        <div style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
          borderRadius: 16, padding: '16px 20px', marginBottom: 20,
          display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center',
        }}>
          <input
            type="text"
            placeholder="Search by order ID..."
            value={searchId}
            onChange={e => setSearchId(e.target.value)}
            style={{
              flex: 1, minWidth: 200, backgroundColor: 'var(--bg-tertiary)',
              border: '1px solid var(--border-color)', color: 'var(--text-primary)',
              fontSize: 13, padding: '10px 16px', borderRadius: 10, outline: 'none',
              fontFamily: 'Courier New, monospace',
            }}
            onFocus={e => e.target.style.borderColor = '#FF4500'}
            onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
          />
          {['active', 'all', ...Object.keys(STATUS_LABELS)].map(key => (
            <button
              key={key}
              onClick={() => setStatusFilter(key)}
              style={{
                fontSize: 11, fontWeight: 700, padding: '7px 14px', borderRadius: 20,
                cursor: 'pointer', textTransform: 'capitalize',
                border: statusFilter === key ? '1px solid #FF4500' : '1px solid var(--border-color)',
                background: statusFilter === key ? 'rgba(255,69,0,0.08)' : 'var(--bg-tertiary)',
                color: statusFilter === key ? '#FF4500' : 'var(--text-secondary)',
                transition: 'all 0.15s',
              }}
            >
              {key === 'active' ? '🔥 Active' : key === 'all' ? 'All' : STATUS_LABELS[key] || key}
            </button>
          ))}
        </div>

        {/* ── Orders table ── */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'var(--text-secondary)' }}>
            <div style={{ width: 28, height: 28, border: '2px solid rgba(255,69,0,0.15)', borderTopColor: '#FF4500', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            Loading orders...
          </div>
        ) : (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 16, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr>
                    {['Order ID', 'Customer', 'Items', 'Amount', 'Status', 'Update'].map(h => (
                      <th key={h} style={TH_STYLE}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '60px 20px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: 14 }}>
                        No orders match your filters.
                      </td>
                    </tr>
                  ) : filtered.map(order => (
                      <OrderRow
                        key={order._id}
                        order={order}
                        onUpdate={handleStatusUpdate}
                        onPaymentUpdate={handlePaymentUpdate}
                        busy={busy}
                      />
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 20px', borderTop: '1px solid var(--border-color)', fontSize: 12, color: 'var(--text-tertiary)' }}>
              Showing {filtered.length} of {orders.length} orders
            </div>
          </div>
        )}

      </div>
    </main>
  );
};

export default AdminDashboard;
