import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSearchParams } from 'react-router-dom';
import apiClient from '../services/apiClient';

// ── Order lifecycle config ─────────────────────────────────────────────────────
const LIFECYCLE_STEPS = [
  { status: 'pending',          label: 'Order Received',    description: 'Your order has been received and is awaiting confirmation.' },
  { status: 'confirmed',        label: 'Order Confirmed',   description: 'The kitchen has accepted your order.' },
  { status: 'preparing',        label: 'Being Prepared',    description: 'Our chefs are assembling your pizza.' },
  { status: 'baking',           label: 'Baking in Oven',    description: 'Wood-fired oven at 450°C. Getting the perfect char.' },
  { status: 'out_for_delivery', label: 'Out for Delivery',  description: 'Your order is on its way with our delivery partner.' },
  { status: 'delivered',        label: 'Delivered',         description: 'Fresh, hot slice in your hands. Enjoy!' },
];

const getStepIndex = (status) => LIFECYCLE_STEPS.findIndex(s => s.status === status);

const PAYMENT_COLORS = {
  paid:     { bg: 'rgba(34,197,94,0.1)',  border: 'rgba(34,197,94,0.3)',  text: '#16a34a' },
  pending:  { bg: 'rgba(234,179,8,0.1)',  border: 'rgba(234,179,8,0.3)',  text: '#ca8a04' },
  failed:   { bg: 'rgba(239,68,68,0.1)',  border: 'rgba(239,68,68,0.3)',  text: '#dc2626' },
  refunded: { bg: 'rgba(99,102,241,0.1)', border: 'rgba(99,102,241,0.3)', text: '#6366f1' },
};

const POLL_INTERVAL_MS = 12000; // 12 seconds

// ── Stepper Component ─────────────────────────────────────────────────────────
function OrderStepper({ order }) {
  const isCancelled = order.orderStatus === 'cancelled';
  const activeIdx   = getStepIndex(order.orderStatus);

  if (isCancelled) {
    return (
      <div style={{
        padding: '28px 32px',
        borderRadius: 16,
        backgroundColor: 'rgba(239,68,68,0.06)',
        border: '1px solid rgba(239,68,68,0.2)',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 36, marginBottom: 12 }}>❌</div>
        <h3 style={{ color: '#dc2626', fontWeight: 700, margin: '0 0 8px 0' }}>Order Cancelled</h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>
          This order has been cancelled. Please contact support if needed.
        </p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, position: 'relative' }}>
      {/* Vertical connector line */}
      <div style={{
        position: 'absolute', left: 11, top: 12, bottom: 12,
        width: 1, backgroundColor: 'var(--border-color)', zIndex: 0,
      }} />

      {LIFECYCLE_STEPS.map((step, idx) => {
        const isCompleted = idx < activeIdx;
        const isActive    = idx === activeIdx;
        const isUpcoming  = idx > activeIdx;

        return (
          <div key={step.status} style={{ display: 'flex', gap: 24, position: 'relative', zIndex: 1 }}>
            {/* Step dot */}
            <div style={{
              width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
              backgroundColor: isCompleted ? '#FF4500' : isActive ? '#FF4500' : 'var(--bg-secondary)',
              border: isUpcoming ? '1px solid var(--border-color)' : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              position: 'relative',
              boxShadow: isActive ? '0 0 0 4px rgba(255,69,0,0.15)' : 'none',
              transition: 'all 0.3s ease',
            }}>
              {isActive && (
                <span style={{
                  position: 'absolute', inset: -4, borderRadius: '50%',
                  border: '1px solid #FF4500',
                  animation: 'pulse 1.8s infinite',
                }} />
              )}
              {isCompleted ? (
                <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                  <path d="M1 4l2.5 2.5L9 1" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : isActive ? (
                <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#fff' }} />
              ) : (
                <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: 'var(--border-color)' }} />
              )}
            </div>

            {/* Step content */}
            <div style={{ paddingTop: 2 }}>
              <h4 style={{
                fontSize: 14, fontWeight: isActive ? 700 : isCompleted ? 600 : 400,
                color: isUpcoming ? 'var(--text-tertiary)' : 'var(--text-primary)',
                margin: '0 0 4px 0',
              }}>
                {step.label}
                {isActive && (
                  <span style={{
                    marginLeft: 8, fontSize: 10, fontWeight: 600, color: '#FF4500',
                    background: 'rgba(255,69,0,0.1)', border: '1px solid rgba(255,69,0,0.2)',
                    padding: '2px 7px', borderRadius: 100, textTransform: 'uppercase',
                  }}>Now</span>
                )}
              </h4>
              <p style={{
                fontSize: 12, lineHeight: 1.6, margin: 0,
                color: isUpcoming ? 'var(--text-tertiary)' : 'var(--text-secondary)',
              }}>
                {step.description}
              </p>
            </div>
          </div>
        );
      })}

      <style>{`
        @keyframes pulse {
          0%   { transform: scale(1); opacity: 1; }
          100% { transform: scale(1.6); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// ── Order Summary Card ────────────────────────────────────────────────────────
function OrderSummaryCard({ order }) {
  const payColor = PAYMENT_COLORS[order.paymentStatus] || PAYMENT_COLORS.pending;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Meta info */}
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        borderRadius: 20, padding: 24,
      }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', fontWeight: 600 }}>Order Details</span>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10 }}>
        <Row label="Order ID"   value={
            <span style={{ fontFamily: 'Courier New, monospace', fontSize: 13, fontWeight: 700, color: '#FF4500' }}>
              {order.publicId || `...${order._id.slice(-8)}`}
            </span>
          } />
          <Row label="Placed"     value={new Date(order.createdAt).toLocaleString()} />
          <Row label="Total"      value={<strong>₹{order.totalPrice.toFixed(2)}</strong>} />
          <Row label="Payment"    value={
            <span style={{
              fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 100,
              backgroundColor: payColor.bg, border: `1px solid ${payColor.border}`, color: payColor.text,
            }}>
              {order.paymentStatus}
            </span>
          } />
          {order.deliveryAddress && (
            <Row label="Address" value={`${order.deliveryAddress.street}, ${order.deliveryAddress.city} - ${order.deliveryAddress.pincode}`} />
          )}
        </div>
      </div>

      {/* Items */}
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
        borderRadius: 20, padding: 24,
      }}>
        <span style={{ fontSize: 10, textTransform: 'uppercase', color: 'var(--text-secondary)', letterSpacing: '0.05em', fontWeight: 600 }}>Items Ordered</span>
        <div style={{ marginTop: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {order.items.map((item, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, color: 'var(--text-primary)' }}>
              <span>{item.pizza?.name || 'Pizza'} × {item.quantity} <span style={{ color: 'var(--text-secondary)', fontSize: 11 }}>({item.size})</span></span>
              <span>₹{item.subtotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Row({ label, value }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13 }}>
      <span style={{ color: 'var(--text-secondary)' }}>{label}</span>
      <span style={{ color: 'var(--text-primary)' }}>{value}</span>
    </div>
  );
}

// ── My Orders Picker ──────────────────────────────────────────────────────────
function MyOrdersList({ onSelect }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    apiClient.get('/orders/my-orders')
      .then(r => setOrders(r.data.data))
      .catch(e => setError(e.response?.data?.message || 'Failed to load orders'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>Loading your orders...</p>;
  if (error)   return <p style={{ color: '#dc2626', textAlign: 'center', padding: 24 }}>{error}</p>;
  if (!orders.length) return <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: 24 }}>No orders yet. Go place one! 🍕</p>;

  const STATUS_BADGE = {
    pending: '#ca8a04', confirmed: '#2563eb', preparing: '#7c3aed',
    baking: '#ea580c', out_for_delivery: '#0891b2', delivered: '#16a34a', cancelled: '#dc2626',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {orders.map(o => (
        <button
          key={o._id}
          onClick={() => onSelect(o.publicId || o._id)}
          style={{
            textAlign: 'left', background: 'var(--bg-secondary)',
            border: '1px solid var(--border-color)', borderRadius: 16,
            padding: '16px 20px', cursor: 'pointer', transition: 'border-color 0.2s',
            width: '100%',
          }}
          onMouseEnter={e => e.currentTarget.style.borderColor = '#FF4500'}
          onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            {/* Show publicId prominently, fall back to last 8 chars of _id */}
            <span style={{ fontFamily: 'Courier New, monospace', fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>
              {o.publicId || `...${o._id.slice(-8)}`}
            </span>
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '3px 9px', borderRadius: 100,
              backgroundColor: `${STATUS_BADGE[o.orderStatus]}20`,
              color: STATUS_BADGE[o.orderStatus],
              border: `1px solid ${STATUS_BADGE[o.orderStatus]}40`,
              textTransform: 'uppercase', letterSpacing: '0.04em',
            }}>
              {o.orderStatus}
            </span>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6, display: 'flex', gap: 16 }}>
            <span>₹{o.totalPrice.toFixed(2)}</span>
            <span>{new Date(o.createdAt).toLocaleDateString()}</span>
            <span>{o.items.length} item{o.items.length !== 1 ? 's' : ''}</span>
          </div>
        </button>
      ))}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function TrackOrderPage() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [inputId,   setInputId]   = useState('');
  const [activeId,  setActiveId]  = useState(null);
  const [order,     setOrder]     = useState(null);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState('');
  const [lastPoll,  setLastPoll]  = useState(null);
  const pollRef = useRef(null);

  // Auto-load order from URL ?orderId= (set after checkout payment success)
  useEffect(() => {
    const urlOrderId = searchParams.get('orderId');
    if (urlOrderId) {
      setInputId(urlOrderId);
      setActiveId(urlOrderId);
    }
  }, [searchParams]);

  const fetchOrder = useCallback(async (id, silent = false) => {
    if (!id) return;
    if (!silent) setLoading(true);
    setError('');
    try {
      // If it looks like a public ID (INF-YYYY-XXXXXX), use the public track endpoint
      const isPublicId = /^INF-\d{4}-[A-Z0-9]{6}$/i.test(id.trim());
      const url = isPublicId
        ? `/orders/track/${id.trim().toUpperCase()}`
        : `/orders/${id.trim()}`;
      const res = await apiClient.get(url);
      setOrder(res.data.data);
      setLastPoll(new Date());
    } catch (err) {
      if (!silent) setError(err.response?.data?.message || 'Order not found. Check the Order ID and try again.');
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  // Start / reset polling
  useEffect(() => {
    clearInterval(pollRef.current);
    if (!activeId) return;

    fetchOrder(activeId);
    pollRef.current = setInterval(() => fetchOrder(activeId, true), POLL_INTERVAL_MS);
    return () => clearInterval(pollRef.current);
  }, [activeId, fetchOrder]);

  // Stop polling for terminal states
  useEffect(() => {
    if (order?.orderStatus === 'delivered' || order?.orderStatus === 'cancelled') {
      clearInterval(pollRef.current);
    }
  }, [order?.orderStatus]);

  const handleTrack = (e) => {
    e.preventDefault();
    if (!inputId.trim()) return;
    setOrder(null);
    setActiveId(inputId.trim());
  };

  const handleSelectOrder = (id) => {
    setInputId(id);
    setOrder(null);
    setActiveId(id);
  };

  const handleBackToOrders = () => {
    setActiveId(null);
    setOrder(null);
    setInputId('');
    setError('');
    clearInterval(pollRef.current);
  };

  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', minHeight: '90vh', paddingTop: 'clamp(80px, 10vw, 120px)', paddingBottom: 80 }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: '0 clamp(16px, 5vw, 40px)' }}>

        {/* Header */}
        <div style={{ marginBottom: 48, textAlign: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 500, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#FF4500', display: 'block', marginBottom: 12 }}>
            Real-time Status
          </span>
          <h1 style={{ fontSize: 'clamp(32px, 4.5vw, 48px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: 0, lineHeight: 1.1 }}>
            Track Your Order
          </h1>
        </div>

        {/* Search card */}
        <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 32, marginBottom: 40 }}>
          <form onSubmit={handleTrack} style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: 260 }}>
              <label htmlFor="order-id-input" style={{ display: 'block', fontSize: 11, fontWeight: 600, color: 'var(--text-secondary)', letterSpacing: '0.05em', textTransform: 'uppercase', marginBottom: 10 }}>
                Order ID
              </label>
              <input
                id="order-id-input"
                type="text"
                value={inputId}
                onChange={e => setInputId(e.target.value)}
                placeholder="e.g. INF-2026-A7K9P2"
                style={{
                  width: '100%', backgroundColor: 'var(--bg-tertiary)', border: '1px solid var(--border-color)',
                  color: 'var(--text-primary)', fontSize: 15, padding: '14px 20px', borderRadius: 12,
                  outline: 'none', transition: 'border-color 0.2s ease', fontFamily: 'Courier New, monospace',
                }}
                onFocus={e => e.target.style.borderColor = '#FF4500'}
                onBlur={e => e.target.style.borderColor = 'var(--border-color)'}
              />
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button
                type="submit"
                disabled={loading || !inputId.trim()}
                style={{
                  backgroundColor: '#FF4500', color: '#fff', fontSize: 14, fontWeight: 600,
                  padding: '0 36px', borderRadius: 12, border: 'none', cursor: 'pointer',
                  height: 52, opacity: loading || !inputId.trim() ? 0.6 : 1, transition: 'background-color 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#DC3800'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = '#FF4500'}
              >
                {loading ? 'Locating...' : 'Track Order'}
              </button>
            </div>
          </form>

          {/* Poll indicator */}
          {activeId && order && lastPoll && (
            <p style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 12, marginBottom: 0 }}>
              ↻ Auto-refreshing every 12s · Last updated: {lastPoll.toLocaleTimeString()}
            </p>
          )}
        </div>

        {/* Back to My Orders button */}
        {user && activeId && (
          <div style={{ marginBottom: 24 }}>
            <button
              onClick={handleBackToOrders}
              style={{
                background: 'none',
                border: '1px solid var(--border-color)',
                color: 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: 600,
                padding: '8px 18px',
                borderRadius: 10,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                transition: 'border-color 0.2s, color 0.2s',
              }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#FF4500'; e.currentTarget.style.color = '#FF4500'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-color)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
            >
              ← Back to My Orders
            </button>
          </div>
        )}

        {/* My Orders List — shown only to logged-in users without an active tracked order */}
        {user && !activeId && (
          <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 32, marginBottom: 40 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 20px 0' }}>My Recent Orders</h2>
            <MyOrdersList onSelect={handleSelectOrder} />
          </div>
        )}

        {/* Error */}
        {error && (
          <div style={{ background: 'rgba(239,68,68,0.06)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 16, padding: '20px 24px', marginBottom: 32 }}>
            <p style={{ color: '#dc2626', margin: 0, fontSize: 14 }}>{error}</p>
          </div>
        )}

        {/* Loading spinner */}
        <AnimatePresence mode="wait">
          {loading && (
            <motion.div key="loader" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '60px 0' }}
            >
              <div style={{ width: 24, height: 24, border: '2px solid rgba(255,69,0,0.1)', borderTopColor: '#FF4500', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: 16 }} />
              <p style={{ color: 'var(--text-secondary)', fontSize: 13, margin: 0 }}>Locating your order...</p>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </motion.div>
          )}

          {/* Tracking panel */}
          {!loading && order && (
            <motion.div key={(order.publicId || order._id) + order.orderStatus} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45 }}
              className="tracking-grid"
            >
              <style>{`
                .tracking-grid {
                  display: grid;
                  grid-template-columns: 1.4fr 1fr;
                  gap: 40px;
                  align-items: start;
                }
                @media (max-width: 768px) {
                  .tracking-grid {
                    grid-template-columns: 1fr;
                    gap: 24px;
                  }
                }
              `}</style>
              {/* Stepper card */}
              <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', borderRadius: 20, padding: 36 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32, borderBottom: '1px solid var(--border-color)', paddingBottom: 20 }}>
                  <div>
                    <span style={{ fontSize: 11, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Order Progress</span>
                    <h3 style={{ color: '#FF4500', margin: '4px 0 0 0', fontFamily: 'Courier New, monospace', fontSize: 16, fontWeight: 800 }}>
                      {order.publicId || `...${order._id.slice(-8)}`}
                    </h3>
                  </div>
                  <span style={{
                    fontSize: 10, fontWeight: 600, color: order.orderStatus === 'cancelled' ? '#dc2626' : order.orderStatus === 'delivered' ? '#16a34a' : '#FF4500',
                    background: order.orderStatus === 'cancelled' ? 'rgba(239,68,68,0.08)' : order.orderStatus === 'delivered' ? 'rgba(22,163,74,0.08)' : 'rgba(255,69,0,0.08)',
                    border: `1px solid ${order.orderStatus === 'cancelled' ? 'rgba(239,68,68,0.2)' : order.orderStatus === 'delivered' ? 'rgba(22,163,74,0.2)' : 'rgba(255,69,0,0.15)'}`,
                    padding: '4px 12px', borderRadius: 100, textTransform: 'uppercase', letterSpacing: '0.05em',
                  }}>
                    {order.orderStatus.replace(/_/g, ' ')}
                  </span>
                </div>
                <OrderStepper order={order} />
              </div>

              {/* Summary column */}
              <OrderSummaryCard order={order} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
