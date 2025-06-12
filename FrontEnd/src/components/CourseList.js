import React, { useState, useEffect } from 'react';
import { courseService } from '../services/courseService';

const CourseList = ({ onSelectCourse, onEditCourse, onDeleteCourse }) => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCourses, setFilteredCourses] = useState([]);

  // Fetch courses on component mount
  useEffect(() => {
    fetchCourses();
  }, []);

  // Filter courses based on search term
  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredCourses(courses);
    } else {
      const filtered = courses.filter(course =>
        course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredCourses(filtered);
    }
  }, [courses, searchTerm]);
  const fetchCourses = async () => {
    try {
      setLoading(true);
      const coursesData = await courseService.getAllCourses();
      setCourses(coursesData);
      setError('');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (courseId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce cours ?')) {
      try {
        await courseService.deleteCourse(courseId);
        setCourses(courses.filter(course => course.id !== courseId));
        if (onDeleteCourse) onDeleteCourse(courseId);
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto p-5">
        <div className="flex flex-col items-center justify-center py-16">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-500 rounded-full animate-spin mb-5"></div>
          <p className="text-gray-600">Chargement des cours...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="max-w-7xl mx-auto p-5">
      <div className="flex justify-between items-center mb-8 flex-wrap gap-5">
        <h2 className="text-3xl font-semibold text-gray-800 m-0">Liste des Cours</h2>
        <div className="flex-1 max-w-md">
          <input
            type="text"
            placeholder="Rechercher un cours..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-3 px-4 border-2 border-gray-200 rounded-lg text-base transition-all duration-300 focus:outline-none focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
          />
        </div>
      </div>

      {error && <div className="bg-red-50 text-red-700 p-4 rounded-lg mb-6 border border-red-200">{error}</div>}

      {filteredCourses.length === 0 ? (
        <div className="text-center py-16 px-5 text-gray-600 text-lg">
          <p>Aucun cours trouvé.</p>
        </div>
      ) : (        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course) => (
            <div key={course.id} className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border border-gray-100">
              <div className="flex justify-between items-start mb-4">
                <h3 
                  className="text-xl font-medium text-gray-800 hover:text-blue-600 cursor-pointer transition-colors duration-300 flex-1 mr-4"
                  onClick={() => onSelectCourse && onSelectCourse(course)}
                >
                  {course.title}
                </h3>
                <div className="flex gap-2">
                  <button
                    className="bg-transparent border-none text-lg p-2 rounded-md hover:bg-blue-50 transition-colors duration-300"
                    onClick={() => onEditCourse && onEditCourse(course)}
                    title="Modifier"
                  >
                    ✏️
                  </button>
                  <button
                    className="bg-transparent border-none text-lg p-2 rounded-md hover:bg-red-50 transition-colors duration-300"
                    onClick={() => handleDelete(course.id)}
                    title="Supprimer"
                  >
                    🗑️
                  </button>
                </div>
              </div>
              
              <div className="mb-5">
                <p className="text-gray-600 line-clamp-3 text-sm leading-relaxed">{course.description}</p>
              </div>
              
              <div className="flex justify-between items-end pt-4 border-t border-gray-100 mt-auto">
                <div className="flex flex-col gap-1">
                  <small className="text-gray-500 text-xs">Créé le {formatDate(course.createdAt)}</small>
                  {course.updatedAt !== course.createdAt && (
                    <small className="text-gray-500 text-xs">Modifié le {formatDate(course.updatedAt)}</small>
                  )}
                </div>
                
                {course.employees && course.employees.length > 0 && (
                  <div>
                    <span className="bg-blue-500 text-white text-xs font-medium py-1 px-3 rounded-full">
                      {course.employees.length} inscription(s)
                    </span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CourseList;
