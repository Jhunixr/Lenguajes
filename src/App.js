import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import Profile from './components/Profile';
import Reports from './components/Reports';
import './App.css';

const AppContent = () => {
  const { currentUser } = useApp();
  const [authView, setAuthView] = useState('login');
  const [currentView, setCurrentView] = useState('home');

  if (!currentUser) {
    return (
      <div className="app-container">
        <Navbar isAuthenticated={false} />
        {authView === 'login' ? (
          <Login onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <Register onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="app-container">
      <Navbar 
        isAuthenticated={true}
        onNavigate={setCurrentView}
        currentView={currentView}
      />
      <div className="main-content-wrapper">
        {currentView === 'home' && <Home />}
        {currentView === 'profile' && <Profile />}
        {currentView === 'reports' && <Reports />}
      </div>
    </div>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;


