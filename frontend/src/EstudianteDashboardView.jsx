// src/EstudianteDashboardView.jsx
import React, { useState, useEffect } from 'react'; // <-- IMPORTAR HOOKS
import apiClient from './api'; // <-- IMPORTAR API CLIENT
import './Dashboard.css';

// (Estilos locales - sin cambios)
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
  color: '#0056b3', margin: '0.5rem 0 0.5rem 0',
};
const kpiTitle = {
  fontSize: '1rem', color: '#555', margin: 0,
};

function EstudianteDashboardView() {
  // 1. Estados para los datos y la carga
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 2. Cargar los datos al iniciar
  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        // ¡Llamamos al nuevo endpoint de stats!
        const response = await apiClient.get('/api/estudiantes/stats');
        setStats(response.data);
        setError(null);
      } catch (err) {
        setError("No se pudieron cargar las estadísticas.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []); // El array vacío [] significa "ejecutar esto solo una vez"

  // 3. Renderizado condicional
  if (loading) return <div>Cargando estadísticas...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <h2>Dashboard del Estudiante</h2>

      {/* 4. Tarjetas KPI (conectadas a los datos reales) */}
      {stats && (
        <div style={kpiStyles}>
          <div style={cardStyle}>
            <div style={kpiNumber}>{stats.postulaciones_activas}</div>
            <div style={kpiTitle}>Postulaciones Activas</div>
          </div>
          <div style={cardStyle}>
            <div style={kpiNumber}>{stats.vacantes_disponibles}</div>
            <div style={kpiTitle}>Vacantes Disponibles</div>
          </div>
          <div style={cardStyle}>
            <div style={kpiNumber}>{stats.mensajes_nuevos}</div>
            <div style={kpiTitle}>Mensajes Nuevos</div>
          </div>
        </div>
      )}

      <div className="content-card">
        <p>Bienvenido a la plataforma de prácticas. Desde aquí podrás gestionar tu proceso.</p>
      </div>
    </>
  );
}
export default EstudianteDashboardView;