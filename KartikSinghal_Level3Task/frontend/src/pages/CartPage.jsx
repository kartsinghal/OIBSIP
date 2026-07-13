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
    <main className="cart-main" style={{ backgroundColor: 'var(--bg-primary)', minHeight: '90vh' }}>
      <style>{`
        .cart-main { padding-top: 100px; padding-bottom: 80px; }
        .cart-container {
          max-width: 800px;
          margin: 0 auto;
          padding: 0 20px;
        }
        .cart-item-row {
          display: flex;
          align-items: center;
          gap: 16px;
          background: var(--bg-secondary);
          border: 1px solid var(--border-color);
          border-radius: 16px;
          padding: 16px;
        }
        .cart-item-info {
          flex: 1;
          min-width: 0;
        }
        .cart-item-controls {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }
        .cart-item-price {
          font-size: 15px;
          font-weight: 700;
          color: var(--text-primary);
          min-width: 56px;
          text-align: right;
          flex-shrink: 0;
        }
        .cart-summary-actions {
          display: flex;
          gap: 12px;
          flex-wrap: wrap;
        }
        @media (max-width: 480px) {
          .cart-main { padding-top: 80px; padding-bottom: 40px; }
          .cart-item-row {
            flex-wrap: wrap;
            gap: 12px;
          }
          .cart-item-info {
            flex: 1 1 calc(100% - 80px);
          }
          .cart-item-controls {
            order: 3;
          }
          .cart-item-price {
            order: 4;
            min-width: auto;
          }
          .cart-item-remove {
            order: 2;
          }
          .cart-summary-actions {
            flex-direction: column;
          }
          .cart-summary-actions a,
          .cart-summary-actions button {
            width: 100% !important;
            text-align: center;
          }
        }
      `}</style>

      <div className="cart-container">
        {/* Header */}
        <div style={{ marginBottom: 40, borderBottom: '1px solid var(--border-color)', paddingBottom: 24 }}>
          <h1 style={{ fontSize: 'clamp(24px, 5vw, 40px)', fontWeight: 900, letterSpacing: '-0.03em', color: 'var(--text-primary)', margin: 0 }}>
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 32 }}>
              {cart.map((item) => (
                <div key={item._id} className="cart-item-row">
                  {/* Image */}
                  {item.image && (
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: 56, height: 56, objectFit: 'cover', borderRadius: 10, flexShrink: 0 }}
                    />
                  )}

                  {/* Info */}
                  <div className="cart-item-info">
                    <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </h3>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                      ₹{item.price} each
                    </span>
                  </div>

                  {/* Quantity controls */}
                  <div className="cart-item-controls">
                    <button
                      onClick={() => handleQuantity(item._id, item.quantity - 1)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-color)',
                        background: 'var(--bg-tertiary)', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                        color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      −
                    </button>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', minWidth: 18, textAlign: 'center' }}>
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => handleQuantity(item._id, item.quantity + 1)}
                      style={{
                        width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-color)',
                        background: 'var(--bg-tertiary)', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                        color: 'var(--text-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}
                    >
                      +
                    </button>
                  </div>

                  {/* Subtotal */}
                  <span className="cart-item-price">
                    ₹{(item.price * item.quantity).toFixed(0)}
                  </span>

                  {/* Remove */}
                  <button
                    className="cart-item-remove"
                    onClick={() => handleRemove(item._id)}
                    title="Remove item"
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: 'var(--text-tertiary)', fontSize: 16, lineHeight: 1,
                      padding: '4px 6px', borderRadius: 6, flexShrink: 0,
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
              borderRadius: 16, padding: '24px',
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                <span style={{ fontSize: 16, color: 'var(--text-secondary)' }}>Total</span>
                <span style={{ fontSize: 'clamp(20px, 5vw, 26px)', fontWeight: 900, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
                  ₹{totalPrice.toFixed(0)}
                </span>
              </div>
              <div className="cart-summary-actions">
                <Link
                  to="/checkout"
                  style={{
                    flex: 1, minWidth: 140, textAlign: 'center',
                    backgroundColor: '#FF4500', color: '#fff',
                    padding: '14px 24px', borderRadius: 100, textDecoration: 'none',
                    fontSize: 14, fontWeight: 700, letterSpacing: '-0.01em',
                    display: 'block',
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
