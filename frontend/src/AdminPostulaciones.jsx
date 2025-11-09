// src/AdminPostulaciones.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';
import AprobacionModal from './AprobacionModal'; // <-- 1. IMPORTAR EL NUEVO MODAL

function AdminPostulaciones() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. NUEVO ESTADO para controlar el modal ---
  const [modalPostulacionId, setModalPostulacionId] = useState(null);

  // Cargar postulaciones pendientes (sin cambios)
  const fetchPostulacionesPendientes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/postulaciones/pendientes');
      setPostulaciones(response.data);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar las postulaciones pendientes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostulacionesPendientes();
  }, []);

  // --- 3. handleAprobar AHORA SOLO ABRE EL MODAL ---
  const handleAprobar = (postulacionId) => {
    setModalPostulacionId(postulacionId);
  };

  // --- 4. NUEVA FUNCIÓN que se llama cuando el modal termina ---
  const handleApprovalSuccess = () => {
    setModalPostulacionId(null); // Cerramos el modal
    fetchPostulacionesPendientes(); // Recargamos la tabla
  };

  // handleRechazar (sin cambios)
  const handleRechazar = async (postulacionId) => {
    // (Deberíamos hacer un modal para esto también, pero por ahora usamos prompt)
    const comentarios = prompt("Por favor, ingrese el motivo del rechazo:");
    if (comentarios === null) return; // Canceló

    try {
      await apiClient.patch(
        `/api/admin/postulaciones/${postulacionId}/rechazar`,
        { comentarios } // Enviamos el JSON de rechazo
      );
      alert('Postulación Rechazada.');
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
    // Usamos un fragmento <> para que el modal flote sobre la tabla
    <> 
      <div>
        <h3>Postulaciones Pendientes de Aprobación Final</h3>
        {/* ... (el resto de la tabla no cambia) ... */}
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
                      {/* 5. El botón ahora llama a la nueva función */}
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

      {/* --- 6. RENDERIZADO CONDICIONAL DEL MODAL --- */}
      {modalPostulacionId && (
        <AprobacionModal 
          postulacionId={modalPostulacionId}
          onClose={() => setModalPostulacionId(null)}
          onSuccess={handleApprovalSuccess}
        />
      )}
    </>
  );
}

export default AdminPostulaciones;