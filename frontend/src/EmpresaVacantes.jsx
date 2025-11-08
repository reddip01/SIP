// src/EmpresaVacantes.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';

function EmpresaVacantes() {
  const [vacantes, setVacantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchMisVacantes = async () => {
      try {
        setLoading(true);
        // Usaremos un endpoint nuevo que debemos crear:
        const response = await apiClient.get('/api/empresas/vacantes/me');
        setVacantes(response.data);
        setError(null);
      } catch (err) {
        console.error("Error cargando mis vacantes:", err);
        setError("No se pudieron cargar las vacantes.");
      } finally {
        setLoading(false);
      }
    };
    fetchMisVacantes();
  }, []);

  if (loading) return <div>Cargando mis vacantes...</div>;
  if (error) return <p className="error-message">{error}</p>;

  return (
    <div>
      <h3>Mis Vacantes Publicadas</h3>
      {vacantes.length === 0 ? (
        <p>No has publicado ninguna vacante.</p>
      ) : (
        <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>ID Vacante</th>
              <th>Título</th>
              <th>Estado</th>
              {/* Podríamos añadir "Candidatos" aquí en el futuro */}
            </tr>
          </thead>
          <tbody>
            {vacantes.map((vacante) => (
              <tr key={vacante.id_vacante}>
                <td>{vacante.id_vacante}</td>
                <td>{vacante.titulo_vacante}</td>
                <td>{vacante.estado}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
export default EmpresaVacantes;