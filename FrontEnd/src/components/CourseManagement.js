import React, { useState, useEffect } from 'react';
import CourseList from './CourseList';
import CourseForm from './CourseForm';
import CourseDetails from './CourseDetails';
import { courseService } from '../services/courseService';

const CourseManagement = () => {
  const [view, setView] = useState('list'); // 'list', 'form', 'details'
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [notification, setNotification] = useState(null);

  // Show notification
  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4000);
  };

  // Handle creating new course
  const handleCreateCourse = () => {
    setSelectedCourse(null);
    setIsEdit(false);
    setView('form');
  };

  // Handle editing course
  const handleEditCourse = (course) => {
    setSelectedCourse(course);
    setIsEdit(true);
    setView('form');
  };

  // Handle viewing course details
  const handleViewCourse = (course) => {
    setSelectedCourse(course);
    setView('details');
  };

  // Handle course save (create or update)
  const handleCourseSave = (savedCourse) => {
    const message = isEdit 
      ? 'Cours modifié avec succès' 
      : 'Cours créé avec succès';
    
    showNotification(message, 'success');
    setView('list');
    setSelectedCourse(null);
    setRefreshTrigger(prev => prev + 1); // Trigger list refresh
  };

  // Handle course delete
  const handleCourseDelete = (courseId) => {
    showNotification('Cours supprimé avec succès', 'success');
    setRefreshTrigger(prev => prev + 1); // Trigger list refresh
  };

  // Handle cancel form
  const handleCancelForm = () => {
    setView('list');
    setSelectedCourse(null);
    setIsEdit(false);
  };

  // Handle close details
  const handleCloseDetails = () => {
    setView('list');
    setSelectedCourse(null);
  };

  // Handle edit from details view
  const handleEditFromDetails = (course) => {
    setSelectedCourse(course);
    setIsEdit(true);
    setView('form');
  };
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white py-10 px-5 flex justify-between items-center flex-wrap gap-5">
        <div>
          <h1 className="text-3xl font-bold mb-2 text-white shadow-sm">Gestion des Cours</h1>
          <p className="text-base opacity-90">Gérez et organisez les cours de votre plateforme LMS</p>
        </div>
        {view === 'list' && (
          <button 
            className="bg-white/20 text-white border-2 border-white/30 py-3 px-6 rounded-lg text-base font-semibold cursor-pointer flex items-center gap-2 transition-all duration-300 backdrop-blur-md hover:bg-white/30 hover:border-white/50 hover:-translate-y-0.5 hover:shadow-lg"
            onClick={handleCreateCourse}
          >
            <span className="text-xl font-bold">+</span>
            Nouveau cours
          </button>
        )}
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-white px-5 py-4 border-b border-gray-200 flex items-center gap-2">
        <span 
          className={`cursor-pointer font-medium transition-colors ${view === 'list' ? 'text-gray-800 cursor-default' : 'text-gray-500 hover:text-blue-600'}`}
          onClick={() => setView('list')}
        >
          Liste des cours
        </span>
        {view === 'form' && (
          <>
            <span className="text-gray-400 text-lg">›</span>
            <span className="text-gray-800 font-medium">
              {isEdit ? 'Modifier le cours' : 'Nouveau cours'}
            </span>
          </>
        )}
        {view === 'details' && (
          <>
            <span className="text-gray-400 text-lg">›</span>
            <span className="text-gray-800 font-medium">
              Détails du cours
            </span>
          </>
        )}
      </div>      {/* Notification */}
      {notification && (
        <div 
          className={`m-5 p-4 rounded-lg flex justify-between items-center shadow-md animate-[fadeInDown_0.3s_ease-out] ${
            notification.type === 'success' ? 'bg-green-100 text-green-800 border border-green-200' : 
            notification.type === 'error' ? 'bg-red-100 text-red-800 border border-red-200' :
            notification.type === 'warning' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
            'bg-blue-100 text-blue-800 border border-blue-200'
          }`}
        >
          <span className="font-medium">{notification.message}</span>
          <button 
            className="bg-transparent border-none text-current cursor-pointer text-lg p-1 rounded-full hover:bg-black/10 w-7 h-7 flex items-center justify-center transition-colors"
            onClick={() => setNotification(null)}
          >
            ✕
          </button>
        </div>
      )}      {/* Main Content */}
      <div className="p-5 max-w-[1400px] mx-auto animate-[fadeIn_0.3s_ease-out]">
        {view === 'list' && (
          <CourseList
            key={refreshTrigger} // Force re-render when refresh triggered
            onSelectCourse={handleViewCourse}
            onEditCourse={handleEditCourse}
            onDeleteCourse={handleCourseDelete}
          />
        )}

        {view === 'form' && (
          <CourseForm
            course={selectedCourse}
            isEdit={isEdit}
            onSave={handleCourseSave}
            onCancel={handleCancelForm}
          />
        )}

        {view === 'details' && selectedCourse && (
          <CourseDetails
            courseId={selectedCourse.id}
            onClose={handleCloseDetails}
            onEdit={handleEditFromDetails}
          />
        )}
      </div>
    </div>
  );
};

export default CourseManagement;
