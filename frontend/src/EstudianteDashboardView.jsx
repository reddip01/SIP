// src/EstudianteDashboardView.jsx
import React from 'react';
import './Dashboard.css'; // Usamos el mismo CSS

// Estilos locales para las tarjetas KPI
const kpiStyles = {
  display: 'flex',
  gap: '1.5rem',
  marginBottom: '2rem',
};
const cardStyle = {
  flex: 1,
  backgroundColor: '#ffffff',
  padding: '1.5rem',
  borderRadius: '8px',
  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  textAlign: 'center',
};
const kpiNumber = {
  fontSize: '2.5rem',
  fontWeight: '600',
  color: '#0056b3', // Azul del tema
  margin: '0.5rem 0 0.5rem 0',
};
const kpiTitle = {
  fontSize: '1rem',
  color: '#555',
  margin: 0,
};

function EstudianteDashboardView() {
  // Por ahora, estos datos son fijos.
  // En el futuro, los cargaríamos desde la API.
  const stats = {
    activas: 1, // (Viene de 'Mis Postulaciones')
    disponibles: 2, // (Viene de 'Buscar Vacantes')
    mensajes: 0,
  };

  return (
    <>
      <h2>Dashboard del Estudiante</h2>

      {/* Tarjetas KPI (basadas en el mockup ) */}
      <div style={kpiStyles}>
        <div style={cardStyle}>
          <div style={kpiNumber}>{stats.activas}</div>
          <div style={kpiTitle}>Postulaciones Activas</div>
        </div>
        <div style={cardStyle}>
          <div style={kpiNumber}>{stats.disponibles}</div>
          <div style={kpiTitle}>Vacantes Disponibles</div>
        </div>
        <div style={cardStyle}>
          <div style={kpiNumber}>{stats.mensajes}</div>
          <div style={kpiTitle}>Mensajes Nuevos</div>
        </div>
      </div>

      <div className="content-card">
        <p>Bienvenido a la plataforma de prácticas. Desde aquí podrás gestionar tu proceso.</p>
        {/* Aquí podría ir un resumen de la práctica activa */}
      </div>
    </>
  );
}
export default EstudianteDashboardView;