import React, { useState, useEffect } from 'react';
import affectationService from '../services/affectationService';
import courseService from '../services/courseService';
import UserService from '../services/UserService';

const AssignmentDebug = () => {
  const [debugInfo, setDebugInfo] = useState({
    affectations: { status: 'loading', data: null, error: null },
    courses: { status: 'loading', data: null, error: null },
    employees: { status: 'loading', data: null, error: null }
  });

  useEffect(() => {
    testAllServices();
  }, []);

  const testAllServices = async () => {
    // Test du service d'affectations
    try {
      console.log('Testing affectation service...');
      const affectationsResult = await affectationService.getAllAffectations();
      console.log('Affectations result:', affectationsResult);
      
      setDebugInfo(prev => ({
        ...prev,
        affectations: {
          status: affectationsResult.success ? 'success' : 'error',
          data: affectationsResult.data,
          error: affectationsResult.error || null
        }
      }));
    } catch (error) {
      console.error('Affectation service error:', error);
      setDebugInfo(prev => ({
        ...prev,
        affectations: {
          status: 'error',
          data: null,
          error: error.message
        }
      }));
    }

    // Test du service de cours
    try {
      console.log('Testing course service...');
      const coursesResult = await courseService.getAllCourses();
      console.log('Courses result:', coursesResult);
      
      setDebugInfo(prev => ({
        ...prev,
        courses: {
          status: 'success',
          data: coursesResult,
          error: null
        }
      }));
    } catch (error) {
      console.error('Course service error:', error);
      setDebugInfo(prev => ({
        ...prev,
        courses: {
          status: 'error',
          data: null,
          error: error.message
        }
      }));
    }

    // Test du service d'employés
    try {
      console.log('Testing employee service...');
      const employeesResult = await UserService.getAllEmployees();
      console.log('Employees result:', employeesResult);
      
      setDebugInfo(prev => ({
        ...prev,
        employees: {
          status: 'success',
          data: employeesResult,
          error: null
        }
      }));
    } catch (error) {
      console.error('Employee service error:', error);
      setDebugInfo(prev => ({
        ...prev,
        employees: {
          status: 'error',
          data: null,
          error: error.message
        }
      }));
    }
  };

  const renderServiceStatus = (serviceName, serviceInfo) => {
    const statusColor = {
      loading: 'bg-yellow-100 text-yellow-800',
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800'
    };

    const statusIcon = {
      loading: '⏳',
      success: '✅',
      error: '❌'
    };

    return (
      <div className="bg-white p-4 rounded-lg shadow border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-gray-900">{serviceName}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor[serviceInfo.status]}`}>
            {statusIcon[serviceInfo.status]} {serviceInfo.status}
          </span>
        </div>
        
        {serviceInfo.error && (
          <div className="bg-red-50 text-red-700 p-2 rounded text-sm mb-2">
            <strong>Erreur:</strong> {serviceInfo.error}
          </div>
        )}
        
        {serviceInfo.data && (
          <div className="bg-gray-50 p-2 rounded text-sm">
            <strong>Données:</strong>
            <pre className="mt-1 text-xs overflow-x-auto">
              {JSON.stringify(serviceInfo.data, null, 2).substring(0, 500)}
              {JSON.stringify(serviceInfo.data, null, 2).length > 500 ? '...' : ''}
            </pre>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto bg-white border-2 border-blue-500 rounded-lg shadow-xl z-50">
      <div className="bg-blue-500 text-white p-3 rounded-t-lg">
        <h2 className="font-bold">Debug des Services d'Assignation</h2>
        <button
          onClick={() => document.querySelector('[data-debug]').remove()}
          className="absolute top-2 right-2 text-white hover:text-gray-200"
        >
          ×
        </button>
      </div>
      
      <div className="p-4 space-y-4">
        {renderServiceStatus('Service Affectations', debugInfo.affectations)}
        {renderServiceStatus('Service Cours', debugInfo.courses)}
        {renderServiceStatus('Service Employés', debugInfo.employees)}
        
        <button
          onClick={testAllServices}
          className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition-colors"
        >
          Retester les Services
        </button>
      </div>
    </div>
  );
};

export default AssignmentDebug;
