import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome to LMS Dashboard</h1>
        <button onClick={handleLogout} className="logout-btn">
          Logout
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="user-info">
          <h3>User Information</h3>
          <p><strong>Email:</strong> {user?.email}</p>
          <p><strong>Status:</strong> Logged in</p>
        </div>
        
        <div className="dashboard-section">
          <h3>Quick Actions</h3>
          <p>Welcome to the Learning Management System! This is where you would access your courses, assignments, and other educational content.</p>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
