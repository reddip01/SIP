// src/AdminDashboardView.jsx
import React from 'react';

function AdminDashboardView() {
  return (
    <>
      <h2>Dashboard General</h2>
      <p>Resumen del estado de la plataforma.</p>

      <div className="content-card">
        <h3>Estadísticas Clave (KPIs)</h3>
        <p>(Aquí irán las tarjetas de "Estudiantes Activos", "Empresas Verificadas", etc.)</p>
      </div>
    </>
  );
}
export default AdminDashboardView;