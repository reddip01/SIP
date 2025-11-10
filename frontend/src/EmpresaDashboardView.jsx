// src/EmpresaDashboardView.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';
import EmpresaCrearVacante from './EmpresaCrearVacante'; // <-- 1. IMPORTAR

function EmpresaDashboardView() {
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // La función para cargar las vacantes (ahora la usaremos también para recargar)
  const fetchMisVacantes = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/empresas/vacantes/me');
      setVacantes(response.data);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar las vacantes.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMisVacantes();
  }, []);

  const handleCerrarVacante = async (vacanteId) => {
    if (!window.confirm("¿Estás seguro de que quieres cerrar esta vacante?")) return;
    try {
      await apiClient.patch(`/api/empresas/vacantes/${vacanteId}/cerrar`);
      alert('Vacante cerrada exitosamente.');
      fetchMisVacantes(); 
    } catch (err) {
      alert(err.response?.data?.detail || 'Error al cerrar la vacante.');
    }
  };

  if (error) return <p className="error-message">{error}</p>;

  return (
    <>
      {/* --- 2. AÑADIR EL FORMULARIO --- */}
      {/* Le pasamos la función de recarga como prop */}
      <EmpresaCrearVacante onVacanteCreada={fetchMisVacantes} />

      {/* --- 3. LA TABLA (AHORA DENTRO DE SU PROPIA TARJETA) --- */}
      <div className="content-card" style={{ marginTop: '2rem' }}>
        <h3>Mis Vacantes Publicadas</h3>
        {loading ? (
          <p>Cargando mis vacantes...</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>ID Vacante</th>
                <th>Título</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {vacantes.map((vacante) => (
                <tr key={vacante.id_vacante}>
                  <td>{vacante.id_vacante}</td>
                  <td>{vacante.titulo_vacante}</td>
                  <td style={{ fontWeight: 'bold', color: vacante.estado === 'Cubierta' ? 'green' : (vacante.estado === 'Cerrada' ? 'red' : 'inherit') }}>
                    {vacante.estado}
                  </td>
                  <td>
                    {(vacante.estado === 'Abierta' || vacante.estado === 'En Revisión') && (
                      <button 
                        onClick={() => handleCerrarVacante(vacante.id_vacante)}
                        className="btn-danger"
                      >
                        Cerrar
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}
export default EmpresaDashboardView;