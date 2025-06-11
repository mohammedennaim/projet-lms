import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';

const Dashboard = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await dashboardService.getDashboardData();
        setDashboardData(data);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Erreur lors du chargement du dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const handleLogout = () => {
    logout();
  };

  const handleNavigateToCourses = () => {
    navigate('/courses');
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Chargement du tableau de bord...</p>
        <style jsx>{`
          .dashboard-loading {
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            background-color: #f8f9fa;
          }
          .loading-spinner {
            width: 50px;
            height: 50px;
            border: 4px solid #e3e3e3;
            border-top: 4px solid #007bff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-error">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h2>Erreur de chargement</h2>
          <p>{error}</p>
          <button onClick={() => window.location.reload()} className="retry-btn">
            Réessayer
          </button>
        </div>
        <style jsx>{`
          .dashboard-error {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background-color: #f8f9fa;
          }
          .error-container {
            text-align: center;
            padding: 40px;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          }
          .error-icon {
            font-size: 48px;
            margin-bottom: 16px;
          }
          .retry-btn {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 16px;
            margin-top: 16px;
          }
          .retry-btn:hover {
            background-color: #0056b3;
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <div className="header-content">
          <h1>Tableau de Bord Administrateur</h1>
          {user && (
            <p className="welcome-text">
              Bienvenue, {user.email} - Accès Administrateur
            </p>
          )}
        </div>
        <button onClick={handleLogout} className="logout-btn">
          Déconnexion
        </button>
      </div>

      {dashboardData && dashboardData.stats && (
        <div className="stats-section">
          <div className="stats-container">
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-content">
                <h3>{dashboardData.stats.users?.total || 0}</h3>
                <p>Utilisateurs Total</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👑</div>
              <div className="stat-content">
                <h3>{dashboardData.stats.users?.admin || 0}</h3>
                <p>Administrateurs</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">💼</div>
              <div className="stat-content">
                <h3>{dashboardData.stats.users?.employee || 0}</h3>
                <p>Employés</p>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-content">
                <h3>{dashboardData.stats.courses?.total || 0}</h3>
                <p>Cours Disponibles</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-content">
        <div className="admin-notice">
          <div className="notice-icon">🔒</div>
          <div className="notice-text">
            <h3>Accès Administrateur Vérifié</h3>
            <p>Vous avez accès à toutes les fonctionnalités d'administration basées sur votre rôle admin.</p>
          </div>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card admin-card" onClick={handleNavigateToCourses}>
            <div className="card-icon">📚</div>
            <h3>Gestion des Cours</h3>
            <p>Créer, modifier et gérer tous les cours de la plateforme</p>
            <div className="card-action">Accéder →</div>
          </div>
          
          <div className="dashboard-card admin-card">
            <div className="card-icon">👥</div>
            <h3>Gestion des Utilisateurs</h3>
            <p>Administrer les comptes utilisateurs et leurs permissions</p>
            <div className="card-action">Bientôt disponible</div>
          </div>
          
          <div className="dashboard-card admin-card">
            <div className="card-icon">📊</div>
            <h3>Rapports & Analytics</h3>
            <p>Consulter les statistiques et rapports détaillés</p>
            <div className="card-action">Bientôt disponible</div>
          </div>

          <div className="dashboard-card admin-card">
            <div className="card-icon">⚙️</div>
            <h3>Configuration Système</h3>
            <p>Paramétrer et configurer la plateforme LMS</p>
            <div className="card-action">Bientôt disponible</div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .dashboard {
          min-height: 100vh;
          background-color: #f8f9fa;
        }

        .dashboard-header {
          background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
          color: white;
          padding: 40px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .header-content h1 {
          font-size: 32px;
          font-weight: 700;
          margin: 0 0 8px 0;
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }

        .welcome-text {
          font-size: 16px;
          opacity: 0.9;
          margin: 0;
          font-weight: 500;
        }

        .logout-btn {
          background-color: rgba(255, 255, 255, 0.2);
          color: white;
          border: 2px solid rgba(255, 255, 255, 0.3);
          padding: 12px 24px;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          backdrop-filter: blur(10px);
        }

        .logout-btn:hover {
          background-color: rgba(255, 255, 255, 0.3);
          border-color: rgba(255, 255, 255, 0.5);
          transform: translateY(-2px);
        }

        .stats-section {
          padding: 40px 20px 20px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .stats-container {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .stat-card {
          background: white;
          padding: 24px;
          border-radius: 12px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          display: flex;
          align-items: center;
          gap: 16px;
          border-left: 4px solid #dc3545;
        }

        .stat-icon {
          font-size: 32px;
        }

        .stat-content h3 {
          font-size: 28px;
          font-weight: 700;
          margin: 0;
          color: #dc3545;
        }

        .stat-content p {
          font-size: 14px;
          color: #666;
          margin: 4px 0 0 0;
        }

        .dashboard-content {
          padding: 20px 20px 40px;
          max-width: 1200px;
          margin: 0 auto;
        }

        .admin-notice {
          background: linear-gradient(135deg, #28a745, #20c997);
          color: white;
          padding: 24px;
          border-radius: 12px;
          margin-bottom: 30px;
          display: flex;
          align-items: center;
          gap: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .notice-icon {
          font-size: 32px;
        }

        .notice-text h3 {
          margin: 0 0 8px 0;
          font-size: 20px;
          font-weight: 600;
        }

        .notice-text p {
          margin: 0;
          opacity: 0.9;
        }

        .dashboard-cards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 24px;
        }

        .dashboard-card {
          background: white;
          border-radius: 12px;
          padding: 32px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
          cursor: pointer;
          text-align: center;
          border: 1px solid #e9ecef;
        }

        .admin-card {
          border-left: 4px solid #dc3545;
        }

        .dashboard-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
        }

        .card-icon {
          font-size: 48px;
          margin-bottom: 16px;
        }

        .dashboard-card h3 {
          color: #333;
          font-size: 24px;
          font-weight: 600;
          margin: 0 0 12px 0;
        }

        .dashboard-card p {
          color: #666;
          font-size: 16px;
          line-height: 1.5;
          margin: 0 0 20px 0;
        }

        .card-action {
          color: #dc3545;
          font-weight: 600;
          font-size: 16px;
        }

        @media (max-width: 768px) {
          .dashboard-header {
            flex-direction: column;
            gap: 20px;
            text-align: center;
            padding: 30px 20px;
          }
          
          .header-content h1 {
            font-size: 24px;
          }
          
          .stats-container {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }
          
          .stat-card {
            padding: 16px;
            flex-direction: column;
            text-align: center;
            gap: 8px;
          }
          
          .stat-content h3 {
            font-size: 24px;
          }
          
          .admin-notice {
            flex-direction: column;
            text-align: center;
            padding: 20px;
          }
          
          .dashboard-content {
            padding: 20px;
          }
          
          .dashboard-cards {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          
          .dashboard-card {
            padding: 24px;
          }
        }
      `}</style>
    </div>
  );
};

export default Dashboard;