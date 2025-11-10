// src/EmpresaCandidatosView.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';

function EmpresaCandidatosView() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchPostulaciones = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/empresas/postulaciones');
      const pendientes = response.data.filter(
        (p) => p.estado_actual === "Recibida"
      );
      setPostulaciones(pendientes);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar las postulaciones.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPostulaciones();
  }, []);

  const handleAprobar = async (id) => {
    try {
      await apiClient.patch(`/api/empresas/postulaciones/${id}/aprobar`);
      alert('Postulación aprobada (pasa a U.)');
      fetchPostulaciones(); 
    } catch (err) {
      alert('Error al aprobar.');
    }
  };

  const handleRechazar = async (id) => {
     // (Esto deberíamos cambiarlo por un modal de "motivo" más adelante)
     const comentarios = prompt("Por favor, ingrese el motivo del rechazo:");
     if (comentarios === null || comentarios.trim() === "") {
       alert("El rechazo fue cancelado o el motivo estaba vacío.");
       return;
     }

     try {
      await apiClient.patch(
        `/api/empresas/postulaciones/${id}/rechazar`,
        { comentarios } // Enviamos el JSON de rechazo
      );
      alert('Postulación rechazada.');
      fetchPostulaciones(); 
    } catch (err) {
      alert('Error al rechazar.');
    }
  };

  if (loading) return <div>Cargando candidatos...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    // --- ¡CAMBIO AQUÍ! ---
    // 1. Envolvemos todo en la "tarjeta" de contenido
    <div className="content-card">
      <h3>Candidatos Pendientes de Revisión</h3>

      {postulaciones.length === 0 ? (
        <p>No tienes candidatos pendientes.</p>
      ) : (
        <table> {/* El CSS global de Dashboard.css ya le da estilo a esta tabla */}
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
                  {/* 2. Añadimos la clase para el botón rojo */}
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
export default EmpresaCandidatosView;