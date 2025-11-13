import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import EditProfileModal from './EditProfileModal';
import './Profile.css';

const Profile = () => {
  const { currentUser } = useApp();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  if (!currentUser) {
    return <div>Cargando...</div>;
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificada';
    
    // Parsear la fecha directamente sin considerar zona horaria
    // Formato esperado: YYYY-MM-DD
    const parts = dateString.split('-');
    if (parts.length === 3) {
      const year = parseInt(parts[0], 10);
      const month = parseInt(parts[1], 10) - 1; // Los meses en JS son 0-indexed
      const day = parseInt(parts[2], 10);
      
      // Crear fecha en hora local sin considerar UTC
      const date = new Date(year, month, day);
      
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    
    // Fallback si el formato no es el esperado
    return dateString;
  };

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar">
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <h1>{currentUser.name}</h1>
        <p>{currentUser.email}</p>
      </div>

      <div className="profile-info">
        <h2>Información Personal</h2>
        <div className="info-row">
          <div className="info-label">Teléfono:</div>
          <div className="info-value">{currentUser.phone || 'No especificado'}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Fecha de Nacimiento:</div>
          <div className="info-value">{formatDate(currentUser.birthdate)}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Género:</div>
          <div className="info-value">{currentUser.gender || 'No especificado'}</div>
        </div>
        <div className="info-row">
          <div className="info-label">Alergias:</div>
          <div className="info-value">
            {currentUser.allergies && currentUser.allergies.trim()
              ? currentUser.allergies
              : 'Ninguna'}
          </div>
        </div>
        <button
          className="edit-profile-btn"
          onClick={() => setIsEditModalOpen(true)}
        >
          Editar Perfil
        </button>
      </div>

      {isEditModalOpen && (
        <EditProfileModal
          user={currentUser}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Profile;

