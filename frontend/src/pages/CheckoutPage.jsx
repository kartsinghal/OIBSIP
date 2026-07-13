import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useAuthModal } from '../context/AuthModalContext';
import apiClient from '../services/apiClient';
import MockRazorpayModal from '../components/MockRazorpayModal';

export default function CheckoutPage() {
  const { cart, totalPrice, dispatch: cartDispatch } = useCart();
  const { user, isAuthenticated } = useAuth();
  const { open } = useAuthModal();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    phone: user?.phone || '',
    address: '',
    notes: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mockModal, setMockModal] = useState(null);

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: prev.fullName || user.fullName || '',
        phone: prev.phone || user.phone || ''
      }));
    }
  }, [user]);

  useEffect(() => {
    if (cart.length === 0 && !loading) {
      navigate('/menu');
    }
  }, [cart, navigate, loading]);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Required';
    if (!formData.phone.trim()) newErrors.phone = 'Required';
    if (!formData.address.trim()) newErrors.address = 'Required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePayment = async () => {
    if (!isAuthenticated) { open(); return; }
    if (!validate()) return;
    setLoading(true);

    try {
      await apiClient.delete('/cart/clear').catch(() => {});
      for (const item of cart) {
        await apiClient.post('/cart/add', {
          pizza: item.basePizzaId || item._id,
          name: item.name,
          quantity: item.quantity,
          size: item.size || 'medium',
          crust: item.crust || 'classic',
          base: item.base || item.customSelections?.Base || '',
          sauce: item.sauce || item.customSelections?.Sauce || '',
          cheese: item.cheese || item.customSelections?.Cheese || '',
          extraCheese: item.extraCheese || false,
          veggies: item.veggies || [],
          meat: item.meat || [],
          toppings: item.toppings || item.customSelections?.Toppings || []
        }).catch(e => console.warn('Sync cart item warning:', e));
      }

      const orderRes = await apiClient.post('/orders', {
        deliveryAddress: {
          street: formData.address,
          city: 'N/A',
          pincode: '000000'
        },
        notes: formData.notes,
      });
      const orderId = orderRes.data.data._id;
      const publicId = orderRes.data.data.publicId;
      const orderTotal = orderRes.data.data.totalPrice;

      setMockModal({ amount: Math.round(orderTotal * 100), orderId, publicId });
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || err.message || 'Failed to initiate checkout');
    } finally {
      setLoading(false);
    }
  };

  const handleMockSuccess = async (mockPayment) => {
    try {
      // Use publicId for the track URL if available, fallback to _id
      const trackId = mockModal.publicId || mockModal.orderId;

      if (mockPayment.paymentMethod === 'cod') {
        await apiClient.post('/payment/confirm-cod', { orderId: mockModal.orderId });
        cartDispatch({ type: 'CLEAR_CART' });
        setMockModal(null);
        navigate(`/track-order?orderId=${trackId}`);
        return;
      }

      const verifyRes = await apiClient.post('/payment/verify', {
        orderId: mockModal.orderId,
        razorpay_order_id:  mockPayment.razorpay_order_id,
        razorpay_payment_id: mockPayment.razorpay_payment_id,
        razorpay_signature: mockPayment.razorpay_signature,
      });
      cartDispatch({ type: 'CLEAR_CART' });
      const confirmedOrderId = verifyRes.data?.data?.publicId || verifyRes.data?.data?.orderId || trackId;
      setMockModal(null);
      navigate(`/track-order?orderId=${confirmedOrderId}`);
    } catch (err) {
      console.error('Order confirmation error:', err);
      setMockModal(null);
      alert(err.response?.data?.message || 'Order confirmation failed. Please contact support.');
    }
  };

  const inputStyle = {
    width: '100%', padding: '13px 14px', background: '#111',
    border: '1px solid #222', borderRadius: 10, color: '#F0F0F0',
    fontSize: 15, marginBottom: 12, outline: 'none', boxSizing: 'border-box',
    fontFamily: 'Inter, sans-serif',
  };

  return (
    <>
      <style>{`
        .checkout-wrapper {
          max-width: 1000px;
          margin: 0 auto;
          padding: 100px 20px 60px;
          display: flex;
          gap: 32px;
          flex-wrap: wrap;
          font-family: Inter, sans-serif;
        }
        .checkout-left {
          flex: 1 1 340px;
          min-width: 0;
        }
        .checkout-right {
          flex: 1 1 300px;
          min-width: 0;
        }
        .checkout-summary-sticky {
          position: sticky;
          top: 90px;
        }
        @media (max-width: 640px) {
          .checkout-wrapper {
            padding: 72px 16px 40px;
            gap: 20px;
          }
          .checkout-right {
            flex: 1 1 100%;
          }
          .checkout-left {
            flex: 1 1 100%;
          }
          .checkout-summary-sticky {
            position: static;
          }
        }
      `}</style>

      <div className="checkout-wrapper">
        {/* Left: Delivery Details */}
        <div className="checkout-left">
          <h2 style={{ fontSize: 'clamp(22px, 5vw, 28px)', fontWeight: 800, color: '#F0F0F0', marginBottom: 24, letterSpacing: '-0.02em' }}>
            Checkout
          </h2>
          <div style={{ background: '#0D0D0D', padding: 'clamp(20px, 4vw, 30px)', borderRadius: 16, border: '1px solid #1A1A1A', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, color: '#fff', fontWeight: 600 }}>Delivery Details</h3>

            <input
              placeholder="Full Name"
              value={formData.fullName}
              onChange={e => setFormData({...formData, fullName: e.target.value})}
              style={{ ...inputStyle, borderColor: errors.fullName ? '#FF4500' : '#222' }}
            />

            <input
              placeholder="Phone Number"
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              style={{ ...inputStyle, borderColor: errors.phone ? '#FF4500' : '#222' }}
            />

            <textarea
              placeholder="Complete Delivery Address"
              rows="3"
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              style={{ ...inputStyle, borderColor: errors.address ? '#FF4500' : '#222', resize: 'vertical' }}
            />

            <textarea
              placeholder="Delivery Notes (Optional)"
              rows="2"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              style={inputStyle}
            />
          </div>
        </div>

        {/* Right: Order Summary */}
        <div className="checkout-right">
          <div className="checkout-summary-sticky" style={{ background: '#0D0D0D', padding: 'clamp(20px, 4vw, 30px)', borderRadius: 16, border: '1px solid #1A1A1A', boxShadow: '0 8px 32px rgba(0,0,0,0.4)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: 18, color: '#fff', fontWeight: 600 }}>Order Summary</h3>

            <div style={{ maxHeight: 280, overflowY: 'auto', marginBottom: 20, paddingRight: 4 }}>
              {cart.map((item, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 14, alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ color: '#E0E0E0', fontWeight: 600, fontSize: 14, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {item.name}
                    </div>
                    <div style={{ color: '#888', fontSize: 12, marginTop: 2 }}>Qty: {item.quantity}</div>
                  </div>
                  <div style={{ color: '#FF4500', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                    ₹{item.price * item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div style={{ borderTop: '1px solid #1A1A1A', paddingTop: 20, marginBottom: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 18, fontWeight: 800, color: '#fff' }}>
                <span>Total Amount</span>
                <span>₹{totalPrice}</span>
              </div>
            </div>

            <button
              onClick={handlePayment}
              disabled={loading}
              style={{
                width: '100%', padding: '15px',
                background: loading ? '#222' : '#FF4500',
                color: loading ? '#888' : '#fff', border: 'none', borderRadius: 12,
                fontSize: 16, fontWeight: 700,
                cursor: loading ? 'not-allowed' : 'pointer', transition: 'background 0.2s',
                letterSpacing: '0.02em',
              }}
            >
              {loading ? 'Processing...' : 'Proceed to Payment'}
            </button>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {mockModal && (
        <MockRazorpayModal
          amount={mockModal.amount}
          orderName="Inferno Pizza"
          prefill={{ name: formData.fullName, contact: formData.phone, email: user?.email || '' }}
          onSuccess={handleMockSuccess}
          onDismiss={() => setMockModal(null)}
        />
      )}
    </>
  );
}
