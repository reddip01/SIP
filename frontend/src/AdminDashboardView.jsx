// src/AdminDashboardView.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';
import './Dashboard.css'; // Asegúrate de importar el CSS

// Reutilizamos los estilos del Dashboard de Estudiante
const kpiStyles = {
  display: 'flex', gap: '1.5rem', marginBottom: '2rem',
};
const cardStyle = {
  flex: 1, backgroundColor: '#ffffff', padding: '1.5rem',
  borderRadius: '8px', boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
  textAlign: 'center',
};
const kpiNumber = {
  fontSize: '2.5rem', fontWeight: '600',
  color: '#5a0c47', // Morado del tema Admin
  margin: '0.5rem 0 0.5rem 0',
};
const kpiTitle = {
  fontSize: '1rem', color: '#555', margin: 0,
};


function AdminDashboardView() {
  // 1. Estados para los datos y la carga
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Cargar los datos al iniciar
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        const response = await apiClient.get('/api/admin/stats');
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  // 3. Renderizado condicional
  if (loading) return <div>Cargando estadísticas...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <h2>Dashboard General</h2>
      <p>Resumen del estado de la plataforma.</p>

      {/* 4. Tarjetas KPI (basadas en el mockup y conectadas) */}
      {stats && (
        <div style={kpiStyles}>
          <div style={cardStyle}>
            <div style={kpiNumber}>{stats.practicas_por_aprobar}</div>
            <div style={kpiTitle}>Prácticas por Aprobar</div>
          </div>
          <div style={cardStyle}>
            <div style={kpiNumber}>{stats.estudiantes_activos}</div>
            <div style={kpiTitle}>Estudiantes Activos</div>
          </div>
          <div style={cardStyle}>
            <div style={kpiNumber}>{stats.empresas_activas}</div>
            <div style={kpiTitle}>Empresas Verificadas</div>
          </div>
        </div>
      )}

      <div className="content-card">
        <p>Bienvenido al panel de administración.</p>
      </div>
    </>
  );
}
export default AdminDashboardView;