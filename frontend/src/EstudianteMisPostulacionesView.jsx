// src/EstudianteMisPostulacionesView.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';
import DetallePostulacionModal from './DetallePostulacionModal'; // <-- 1. IMPORTAR EL MODAL

// 2. ACEPTAR userType (lo necesitamos para pasarlo al modal)
function EstudianteMisPostulacionesView({ userType }) { 
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 3. AÑADIR ESTADO PARA EL MODAL
  const [postulacionSeleccionada, setPostulacionSeleccionada] = useState(null);

  // Cargar las postulaciones (sin cambios)
  useEffect(() => {
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
    fetchMisPostulaciones();
  }, []);
  
  // 4. AÑADIR FUNCIÓN PARA ABRIR EL MODAL
  const handleVerDetalles = (postulacion) => {
    setPostulacionSeleccionada(postulacion);
  };

  const handleCloseModal = () => {
    setPostulacionSeleccionada(null);
    // (Opcional: recargar datos si el modal pudiera cambiarlos)
  };


  if (loading) return <div>Cargando mis postulaciones...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    // 5. Envolvemos todo en un fragmento <> y la tarjeta de contenido
    <>
      <div className="content-card">
        <h3>Mis Postulaciones</h3>
        {postulaciones.length === 0 ? (
          <p>No te has postulado a ninguna vacante.</p>
        ) : (
          <table>
            {/* 6. AÑADIR LA COLUMNA "Acciones" */}
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
                  {/* 7. AÑADIR EL BOTÓN */}
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

      {/* 8. RENDERIZAR EL MODAL */}
      {postulacionSeleccionada && (
        <DetallePostulacionModal
          postulacion={postulacionSeleccionada}
          onClose={handleCloseModal}
          userType={userType} // ¡Esto le dice al modal que eres "estudiante"!
        />
      )}
    </>
  );
}

export default EstudianteMisPostulacionesView;