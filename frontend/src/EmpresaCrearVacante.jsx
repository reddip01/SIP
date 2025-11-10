// src/EmpresaCrearVacante.jsx
import React, { useState } from 'react';
import apiClient from './api';

// Aceptamos una prop 'onVacanteCreada' para
// avisarle al padre (la tabla) que debe recargarse.
function EmpresaCrearVacante({ onVacanteCreada }) {
  const [titulo, setTitulo] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCrearVacante = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Usamos el endpoint que ya existe en el backend
      await apiClient.post('/api/empresas/vacantes', {
        titulo_vacante: titulo,
        descripcion_funciones: descripcion,
      });

      alert('¡Vacante creada! Pasará a revisión del administrador.');
      setTitulo('');
      setDescripcion('');
      onVacanteCreada(); // ¡Avisamos al padre para que recargue la tabla!

    } catch (err) {
      setError(err.response?.data?.detail || "Error al crear la vacante.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="content-card">
      <h2>Publicar Nueva Vacante</h2>
      <form onSubmit={handleCrearVacante}>
        <div style={{ marginBottom: '1rem' }}>
          <label>Título de la Vacante:</label>
          <input
            type="text"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
            required
            style={{ width: '100%', padding: '0.5rem' }}
          />
        </div>
        <div style={{ marginBottom: '1rem' }}>
          <label>Descripción de Funciones:</label>
          <textarea
            value={descripcion}
            onChange={(e) => setDescripcion(e.target.value)}
            required
            style={{ width: '100%', minHeight: '80px', padding: '0.5rem' }}
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Publicando..." : "Publicar Vacante"}
        </button>
      </form>
    </div>
  );
}

export default EmpresaCrearVacante;