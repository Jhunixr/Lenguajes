import React from 'react';
import { useApp } from '../context/AppContext';
import './Navbar.css';

const Navbar = ({ isAuthenticated, onNavigate, currentView }) => {
  const { logout } = useApp();

  const handleLogout = () => {
    logout();
  };

  if (!isAuthenticated) {
    return (
      <nav className="navbar">
        <div className="navbar-container">
          <div className="logo">🏥 MediCare</div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <div className="logo">🏥 MediCare</div>
        <div className="nav-links">
          <button
            className={`nav-btn ${currentView === 'home' ? 'active' : 'btn-secondary'}`}
            onClick={() => onNavigate('home')}
          >
            Inicio
          </button>
          <button
            className={`nav-btn ${currentView === 'profile' ? 'active' : 'btn-secondary'}`}
            onClick={() => onNavigate('profile')}
          >
            Mi Perfil
          </button>
          <button
            className={`nav-btn ${currentView === 'reports' ? 'active' : 'btn-secondary'}`}
            onClick={() => onNavigate('reports')}
          >
            Reportes
          </button>
          <button className="nav-btn btn-primary" onClick={handleLogout}>
            Cerrar Sesión
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;


