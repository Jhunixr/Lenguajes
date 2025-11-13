import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './Modal.css';

const AppointmentModal = ({ specialty, onClose }) => {
  const { scheduleAppointment, isSlotBooked, DEFAULT_SLOTS, currentUser } = useApp();
  const [formData, setFormData] = useState({
    date: '',
    time: '',
    clientName: currentUser?.name || '',
    reason: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [availableSlots, setAvailableSlots] = useState([]);

  useEffect(() => {
    const today = new Date().toISOString().split('T')[0];
    setFormData(prev => ({ 
      ...prev, 
      date: today,
      clientName: currentUser?.name || prev.clientName || ''
    }));
  }, [currentUser]);

  useEffect(() => {
    const checkSlots = async () => {
      if (formData.date) {
        const slotsPromises = DEFAULT_SLOTS.map(async (time) => ({
          time,
          booked: await isSlotBooked(specialty, formData.date, time)
        }));
        const slots = await Promise.all(slotsPromises);
        setAvailableSlots(slots);
        
        // Resetear el tiempo seleccionado si cambia la fecha
        if (formData.time) {
          const isBooked = await isSlotBooked(specialty, formData.date, formData.time);
          if (isBooked) {
            setFormData(prev => ({ ...prev, time: '' }));
          }
        }
      }
    };

    checkSlots();
  }, [formData.date, specialty, isSlotBooked, DEFAULT_SLOTS, formData.time]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSlotSelect = async (time) => {
    const booked = await isSlotBooked(specialty, formData.date, time);
    if (!booked) {
      setFormData({ ...formData, time });
      setError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (!formData.time) {
        throw new Error('Seleccione un horario disponible');
      }

      const booked = await isSlotBooked(specialty, formData.date, formData.time);
      if (booked) {
        throw new Error('El horario ya fue reservado. Elija otro.');
      }

      await scheduleAppointment({
        specialty,
        date: formData.date,
        time: formData.time,
        clientName: formData.clientName.trim(),
        reason: formData.reason.trim()
      });

      setSuccess(true);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const minDate = new Date().toISOString().split('T')[0];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <span className="close-modal" onClick={onClose}>&times;</span>
        <h2>Agendar Cita</h2>
        
        {error && <div className="alert alert-error">{error}</div>}
        {success && <div className="alert alert-success">Cita agendada exitosamente!</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Especialidad</label>
            <input type="text" value={specialty} readOnly className="readonly-input" />
          </div>

          <div className="form-group">
            <label htmlFor="date">Fecha</label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              min={minDate}
              required
            />
          </div>

          <div className="form-group">
            <label>Horarios disponibles</label>
            <div className="slots-container">
              {availableSlots.map((slot, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`slot-btn ${slot.booked ? 'booked' : ''} ${
                    formData.time === slot.time ? 'selected' : ''
                  }`}
                  onClick={() => handleSlotSelect(slot.time)}
                  disabled={slot.booked}
                >
                  {slot.time} {slot.booked && '(Ocupado)'}
                </button>
              ))}
            </div>
            <small className="form-hint">
              Cada día tiene 5 horarios predefinidos; si un horario está reservado se mostrará como ocupado.
            </small>
          </div>

          <div className="form-group">
            <label htmlFor="clientName">Nombre del paciente</label>
            <input
              type="text"
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              required
              placeholder="Nombre del paciente"
            />
          </div>

          <div className="form-group">
            <label htmlFor="reason">Motivo de la Consulta</label>
            <textarea
              id="reason"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              rows="4"
              placeholder="Describa el motivo de la consulta"
            />
          </div>

          <button type="submit" className="btn-full" disabled={loading || success}>
            {loading ? 'Agendando...' : success ? '¡Cita Agendada!' : 'Confirmar Cita'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AppointmentModal;

