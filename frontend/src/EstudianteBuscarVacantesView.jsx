// src/EstudianteVacantes.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';

function EstudianteBuscarVacantesView() {
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchVacantes = async () => {
    try {
      setLoading(true);
      // Este endpoint ya existe y solo trae las "Abiertas"
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
      // Este endpoint también ya existe
      await apiClient.post(`/api/estudiantes/vacantes/${vacanteId}/postular`);
      alert('¡Postulación enviada con éxito!');
      // Opcional: podrías recargar la lista o deshabilitar el botón
      fetchVacantes(); // Recargamos por si acaso
    } catch (err) {
      if (err.response && err.response.data.detail) {
        alert(`Error: ${err.response.data.detail}`);
      } else {
        alert('Error al postularse.');
      }
    }
  };

  if (loading) return <div>Cargando vacantes disponibles...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h3>Buscar Vacantes</h3>
      {vacantes.length === 0 ? (
        <p>No hay vacantes disponibles en este momento.</p>
      ) : (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
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
                {/* --- CAMBIOS AQUÍ --- */}
                <td>{v.empresa.razon_social}</td>
                <td>{v.titulo_vacante}</td>
                {/* --- FIN DE CAMBIOS --- */}
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
  );
}
export default EstudianteBuscarVacantesView;