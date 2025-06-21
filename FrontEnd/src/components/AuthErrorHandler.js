import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const AuthErrorHandler = () => {
  const { logout } = useAuth();
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Écouter les erreurs d'authentification globales
    const handleAuthError = (event) => {
      if (event.detail?.requiresAuth) {
        setAuthError({
          type: 'auth',
          message: 'Votre session a expiré. Veuillez vous reconnecter.',
          action: 'Se reconnecter'
        });
      } else if (event.detail?.forbidden) {
        setAuthError({
          type: 'forbidden',
          message: 'Vous n\'avez pas les permissions nécessaires pour cette action.',
          action: 'Contacter l\'administrateur'
        });
      }
    };

    // Créer un événement personnalisé pour les erreurs d'auth
    window.addEventListener('authError', handleAuthError);

    return () => {
      window.removeEventListener('authError', handleAuthError);
    };
  }, []);

  const handleReconnect = () => {
    logout();
    window.location.href = '/login';
  };

  const dismissError = () => {
    setAuthError(null);
  };

  if (!authError) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-4 shadow-lg">
      <div className="container mx-auto flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.314 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
          </svg>
          <div>
            <div className="font-semibold">Problème d'authentification</div>
            <div className="text-sm opacity-90">{authError.message}</div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          {authError.type === 'auth' && (
            <button
              onClick={handleReconnect}
              className="bg-white text-red-600 px-4 py-2 rounded-lg font-medium hover:bg-gray-100 transition-colors"
            >
              {authError.action}
            </button>
          )}
          <button
            onClick={dismissError}
            className="text-white hover:text-gray-200 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default AuthErrorHandler;
