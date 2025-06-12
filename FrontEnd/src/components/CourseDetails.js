import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';

const CourseDetails = ({ courseId, onClose, onEdit }) => {
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const fetchCourseDetails = async () => {
    try {
      setLoading(true);
      const courseData = await courseService.getCourseById(courseId);
      setCourse(courseData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5 backdrop-blur-sm">
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl">
          <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
            <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-5"></div>
            <p className="text-gray-600">Chargement des détails du cours...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5 backdrop-blur-sm" onClick={onClose}>
        <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          <div className="flex flex-col items-center justify-center py-16 px-5 text-center">
            <h3 className="text-red-500 text-xl font-semibold mb-4">Erreur</h3>
            <p className="text-gray-600 mb-8">{error}</p>
            <button 
              className="px-6 py-3 bg-blue-500 text-white rounded-lg font-medium transition-all duration-300 hover:bg-blue-600" 
              onClick={onClose}
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    );
  }
  if (!course) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-5 backdrop-blur-sm animate-fadeIn" onClick={onClose}>
      <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-auto shadow-2xl animate-scale-in" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start p-6 pb-0 border-b border-gray-200 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 pr-5 leading-normal">{course.title}</h2>
          <button 
            className="bg-transparent border-none text-gray-500 hover:text-gray-800 hover:bg-gray-100 w-8 h-8 flex items-center justify-center rounded-full transition-all duration-200" 
            onClick={onClose} 
            title="Fermer"
          >
            ✕
          </button>
        </div>

        <div className="px-6 pb-6">
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-blue-500 inline-block">Description</h3>
            <p className="text-gray-600 leading-relaxed whitespace-pre-wrap">{course.description}</p>
          </div>

          <div className="bg-gray-50 p-5 rounded-xl border-l-4 border-blue-500 mb-8">
            <div className="flex justify-between items-center py-2 border-b border-gray-200 mb-2">
              <span className="font-medium text-gray-800">Date de création :</span>
              <span className="text-gray-600 text-sm">{formatDate(course.createdAt)}</span>
            </div>
            <div className="flex justify-between items-center py-2">
              <span className="font-medium text-gray-800">Dernière modification :</span>
              <span className="text-gray-600 text-sm">{formatDate(course.updatedAt)}</span>
            </div>
          </div>

          {course.employees && course.employees.length > 0 && (
            <div className="mb-8">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 pb-2 border-b-2 border-green-500 inline-block">
                Inscriptions ({course.employees.length})
              </h3>
              <div className="grid gap-3">
                {course.employees.map((employee, index) => (
                  <div key={employee.id || index} className="bg-gray-50 p-4 rounded-lg border-l-3 border-green-500">
                    <div className="flex flex-col gap-1">
                      <span className="font-medium text-gray-800">
                        {employee.firstName} {employee.lastName}
                      </span>
                      {employee.email && (
                        <span className="text-gray-600 text-sm">{employee.email}</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {(!course.employees || course.employees.length === 0) && (
            <div className="text-center py-10 px-5 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 mb-8">
              <p className="text-gray-600">Aucune inscription pour ce cours.</p>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3 p-6 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
          <button 
            className="px-5 py-2.5 bg-gray-500 text-white rounded-lg font-medium transition-all duration-300 hover:bg-gray-600"
            onClick={onClose}
          >
            Fermer
          </button>
          {onEdit && (
            <button 
              className="px-5 py-2.5 bg-blue-500 text-white rounded-lg font-medium transition-all duration-300 hover:bg-blue-600 hover:shadow-md"
              onClick={() => onEdit(course)}
            >
              Modifier
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
