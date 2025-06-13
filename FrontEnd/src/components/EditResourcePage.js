import React, { useState, useEffect, useCallback } from 'react';
import { ressourceService } from '../services/ressourceService';
import Navbar from './Navbar';
import EditVideoResource from './EditVideoResource';

const EditResourcePage = ({ match }) => {
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const resourceId = match?.params?.id;

  const fetchResource = useCallback(async () => {
    try {
      setLoading(true);
      const resourceData = await ressourceService.getRessourceById(resourceId);
      setResource(resourceData);
      setError(null);
    } catch (err) {
      setError('Erreur lors du chargement de la ressource');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
    }
  }, [resourceId]);

  useEffect(() => {
    if (resourceId) {
      fetchResource();
    }
  }, [resourceId, fetchResource]);

  const handleResourceUpdated = (updatedResource) => {
    setResource(updatedResource);
    setSuccessMessage(`Ressource mise à jour avec succès!`);
    
    // Masquer le message après 5 secondes
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 rounded-full border-4 border-t-orange-600 border-orange-100 animate-spin"></div>
              <div className="absolute inset-3 rounded-full bg-gradient-to-r from-orange-600 to-blue-600 animate-pulse"></div>
            </div>
            <p className="mt-4 text-orange-600 font-medium animate-pulse">Chargement de la ressource...</p>
          </div>
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 md:p-8 pt-20">
          <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-lg text-center">
            <svg className="w-12 h-12 mx-auto mb-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            <h2 className="text-xl font-semibold mb-2">Erreur</h2>
            <p>{error}</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 md:p-8 pt-20">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 mb-8 shadow-xl shadow-blue-500/5 border border-white/20 relative overflow-hidden">
          <div className="absolute -left-40 -top-40 w-80 h-80 bg-orange-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-orange-600 to-blue-600 bg-clip-text text-transparent">
              Modifier la Ressource Vidéo
            </h1>
            <p className="text-gray-500 mt-2">
              Modifiez les détails de votre ressource vidéo
            </p>
            
            {resource && (
              <div className="mt-4 flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 4V2a1 1 0 011-1h4a1 1 0 011 1v2h4a1 1 0 011 1v1H3V5a1 1 0 011-1h3zM3 7h14l-1 10H4L3 7z"></path>
                  </svg>
                  ID: {resource.id}
                </span>
                <span className="flex items-center">
                  <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path>
                  </svg>
                  Cours: {resource.course?.title}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Message de succès */}
        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 p-4 rounded-lg mb-6 flex items-center animate-fade-in">
            <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            {successMessage}
          </div>
        )}

        {/* Informations actuelles */}
        {resource && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mb-6 shadow-lg shadow-blue-500/5 border border-white/20">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Informations Actuelles</h2>
            
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cours Associé</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="font-medium text-gray-900">{resource.course?.title}</div>
                  <div className="text-sm text-gray-500">ID: {resource.course?.id}</div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">URL de la Ressource Vidéo</label>
                <div className="p-3 bg-gray-50 rounded-lg">
                  <div className="text-sm text-gray-900 break-all">{resource.contenu}</div>
                  <a 
                    href={resource.contenu} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 underline text-sm mt-1 inline-block"
                  >
                    Ouvrir la vidéo
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Formulaire d'édition */}
        <EditVideoResource
          resourceId={resourceId}
          onResourceUpdated={handleResourceUpdated}
        />
      </div>

      <style jsx>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
      `}</style>
    </>
  );
};

export default EditResourcePage;
