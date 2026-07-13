import { BrowserRouter } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider } from './context/AuthContext';
import { AuthModalProvider } from './context/AuthModalContext';
import { CartProvider } from './context/CartContext';
import AppRouter from './routes/AppRouter';
import AuthModal from './components/auth/AuthModal';
import CartToast from './components/CartToast';
import { GoogleOAuthProvider } from '@react-oauth/google';

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || 'dummy-client-id.apps.googleusercontent.com';
  
  return (
    <GoogleOAuthProvider clientId={clientId}>
      <ThemeProvider>
        <CartProvider>
          <AuthProvider>
            <AuthModalProvider>
              <BrowserRouter>
                <AppRouter />
                <AuthModal />
                <CartToast />
              </BrowserRouter>
            </AuthModalProvider>
          </AuthProvider>
        </CartProvider>
      </ThemeProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
