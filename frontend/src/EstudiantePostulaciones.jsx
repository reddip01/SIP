// src/EstudiantePostulaciones.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';

function EstudiantePostulaciones() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMisPostulaciones = async () => {
      try {
        setLoading(true);
        // Usamos el endpoint que acabamos de crear
        const response = await apiClient.get('/api/estudiantes/postulaciones/me');
        setPostulaciones(response.data);
        setError(null);
      } catch (err) {
        setError("No se pudieron cargar tus postulaciones.");
      } finally {
        setLoading(false);
      }
    };
    fetchMisPostulaciones();
  }, []);

  if (loading) return <div>Cargando mis postulaciones...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h3>Mis Postulaciones</h3>
      {postulaciones.length === 0 ? (
        <p>No te has postulado a ninguna vacante.</p>
      ) : (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID Postulación</th>
              <th>ID Vacante</th>
              <th>Estado Actual</th>
            </tr>
          </thead>
          <tbody>
            {postulaciones.map((post) => (
              <tr key={post.id_postulacion}>
                <td>{post.id_postulacion}</td>
                <td>{post.id_vacante}</td>
                <td>{post.estado_actual}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default EstudiantePostulaciones;