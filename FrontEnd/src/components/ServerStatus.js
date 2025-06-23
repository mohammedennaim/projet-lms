import React, { useState, useEffect } from 'react';
import affectationService from '../services/affectationService';
import { checkServerConnectivity } from '../utils/errorUtils';

const ServerStatus = () => {
  const [serverStatus, setServerStatus] = useState({
    healthy: false,
    checking: true,
    message: 'Vérification en cours...',
    lastChecked: null
  });
  const checkServerHealth = async () => {
    setServerStatus(prev => ({ ...prev, checking: true }));
    
    try {
      // First check basic connectivity
      const connectivity = await checkServerConnectivity();
      
      if (!connectivity.isConnected) {
        setServerStatus({
          healthy: false,
          checking: false,
          message: 'Serveur non accessible',
          lastChecked: new Date().toLocaleTimeString(),
          error: connectivity.message,
          details: 'Vérifiez que le serveur backend est démarré sur http://localhost:8000'
        });
        return;
      }
      
      if (connectivity.requiresAuth) {
        setServerStatus({
          healthy: true,
          checking: false,
          message: 'Serveur accessible (authentification requise)',
          lastChecked: new Date().toLocaleTimeString(),
          details: 'Le serveur répond correctement'
        });
        return;
      }
      
      // If connected, try the full health check
      const healthCheck = await affectationService.checkApiHealth();
      setServerStatus({
        healthy: healthCheck.healthy,
        checking: false,
        message: healthCheck.message,
        lastChecked: new Date().toLocaleTimeString(),
        error: healthCheck.error
      });
    } catch (error) {
      setServerStatus({
        healthy: false,
        checking: false,
        message: 'Erreur de vérification',
        lastChecked: new Date().toLocaleTimeString(),
        error: error.message,
        details: 'Impossible de vérifier l\'état du serveur'
      });
    }
  };

  useEffect(() => {
    checkServerHealth();
    // Vérifier toutes les 30 secondes
    const interval = setInterval(checkServerHealth, 30000);
    return () => clearInterval(interval);
  }, []);

  const getStatusColor = () => {
    if (serverStatus.checking) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    if (serverStatus.healthy) return 'text-green-600 bg-green-50 border-green-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  const getStatusIcon = () => {
    if (serverStatus.checking) {
      return (
        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-yellow-600"></div>
      );
    }
    if (serverStatus.healthy) {
      return (
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
      </svg>
    );
  };

  return (
    <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm border ${getStatusColor()}`}>
      {getStatusIcon()}
      <span className="ml-2 font-medium">
        {serverStatus.message}
      </span>
      {serverStatus.lastChecked && (
        <span className="ml-2 text-xs opacity-75">
          ({serverStatus.lastChecked})
        </span>
      )}
      <button
        onClick={checkServerHealth}
        className="ml-2 text-xs underline hover:no-underline"
        disabled={serverStatus.checking}
      >
        Actualiser
      </button>
    </div>
  );
};

export default ServerStatus;
