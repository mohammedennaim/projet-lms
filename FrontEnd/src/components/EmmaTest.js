// Test des données Emma Martin
import React, { useState, useEffect } from 'react';
import api from '../services/api';

const EmmaTest = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [employeesResponse, affectationsResponse] = await Promise.all([
          api.get('/statistics/debug-employees'),
          api.get('/statistics/affectations-simple')
        ]);
        
        const employeesData = employeesResponse.data?.employees || [];
        const affectations = affectationsResponse.data || [];
        
        // Créer une map des affectations par utilisateur
        const affectationsMap = new Map();
        affectations.forEach(affectation => {
          if (!affectation.user) return;
          
          const userId = affectation.user.id;
          if (!affectationsMap.has(userId)) {
            affectationsMap.set(userId, []);
          }
          affectationsMap.get(userId).push(affectation);
        });
        
        // Trouver Emma Martin
        const emma = employeesData.find(emp => emp.fullName === 'Emma Martin');
        if (emma) {
          const userAffectations = affectationsMap.get(emma.id) || [];
          
          console.log('Emma Martin trouvée:', emma);
          console.log('Affectations d\'Emma:', userAffectations);
          
          // Traiter ses cours
          const assignedCourses = userAffectations.map(affectation => {
            const course = affectation.course;
            
            // Calculer le score moyen et récupérer les feedbacks
            let averageScore = 0;
            let totalEvaluations = 0;
            
            if (affectation.evaluations && affectation.evaluations.length > 0) {
              const validEvaluations = affectation.evaluations.filter(evaluation => evaluation.note != null);
              if (validEvaluations.length > 0) {
                const totalScore = validEvaluations.reduce((sum, evaluation) => sum + evaluation.note, 0);
                averageScore = Math.round((totalScore / validEvaluations.length) * 10) / 10;
                totalEvaluations = validEvaluations.length;
              }
            }
            
            // Calculer la progression basée sur les évaluations réelles
            let progress = 0;
            let isCompleted = false;
            
            if (totalEvaluations > 0) {
              // Si l'employé a des évaluations, calculer la progression
              if (averageScore >= 10) {
                // Si la note moyenne est suffisante, considérer comme terminé
                progress = 100;
                isCompleted = true;
              } else {
                // Sinon, progression partielle basée sur le nombre d'évaluations
                progress = Math.min(80, totalEvaluations * 25);
              }
            } else {
              // Pas d'évaluations : progression basée sur l'assignation
              progress = affectation.assigneCours ? 100 : 15;
              isCompleted = affectation.assigneCours;
            }
            
            return {
              courseId: course?.id || 'N/A',
              courseName: course?.title || course?.name || 'Cours non trouvé',
              dateAssigned: affectation.dateAssigned || 'N/A',
              isCompleted: isCompleted,
              averageScore: averageScore,
              totalEvaluations: totalEvaluations,
              progress: progress,
              assigneCours: affectation.assigneCours
            };
          });
          
          // Calculer les statistiques globales d'Emma
          const totalCourses = assignedCourses.length;
          const completedCourses = assignedCourses.filter(course => course.isCompleted).length;
          const totalEvaluations = assignedCourses.reduce((sum, course) => sum + course.totalEvaluations, 0);
          
          // Calculer un taux de réussite amélioré
          let successfulCourses = completedCourses;
          assignedCourses.forEach(course => {
            if (!course.isCompleted && course.totalEvaluations > 0 && course.averageScore >= 10) {
              successfulCourses++;
            }
          });
          
          const completionRate = totalCourses > 0 ? Math.round((successfulCourses / totalCourses) * 100) : 0;
          
          const emmaData = {
            ...emma,
            totalCourses,
            completedCourses,
            completionRate,
            assignedCourses,
            successfulCourses
          };
          
          console.log('Emma - Données traitées:', emmaData);
          setData(emmaData);
        }
        
      } catch (error) {
        console.error('Erreur:', error);
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  if (loading) return <div>Chargement...</div>;
  if (!data) return <div>Emma Martin non trouvée</div>;

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>Test Emma Martin</h1>
      <div style={{ backgroundColor: '#f5f5f5', padding: '15px', borderRadius: '5px' }}>
        <h2>Informations générales</h2>
        <p><strong>Nom:</strong> {data.fullName}</p>
        <p><strong>Email:</strong> {data.email}</p>
        <p><strong>Total cours:</strong> {data.totalCourses}</p>
        <p><strong>Cours terminés:</strong> {data.completedCourses}</p>
        <p><strong>Cours réussis:</strong> {data.successfulCourses}</p>
        <p><strong>Taux de réussite:</strong> {data.completionRate}%</p>
      </div>
      
      <div style={{ marginTop: '20px' }}>
        <h2>Cours assignés</h2>
        {data.assignedCourses.map((course, index) => (
          <div key={index} style={{ backgroundColor: '#e7f3ff', padding: '10px', margin: '10px 0', borderRadius: '5px' }}>
            <h3>{course.courseName}</h3>
            <p><strong>Progression:</strong> {course.progress}%</p>
            <p><strong>Score moyen:</strong> {course.averageScore}/20</p>
            <p><strong>Évaluations:</strong> {course.totalEvaluations}</p>
            <p><strong>Terminé:</strong> {course.isCompleted ? 'Oui' : 'Non'}</p>
            <p><strong>AssigneCours DB:</strong> {course.assigneCours ? 'Oui' : 'Non'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EmmaTest;
