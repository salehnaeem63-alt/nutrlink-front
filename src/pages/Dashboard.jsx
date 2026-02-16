import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    // You can decode the token to get user info
    // For now, we'll just show a basic dashboard
    const token = localStorage.getItem('authToken');
    if (token) {
      // Here you could fetch user data from your API
      setUser({ name: 'User' });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/login');
  };

  return (
    <div className="dashboard-page">
      <nav className="dashboard-navbar">
        <div className="navbar-content">
          <div className="brand">
            <div className="brand-icon">N</div>
            <span className="brand-name">NutriPlan</span>
          </div>
          
          <div className="nav-right">
            <span className="user-greeting">Welcome back!</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="dashboard-content">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Welcome to your NutriPlan dashboard</p>
        </div>

        <div className="dashboard-cards">
          <div className="dashboard-card">
            <div className="card-icon">📊</div>
            <h3>My Plans</h3>
            <p>View and manage your nutrition plans</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">🍎</div>
            <h3>Meals</h3>
            <p>Track your daily meals</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">📈</div>
            <h3>Progress</h3>
            <p>Monitor your health progress</p>
          </div>

          <div className="dashboard-card">
            <div className="card-icon">⚙️</div>
            <h3>Settings</h3>
            <p>Manage your account settings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;