// src/DashboardEstudiante.jsx
import React from 'react';
import EstudianteVacantes from './EstudianteVacantes';
import EstudiantePostulaciones from './EstudiantePostulaciones';

// 1. Aceptar { handleLogout } como prop
function DashboardEstudiante({ handleLogout }) {

  // 2. Usar la función en el botón
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard del Estudiante</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      
      <hr />
      <EstudiantePostulaciones />
      <hr style={{ marginTop: '2rem' }} />
      <EstudianteVacantes />
    </div>
  );
}
export default DashboardEstudiante;