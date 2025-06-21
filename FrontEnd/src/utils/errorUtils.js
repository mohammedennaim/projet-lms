// Utilitaires pour gérer les erreurs d'authentification globalement

export const triggerAuthError = (errorType, message) => {
  const event = new CustomEvent('authError', {
    detail: {
      [errorType]: true,
      message: message
    }
  });
  window.dispatchEvent(event);
};

export const handleApiError = (error, fallbackMessage = 'Erreur lors de la requête') => {
  console.error('API Error:', error);
  
  if (error.response?.status === 401) {
    triggerAuthError('requiresAuth', 'Votre session a expiré. Veuillez vous reconnecter.');
    return {
      success: false,
      error: 'Session expirée',
      requiresAuth: true
    };
  }
  
  if (error.response?.status === 403) {
    triggerAuthError('forbidden', 'Vous n\'avez pas les permissions nécessaires.');
    return {
      success: false,
      error: 'Accès refusé',
      forbidden: true
    };
  }
  
  if (error.response?.status === 404) {
    return {
      success: false,
      notFound: true
    };
  }
  
  return {
    success: false,
    error: error.response?.data?.message || error.message || fallbackMessage
  };
};

export const isNetworkError = (error) => {
  return (
    error.code === 'NETWORK_ERROR' ||
    error.code === 'ECONNREFUSED' ||
    !error.response ||
    (error.response?.status >= 500)
  );
};

export const getMockData = (type = 'affectations') => {
  const mockData = {
    affectations: [
      {
        id: 1,
        dateAssigned: new Date().toISOString().split('T')[0],
        assigneCours: true,
        user: { id: 1, firstName: 'John', lastName: 'Doe' },
        cours: { id: 1, title: 'Cours de démonstration' }
      },
      {
        id: 2,
        dateAssigned: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        assigneCours: false,
        user: { id: 2, firstName: 'Jane', lastName: 'Smith' },
        cours: { id: 2, title: 'Formation avancée' }
      },
      {
        id: 3,
        dateAssigned: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        assigneCours: true,
        user: { id: 3, firstName: 'Alice', lastName: 'Martin' },
        cours: { id: 3, title: 'Introduction au développement' }
      }
    ]
  };
  
  return mockData[type] || [];
};
