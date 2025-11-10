// src/DashboardEmpresa.jsx
import React from 'react';
import { Routes, Route, Link, Navigate } from 'react-router-dom';
import './Dashboard.css'; // <-- 1. ¡USAMOS EL MISMO CSS DEL ADMIN!

// 2. Importamos las "vistas" que acabamos de renombrar
import EmpresaDashboardView from './EmpresaDashboardView';
import EmpresaCandidatosView from './EmpresaCandidatosView';
import EmpresaSeguimientoView from './EmpresaSeguimientoView';

// 3. Aceptamos 'handleLogout'
function DashboardEmpresa({ handleLogout, userType }) {

  return (
    <div className="dashboard-layout">

      {/* --- BARRA SUPERIOR (HEADER) --- */}
      {/* Usamos un color azul para diferenciar de Admin */}
      <header className="header" style={{ backgroundColor: '#0056b3' }}>
        <div className="header-user">
          Panel de Empresa
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
        {/* Estos son los links de tu mockup  */}
        <ul className="sidebar-nav">
          <li><Link to="/empresa/vacantes">Gestión de Vacantes</Link></li>
          <li><Link to="/empresa/candidatos">Candidatos</Link></li>
          <li><Link to="/empresa/seguimiento">Seguimiento</Link></li>
          <li><Link to="#">Perfil de Empresa</Link></li>
        </ul>
      </nav>

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main className="main-content">
        {/* 4. Definimos las rutas anidadas */}
        <Routes>
          <Route path="vacantes" element={<EmpresaDashboardView />} />
          <Route path="candidatos" element={<EmpresaCandidatosView />} />
          <Route path="seguimiento" element={<EmpresaSeguimientoView userType={userType} />} />
          <Route path="perfil" element={<h2>Perfil de Empresa (en construcción)</h2>} />
          

          {/* Ruta por defecto para /empresa/ */}
          <Route index element={<Navigate to="vacantes" />} />
        </Routes>
      </main>

    </div>
  );
}
export default DashboardEmpresa;