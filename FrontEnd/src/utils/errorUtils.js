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
    error.code === 'ERR_NETWORK' ||
    error.message === 'Network Error' ||
    error.message?.includes('fetch') ||
    error.message?.includes('Network') ||
    !error.response ||
    (error.response?.status >= 500) ||
    error.name === 'TypeError' ||
    error.errno === 'ECONNREFUSED'
  );
};

export const getMockData = (type = 'affectations') => {
  const mockData = {
    affectations: [
      {
        id: 1,
        dateAssigned: new Date().toISOString().split('T')[0],
        assigneCours: true,
        user: { 
          id: 1, 
          firstName: 'John', 
          lastName: 'Doe',
          email: 'john.doe@example.com',
          fullName: 'John Doe'
        },
        cours: { 
          id: 1, 
          title: 'Formation JavaScript Avancé',
          description: 'Cours complet sur JavaScript ES6+ et les frameworks modernes'
        }
      },
      {
        id: 2,
        dateAssigned: new Date(Date.now() - 86400000).toISOString().split('T')[0],
        assigneCours: false,
        user: { 
          id: 2, 
          firstName: 'Jane', 
          lastName: 'Smith',
          email: 'jane.smith@example.com',
          fullName: 'Jane Smith'
        },
        cours: { 
          id: 2, 
          title: 'Formation React.js',
          description: 'Développement d\'applications web avec React'
        }
      },
      {
        id: 3,
        dateAssigned: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
        assigneCours: true,
        user: { 
          id: 3, 
          firstName: 'Alice', 
          lastName: 'Martin',
          email: 'alice.martin@example.com',
          fullName: 'Alice Martin'
        },
        cours: { 
          id: 3, 
          title: 'Introduction au développement Web',
          description: 'Bases du développement web : HTML, CSS, JavaScript'
        }
      },
      {
        id: 4,
        dateAssigned: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
        assigneCours: true,
        user: { 
          id: 4, 
          firstName: 'Bob', 
          lastName: 'Wilson',
          email: 'bob.wilson@example.com',
          fullName: 'Bob Wilson'
        },
        cours: { 
          id: 4, 
          title: 'Base de données MySQL',
          description: 'Conception et gestion de bases de données relationnelles'
        }
      },
      {
        id: 5,
        dateAssigned: new Date(Date.now() - 5 * 86400000).toISOString().split('T')[0],
        assigneCours: false,
        user: { 
          id: 5, 
          firstName: 'Carol', 
          lastName: 'Brown',
          email: 'carol.brown@example.com',
          fullName: 'Carol Brown'
        },
        cours: { 
          id: 5, 
          title: 'Symfony Framework',
          description: 'Développement d\'API avec Symfony et Doctrine'
        }
      }
    ],
    courses: [
      {
        id: 1,
        title: 'Formation JavaScript Avancé',
        description: 'Cours complet sur JavaScript ES6+ et les frameworks modernes'
      },
      {
        id: 2,
        title: 'Formation React.js',
        description: 'Développement d\'applications web avec React'
      },
      {
        id: 3,
        title: 'Introduction au développement Web',
        description: 'Bases du développement web : HTML, CSS, JavaScript'
      }
    ],
    employees: [
      {
        id: 1,
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        fullName: 'John Doe'
      },
      {
        id: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        email: 'jane.smith@example.com',
        fullName: 'Jane Smith'
      },
      {
        id: 3,
        firstName: 'Alice',
        lastName: 'Martin',
        email: 'alice.martin@example.com',
        fullName: 'Alice Martin'
      }
    ]
  };
  
  return mockData[type] || [];
};
