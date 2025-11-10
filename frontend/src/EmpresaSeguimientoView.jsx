// src/EmpresaSeguimientoView.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';
import DetallePostulacionModal from './DetallePostulacionModal'; // <-- ¡Reusamos el modal!

function EmpresaSeguimientoView({ userType }) {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estado para controlar el modal de detalles
  const [postulacionSeleccionada, setPostulacionSeleccionada] = useState(null);

  // Cargar el historial de la empresa
  const fetchHistorialEmpresa = async () => {
    try {
      setLoading(true);
      // 1. Llamamos al nuevo endpoint de empresa
      const response = await apiClient.get('/api/empresas/practicas/seguimiento');
      setPostulaciones(response.data);
      setError(null);
    } catch (err) {
      setError("No se pudo cargar el historial de prácticas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorialEmpresa();
  }, []);

  const handleVerDetalles = (postulacion) => {
    setPostulacionSeleccionada(postulacion);
  };

  // --- Renderizado ---
  if (loading) return <div>Cargando historial de prácticas...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      <div className="content-card">
        <h2>Seguimiento de Prácticas</h2>
        <p>Un registro de todas las prácticas activas o finalizadas asociadas a tu empresa.</p>

        {postulaciones.length === 0 ? (
          <p>Aún no tienes prácticas activas o finalizadas.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Estudiante</th>
                <th>Vacante</th>
                <th>Estado Final</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {postulaciones.map((post) => (
                <tr key={post.id_postulacion}>
                  <td>{post.id_postulacion}</td>
                  <td>{post.estudiante.nombre} {post.estudiante.apellido}</td>
                  <td>{post.vacante.titulo_vacante}</td>
                  <td style={{ fontWeight: 'bold', color: post.estado_actual === 'Aprobada' ? 'green' : 'red' }}>
                    {post.estado_actual}
                  </td>
                  <td>
                    <button onClick={() => handleVerDetalles(post)}>
                      Ver Detalles / Comentar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* ¡Reutilizamos el mismo modal de detalles del Admin! */}
      {postulacionSeleccionada && (
        <DetallePostulacionModal 
          postulacion={postulacionSeleccionada}
          onClose={() => setPostulacionSeleccionada(null)}
          userType={userType}
        />
      )}
    </>
  );
}

export default EmpresaSeguimientoView;