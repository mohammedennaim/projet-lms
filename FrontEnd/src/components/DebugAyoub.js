// Page de debug dédiée pour Ayoub Labit
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const DebugAyoub = () => {
  const [debugData, setDebugData] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDebugData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔍 Début du debug pour Ayoub Labit...');
      
      // Test avec cache busting
      const timestamp = Date.now();
      const [employeesResponse, affectationsResponse] = await Promise.all([
        api.get(`/statistics/debug-employees?t=${timestamp}`),
        api.get(`/statistics/affectations-simple?t=${timestamp}`)
      ]);
      
      console.log('📥 Réponse employés brute:', employeesResponse);
      console.log('📥 Réponse affectations brute:', affectationsResponse);
      
      const employeesData = employeesResponse.data?.employees || [];
      const affectations = affectationsResponse.data || [];
      
      console.log('👥 Employés extraits:', employeesData);
      console.log('📋 Affectations extraites:', affectations);
      
      // Trouver Ayoub Labit
      const ayoub = employeesData.find(emp => emp.fullName === 'Ayoub Labit');
      console.log('🎯 Ayoub trouvé:', ayoub);
      
      if (!ayoub) {
        throw new Error('Ayoub Labit non trouvé dans les employés');
      }
      
      // Filtrer ses affectations
      const ayoubAffectations = affectations.filter(aff => aff.user && aff.user.id === ayoub.id);
      console.log('📝 Affectations d\'Ayoub:', ayoubAffectations);
      
      // Traitement comme dans Statistics.js
      const processedCourses = ayoubAffectations.map(affectation => {
        const course = affectation.course;
        
        console.log('📚 Traitement du cours:', course?.title);
        console.log('🔢 Évaluations brutes:', affectation.evaluations);
        
        let averageScore = 0;
        let feedbacks = [];
        let totalEvaluations = 0;
        
        if (affectation.evaluations && affectation.evaluations.length > 0) {
          const validEvaluations = affectation.evaluations.filter(evaluation => evaluation.note != null);
          console.log('✅ Évaluations valides:', validEvaluations);
          
          if (validEvaluations.length > 0) {
            const totalScore = validEvaluations.reduce((sum, evaluation) => sum + evaluation.note, 0);
            averageScore = Math.round((totalScore / validEvaluations.length) * 10) / 10;
            totalEvaluations = validEvaluations.length;
            
            console.log(`📊 Score total: ${totalScore}, Moyenne: ${averageScore}, Nb évaluations: ${totalEvaluations}`);
            
            feedbacks = validEvaluations.map(evaluation => {
              let feedback = '';
              if (evaluation.note >= 18) feedback = 'Excellent travail ! Performance exceptionnelle.';
              else if (evaluation.note >= 15) feedback = 'Très bon travail, continue comme ça !';
              else if (evaluation.note >= 12) feedback = 'Bon travail, quelques améliorations possibles.';
              else if (evaluation.note >= 10) feedback = 'Travail satisfaisant, des efforts supplémentaires sont nécessaires.';
              else feedback = 'Performance à améliorer, accompagnement recommandé.';
              
              return {
                score: evaluation.note,
                feedback: feedback,
                date: affectation.dateAssigned || new Date().toISOString()
              };
            });
            
            console.log('💬 Feedbacks générés:', feedbacks);
          }
        } else {
          console.log('❌ Aucune évaluation trouvée pour ce cours');
        }
        
        // Calculer la progression
        let progress = 0;
        let isCompleted = false;
        
        if (totalEvaluations > 0) {
          if (averageScore >= 10) {
            progress = 100;
            isCompleted = true;
          } else {
            progress = Math.min(80, totalEvaluations * 25);
          }
        } else {
          progress = affectation.assigneCours ? 100 : 15;
          isCompleted = affectation.assigneCours;
        }
        
        console.log(`📈 Progression calculée: ${progress}%, Terminé: ${isCompleted}`);
        
        return {
          courseId: course?.id || 'N/A',
          courseName: course?.title || 'Cours non trouvé',
          courseDescription: course?.description || '',
          dateAssigned: affectation.dateAssigned || 'N/A',
          isCompleted: isCompleted,
          averageScore: averageScore,
          totalEvaluations: totalEvaluations,
          feedbacks: feedbacks,
          progress: progress,
          assigneCours: affectation.assigneCours
        };
      });
      
      console.log('🎓 Cours traités finaux:', processedCourses);
      
      // Calculer les statistiques globales
      const totalCourses = processedCourses.length;
      const completedCourses = processedCourses.filter(course => course.isCompleted).length;
      const totalEvaluations = processedCourses.reduce((sum, course) => sum + course.totalEvaluations, 0);
      
      let successfulCourses = completedCourses;
      processedCourses.forEach(course => {
        if (!course.isCompleted && course.totalEvaluations > 0 && course.averageScore >= 10) {
          successfulCourses++;
        }
      });
      
      const completionRate = totalCourses > 0 ? Math.round((successfulCourses / totalCourses) * 100) : 0;
      const avgScore = totalEvaluations > 0 ? 
        processedCourses.reduce((sum, course) => sum + (course.averageScore * course.totalEvaluations), 0) / totalEvaluations : 0;
      
      const finalStats = {
        totalCourses,
        completedCourses,
        successfulCourses,
        completionRate,
        averageScore: Math.round(avgScore * 10) / 10,
        totalEvaluations,
        processedCourses
      };
      
      console.log('📈 Statistiques finales:', finalStats);
      
      setDebugData({
        ayoub,
        ayoubAffectations,
        finalStats,
        rawEmployees: employeesData.length,
        rawAffectations: affectations.length
      });
      
    } catch (error) {
      console.error('❌ Erreur debug:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDebugData();
  }, []);

  if (loading) return <div style={{ padding: '20px' }}>🔄 Chargement debug...</div>;
  if (error) return <div style={{ padding: '20px', color: 'red' }}>❌ Erreur: {error}</div>;
  if (!debugData) return <div style={{ padding: '20px' }}>Aucune donnée</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f5f5f5' }}>
      <h1>🔍 Debug Ayoub Labit</h1>
      
      <button 
        onClick={loadDebugData}
        style={{ 
          padding: '10px 20px', 
          backgroundColor: '#007bff', 
          color: 'white', 
          border: 'none', 
          borderRadius: '5px', 
          cursor: 'pointer',
          marginBottom: '20px'
        }}
      >
        🔄 Recharger Debug
      </button>
      
      <div style={{ display: 'grid', gap: '20px' }}>
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
          <h2>📊 Données brutes</h2>
          <p>Employés récupérés: {debugData.rawEmployees}</p>
          <p>Affectations récupérées: {debugData.rawAffectations}</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
          <h2>👤 Ayoub Labit</h2>
          <p>ID: {debugData.ayoub.id}</p>
          <p>Nom: {debugData.ayoub.fullName}</p>
          <p>Email: {debugData.ayoub.email}</p>
          <p>Affectations trouvées: {debugData.ayoubAffectations.length}</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
          <h2>📈 Statistiques calculées</h2>
          <p>Total cours: {debugData.finalStats.totalCourses}</p>
          <p>Cours complétés: {debugData.finalStats.completedCourses}</p>
          <p>Cours réussis: {debugData.finalStats.successfulCourses}</p>
          <p>Taux de réussite: {debugData.finalStats.completionRate}%</p>
          <p>Score moyen: {debugData.finalStats.averageScore}/20</p>
          <p>Total évaluations: {debugData.finalStats.totalEvaluations}</p>
        </div>
        
        <div style={{ backgroundColor: 'white', padding: '15px', borderRadius: '8px' }}>
          <h2>📚 Cours détaillés</h2>
          {debugData.finalStats.processedCourses.map((course, index) => (
            <div key={index} style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '10px', 
              margin: '10px 0', 
              borderRadius: '5px',
              border: '1px solid #dee2e6' 
            }}>
              <h4>{course.courseName}</h4>
              <p>Score moyen: {course.averageScore}/20</p>
              <p>Évaluations: {course.totalEvaluations}</p>
              <p>Progression: {course.progress}%</p>
              <p>Terminé: {course.isCompleted ? 'Oui' : 'Non'}</p>
              <p>AssigneCours (DB): {course.assigneCours ? 'Oui' : 'Non'}</p>
              
              {course.feedbacks.length > 0 && (
                <div>
                  <strong>Feedbacks:</strong>
                  {course.feedbacks.map((fb, fbIndex) => (
                    <div key={fbIndex} style={{ marginLeft: '10px', fontSize: '14px' }}>
                      • {fb.score}/20: {fb.feedback}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DebugAyoub;
