import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/api';

const AuthTest = () => {
  const { isAuthenticated, user, login } = useAuth();
  const [loginData, setLoginData] = useState({
    email: 'admin@lms.com',
    password: 'admin123'
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleLogin = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      const result = await authService.login(loginData);
      if (result.success) {
        const { token, user: userEmail } = result.data;
        const userData = { email: userEmail };
        login(token, userData);
        setMessage('Connexion réussie !');
      } else {
        setMessage('Erreur: ' + result.error);
      }
    } catch (error) {
      setMessage('Erreur lors de la connexion: ' + error.message);
    }
    
    setLoading(false);
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-lg max-w-md mx-auto">
      <h3 className="text-lg font-bold mb-4">Test d'Authentification</h3>
      
      {isAuthenticated ? (
        <div className="space-y-3">
          <div className="text-green-600">
            ✅ Utilisateur connecté: {user?.email}
          </div>
          <div className="text-sm text-gray-600">
            Token présent: {localStorage.getItem('token') ? 'Oui' : 'Non'}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div className="text-red-600">
            ❌ Utilisateur non connecté
          </div>
          
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email"
              value={loginData.email}
              onChange={(e) => setLoginData({...loginData, email: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Mot de passe"
              value={loginData.password}
              onChange={(e) => setLoginData({...loginData, password: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <button
              onClick={handleLogin}
              disabled={loading}
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 disabled:opacity-50"
            >
              {loading ? 'Connexion...' : 'Se connecter'}
            </button>
          </div>
        </div>
      )}
      
      {message && (
        <div className={`mt-4 p-3 rounded ${message.includes('Erreur') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {message}
        </div>
      )}
    </div>
  );
};

export default AuthTest;
