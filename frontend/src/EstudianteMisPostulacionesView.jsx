// src/EstudianteMisPostulacionesView.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';
import DetallePostulacionModal from './DetallePostulacionModal';

// Aceptamos userType (¡esto ya lo tenías bien!)
function EstudianteMisPostulacionesView({ userType }) { 
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [postulacionSeleccionada, setPostulacionSeleccionada] = useState(null);

  // --- Lógica (SIN CAMBIOS) ---
  const fetchMisPostulaciones = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/estudiantes/postulaciones/me');
      setPostulaciones(response.data);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar tus postulaciones.");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchMisPostulaciones();
  }, []);
  
  const handleVerDetalles = (postulacion) => {
    setPostulacionSeleccionada(postulacion);
  };
  const handleCloseModal = () => {
    setPostulacionSeleccionada(null);
    fetchMisPostulaciones(); // Recargamos la lista por si hubo cambios
  };
  // --- Fin Lógica ---

  if (loading) return <div>Cargando mis postulaciones...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      {/* --- ¡ESTE ES EL CAMBIO! --- */}
      <div className="content-card"> 
        <h3>Mis Postulaciones</h3>
        {postulaciones.length === 0 ? (
          <p>No te has postulado a ninguna vacante.</p>
        ) : (
          <table>
            {/* ... (la tabla <thead> y <tbody> no cambian) ... */}
            <thead>
              <tr>
                <th>ID Postulación</th>
                <th>Empresa</th>
                <th>Título de la Vacante</th>
                <th>Estado Actual</th>
                <th>Acciones</th> 
              </tr>
            </thead>
            <tbody>
              {postulaciones.map((post) => (
                <tr key={post.id_postulacion}>
                  <td>{post.id_postulacion}</td>
                  <td>{post.vacante.empresa.razon_social}</td>
                  <td>{post.vacante.titulo_vacante}</td>
                  <td style={{ fontWeight: 'bold', color: post.estado_actual === 'Aprobada' ? 'green' : 'inherit' }}>
                    {post.estado_actual}
                  </td>
                  <td>
                    <button onClick={() => handleVerDetalles(post)}>
                      Ver Detalles
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {/* --- FIN DEL CAMBIO --- */}

      {/* El modal queda fuera de la tarjeta */}
      {postulacionSeleccionada && (
        <DetallePostulacionModal
          postulacion={postulacionSeleccionada}
          onClose={handleCloseModal}
          userType={userType} // ¡Esto ya lo tenías bien!
        />
      )}
    </>
  );
}

export default EstudianteMisPostulacionesView;