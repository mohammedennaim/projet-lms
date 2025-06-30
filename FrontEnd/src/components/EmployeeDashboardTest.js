import React, { useState, useEffect } from 'react';
import api from '../services/api';

const EmployeeDashboardTest = () => {
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [credentials, setCredentials] = useState({
    email: 'employee.dashboard@example.com', // Employé avec 0 cours (normal)
    password: 'employee123'
  });

  const addResult = (test, success, data) => {
    setTestResults(prev => [...prev, { test, success, data, timestamp: new Date().toLocaleTimeString() }]);
  };

  const runCompleteTest = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      // Test 1: Connexion automatique avec les identifiants test
      addResult('Début du test', true, 'Test de connexion et récupération des affectations');

      try {
        console.log('Tentative de connexion avec:', credentials);
        const loginResponse = await api.post('/login', credentials);
        
        if (loginResponse.data.token) {
          // Stocker le token et l'utilisateur
          localStorage.setItem('token', loginResponse.data.token);
          localStorage.setItem('user', JSON.stringify({
            userId: loginResponse.data.userId,
            email: loginResponse.data.user,
            fullName: loginResponse.data.fullName,
            role: loginResponse.data.role
          }));

          addResult('Connexion API', true, {
            userId: loginResponse.data.userId,
            role: loginResponse.data.role,
            hasToken: !!loginResponse.data.token
          });

          // Test 2: Test immédiat de l'API des affectations
          try {
            const affectationsResponse = await api.get(`/api/employee/affectations/${loginResponse.data.userId}`);
            addResult('API Affectations', true, {
              status: affectationsResponse.status,
              coursesCount: affectationsResponse.data.courses?.length || 0,
              data: affectationsResponse.data
            });
          } catch (affectationsError) {
            console.error('Erreur affectations:', affectationsError);
            addResult('API Affectations', false, {
              message: affectationsError.message,
              status: affectationsError.response?.status,
              data: affectationsError.response?.data,
              config: {
                url: affectationsError.config?.url,
                method: affectationsError.config?.method,
                headers: affectationsError.config?.headers
              }
            });
          }

        } else {
          addResult('Connexion API', false, 'Pas de token reçu');
        }
      } catch (loginError) {
        console.error('Erreur de connexion:', loginError);
        addResult('Connexion API', false, {
          message: loginError.message,
          status: loginError.response?.status,
          data: loginError.response?.data
        });
      }

      // Test 3: Test de connectivité réseau brute
      try {
        const response = await fetch('http://localhost:8000/api/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: 'test@test.com', password: 'wrong' })
        });
        addResult('Connectivité Réseau', true, { 
          status: response.status, 
          message: 'Serveur accessible' 
        });
      } catch (networkError) {
        addResult('Connectivité Réseau', false, { 
          message: 'Serveur inaccessible', 
          error: networkError.message 
        });
      }

    } catch (error) {
      addResult('Erreur Générale', false, error.message);
    }

    setLoading(false);
  };

  // Test rapide avec les données localStorage existantes
  const runQuickTest = async () => {
    setLoading(true);
    setTestResults([]);

    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      
      addResult('localStorage Check', !!token && !!user.userId, { 
        hasToken: !!token, 
        userId: user.userId,
        email: user.email 
      });

      if (token && user.userId) {
        try {
          const response = await api.get(`/api/employee/affectations/${user.userId}`);
          addResult('API Test (localStorage)', true, {
            status: response.status,
            coursesCount: response.data.courses?.length || 0,
            data: response.data
          });
        } catch (error) {
          addResult('API Test (localStorage)', false, {
            message: error.message,
            status: error.response?.status,
            data: error.response?.data
          });
        }
      }
    } catch (error) {
      addResult('Test localStorage', false, error.message);
    }

    setLoading(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">🔍 Diagnostic Dashboard Employé - React</h1>
      
      <div className="mb-6 space-y-4">
        <div className="p-4 bg-gray-50 rounded">
          <h3 className="font-semibold mb-2">Identifiants de test:</h3>
          <div className="space-y-2">
            <input
              type="email"
              placeholder="Email"
              value={credentials.email}
              onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              className="w-full p-2 border rounded"
            />
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials({...credentials, password: e.target.value})}
              className="w-full p-2 border rounded"
            />
          </div>
        </div>
        
        <div className="space-x-4">
          <button 
            onClick={runCompleteTest}
            disabled={loading}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Tests en cours...' : 'Test Complet (Connexion + API)'}
          </button>
          
          <button 
            onClick={runQuickTest}
            disabled={loading}
            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 disabled:opacity-50"
          >
            {loading ? 'Tests en cours...' : 'Test Rapide (localStorage)'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {testResults.map((result, index) => (
          <div 
            key={index}
            className={`p-4 rounded border-l-4 ${
              result.success 
                ? 'bg-green-50 border-green-500 text-green-800' 
                : 'bg-red-50 border-red-500 text-red-800'
            }`}
          >
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-semibold">
                {result.success ? '✅' : '❌'} {result.test}
              </h3>
              <span className="text-sm opacity-70">{result.timestamp}</span>
            </div>
            <pre className="text-sm bg-gray-100 p-2 rounded overflow-auto">
              {JSON.stringify(result.data, null, 2)}
            </pre>
          </div>
        ))}
      </div>

      {testResults.length === 0 && !loading && (
        <div className="text-center text-gray-500 py-8">
          <p>Aucun test exécuté.</p>
          <p className="text-sm mt-2">
            Utilisez "Test Complet" pour une première connexion ou "Test Rapide" si vous êtes déjà connecté.
          </p>
        </div>
      )}

      <div className="mt-8 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold text-blue-800 mb-2">Instructions:</h3>
        <ol className="list-decimal list-inside text-sm text-blue-700 space-y-1">
          <li>Utilisez l'email de test pré-rempli ou créez un nouveau compte employé</li>
          <li>Cliquez sur "Test Complet" pour se connecter et tester l'API</li>
          <li>Vérifiez les résultats pour identifier le problème</li>
          <li>Ouvrez la console du navigateur (F12) pour plus de détails</li>
        </ol>
      </div>
    </div>
  );
};

export default EmployeeDashboardTest;
