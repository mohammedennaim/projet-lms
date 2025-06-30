import React, { useState } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const EmployeeAffectationsTest = () => {
  const { user, login } = useAuth();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const addResult = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setResults(prev => [...prev, { timestamp, message, type }]);
  };

  const clearResults = () => {
    setResults([]);
  };

  const testLogin = async () => {
    addResult('🔐 Test de connexion employé...', 'info');
    setLoading(true);

    try {
      const response = await api.post('/login', {
        email: 'john.doe@lms.com',
        password: 'password123'
      });

      if (response.data.token && response.data.userId) {
        const userData = {
          userId: response.data.userId,
          email: response.data.user,
          role: response.data.role,
          fullName: response.data.fullName
        };

        login(response.data.token, userData);
        
        addResult(`✅ Connexion réussie!`, 'success');
        addResult(`User: ${response.data.user} (ID: ${response.data.userId})`, 'success');
        addResult(`Role: ${response.data.role}`, 'success');
        addResult(`Nom: ${response.data.fullName}`, 'success');
      } else {
        throw new Error('Token ou userId manquant dans la réponse');
      }
    } catch (error) {
      addResult(`❌ Erreur de connexion: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const testEmployeeAffectations = async () => {
    if (!user || !user.userId) {
      addResult('❌ Veuillez d\'abord vous connecter', 'error');
      return;
    }

    addResult(`📚 Test récupération des cours assignés (User ID: ${user.userId})...`, 'info');
    setLoading(true);

    try {
      const response = await api.get(`/employee/affectations/${user.userId}`);
      
      addResult(`✅ API Response: ${response.data.message}`, 'success');
      addResult(`Total: ${response.data.total?.courses || 0} cours, ${response.data.total?.quizzes || 0} quiz, ${response.data.total?.resources || 0} ressources`, 'info');
      
      const courses = response.data.courses || [];
      
      if (courses.length > 0) {
        addResult(`✅ ${courses.length} cours assigné(s) trouvé(s):`, 'success');
        courses.forEach((course, index) => {
          addResult(`${index + 1}. ${course.title} - ${course.description || 'Pas de description'}`, 'success');
        });
        addResult(`🎉 VALIDATION RÉUSSIE: L'employé voit ${courses.length} cours assigné(s)`, 'success');
      } else {
        addResult(`⚠️ ATTENTION: Aucun cours assigné à cet employé`, 'error');
      }
    } catch (error) {
      addResult(`❌ Erreur lors de la récupération des affectations: ${error.message}`, 'error');
      console.error('Error details:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const testFullFlow = async () => {
    addResult('🚀 Démarrage du test complet...', 'info');
    clearResults();
    
    await testLogin();
    
    // Attendre 1 seconde puis tester les affectations
    setTimeout(() => {
      testEmployeeAffectations();
    }, 1000);
  };

  const getResultClass = (type) => {
    switch (type) {
      case 'success': return 'bg-green-100 border-green-400 text-green-700';
      case 'error': return 'bg-red-100 border-red-400 text-red-700';
      case 'info': return 'bg-blue-100 border-blue-400 text-blue-700';
      default: return 'bg-gray-100 border-gray-400 text-gray-700';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">
        🎓 Test Dashboard Employé - Cours Assignés
      </h1>
      
      <div className="mb-6 space-x-4">
        <button
          onClick={testLogin}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
        >
          1. Test Login Employé
        </button>
        
        <button
          onClick={testEmployeeAffectations}
          disabled={loading || !user}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
        >
          2. Test Affectations Employé
        </button>
        
        <button
          onClick={testFullFlow}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 disabled:opacity-50"
        >
          3. Test Complet
        </button>
        
        <button
          onClick={clearResults}
          disabled={loading}
          className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 disabled:opacity-50"
        >
          Effacer
        </button>
      </div>

      {user && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold text-green-800">Utilisateur connecté:</h3>
          <p className="text-green-700">
            {user.fullName} ({user.email}) - {user.role} - ID: {user.userId}
          </p>
        </div>
      )}

      {loading && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <p className="text-yellow-700">⏳ Test en cours...</p>
        </div>
      )}

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {results.map((result, index) => (
          <div
            key={index}
            className={`p-3 border rounded-md ${getResultClass(result.type)}`}
          >
            <span className="font-mono text-sm">{result.timestamp}</span> - {result.message}
          </div>
        ))}
      </div>

      {results.length === 0 && (
        <div className="p-4 bg-gray-50 border border-gray-200 rounded text-center text-gray-600">
          🏁 Cliquez sur "Test Complet" pour commencer la validation
        </div>
      )}
    </div>
  );
};

export default EmployeeAffectationsTest;
