import React, { useState } from 'react';
import Navbar from './Navbar';
import AddVideoResource from './AddVideoResource';

const AddResourcePage = () => {
  const [ressources, setRessources] = useState([]);
  const [successMessage, setSuccessMessage] = useState('');

  const handleResourceAdded = (newResource) => {
    setRessources(prev => [...prev, newResource]);
    setSuccessMessage(`Ressource vidéo ajoutée avec succès pour le cours "${newResource.course?.title}"`);
    
    // Masquer le message après 5 secondes
    setTimeout(() => {
      setSuccessMessage('');
    }, 5000);
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 p-6 md:p-8 pt-20">
        {/* Header */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 md:p-8 mb-8 shadow-xl shadow-blue-500/5 border border-white/20 relative overflow-hidden">
          <div className="absolute -left-40 -top-40 w-80 h-80 bg-green-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -right-20 -bottom-20 w-60 h-60 bg-blue-200 rounded-full opacity-20 blur-3xl"></div>
          
          <div className="relative">
            <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              Ajouter une Ressource Vidéo
            </h1>
            <p className="text-gray-500 mt-2">
              Ajoutez facilement des URLs de vidéo à vos cours
            </p>
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

        {/* Formulaire d'ajout */}
        <AddVideoResource
          onResourceAdded={handleResourceAdded}
        />

        {/* Ressources récemment ajoutées */}
        {ressources.length > 0 && (
          <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mt-8 shadow-lg shadow-blue-500/5 border border-white/20">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Ressources ajoutées récemment
            </h2>
            
            <div className="space-y-3">
              {ressources.slice(-5).reverse().map((ressource, index) => (
                <div key={ressource.id || index} className="flex items-center justify-between p-4 bg-white/50 rounded-lg border border-gray-100">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div>
                        <div className="font-medium text-gray-900">
                          {ressource.course?.title}
                        </div>
                        <div className="text-sm text-gray-500 truncate max-w-md">
                          {ressource.contenu}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <a
                    href={ressource.contenu}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm underline flex items-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
                    </svg>
                    Voir
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Guide d'utilisation */}
        <div className="bg-white/70 backdrop-blur-xl rounded-2xl p-6 mt-8 shadow-lg shadow-blue-500/5 border border-white/20">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Guide d'utilisation
          </h2>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Types d'URLs supportées</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  YouTube (https://www.youtube.com/watch?v=...)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Vimeo (https://vimeo.com/...)
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Liens directs MP4, WebM, etc.
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
                  Autres plateformes vidéo
                </li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-900 mb-2">Conseils</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Vérifiez que l'URL est accessible publiquement
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Utilisez des URLs HTTPS quand possible
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Testez la vidéo avant de l'ajouter
                </li>
                <li className="flex items-center">
                  <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                  Organisez par cours pour faciliter la gestion
                </li>
              </ul>
            </div>
          </div>
        </div>
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

export default AddResourcePage;
