// src/DashboardEstudiante.jsx
import React from 'react';
import EstudianteVacantes from './EstudianteVacantes';
import EstudiantePostulaciones from './EstudiantePostulaciones';

function DashboardEstudiante() {
  const handleLogout = () => {
    localStorage.removeItem('sip_token');
    window.location.reload();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard del Estudiante</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>

      <hr />
      {/* Componente para "Mis Postulaciones" */}
      <EstudiantePostulaciones />

      <hr style={{ marginTop: '2rem' }} />

      {/* Componente para "Buscar Vacantes" */}
      <EstudianteVacantes />
    </div>
  );
}
export default DashboardEstudiante;