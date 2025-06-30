import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Liste des routes restreintes par rôle
const roleRoutes = {
  'ROLE_ADMIN': ['/dashboard', '/courses', '/users', '/employees', '/affectations', '/ressources', '/statistics', '/quizzes', '/questions', '/workflow'],
  'ROLE_EMPLOYEE': ['/employee-dashboard', '/quiz', '/course', '/employee-courses', '/employee-quizzes', '/employee-resources'],
};

/**
 * Composant de garde pour rediriger les utilisateurs en fonction de leur rôle
 */
export const RoleGuard = ({ children }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const currentPath = window.location.pathname;
  
  useEffect(() => {
    if (!user || !user.role) return;

    // Normalisation du rôle pour la comparaison
    let normalizedRole = '';
    if (typeof user.role === 'string') {
      normalizedRole = user.role.toUpperCase().trim();
    } else {
      normalizedRole = JSON.stringify(user.role).toUpperCase();
    }
    
    console.log('RoleGuard checking normalized role:', normalizedRole);

    // Déterminer le rôle réel
    let userRoleKey = '';
    if (normalizedRole.includes('ROLE_ADMIN')) {
      userRoleKey = 'ROLE_ADMIN';
    } else if (normalizedRole.includes('ROLE_EMPLOYEE')) {
      userRoleKey = 'ROLE_EMPLOYEE';
    }
    
    console.log('Determined role key:', userRoleKey);

    // Vérifier si la page actuelle est autorisée pour ce rôle
    const allowedPaths = roleRoutes[userRoleKey] || [];
    const isAllowed = allowedPaths.some(path => currentPath.startsWith(path));

    // Si l'utilisateur n'a pas accès à cette page, le rediriger vers sa page d'accueil
    if (!isAllowed) {
      const homePath = userRoleKey === 'ROLE_ADMIN' ? '/dashboard' : '/employee-dashboard';
      console.log('User not allowed on this path. Redirecting to:', homePath);
      navigate(homePath);
    }
  }, [user, currentPath, navigate]);

  return children;
};

export const getHomePageForRole = (role) => {
  console.log('Role received:', role); // Ajouter un log pour vérifier le rôle exact reçu
  
  // Gestion de role qui pourrait être un objet ou une chaîne
  let roleStr = '';
  if (typeof role === 'object' && role !== null) {
    console.log('Role is an object:', role);
    roleStr = JSON.stringify(role);
  } else {
    roleStr = String(role || '');
  }
  
  // Conversion en majuscules et trim pour plus de robustesse
  const normalizedRole = roleStr.toUpperCase().trim();
  console.log('Normalized role:', normalizedRole);
  
  // Vérifier si le rôle contient les chaînes spécifiques
  if (normalizedRole.includes('ROLE_ADMIN')) {
    return '/dashboard';
  } else if (normalizedRole.includes('ROLE_EMPLOYEE')) {
    return '/employee-dashboard';
  } else {
    console.log('Default case triggered for role:', role);
    return '/login';
  }
};
