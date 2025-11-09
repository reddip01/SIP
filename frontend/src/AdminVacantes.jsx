// src/AdminVacantes.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api'; // <-- ¡Importamos nuestro cliente API!

function AdminVacantes() {
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Función para cargar las vacantes pendientes
  const fetchVacantesPendientes = async () => {
    try {
      setLoading(true);
      // Usamos apiClient (ya tiene el token)
      const response = await apiClient.get('/api/admin/vacantes/pendientes');
      setVacantes(response.data);
      setError(null);
    } catch (err) {
      console.error("Error cargando vacantes:", err);
      setError("No se pudieron cargar las vacantes pendientes.");
    } finally {
      setLoading(false);
    }
  };

  // useEffect para cargar las vacantes cuando el componente se monta
  useEffect(() => {
    fetchVacantesPendientes();
  }, []); // El array vacío [] significa "ejecutar esto solo una vez"

  // Función para el botón de Aprobar
  const handleAprobar = async (vacanteId) => {
    try {
      await apiClient.patch(`/api/admin/vacantes/${vacanteId}/aprobar`);
      alert('¡Vacante aprobada!');
      // Recargamos la lista para que la vacante desaparezca de "pendientes"
      fetchVacantesPendientes();
    } catch (err) {
      alert('Error al aprobar la vacante.');
      console.error(err);
    }
  };

  // Función para el botón de Rechazar
  const handleRechazar = async (vacanteId) => {
    try {
      await apiClient.patch(`/api/admin/vacantes/${vacanteId}/rechazar`);
      alert('Vacante rechazada.');
      // Recargamos la lista
      fetchVacantesPendientes();
    } catch (err) {
      alert('Error al rechazar la vacante.');
      console.error(err);
    }
  };

  // --- Renderizado del componente ---
  if (loading) return <div>Cargando vacantes pendientes...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h3>Vacantes Pendientes de Aprobación</h3>
      {vacantes.length === 0 ? (
        <p>No hay vacantes pendientes.</p>
      ) : (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
            <th>Empresa</th>
            <th>Título de la Vacante</th>
            <th>Estado</th>
            <th>Acciones</th>
            </tr>
          </thead>
            <tbody>
            {vacantes.map((vacante) => (
                <tr key={vacante.id_vacante}>
                <td>{vacante.empresa.razon_social}</td>
                <td>{vacante.titulo_vacante}</td>
                <td>{vacante.estado}</td>
                <td>
                    <button onClick={() => handleAprobar(vacante.id_vacante)}>
                    Aprobar
                    </button>
                    <button onClick={() => handleRechazar(vacante.id_vacante)} className="btn-danger">
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

export default AdminVacantes;