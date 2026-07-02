import { useCart } from '../context/CartContext';
import { Link } from 'react-router-dom';

export default function CartPage() {
  const { cart, dispatch, totalItems, totalPrice } = useCart();

  const handleRemove = (id) => {
    dispatch({ type: 'REMOVE_ITEM', payload: id });
  };

  const handleQuantity = (id, quantity) => {
    if (quantity < 1) {
      dispatch({ type: 'REMOVE_ITEM', payload: id });
    } else {
      dispatch({ type: 'UPDATE_QUANTITY', payload: { id, quantity } });
    }
  };

  const handleClear = () => {
    dispatch({ type: 'CLEAR_CART' });
  };

  return (
    <main style={{ backgroundColor: 'var(--bg-primary)', minHeight: '90vh', paddingTop: 100, paddingBottom: 80 }}>
      <div style={{ maxWidth: 800, margin: '0 auto', padding: '0 40px' }}>

        {/* Header */}
        <div style={{ marginBottom: 40, borderBottom: '1px solid var(--border-color)', paddingBottom: 24 }}>
          <h1 style={{ fontSize: 'clamp(28px, 4vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: 0 }}>
            Your Cart
          </h1>
          {totalItems > 0 && (
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, margin: '8px 0 0 0' }}>
              {totalItems} item{totalItems !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        {/* Empty state */}
        {cart.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🍕</div>
            <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', margin: '0 0 12px 0' }}>
              Your cart is empty
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: 14, marginBottom: 32 }}>
              Add some pizzas to get started.
            </p>
            <Link
              to="/menu"
              style={{
                display: 'inline-block', backgroundColor: '#FF4500', color: '#fff',
                padding: '12px 32px', borderRadius: 100, textDecoration: 'none',
                fontSize: 14, fontWeight: 600, letterSpacing: '-0.01em',
              }}
            >
              Browse Menu
            </Link>
          </div>
        ) : (
          <>
            {/* Cart items */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 32 }}>
              {cart.map((item) => (
                <div
                  key={item._id}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 20,
                    background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
                    borderRadius: 16, padding: '16px 20px',
                  }}
                >
                  {/* Image */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: 64, height: 64, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                    />
                  )}

                  {/* Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
                      {item.name}
                    </h3>
                    <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
                      ₹{item.price} each
                    </span>
                  </div>

                  {/* Quantity controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button
                      onClick={() => handleQuantity(item._id, item.quantity - 1)}
                      style={{
                        width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border-color)',
                        background: 'var(--bg-tertiary)', cursor: 'pointer', fontSize: 16, fontWeight: 600,
                        color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', minWidth: 20, textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantity(item._id, item.quantity + 1)}
                      style={{
                        width: 30, height: 30, borderRadius: '50%', border: '1px solid var(--border-color)',
                        background: 'var(--bg-tertiary)', cursor: 'pointer', fontSize: 16, fontWeight: 600,
                        color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)', minWidth: 64, textAlign: 'right' }}>
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </span>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item._id)}
                    title="Remove item"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-tertiary)', fontSize: 18, lineHeight: 1,
                      padding: '4px 6px', borderRadius: 6,
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#dc2626'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--text-tertiary)'}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div style={{
              background: 'var(--bg-secondary)', border: '1px solid var(--border-color)',
              borderRadius: 16, padding: '24px 28px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Total</span>
                <span style={{ fontSize: 22, fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  ₹{totalPrice.toFixed(0)}
                </span>
              </div>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link
                  to="/checkout"
                  style={{
                    flex: 1, minWidth: 160, textAlign: 'center',
                    backgroundColor: '#FF4500', color: '#fff',
                    padding: '14px 24px', borderRadius: 100, textDecoration: 'none',
                    fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
                  }}
                >
                  Proceed to Checkout
                </Link>
                <button
                  onClick={handleClear}
                  style={{
                    background: 'none', border: '1px solid var(--border-color)', borderRadius: 100,
                    padding: '14px 24px', fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)',
                    cursor: 'pointer', letterSpacing: '-0.01em', transition: 'border-color 0.2s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = '#dc2626'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'var(--border-color)'}
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </main>
  );
}
