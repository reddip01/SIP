// src/EstudianteBuscarVacantesView.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';

function EstudianteBuscarVacantesView() { // No necesita userType, ¡correcto!
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- Lógica (SIN CAMBIOS) ---
  const fetchVacantes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/estudiantes/vacantes');
      setVacantes(response.data);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar las vacantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVacantes();
  }, []);

  const handlePostular = async (vacanteId) => {
    try {
      await apiClient.post(`/api/estudiantes/vacantes/${vacanteId}/postular`);
      alert('¡Postulación enviada con éxito!');
      fetchVacantes(); // Recargamos
    } catch (err) {
      if (err.response && err.response.data.detail) {
        alert(`Error: ${err.response.data.detail}`);
      } else {
        alert('Error al postularse.');
      }
    }
  };
  // --- Fin Lógica ---

  if (loading) return <div>Cargando vacantes disponibles...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    // --- ¡ESTE ES EL CAMBIO! ---
    <div className="content-card"> 
      <h3>Buscar Vacantes</h3>
      {vacantes.length === 0 ? (
        <p>No hay vacantes disponibles en este momento.</p>
      ) : (
        <table>
          {/* ... (la tabla <thead> y <tbody> no cambian) ... */}
          <thead>
            <tr>
              <th>Empresa</th>
              <th>Título</th>
              <th>Descripción</th>
              <th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {vacantes.map((v) => (
              <tr key={v.id_vacante}>
                <td>{v.empresa.razon_social}</td>
                <td>{v.titulo_vacante}</td>
                <td>{v.descripcion_funciones}</td>
                <td>
                  <button onClick={() => handlePostular(v.id_vacante)}>
                    Postularse
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
    // --- FIN DEL CAMBIO ---
  );
}

export default EstudianteBuscarVacantesView;