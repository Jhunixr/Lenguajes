import React, { useState, useEffect, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import './Reports.css';

const DOCTOR_SPECIALTIES = [
  'Medicina General',
  'Obstetricia',
  'Nutrición',
  'Odontología',
  'Cardiología'
];

const Reports = () => {
  const { getAllAppointments, getAllUsers, getAllDoctors, createDoctor, deleteDoctor } = useApp();
  const [allAppointments, setAllAppointments] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedSpecialty, setSelectedSpecialty] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [doctors, setDoctors] = useState([]);
  const [doctorForm, setDoctorForm] = useState({ name: '', specialty: '', shift: '', available_slots: '' });
  const [doctorLoading, setDoctorLoading] = useState(false);
  const [doctorError, setDoctorError] = useState('');

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appointments, usersData, doctorsData] = await Promise.all([
          getAllAppointments(),
          getAllUsers(),
          getAllDoctors()
        ]);
        setAllAppointments(appointments || []);
        setUsers(usersData || {});
        setDoctors(doctorsData || []);
      } catch (error) {
        console.error('Error cargando reportes:', error);
        setAllAppointments([]);
        setUsers({});
        setDoctors([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getAllAppointments, getAllUsers, getAllDoctors]);

  const specialties = useMemo(() => {
    const set = new Set(allAppointments.map(a => a.specialty).filter(Boolean));
    return Array.from(set).sort();
  }, [allAppointments]);

  const filteredAppointments = useMemo(() => {
    return allAppointments.filter(apt => {
      if (selectedSpecialty && apt.specialty !== selectedSpecialty) return false;
      if (dateFrom && apt.date < dateFrom) return false;
      if (dateTo && apt.date > dateTo) return false;
      return true;
    });
  }, [allAppointments, selectedSpecialty, dateFrom, dateTo]);

  const computeStats = (appointments) => {
    const total = appointments.length;
    const uniquePatients = new Set(appointments.map(a => a.userEmail)).size;
    const uniqueSpecialties = new Set(appointments.map(a => a.specialty)).size;

    let topSpecialty = '-';
    let topSpecialtyCount = 0;
    const specialtyCounts = {};

    let topDay = '-';
    let topDayCount = 0;
    const dayCounts = {};

    appointments.forEach(a => {
      if (a.specialty) {
        specialtyCounts[a.specialty] = (specialtyCounts[a.specialty] || 0) + 1;
        if (specialtyCounts[a.specialty] > topSpecialtyCount) {
          topSpecialtyCount = specialtyCounts[a.specialty];
          topSpecialty = a.specialty;
        }
      }

      if (a.date) {
        dayCounts[a.date] = (dayCounts[a.date] || 0) + 1;
        if (dayCounts[a.date] > topDayCount) {
          topDayCount = dayCounts[a.date];
          topDay = a.date;
        }
      }
    });

    return {
      total,
      uniquePatients,
      uniqueSpecialties,
      topSpecialty,
      topDay
    };
  };

  const stats = useMemo(() => computeStats(filteredAppointments), [filteredAppointments]);

  const getAppointmentStatus = (apt) => {
    try {
      const aptDateTime = new Date(`${apt.date} ${apt.time}`);
      const now = new Date();
      if (isNaN(aptDateTime.getTime())) return 'Desconocido';
      return aptDateTime >= now ? 'Próxima' : 'Pasada';
    } catch {
      return 'Desconocido';
    }
  };

  const exportCSV = () => {
    if (filteredAppointments.length === 0) {
      alert('No hay datos para exportar con los filtros actuales');
      return;
    }

    const header = ['Paciente', 'Email', 'Especialidad', 'Doctor', 'Fecha', 'Hora', 'Estado', 'Motivo'];
    const lines = [header.join(',')];

    filteredAppointments.forEach(apt => {
      const status = getAppointmentStatus(apt);
      const row = [
        `"${(apt.clientName || users[apt.userEmail]?.name || '').replace(/"/g, '""')}"`,
        `"${(apt.userEmail || '').replace(/"/g, '""')}"`,
        `"${(apt.specialty || '').replace(/"/g, '""')}"`,
        `"${(apt.doctor || '').replace(/"/g, '""')}"`,
        `"${apt.date}"`,
        `"${apt.time}"`,
        `"${status}"`,
        `"${(apt.reason || '').replace(/"/g, '""')}"`
      ];
      lines.push(row.join(','));
    });

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `panel_admin_citas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDoctorInputChange = (e) => {
    setDoctorForm({
      ...doctorForm,
      [e.target.name]: e.target.value
    });
    setDoctorError('');
  };

  const handleCreateDoctor = async (e) => {
    e.preventDefault();
    setDoctorError('');

    if (!doctorForm.name || !doctorForm.specialty) {
      setDoctorError('Nombre y especialidad son obligatorios');
      return;
    }

    setDoctorLoading(true);
    try {
      const newDoctor = await createDoctor(doctorForm);
      setDoctors(prev => [...prev, newDoctor]);
      setDoctorForm({ name: '', specialty: '', shift: '', available_slots: '' });
    } catch (error) {
      setDoctorError(error.message);
    } finally {
      setDoctorLoading(false);
    }
  };

  const handleDeleteDoctor = async (id) => {
    if (!window.confirm('¿Eliminar este doctor? Esta acción no se puede deshacer.')) return;

    try {
      await deleteDoctor(id);
      setDoctors(prev => prev.filter(d => d.id !== id));
    } catch (error) {
      alert(error.message);
    }
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <div>
          <h2>Panel Administrativo</h2>
          <p className="reports-subtitle">
            Vista general de todas las citas del sistema. Usa los filtros para analizar por especialidad y fechas.
          </p>
        </div>
        <button className="export-btn" onClick={exportCSV} disabled={filteredAppointments.length === 0}>
          📥 Exportar CSV (filtros)
        </button>
      </div>

      <div className="reports-filters">
        <div className="filter-group">
          <label>Especialidad</label>
          <select
            value={selectedSpecialty}
            onChange={(e) => setSelectedSpecialty(e.target.value)}
          >
            <option value="">Todas</option>
            {specialties.map(spec => (
              <option key={spec} value={spec}>{spec}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <label>Desde</label>
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
          />
        </div>
        <div className="filter-group">
          <label>Hasta</label>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
          />
        </div>
      </div>

      <div className="doctors-admin">
        <div className="doctors-form">
          <h3>Gestión de Doctores</h3>
          <p className="doctors-subtitle">Agrega o elimina doctores disponibles para agendamiento.</p>
          {doctorError && <div className="alert alert-error small-alert">{doctorError}</div>}
          <form onSubmit={handleCreateDoctor} className="doctors-form-grid">
            <div className="form-group-inline">
              <label>Nombre</label>
              <input
                type="text"
                name="name"
                value={doctorForm.name}
                onChange={handleDoctorInputChange}
                placeholder="Nombre del doctor"
                required
              />
            </div>
            <div className="form-group-inline">
              <label>Especialidad</label>
              <select
                name="specialty"
                value={doctorForm.specialty}
                onChange={handleDoctorInputChange}
                required
              >
                <option value="">Seleccionar</option>
                {DOCTOR_SPECIALTIES.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div className="form-group-inline">
              <label>Turno (opcional)</label>
              <select
                name="shift"
                value={doctorForm.shift}
                onChange={handleDoctorInputChange}
              >
                <option value="">No especificado</option>
                <option value="Mañana">Mañana</option>
                <option value="Tarde">Tarde</option>
                <option value="Completo">Completo</option>
              </select>
            </div>
            <div className="form-group-inline">
              <label>Horarios disponibles (ej: 17:00, 19:00, 21:00)</label>
              <input
                type="text"
                name="available_slots"
                value={doctorForm.available_slots}
                onChange={handleDoctorInputChange}
                placeholder="Ingresa las horas separadas por comas"
              />
            </div>
            <button type="submit" className="export-btn small" disabled={doctorLoading}>
              {doctorLoading ? 'Guardando...' : 'Agregar Doctor'}
            </button>
          </form>
        </div>

        <div className="doctors-list">
          <h4>Doctores Registrados</h4>
          {doctors.length === 0 ? (
            <p className="no-reports">Aún no hay doctores registrados.</p>
          ) : (
            <table className="reports-table doctors-table">
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Especialidad</th>
                  <th>Turno</th>
                  <th>Horarios</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {doctors.map(doc => (
                  <tr key={doc.id}>
                    <td>{doc.name}</td>
                    <td>{doc.specialty}</td>
                    <td>{doc.shift || '-'}</td>
                    <td>{doc.available_slots || '-'}</td>
                    <td>
                      <button
                        type="button"
                        className="doctor-delete-btn"
                        onClick={() => handleDeleteDoctor(doc.id)}
                      >
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {loading ? (
        <p className="no-reports">Cargando reportes...</p>
      ) : filteredAppointments.length === 0 ? (
        <p className="no-reports">No hay citas que coincidan con los filtros seleccionados</p>
      ) : (
        <>
          <div className="reports-stats">
            <div className="stat-card">
              <div className="stat-value">{stats.total}</div>
              <div className="stat-label">Citas en el periodo</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.uniquePatients}</div>
              <div className="stat-label">Pacientes únicos</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.uniqueSpecialties}</div>
              <div className="stat-label">Especialidades involucradas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.topSpecialty || '-'}</div>
              <div className="stat-label">Especialidad más frecuente</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">{stats.topDay || '-'}</div>
              <div className="stat-label">Día con más citas</div>
            </div>
          </div>

          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Email</th>
                  <th>Especialidad</th>
                  <th>Doctor</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Estado</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map(apt => {
                  const status = getAppointmentStatus(apt);
                  return (
                    <tr key={apt.id}>
                      <td>{apt.clientName || users[apt.userEmail]?.name || apt.userEmail}</td>
                      <td>{apt.userEmail}</td>
                      <td>{apt.specialty}</td>
                      <td>{apt.doctor || '-'}</td>
                      <td>{apt.date}</td>
                      <td>{apt.time}</td>
                      <td>
                        <span className={`status-pill ${status === 'Próxima' ? 'status-upcoming' : status === 'Pasada' ? 'status-past' : 'status-unknown'}`}>
                          {status}
                        </span>
                      </td>
                      <td className="reason-cell">{apt.reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;

