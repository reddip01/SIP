// src/DashboardEmpresa.jsx
import React from 'react';
import EmpresaVacantes from './EmpresaVacantes';
import EmpresaPostulaciones from './EmpresaPostulaciones';

// 1. Aceptar { handleLogout } como prop
function DashboardEmpresa({ handleLogout }) {
  
  // 2. Usar la función en el botón
  return (
    <div style={{ padding: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1>Dashboard de Empresa</h1>
        <button onClick={handleLogout}>Cerrar Sesión</button>
      </div>
      <p>Gestión de vacantes y candidatos.</p>
      
      <hr />
      <EmpresaPostulaciones />
      <hr style={{ marginTop: '2rem' }} />
      <EmpresaVacantes />
    </div>
  );
}
export default DashboardEmpresa;