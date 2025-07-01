// Test simple pour les feedbacks
import React from 'react';

const FeedbacksTest = () => {
  // Données de test avec feedbacks
  const testEmployee = {
    fullName: 'Emma Martin Test',
    email: 'emma.test@lms.com',
    totalCourses: 1,
    completedCourses: 1,
    completionRate: 100,
    averageScore: 16.3,
    assignedCourses: [
      {
        courseId: 27,
        courseName: 'Introduction à la programmation',
        courseDescription: 'Ce cours couvre les bases de la programmation',
        dateAssigned: '2025-06-01 00:00:00',
        isCompleted: true,
        averageScore: 16.3,
        totalEvaluations: 3,
        progress: 100,
        feedbacks: [
          {
            score: 16,
            feedback: 'Très bon travail, continue comme ça !',
            date: '2025-06-01 00:00:00'
          },
          {
            score: 18,
            feedback: 'Excellent travail ! Performance exceptionnelle.',
            date: '2025-06-01 00:00:00'
          },
          {
            score: 15,
            feedback: 'Très bon travail, continue comme ça !',
            date: '2025-06-01 00:00:00'
          }
        ]
      }
    ]
  };

  console.log('Test Employee:', testEmployee);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial', backgroundColor: '#f5f5f5' }}>
      <h1>Test d'affichage des Feedbacks</h1>
      
      <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '10px', marginBottom: '20px' }}>
        <h2>{testEmployee.fullName}</h2>
        <p>Email: {testEmployee.email}</p>
        <p>Score moyen: {testEmployee.averageScore}/20</p>
        
        <div style={{ marginTop: '20px' }}>
          <h3>Cours assignés:</h3>
          {testEmployee.assignedCourses.map((course, index) => (
            <div key={index} style={{ 
              backgroundColor: '#f8f9fa', 
              padding: '15px', 
              borderRadius: '5px', 
              margin: '10px 0',
              border: '1px solid #dee2e6'
            }}>
              <h4>{course.courseName}</h4>
              <p>Score moyen: {course.averageScore}/20</p>
              <p>Évaluations: {course.totalEvaluations}</p>
              <p>Progression: {course.progress}%</p>
              
              <div style={{ marginTop: '15px' }}>
                <h5>Feedbacks récents:</h5>
                {course.feedbacks && course.feedbacks.length > 0 ? (
                  <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                    {course.feedbacks.slice(-2).map((feedback, fbIndex) => (
                      <div key={fbIndex} style={{ 
                        backgroundColor: '#e9ecef',
                        padding: '10px',
                        margin: '5px 0',
                        borderRadius: '3px',
                        border: '1px solid #ced4da'
                      }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                          <span style={{ 
                            fontWeight: 'bold',
                            color: feedback.score >= 16 ? 'green' : 
                                   feedback.score >= 12 ? 'blue' :
                                   feedback.score >= 10 ? 'orange' : 'red'
                          }}>
                            {feedback.score}/20
                          </span>
                          <span style={{ fontSize: '12px', color: '#666' }}>
                            {new Date(feedback.date).toLocaleDateString('fr-FR')}
                          </span>
                        </div>
                        <p style={{ margin: 0, fontSize: '14px' }}>{feedback.feedback}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: '#666', fontStyle: 'italic' }}>Aucun feedback disponible</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedbacksTest;
