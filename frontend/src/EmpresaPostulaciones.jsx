// src/EmpresaPostulaciones.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';

function EmpresaPostulaciones() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar las postulaciones recibidas
  const fetchPostulaciones = async () => {
    try {
      setLoading(true);
      // Este endpoint ya lo creamos en el backend
      const response = await apiClient.get('/api/empresas/postulaciones');
      // Filtramos para mostrar solo las que están 'Recibida'
      const pendientes = response.data.filter(
        (p) => p.estado_actual === "Recibida"
      );
      setPostulaciones(pendientes);
      setError(null);
    } catch (err) {
      console.error("Error cargando postulaciones:", err);
      setError("No se pudieron cargar las postulaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostulaciones();
  }, []);

  // Funciones de Aprobar/Rechazar
  const handleAprobar = async (id) => {
    try {
      await apiClient.patch(`/api/empresas/postulaciones/${id}/aprobar`);
      alert('Postulación aprobada (pasa a U.)');
      fetchPostulaciones(); // Recarga la lista
    } catch (err) {
      alert('Error al aprobar.');
    }
  };

  const handleRechazar = async (id) => {
     try {
      await apiClient.patch(`/api/empresas/postulaciones/${id}/rechazar`);
      alert('Postulación rechazada.');
      fetchPostulaciones(); // Recarga la lista
    } catch (err) {
      alert('Error al rechazar.');
    }
  };


  if (loading) return <div>Cargando candidatos...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h3>Candidatos Pendientes de Revisión</h3>
      {postulaciones.length === 0 ? (
        <p>No tienes candidatos pendientes.</p>
      ) : (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
            <tr>
                <th>ID Postulación</th>
                <th>Estudiante</th>
                <th>Título de la Vacante</th>
                <th>Acciones</th>
            </tr>
            </thead>
          <tbody>
        {postulaciones.map((post) => (
            <tr key={post.id_postulacion}>
            <td>{post.id_postulacion}</td>
            <td>{post.estudiante.nombre} {post.estudiante.apellido}</td>
            <td>{post.vacante.titulo_vacante}</td>
            <td>
                <button onClick={() => handleAprobar(post.id_postulacion)}>
                Aprobar
                </button>
                <button onClick={() => handleRechazar(post.id_postulacion)} className="btn-danger">
                Rechazar
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
export default EmpresaPostulaciones;