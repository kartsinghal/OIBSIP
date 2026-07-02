import { useState } from 'react';

/**
 * MockRazorpayModal — Drop-in Razorpay replacement for local development.
 * Swap out for the real Razorpay SDK when ready to go live.
 *
 * Props:
 *   amount      — number in paise (e.g. 74800 for ₹748)
 *   orderName   — display name (e.g. "Inferno Pizza")
 *   prefill     — { name, contact, email }
 *   onSuccess   — (mockPayment) => void
 *   onDismiss   — () => void
 */
export default function MockRazorpayModal({ amount, orderName, prefill, onSuccess, onDismiss }) {
  const [tab, setTab]         = useState('card'); // 'card' | 'upi' | 'netbanking' | 'cod'
  const [cardNo, setCardNo]   = useState('');
  const [expiry, setExpiry]   = useState('');
  const [cvv, setCvv]         = useState('');
  const [upiId, setUpiId]     = useState('');
  const [bank, setBank]       = useState('');
  const [paying, setPaying]   = useState(false);
  const [paid, setPaid]       = useState(false);

  const amountRupees = (amount / 100).toFixed(2);

  const handlePay = async () => {
    if (tab === 'cod') {
      // COD: skip payment simulation, call success directly
      onSuccess({
        paymentMethod: 'cod',
        paymentStatus: 'pending',
        razorpay_payment_id: null,
        razorpay_order_id: null,
        razorpay_signature: null,
      });
      return;
    }

    setPaying(true);
    await new Promise(r => setTimeout(r, 2000)); // simulate network delay
    setPaid(true);
    await new Promise(r => setTimeout(r, 700));  // show success briefly

    const mockPayment = {
      razorpay_payment_id: `pay_mock_${Date.now()}`,
      razorpay_order_id:   `order_mock_${Date.now()}`,
      razorpay_signature:  'mock_signature',
    };
    onSuccess(mockPayment);
  };

  // ── Shared styles ────────────────────────────────────────────────────────────
  const inputStyle = {
    width: '100%', padding: '12px 14px',
    background: '#f8f8f8', border: '1px solid #ddd',
    borderRadius: 8, fontSize: 14, color: '#1a1a1a',
    outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
    marginBottom: 12,
  };

  const tabStyle = (active) => ({
    flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 600,
    cursor: 'pointer', border: 'none', background: 'transparent',
    borderBottom: active ? '2px solid #528FF0' : '2px solid transparent',
    color: active ? '#528FF0' : '#888',
    transition: 'all 0.2s',
    fontFamily: 'Inter, sans-serif',
    letterSpacing: '0.02em',
    textTransform: 'uppercase',
  });

  // ── Success screen ───────────────────────────────────────────────────────────
  if (paid) {
    return (
      <div style={overlay}>
        <div style={{ ...modal, textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: 60, marginBottom: 16 }}>✅</div>
          <h3 style={{ color: '#16a34a', fontWeight: 700, margin: '0 0 8px', fontSize: 20 }}>
            Payment Successful!
          </h3>
          <p style={{ color: '#666', fontSize: 14 }}>Your order is being confirmed…</p>
        </div>
      </div>
    );
  }

  // ── Payment screen ───────────────────────────────────────────────────────────
  return (
    <div style={overlay} onClick={(e) => e.target === e.currentTarget && onDismiss()}>
      <div style={modal}>

        {/* ── Header ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '20px 24px', borderBottom: '1px solid #eee' }}>
          <div style={{
            width: 40, height: 40, borderRadius: 10,
            background: 'linear-gradient(135deg, #FF4500, #ff7c4d)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, flexShrink: 0,
          }}>🍕</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 15, color: '#1a1a1a' }}>{orderName}</div>
            <div style={{ fontSize: 12, color: '#888' }}>Secure Checkout · Test Mode</div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: 11, color: '#888' }}>Total</div>
            <div style={{ fontWeight: 800, fontSize: 20, color: '#1a1a1a' }}>₹{amountRupees}</div>
          </div>
        </div>

        {/* ── Prefill info ── */}
        <div style={{ padding: '12px 24px 0', display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {prefill?.name && (
            <span style={chip}>{prefill.name}</span>
          )}
          {prefill?.contact && (
            <span style={chip}>📞 {prefill.contact}</span>
          )}
        </div>

        {/* ── Tabs ── */}
        <div style={{ display: 'flex', borderBottom: '1px solid #eee', margin: '12px 0 0' }}>
          {['card', 'upi', 'netbanking', 'cod'].map(t => (
            <button key={t} style={tabStyle(tab === t)} onClick={() => setTab(t)}>
              {t === 'card' ? '💳 Card' : t === 'upi' ? '⚡ UPI' : t === 'netbanking' ? '🏦 Net Banking' : '🛵 COD'}
            </button>
          ))}
        </div>

        {/* ── Tab Content ── */}
        <div style={{ padding: '20px 24px' }}>

          {tab === 'card' && (
            <div>
              <label style={label}>Card Number</label>
              <input
                placeholder="4111 1111 1111 1111"
                value={cardNo}
                onChange={e => setCardNo(e.target.value)}
                maxLength={19}
                style={inputStyle}
              />
              <div style={{ display: 'flex', gap: 12 }}>
                <div style={{ flex: 1 }}>
                  <label style={label}>Expiry</label>
                  <input
                    placeholder="MM / YY"
                    value={expiry}
                    onChange={e => setExpiry(e.target.value)}
                    maxLength={7}
                    style={inputStyle}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={label}>CVV</label>
                  <input
                    placeholder="•••"
                    value={cvv}
                    type="password"
                    onChange={e => setCvv(e.target.value)}
                    maxLength={4}
                    style={inputStyle}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8, marginBottom: 4 }}>
                {['4111 1111 1111 1111', '5267 3181 8797 5449'].map(n => (
                  <button key={n} onClick={() => setCardNo(n)} style={autofillBtn}>
                    Use {n.slice(0, 4)}…
                  </button>
                ))}
              </div>
              <p style={{ fontSize: 11, color: '#aaa', marginTop: 6 }}>
                Any expiry / CVV works in test mode.
              </p>
            </div>
          )}

          {tab === 'upi' && (
            <div>
              <label style={label}>UPI ID</label>
              <input
                placeholder="yourname@upi"
                value={upiId}
                onChange={e => setUpiId(e.target.value)}
                style={inputStyle}
              />
              <button onClick={() => setUpiId('success@razorpay')} style={autofillBtn}>
                Use test UPI
              </button>
              <p style={{ fontSize: 11, color: '#aaa', marginTop: 10 }}>
                Use <code>success@razorpay</code> for test success.
              </p>
            </div>
          )}

          {tab === 'netbanking' && (
            <div>
              <label style={label}>Select Bank</label>
              <select
                value={bank}
                onChange={e => setBank(e.target.value)}
                style={{ ...inputStyle, cursor: 'pointer' }}
              >
                <option value="">-- Choose a bank --</option>
                <option value="HDFC">HDFC Bank</option>
                <option value="ICICI">ICICI Bank</option>
                <option value="SBI">State Bank of India</option>
                <option value="AXIS">Axis Bank</option>
                <option value="KOTAK">Kotak Mahindra</option>
              </select>
              <p style={{ fontSize: 11, color: '#aaa', marginTop: 2 }}>
                Any selection works in test mode.
              </p>
            </div>
          )}

          {tab === 'cod' && (
            <div style={{
              textAlign: 'center', padding: '24px 0 8px',
            }}>
              <div style={{ fontSize: 48, marginBottom: 14 }}>🛵</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#1a1a1a', marginBottom: 8 }}>
                Cash on Delivery
              </div>
              <div style={{
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                borderRadius: 10, padding: '14px 16px', marginBottom: 8,
              }}>
                <p style={{ margin: 0, fontSize: 14, color: '#15803d', fontWeight: 600 }}>
                  Pay with cash at the time of delivery
                </p>
                <p style={{ margin: '6px 0 0', fontSize: 12, color: '#16a34a' }}>
                  No online payment required
                </p>
              </div>
              <p style={{ fontSize: 11, color: '#aaa', marginTop: 8 }}>
                Order will be confirmed immediately. Have exact change ready.
              </p>
            </div>
          )}
        </div>

        {/* ── Actions ── */}
        <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          <button
            onClick={handlePay}
            disabled={paying}
            style={{
              width: '100%', padding: '14px',
              background: paying ? '#93c5fd' : tab === 'cod' ? '#16a34a' : '#528FF0',
              color: '#fff', border: 'none', borderRadius: 10,
              fontSize: 15, fontWeight: 700, cursor: paying ? 'not-allowed' : 'pointer',
              transition: 'background 0.2s',
              fontFamily: 'Inter, sans-serif',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
          >
            {paying ? (
              <>
                <Spinner />
                Processing payment…
              </>
            ) : tab === 'cod' ? (
              '🛵 Place Order (COD)'
            ) : (
              `Pay ₹${amountRupees}`
            )}
          </button>
          <button
            onClick={onDismiss}
            disabled={paying}
            style={{
              width: '100%', padding: '10px',
              background: 'transparent', color: '#888',
              border: '1px solid #ddd', borderRadius: 10,
              fontSize: 13, cursor: paying ? 'not-allowed' : 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}
          >
            Cancel
          </button>
        </div>

        {/* ── Footer ── */}
        <div style={{ borderTop: '1px solid #f0f0f0', padding: '12px 24px', textAlign: 'center' }}>
          <span style={{ fontSize: 10, color: '#bbb', letterSpacing: '0.04em' }}>
            🔒 SECURED · MOCK MODE — NO REAL PAYMENTS
          </span>
        </div>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <div style={{
      width: 16, height: 16, border: '2px solid rgba(255,255,255,0.4)',
      borderTopColor: '#fff', borderRadius: '50%',
      animation: 'rzp-spin 0.7s linear infinite',
    }}>
      <style>{`@keyframes rzp-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Shared style constants ────────────────────────────────────────────────────
const overlay = {
  position: 'fixed', inset: 0, zIndex: 9999,
  background: 'rgba(0,0,0,0.55)',
  display: 'flex', alignItems: 'center', justifyContent: 'center',
  fontFamily: 'Inter, sans-serif',
};

const modal = {
  background: '#fff', borderRadius: 16,
  width: '100%', maxWidth: 420,
  boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
  overflow: 'hidden',
};

const label = {
  display: 'block', fontSize: 11, fontWeight: 600,
  color: '#555', marginBottom: 6, letterSpacing: '0.04em',
  textTransform: 'uppercase',
};

const chip = {
  fontSize: 12, color: '#555', background: '#f3f3f3',
  borderRadius: 100, padding: '4px 10px',
};

const autofillBtn = {
  fontSize: 11, color: '#528FF0',
  background: 'rgba(82,143,240,0.08)',
  border: '1px solid rgba(82,143,240,0.2)',
  borderRadius: 6, padding: '4px 10px',
  cursor: 'pointer', fontFamily: 'Inter, sans-serif',
};
