// src/AdminPostulaciones.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api'; // ¡Usamos nuestro cliente API!

function AdminPostulaciones() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar las postulaciones pendientes
  const fetchPostulacionesPendientes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/postulaciones/pendientes');
      setPostulaciones(response.data);
      setError(null);
    } catch (err) {
      console.error("Error cargando postulaciones:", err);
      setError("No se pudieron cargar las postulaciones pendientes.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar las postulaciones al montar el componente
  useEffect(() => {
    fetchPostulacionesPendientes();
  }, []);

  // Función para el botón de Aprobar
  const handleAprobar = async (postulacionId) => {
    try {
      await apiClient.patch(`/api/admin/postulaciones/${postulacionId}/aprobar`);
      alert('¡Postulación Aprobada!');
      // Recargamos la lista
      fetchPostulacionesPendientes();
    } catch (err) {
      alert('Error al aprobar la postulación.');
      console.error(err);
    }
  };

  // Función para el botón de Rechazar
  const handleRechazar = async (postulacionId) => {
    try {
      await apiClient.patch(`/api/admin/postulaciones/${postulacionId}/rechazar`);
      alert('Postulación Rechazada.');
      // Recargamos la lista
      fetchPostulacionesPendientes();
    } catch (err) {
      alert('Error al rechazar la postulación.');
      console.error(err);
    }
  };

  // --- Renderizado del componente ---
  if (loading) return <div>Cargando postulaciones pendientes...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h3>Postulaciones Pendientes de Aprobación Final</h3>
      {postulaciones.length === 0 ? (
        <p>No hay postulaciones pendientes.</p>
      ) : (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
            <tr>
                <th>ID Postulación</th>
                <th>Estudiante</th>
                <th>Vacante</th>
                <th>Estado Actual</th>
                <th>Acciones</th>
            </tr>
            </thead>
          <tbody>
            {postulaciones.map((post) => (
            <tr key={post.id_postulacion}>
                <td>{post.id_postulacion}</td>
                <td>{post.estudiante.nombre} {post.estudiante.apellido}</td>
                <td>{post.vacante.titulo_vacante}</td>
                <td>{post.estado_actual}</td>
                <td>
                <button onClick={() => handleAprobar(post.id_postulacion)}>
                    Aprobar (Final)
                </button>
                <button onClick={() => handleRechazar(post.id_postulacion)} className="btn-danger">
                    Rechazar (Final)
                </button>
                </td>
            </tr>
            ))}
            </tbody>
        </table>
      )}
    </div>
  );
}

export default AdminPostulaciones;