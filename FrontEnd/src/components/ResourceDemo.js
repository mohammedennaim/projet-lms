import React, { useState } from 'react';
import AddVideoResource from './AddVideoResource';
import EditVideoResource from './EditVideoResource';
import RessourceManagement from './RessourceManagement';
import Navbar from './Navbar';

const ResourceDemo = () => {
  const [currentView, setCurrentView] = useState('management');
  const [editResourceId, setEditResourceId] = useState(null);

  const handleResourceAdded = (newResource) => {
    console.log('Nouvelle ressource ajoutée:', newResource);
    // Vous pouvez actualiser les données ou faire d'autres actions
  };

  const handleResourceUpdated = (updatedResource) => {
    console.log('Ressource mise à jour:', updatedResource);
    setEditResourceId(null);
    setCurrentView('management');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'add':
        return (
          <AddVideoResource
            onResourceAdded={handleResourceAdded}
            onCancel={() => setCurrentView('management')}
          />
        );
        
      case 'edit':
        return editResourceId ? (
          <EditVideoResource
            resourceId={editResourceId}
            onResourceUpdated={handleResourceUpdated}
            onCancel={() => {
              setEditResourceId(null);
              setCurrentView('management');
            }}
          />
        ) : (
          <div className="bg-red-50 text-red-700 p-4 rounded-lg">
            Aucune ressource sélectionnée pour l'édition
          </div>
        );
        
      case 'management':
      default:
        return <RessourceManagement />;
    }
  };

  if (currentView === 'management') {
    return renderCurrentView();
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 md:p-8 pt-20">
        {/* Navigation */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-4 mb-8 shadow-lg shadow-blue-500/5 border border-white/20">
          <div className="flex flex-wrap gap-3">
            <button
              onClick={() => setCurrentView('management')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                currentView === 'management'
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Gestion des Ressources
            </button>
            <button
              onClick={() => setCurrentView('add')}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                currentView === 'add'
                  ? 'bg-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Ajouter une Ressource
            </button>
            <div className="flex items-center space-x-2">
              <input
                type="number"
                placeholder="ID de la ressource"
                value={editResourceId || ''}
                onChange={(e) => setEditResourceId(e.target.value ? parseInt(e.target.value) : null)}
                className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-orange-500/50"
              />
              <button
                onClick={() => editResourceId && setCurrentView('edit')}
                disabled={!editResourceId}
                className={`px-4 py-2 rounded-lg font-medium transition-all duration-300 ${
                  currentView === 'edit' && editResourceId
                    ? 'bg-orange-600 text-white shadow-lg'
                    : editResourceId
                      ? 'bg-white text-gray-700 hover:bg-gray-50'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                Modifier Ressource
              </button>
            </div>
          </div>
        </div>

        {/* Vue actuelle */}
        {renderCurrentView()}
      </div>
    </>
  );
};

export default ResourceDemo;
