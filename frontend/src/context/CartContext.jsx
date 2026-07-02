import { createContext, useContext, useReducer, useState, useRef } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';

const CartContext = createContext(null);

function cartReducer(state, action) {
  switch (action.type) {
    case 'ADD_ITEM': {
      const existing = state.find((i) => i._id === action.payload._id);
      if (existing) {
        return state.map((i) =>
          i._id === action.payload._id ? { ...i, quantity: i.quantity + 1 } : i
        );
      }
      return [...state, { ...action.payload, quantity: 1 }];
    }
    case 'REMOVE_ITEM':
      return state.filter((i) => i._id !== action.payload);
    case 'UPDATE_QUANTITY':
      return state.map((i) =>
        i._id === action.payload.id ? { ...i, quantity: action.payload.quantity } : i
      );
    case 'CLEAR_CART':
      return [];
    default:
      return state;
  }
}

export function CartProvider({ children }) {
  const [savedCart, setSavedCart] = useLocalStorage('cart', []);
  const [cart, dispatch] = useReducer(cartReducer, savedCart);
  const [toast, setToast] = useState(null); // { message, itemCount }
  const toastTimer = useRef(null);

  const showToast = (itemCount = 1) => {
    clearTimeout(toastTimer.current);
    setToast({ itemCount });
    toastTimer.current = setTimeout(() => setToast(null), 3000);
  };

  const hideToast = () => {
    clearTimeout(toastTimer.current);
    setToast(null);
  };

  // Sync reducer state back to localStorage on every change
  const wrappedDispatch = (action) => {
    const nextState = cartReducer(cart, action);
    setSavedCart(nextState);
    dispatch(action);
  };

  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <CartContext.Provider value={{ cart, dispatch: wrappedDispatch, totalItems, totalPrice, toast, showToast, hideToast }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
