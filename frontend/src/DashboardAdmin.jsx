// src/DashboardAdmin.jsx
import React from 'react';
// 1. Importar los componentes de enrutamiento
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import './Dashboard.css'; // <-- ¡AQUÍ SE IMPORTA EL ESTILO!

// 2. Importar las "páginas" (vistas) del dashboard
import AdminDashboardView from './AdminDashboardView';
import AdminAprobaciones from './AdminAprobaciones';
import AdminGestionEmpresas from './AdminGestionEmpresas';
import AdminGestionEstudiantes from './AdminGestionEstudiantes';
import AdminGestionProgramas from './AdminGestionProgramas';

// 3. Aceptar 'handleLogout' como prop desde App.jsx
function DashboardAdmin({ handleLogout }) {
  
  return (
    // 4. APLICAR EL LAYOUT
    <div className="dashboard-layout">
      
      <header className="header">
        <div className="header-user">Coordinador de Prácticas</div>
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </header>

      <nav className="sidebar">
        <div className="sidebar-header">Plataforma SIP</div>
        <ul className="sidebar-nav">
          {/* 5. Cambiar <a> por <Link> de react-router-dom */}
          <li><Link to="/admin/dashboard">Dashboard</Link></li>
          <li><Link to="/admin/aprobaciones">Aprobaciones</Link></li>
          <li><Link to="/admin/empresas">Gestionar Empresas</Link></li>
          <li><Link to="/admin/estudiantes">Gestionar Estudiantes</Link></li>
          <li><Link to="/admin/programas">Gestionar Programas</Link></li>
        </ul>
      </nav>

      <main className="main-content">
        {/* 6. Definir las rutas ANIDADAS */}
        {/* <Routes> decide qué componente "hijo" mostrar aquí */}
        <Routes>
          <Route path="dashboard" element={<AdminDashboardView />} />
          <Route path="aprobaciones" element={<AdminAprobaciones />} />
          <Route path="empresas" element={<AdminGestionEmpresas />} />
          <Route path="estudiantes" element={<AdminGestionEstudiantes />} />
          <Route path="programas" element={<AdminGestionProgramas />} />
          
          {/* Si solo entran a /admin, redirigimos a /admin/dashboard */}
          <Route index element={<Navigate to="dashboard" />} />
        </Routes>
      </main>

    </div>
  );
}
export default DashboardAdmin;