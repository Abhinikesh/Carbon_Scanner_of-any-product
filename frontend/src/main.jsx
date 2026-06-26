import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { useAuth } from './context/AuthContext.jsx';
import SplashScreen from './components/SplashScreen.jsx';
import './index.css';

/**
 * AppWithSplash — thin wrapper that reads AuthContext.isLoading and shows
 * the SplashScreen until the session restore attempt completes.
 * Lives inside AuthProvider so it can consume the context.
 */
function AppWithSplash() {
  const { isLoading } = useAuth();
  return (
    <>
      <SplashScreen done={!isLoading} />
      <App />
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {/* GoogleOAuthProvider must wrap everything so the Google button can render */}
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID}>
      <AuthProvider>
        <BrowserRouter>
          <AppWithSplash />
        </BrowserRouter>
      </AuthProvider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
