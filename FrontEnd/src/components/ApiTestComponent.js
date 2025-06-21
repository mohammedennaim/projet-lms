import React, { useState } from 'react';
import affectationService from '../services/affectationService';

const ApiTestComponent = () => {
  const [testResult, setTestResult] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const testApiConnection = async () => {
    setIsLoading(true);
    setTestResult(null);

    try {
      console.log('Testing affectation API connection...');
      const result = await affectationService.getAllAffectations();
      
      setTestResult({
        success: result.success,
        dataCount: result.data?.length || 0,
        isMockData: result.isMockData || false,
        error: result.error,
        rawData: result
      });
      
      console.log('API Test Result:', result);
    } catch (error) {
      console.error('API Test Error:', error);
      setTestResult({
        success: false,
        error: error.message,
        rawData: error
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed top-4 left-4 bg-white border-2 border-blue-500 rounded-lg shadow-xl p-4 max-w-md z-50">
      <h3 className="font-bold text-lg mb-3 text-blue-700">Test API Affectations</h3>
      
      <button
        onClick={testApiConnection}
        disabled={isLoading}
        className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-gray-400 mb-3"
      >
        {isLoading ? 'Test en cours...' : 'Tester la connexion API'}
      </button>

      {testResult && (
        <div className="space-y-2">
          <div className={`p-2 rounded text-sm ${
            testResult.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            <strong>Statut:</strong> {testResult.success ? 'Succès' : 'Échec'}
          </div>

          {testResult.success && (
            <>
              <div className="bg-blue-100 text-blue-800 p-2 rounded text-sm">
                <strong>Données:</strong> {testResult.dataCount} affectations trouvées
              </div>
              
              {testResult.isMockData && (
                <div className="bg-yellow-100 text-yellow-800 p-2 rounded text-sm">
                  ⚠️ <strong>Données de démonstration</strong> (API non disponible)
                </div>
              )}
            </>
          )}

          {testResult.error && (
            <div className="bg-red-100 text-red-800 p-2 rounded text-sm">
              <strong>Erreur:</strong> {testResult.error}
            </div>
          )}

          <details className="mt-2">
            <summary className="cursor-pointer text-xs text-gray-600">Détails techniques</summary>
            <pre className="text-xs bg-gray-100 p-2 rounded mt-1 overflow-auto max-h-32">
              {JSON.stringify(testResult.rawData, null, 2)}
            </pre>
          </details>
        </div>
      )}

      <button
        onClick={() => document.querySelector('[data-api-test]')?.remove()}
        className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
      >
        ×
      </button>
    </div>
  );
};

export default ApiTestComponent;
