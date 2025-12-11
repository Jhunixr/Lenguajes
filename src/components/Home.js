import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import AppointmentModal from './AppointmentModal';
import SelfConsultationModal from './SelfConsultationModal';
import './Home.css';

const SPECIALIZATIONS = [
  {
    id: 1,
    name: 'Medicina General',
    icon: '👨‍⚕️',
    description: 'Atención médica integral para toda la familia. Primera consulta para evaluación general y derivación a especialidades si es necesario.'
  },
  {
    id: 2,
    name: 'Obstetricia',
    icon: '🤰',
    description: 'Atención especializada en embarazo, parto y cuidados prenatales. Seguimiento completo de la gestación.'
  },
  {
    id: 3,
    name: 'Nutrición',
    icon: '🥗',
    description: 'Planes alimenticios personalizados, asesoramiento nutricional y seguimiento de dietas especiales.'
  },
  {
    id: 4,
    name: 'Odontología',
    icon: '🦷',
    description: 'Cuidado dental completo, limpiezas, tratamientos y prevención de enfermedades bucales.'
  },
  {
    id: 5,
    name: 'Cardiología',
    icon: '❤️',
    description: 'Especialistas en salud cardiovascular, prevención y tratamiento de enfermedades del corazón.'
  }
];

const Home = () => {
  const { getUserAppointments, cancelAppointment } = useApp();
  const [selectedSpecialty, setSelectedSpecialty] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSelfConsultationOpen, setIsSelfConsultationOpen] = useState(false);
  const [userAppointments, setUserAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  useEffect(() => {
    const loadAppointments = async () => {
      try {
        const appointments = await getUserAppointments();
        setUserAppointments(appointments || []);
      } catch (error) {
        console.error('Error cargando citas:', error);
        setUserAppointments([]);
      } finally {
        setLoading(false);
      }
    };

    loadAppointments();
  }, [getUserAppointments, isModalOpen, cancellingId]);

  const handleOpenModal = (specialty) => {
    setSelectedSpecialty(specialty);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedSpecialty(null);
  };

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm('¿Estás seguro de que deseas cancelar esta cita? El horario quedará disponible para otros pacientes.')) {
      return;
    }

    setCancellingId(appointmentId);
    try {
      await cancelAppointment(appointmentId);
      // Recargar las citas
      const appointments = await getUserAppointments();
      setUserAppointments(appointments || []);
    } catch (error) {
      alert('Error al cancelar la cita: ' + error.message);
    } finally {
      setCancellingId(null);
    }
  };

  const getNextAppointment = () => {
    if (!userAppointments || userAppointments.length === 0) return null;

    const now = new Date();
    let next = null;

    userAppointments.forEach(apt => {
      const dateTime = new Date(`${apt.date} ${apt.time}`);
      if (!isNaN(dateTime.getTime()) && dateTime >= now) {
        if (!next || dateTime < new Date(`${next.date} ${next.time}`)) {
          next = apt;
        }
      }
    });

    return next;
  };

  const nextAppointment = getNextAppointment();

  const getAppointmentStatus = (apt) => {
    if (!apt || !apt.date || !apt.time) return '';

    const now = new Date();
    const dateTime = new Date(`${apt.date} ${apt.time}`);
    if (isNaN(dateTime.getTime())) return '';

    const todayStr = now.toISOString().slice(0, 10);
    const aptDateStr = new Date(apt.date).toISOString().slice(0, 10);

    if (dateTime < now) {
      return 'Pasada';
    }

    if (aptDateStr === todayStr) {
      return 'Hoy';
    }

    return 'Próxima';
  };

  return (
    <div className="home-container">
      <div className="hero-section">
        <div className="hero-badge">Sistema médico · Proyecto académico</div>
        <h1>Bienvenido a MediCare</h1>
        <p>Sistema integral de gestión de citas médicas</p>
        <div className="hero-actions">
          <button 
            className="hero-btn primary"
            onClick={() => setIsSelfConsultationOpen(true)}
          >
            🔍 Autoconsulta Rápida
          </button>
          <p className="hero-hint">Obtén una evaluación preliminar antes de agendar tu cita</p>
          <p className="hero-legal">La autoconsulta es solo una orientación inicial y no reemplaza una valoración médica profesional.</p>
        </div>
      </div>

      <div className="specializations">
        <h2>Nuestras Especializaciones</h2>
        <div className="spec-grid">
          {SPECIALIZATIONS.map((spec) => (
            <div key={spec.id} className="spec-card">
              <div className="spec-icon">{spec.icon}</div>
              <h3>{spec.name}</h3>
              <p>{spec.description}</p>
              <button
                className="spec-btn"
                onClick={() => handleOpenModal(spec.name)}
              >
                Agendar Cita
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="appointments-section">
        <h2>Mis Citas Programadas</h2>
        {nextAppointment && (
          <div className="next-appointment-highlight">
            <h3>Próxima cita</h3>
            <p className="next-appointment-main">
              <span>📅 {nextAppointment.date}</span>
              <span>🕐 {nextAppointment.time}</span>
              <span>🏥 {nextAppointment.specialty}</span>
            </p>
            <p className="next-appointment-extra">
              Paciente: {nextAppointment.clientName || 'Paciente'} · Doctor: {nextAppointment.doctor || 'Por asignar'} · Motivo: {nextAppointment.reason}
            </p>
          </div>
        )}
        {loading ? (
          <p className="no-appointments">Cargando citas...</p>
        ) : userAppointments.length === 0 ? (
          <p className="no-appointments">No tienes citas programadas</p>
        ) : (
          <div className="appointments-list">
            {userAppointments.map((apt) => (
              <div key={apt.id} className="appointment-card">
                <div className="appointment-header">
                  <h4>{apt.specialty}</h4>
                  <span className={`appointment-status status-${getAppointmentStatus(apt).toLowerCase().replace('ó', 'o')}`}>
                    {getAppointmentStatus(apt)}
                  </span>
                  <button
                    className="cancel-btn"
                    onClick={() => handleCancelAppointment(apt.id)}
                    disabled={cancellingId === apt.id}
                    title="Cancelar cita"
                  >
                    {cancellingId === apt.id ? '⏳ Cancelando...' : '❌ Cancelar'}
                  </button>
                </div>
                <div className="appointment-info">
                  <span>📅 {apt.date}</span>
                  <span>🕐 {apt.time}</span>
                  <span>👤 {apt.clientName || 'Paciente'}</span>
                  <span>👨‍⚕️ {apt.doctor || 'Por asignar'}</span>
                  <span>📝 {apt.reason}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <AppointmentModal
          specialty={selectedSpecialty}
          onClose={handleCloseModal}
        />
      )}

      {isSelfConsultationOpen && (
        <SelfConsultationModal
          onClose={() => setIsSelfConsultationOpen(false)}
          onScheduleAppointment={(specialty) => {
            setIsSelfConsultationOpen(false);
            setSelectedSpecialty(specialty);
            setIsModalOpen(true);
          }}
        />
      )}

      <footer className="home-footer">
        <p>MediCare · Sistema Médico · Proyecto académico de Lenguajes de Programación</p>
      </footer>
    </div>
  );
};

export default Home;

