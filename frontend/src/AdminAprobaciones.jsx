// src/AdminAprobaciones.jsx
import React from 'react';
import AdminVacantes from './AdminVacantes';
import AdminPostulaciones from './AdminPostulaciones';

function AdminAprobaciones() {
  return (
    <>
      <h2>Gestión de Aprobaciones</h2>
      <p>Gestione las vacantes y postulaciones pendientes.</p>

      <div className="content-card">
        {/* Componente de vacantes pendientes */}
        <AdminVacantes />
      </div>

      <div className="content-card">
        {/* Componente de postulaciones pendientes */}
        <AdminPostulaciones />
      </div>
    </>
  );
}
export default AdminAprobaciones;