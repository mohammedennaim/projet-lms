import React, { useState, useEffect } from 'react';
import api from '../services/api';

const SimpleStatisticsTest = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [logs, setLogs] = useState([]);

  const addLog = (message) => {
    setLogs(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
    console.log(message);
  };

  const testAPI = async () => {
    setLoading(true);
    setError(null);
    setEmployees([]);
    setLogs([]);

    try {
      addLog('🚀 Début du test API...');
      
      // Test direct avec fetch
      addLog('📡 Test avec fetch...');
      const fetchResponse = await fetch('http://localhost:8000/api/statistics/debug-employees');
      addLog(`📡 Fetch response status: ${fetchResponse.status}`);
      const fetchData = await fetchResponse.json();
      addLog(`📡 Fetch data: ${fetchData.count} employés`);

      // Test avec axios
      addLog('🔧 Test avec axios...');
      const axiosResponse = await api.get('/statistics/debug-employees');
      addLog(`🔧 Axios response status: ${axiosResponse.status}`);
      addLog(`🔧 Axios data: ${axiosResponse.data.count} employés`);

      setEmployees(axiosResponse.data.employees || []);
      addLog('✅ Test réussi!');

    } catch (err) {
      addLog(`❌ Erreur: ${err.message}`);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    testAPI();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>🧪 Test API Simple</h1>
      
      <button onClick={testAPI} disabled={loading}>
        {loading ? 'Test en cours...' : 'Relancer le test'}
      </button>

      <h2>📋 Logs:</h2>
      <div style={{ background: '#f0f0f0', padding: '10px', marginBottom: '20px' }}>
        {logs.map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      {error && (
        <div style={{ color: 'red', background: '#ffe6e6', padding: '10px' }}>
          <strong>Erreur:</strong> {error}
        </div>
      )}

      <h2>👥 Employés ({employees.length}):</h2>
      {employees.length > 0 ? (
        <ul>
          {employees.map(emp => (
            <li key={emp.id}>
              <strong>{emp.fullName}</strong> - {emp.email}
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun employé chargé</p>
      )}
    </div>
  );
};

export default SimpleStatisticsTest;
