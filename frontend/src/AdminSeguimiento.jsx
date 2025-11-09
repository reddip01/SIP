// src/AdminSeguimiento.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';
import DetallePostulacionModal from './DetallePostulacionModal'; // <-- 1. IMPORTAR EL MODAL

function AdminSeguimiento() {
  const [postulaciones, setPostulaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- 2. ESTADO PARA EL MODAL ---
  const [postulacionSeleccionada, setPostulacionSeleccionada] = useState(null);

  const fetchHistorial = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/practicas/historial');
      setPostulaciones(response.data);
      setError(null);
    } catch (err) {
      setError("No se pudo cargar el historial de prácticas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
  }, []);

  // 3. Función que se llama desde la tabla
  const handleVerDetalles = (postulacion) => {
    setPostulacionSeleccionada(postulacion);
  };

  // --- Renderizado ---
  if (loading) return <div>Cargando historial de prácticas...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    // 4. Usamos un fragmento <> para que el modal flote sobre la tabla
    <>
      <div className="content-card">
        <h2>Seguimiento de Prácticas (Historial)</h2>
        <p>Un registro de todas las postulaciones que han completado su ciclo.</p>

        {postulaciones.length === 0 ? (
          <p>Aún no hay prácticas finalizadas (aprobadas o rechazadas).</p>
        ) : (
          <table>
            {/* ... (el <thead> de la tabla no cambia) ... */}
            <thead>
              <tr>
                <th>ID</th>
                <th>Estudiante</th>
                <th>Empresa</th>
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
                  <td>{post.vacante.empresa.razon_social}</td>
                  <td>{post.vacante.titulo_vacante}</td>
                  <td style={{ fontWeight: 'bold', color: post.estado_actual === 'Aprobada' ? 'green' : 'red' }}>
                    {post.estado_actual}
                  </td>
                  <td>
                    {/* 5. Actualizamos el botón para que pase el objeto 'post' */}
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

      {/* 6. RENDERIZADO CONDICIONAL DEL MODAL */}
      {/* Si 'postulacionSeleccionada' no es null, muestra el modal */}
      {postulacionSeleccionada && (
        <DetallePostulacionModal 
          postulacion={postulacionSeleccionada}
          onClose={() => setPostulacionSeleccionada(null)} // Función para cerrar
        />
      )}
    </>
  );
}

export default AdminSeguimiento;