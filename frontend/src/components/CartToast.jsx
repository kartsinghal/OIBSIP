import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function CartToast() {
  const { toast, hideToast } = useCart();
  const navigate = useNavigate();
  const prevToast = useRef(null);

  // Keep prev value for exit animation
  useEffect(() => {
    if (toast) prevToast.current = toast;
  }, [toast]);

  const displayed = toast || prevToast.current;
  const visible = !!toast;

  const handleViewCart = () => {
    hideToast();
    navigate('/cart');
  };

  return (
    <>
      <style>{`
        @keyframes toastSlideUp {
          from { transform: translate(-50%, 32px); opacity: 0; }
          to   { transform: translate(-50%, 0);   opacity: 1; }
        }
        @keyframes toastSlideDown {
          from { transform: translate(-50%, 0);   opacity: 1; }
          to   { transform: translate(-50%, 32px); opacity: 0; }
        }
        .inferno-cart-toast {
          position: fixed;
          bottom: 32px;
          left: 50%;
          transform: translate(-50%, 0);
          z-index: 9999;
          display: flex;
          align-items: center;
          gap: 20px;
          padding: 14px 20px 14px 22px;
          border-radius: 100px;
          background: rgba(18, 18, 18, 0.88);
          backdrop-filter: saturate(180%) blur(18px);
          -webkit-backdrop-filter: saturate(180%) blur(18px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.45), 0 2px 8px rgba(0, 0, 0, 0.3);
          white-space: nowrap;
          pointer-events: all;
          animation: toastSlideUp 0.35s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
        .inferno-cart-toast.hiding {
          animation: toastSlideDown 0.28s cubic-bezier(0.4, 0, 1, 1) forwards;
          pointer-events: none;
        }
        .inferno-toast-icon {
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: #FF4500;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }
        .inferno-toast-msg {
          font-family: Inter, sans-serif;
          font-size: 14px;
          font-weight: 500;
          color: rgba(255, 255, 255, 0.92);
          letter-spacing: -0.01em;
        }
        .inferno-toast-msg strong {
          color: #ffffff;
          font-weight: 700;
        }
        .inferno-toast-divider {
          width: 1px;
          height: 18px;
          background: rgba(255, 255, 255, 0.12);
          flex-shrink: 0;
        }
        .inferno-toast-cta {
          font-family: Inter, sans-serif;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          color: #FF4500;
          background: none;
          border: none;
          cursor: pointer;
          padding: 4px 2px;
          transition: color 0.15s ease;
          flex-shrink: 0;
        }
        .inferno-toast-cta:hover {
          color: #FF6A38;
        }
        .inferno-toast-close {
          background: none;
          border: none;
          cursor: pointer;
          color: rgba(255, 255, 255, 0.3);
          font-size: 14px;
          padding: 2px 4px;
          line-height: 1;
          transition: color 0.15s ease;
          flex-shrink: 0;
        }
        .inferno-toast-close:hover {
          color: rgba(255, 255, 255, 0.7);
        }
        @media (max-width: 480px) {
          .inferno-cart-toast {
            bottom: 20px;
            left: 16px;
            right: 16px;
            transform: translateX(0);
            border-radius: 16px;
          }
          .inferno-cart-toast.hiding {
            animation: none;
            opacity: 0;
          }
        }
      `}</style>

      {displayed && (
        <div className={`inferno-cart-toast${!visible ? ' hiding' : ''}`}>
          {/* Check icon */}
          <div className="inferno-toast-icon">
            <svg width="11" height="9" viewBox="0 0 11 9" fill="none">
              <path d="M1 4.5l3 3 6-7" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>

          {/* Message */}
          <span className="inferno-toast-msg">
            <strong>{displayed.itemCount} item</strong> added to cart
          </span>

          {/* Divider */}
          <div className="inferno-toast-divider" />

          {/* View Cart CTA */}
          <button className="inferno-toast-cta" onClick={handleViewCart}>
            View Cart
          </button>

          {/* Dismiss */}
          <button className="inferno-toast-close" onClick={hideToast} aria-label="Dismiss">
            ✕
          </button>
        </div>
      )}
    </>
  );
}
