import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import './Reports.css';

const Reports = () => {
  const { getAllAppointments, getAllUsers } = useApp();
  const [allAppointments, setAllAppointments] = useState([]);
  const [users, setUsers] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [appointments, usersData] = await Promise.all([
          getAllAppointments(),
          getAllUsers()
        ]);
        setAllAppointments(appointments || []);
        setUsers(usersData || {});
      } catch (error) {
        console.error('Error cargando reportes:', error);
        setAllAppointments([]);
        setUsers({});
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [getAllAppointments, getAllUsers]);

  const exportCSV = () => {
    if (allAppointments.length === 0) {
      alert('No hay datos para exportar');
      return;
    }

    const header = ['Paciente', 'Email', 'Especialidad', 'Fecha', 'Hora', 'Motivo'];
    const lines = [header.join(',')];

    allAppointments.forEach(apt => {
      const row = [
        `"${(apt.clientName || users[apt.userEmail]?.name || '').replace(/"/g, '""')}"`,
        `"${(apt.userEmail || '').replace(/"/g, '""')}"`,
        `"${(apt.specialty || '').replace(/"/g, '""')}"`,
        `"${apt.date}"`,
        `"${apt.time}"`,
        `"${(apt.reason || '').replace(/"/g, '""')}"`
      ];
      lines.push(row.join(','));
    });

    const csv = lines.join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `reportes_citas_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-container">
      <div className="reports-header">
        <h2>Reportes de Citas</h2>
        <button className="export-btn" onClick={exportCSV} disabled={allAppointments.length === 0}>
          📥 Exportar CSV
        </button>
      </div>

      {loading ? (
        <p className="no-reports">Cargando reportes...</p>
      ) : allAppointments.length === 0 ? (
        <p className="no-reports">No hay citas registradas</p>
      ) : (
        <>
          <div className="reports-stats">
            <div className="stat-card">
              <div className="stat-value">{allAppointments.length}</div>
              <div className="stat-label">Total de Citas</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {new Set(allAppointments.map(a => a.userEmail)).size}
              </div>
              <div className="stat-label">Pacientes Únicos</div>
            </div>
            <div className="stat-card">
              <div className="stat-value">
                {new Set(allAppointments.map(a => a.specialty)).size}
              </div>
              <div className="stat-label">Especialidades</div>
            </div>
          </div>

          <div className="reports-table-container">
            <table className="reports-table">
              <thead>
                <tr>
                  <th>Paciente</th>
                  <th>Email</th>
                  <th>Especialidad</th>
                  <th>Fecha</th>
                  <th>Hora</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {allAppointments.map(apt => (
                  <tr key={apt.id}>
                    <td>{apt.clientName || users[apt.userEmail]?.name || apt.userEmail}</td>
                    <td>{apt.userEmail}</td>
                    <td>{apt.specialty}</td>
                    <td>{apt.date}</td>
                    <td>{apt.time}</td>
                    <td className="reason-cell">{apt.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default Reports;

