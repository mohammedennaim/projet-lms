// Test des données brutes directement
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const RawDataTest = () => {
  const [rawData, setRawData] = useState(null);
  const [processedData, setProcessedData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadRawData = async () => {
      try {
        const [employeesResponse, affectationsResponse] = await Promise.all([
          api.get('/statistics/debug-employees'),
          api.get('/statistics/affectations-simple')
        ]);
        
        const employeesData = employeesResponse.data?.employees || [];
        const affectations = affectationsResponse.data || [];
        
        console.log('RAW EMPLOYEES:', employeesData);
        console.log('RAW AFFECTATIONS:', affectations);
        
        setRawData({ employeesData, affectations });
        
        // Chercher Emma Martin spécifiquement
        const emma = employeesData.find(emp => emp.fullName === 'Emma Martin');
        const emmaAffectations = affectations.filter(aff => aff.user && aff.user.id === emma?.id);
        
        console.log('EMMA TROUVÉE:', emma);
        console.log('AFFECTATIONS EMMA:', emmaAffectations);
        
        setProcessedData({ emma, emmaAffectations });
        
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadRawData();
  }, []);

  if (loading) return <div>Chargement des données brutes...</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Test des Données Brutes</h1>
      
      <div style={{ backgroundColor: '#f0f0f0', padding: '15px', margin: '20px 0', borderRadius: '5px' }}>
        <h2>Employés trouvés: {rawData?.employeesData?.length || 0}</h2>
        {rawData?.employeesData?.map(emp => (
          <div key={emp.id} style={{ margin: '5px 0' }}>
            {emp.id} - {emp.fullName} ({emp.email})
          </div>
        ))}
      </div>
      
      <div style={{ backgroundColor: '#e0f0ff', padding: '15px', margin: '20px 0', borderRadius: '5px' }}>
        <h2>Affectations trouvées: {rawData?.affectations?.length || 0}</h2>
        {rawData?.affectations?.map(aff => (
          <div key={aff.id} style={{ margin: '5px 0', padding: '5px', backgroundColor: 'white', borderRadius: '3px' }}>
            ID {aff.id}: {aff.user?.fullName} → {aff.course?.title} ({aff.evaluations?.length || 0} évaluations)
          </div>
        ))}
      </div>
      
      {processedData?.emma && (
        <div style={{ backgroundColor: '#e0ffe0', padding: '15px', margin: '20px 0', borderRadius: '5px' }}>
          <h2>Emma Martin - Détails</h2>
          <p><strong>ID:</strong> {processedData.emma.id}</p>
          <p><strong>Nom:</strong> {processedData.emma.fullName}</p>
          <p><strong>Email:</strong> {processedData.emma.email}</p>
          
          <h3>Affectations d'Emma ({processedData.emmaAffectations?.length || 0}):</h3>
          {processedData.emmaAffectations?.map(aff => (
            <div key={aff.id} style={{ margin: '10px 0', padding: '10px', backgroundColor: 'white', borderRadius: '3px' }}>
              <p><strong>Affectation ID:</strong> {aff.id}</p>
              <p><strong>Cours:</strong> {aff.course?.title}</p>
              <p><strong>Date:</strong> {aff.dateAssigned}</p>
              <p><strong>AssigneCours:</strong> {aff.assigneCours ? 'Oui' : 'Non'}</p>
              <p><strong>Évaluations:</strong></p>
              {aff.evaluations?.map(evaluation => (
                <div key={evaluation.id} style={{ marginLeft: '20px', padding: '5px', backgroundColor: '#f9f9f9' }}>
                  ID {evaluation.id}: Note {evaluation.note}/20
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RawDataTest;
