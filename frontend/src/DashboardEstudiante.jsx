// src/DashboardEstudiante.jsx
import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import './Dashboard.css'; // <-- ¡Usamos el mismo CSS!

// Importamos las 3 "vistas"
import EstudianteDashboardView from './EstudianteDashboardView';
import EstudianteMisPostulacionesView from './EstudianteMisPostulacionesView';
import EstudianteBuscarVacantesView from './EstudianteBuscarVacantesView';
import PerfilPagina from './PerfilPagina';

function DashboardEstudiante({ handleLogout, userType }) {

  return (
    <div className="dashboard-layout">

      {/* --- BARRA SUPERIOR (HEADER) --- */}
      <header className="header" style={{ backgroundColor: '#0056b3' }}>
        <div className="header-user">
          Panel de Estudiante
        </div>
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </header>

      {/* --- BARRA LATERAL (SIDEBAR) --- */}
      <nav className="sidebar">
        <div className="sidebar-header">
          Plataforma SIP
        </div>
        {/* Links del mockup  */}
        <ul className="sidebar-nav">
          <li><Link to="/estudiante/dashboard">Dashboard</Link></li>
          <li><Link to="/estudiante/postulaciones">Mis Postulaciones</Link></li>
          <li><Link to="/estudiante/vacantes">Buscar Vacantes</Link></li>
          <li><Link to="/estudiante/perfil">Mi Perfil</Link></li>
        </ul>
      </nav>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="main-content">
        <Routes>
          <Route path="dashboard" element={<EstudianteDashboardView />} />
          <Route path="postulaciones" element={<EstudianteMisPostulacionesView userType={userType} />} />
          <Route path="vacantes" element={<EstudianteBuscarVacantesView userType={userType} />} />
          <Route path="perfil" element={<PerfilPagina />} />

          {/* Ruta por defecto para /estudiante/ */}
          <Route index element={<Navigate to="dashboard" />} />
        </Routes>
      </main>

    </div>
  );
}
export default DashboardEstudiante;