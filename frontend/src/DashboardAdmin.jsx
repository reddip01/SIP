// src/DashboardAdmin.jsx
import React from 'react';
import AdminVacantes from './AdminVacantes';
import AdminPostulaciones from './AdminPostulaciones'; // <-- 1. IMPORTAR

function DashboardAdmin() {
  const handleLogout = () => {
    localStorage.removeItem('sip_token');
    window.location.reload(); 
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard de Administrador</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      <p>Gestión de vacantes y postulaciones del sistema.</p>

      <hr />
      <AdminVacantes />

      <hr style={{ marginTop: '2rem' }} />

      {/* --- 2. RENDERIZAR EL NUEVO COMPONENTE --- */}
      <AdminPostulaciones />

    </div>
  );
}
export default DashboardAdmin;