// src/AdminDashboardView.jsx
import React from 'react';
import AdminVacantes from './AdminVacantes';
import AdminPostulaciones from './AdminPostulaciones';

// Esta es la "página" que se muestra DENTRO del layout principal
function AdminDashboardView() {
  return (
    <>
      {/* Como puedes ver, aquí NO hay <nav> ni <header>.
        Solo está el contenido.
      */}
      <h2>Dashboard General</h2>
      <p>Gestión de vacantes y postulaciones del sistema.</p>

      <div className="content-card">
        <AdminVacantes />
      </div>

      <div className="content-card">
        <AdminPostulaciones />
      </div>
    </>
  );
}
export default AdminDashboardView;