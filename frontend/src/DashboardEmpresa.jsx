// src/DashboardEmpresa.jsx
import React from 'react';
import EmpresaVacantes from './EmpresaVacantes';
import EmpresaPostulaciones from './EmpresaPostulaciones';

function DashboardEmpresa() {
  const handleLogout = () => {
    localStorage.removeItem('sip_token');
    window.location.reload();
  };

  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard de Empresa</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      <p>Gestión de vacantes y candidatos.</p>

      <hr />
      {/* Aquí cargamos las postulaciones pendientes (Candidatos) */}
      <EmpresaPostulaciones />

      <hr style={{ marginTop: '2rem' }} />

      {/* Aquí cargamos la lista de "Nuestras Vacantes" */}
      <EmpresaVacantes />
    </div>
  );
}
export default DashboardEmpresa;