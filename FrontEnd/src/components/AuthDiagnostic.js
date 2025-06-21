import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const AuthDiagnostic = () => {
  const { user } = useAuth();
  const [authInfo, setAuthInfo] = useState({
    hasToken: false,
    tokenValid: null,
    userInfo: null,
    testApiResult: null
  });
  const [isLoading, setIsLoading] = useState(false);

  const checkAuthStatus = useCallback(async () => {
    setIsLoading(true);
    
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    
    let parsedUser = null;
    try {
      parsedUser = storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('Error parsing stored user:', e);
    }

    // Test API call to verify token
    let apiTestResult = null;
    try {
      const response = await api.get('/api/admin/affectations');
      apiTestResult = {
        success: true,
        status: response.status,
        dataCount: response.data?.length || 0
      };
    } catch (error) {
      apiTestResult = {
        success: false,
        status: error.response?.status,
        message: error.response?.data?.message || error.message,
        code: error.code
      };
    }

    setAuthInfo({
      hasToken: !!token,
      tokenValue: token ? `${token.substring(0, 20)}...` : null,
      tokenValid: apiTestResult.success,
      userInfo: parsedUser,
      contextUser: user,
      testApiResult: apiTestResult
    });
    
    setIsLoading(false);
  }, [user]);

  useEffect(() => {
    checkAuthStatus();
  }, [checkAuthStatus]);

  const refreshToken = async () => {
    try {
      setIsLoading(true);
      // Vous pouvez implémenter ici la logique de refresh token
      // Pour l'instant, on redirige vers la page de login
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } catch (error) {
      console.error('Error refreshing token:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const StatusIndicator = ({ success, label }) => (
    <div className={`flex items-center space-x-2 p-2 rounded ${
      success === null ? 'bg-gray-100' : 
      success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
    }`}>
      <div className={`w-3 h-3 rounded-full ${
        success === null ? 'bg-gray-400' :
        success ? 'bg-green-500' : 'bg-red-500'
      }`}></div>
      <span className="text-sm font-medium">{label}</span>
    </div>
  );

  return (
    <div className="fixed bottom-4 left-4 bg-white border-2 border-indigo-500 rounded-lg shadow-xl p-4 max-w-md z-50">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-lg text-indigo-700">Diagnostic d'Authentification</h3>
        <button
          onClick={() => document.querySelector('[data-auth-diagnostic]')?.remove()}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-4">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-indigo-600 mr-2"></div>
          <span className="text-sm text-gray-600">Vérification...</span>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-3">
          <StatusIndicator success={authInfo.hasToken} label="Token présent" />
          <StatusIndicator success={authInfo.tokenValid} label="Token valide" />
          
          {authInfo.tokenValue && (
            <div className="bg-gray-50 p-2 rounded text-xs">
              <strong>Token:</strong> {authInfo.tokenValue}
            </div>
          )}

          {authInfo.userInfo && (
            <div className="bg-blue-50 p-2 rounded text-xs">
              <strong>Utilisateur:</strong> {authInfo.userInfo.email}<br/>
              <strong>Rôles:</strong> {authInfo.userInfo.roles?.join(', ') || 'Aucun'}
            </div>
          )}

          {authInfo.testApiResult && (
            <div className={`p-2 rounded text-xs ${
              authInfo.testApiResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
            }`}>
              <strong>Test API:</strong> {authInfo.testApiResult.success ? 'Succès' : 'Échec'}<br/>
              <strong>Status:</strong> {authInfo.testApiResult.status}<br/>
              {authInfo.testApiResult.message && (
                <><strong>Message:</strong> {authInfo.testApiResult.message}<br/></>
              )}
              {authInfo.testApiResult.dataCount !== undefined && (
                <><strong>Données:</strong> {authInfo.testApiResult.dataCount} affectations</>
              )}
            </div>
          )}

          <div className="flex space-x-2">
            <button
              onClick={checkAuthStatus}
              disabled={isLoading}
              className="flex-1 bg-indigo-500 text-white px-3 py-2 rounded text-sm hover:bg-indigo-600 disabled:bg-gray-400"
            >
              Retester
            </button>
            {!authInfo.tokenValid && (
              <button
                onClick={refreshToken}
                disabled={isLoading}
                className="flex-1 bg-red-500 text-white px-3 py-2 rounded text-sm hover:bg-red-600 disabled:bg-gray-400"
              >
                Se reconnecter
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AuthDiagnostic;
