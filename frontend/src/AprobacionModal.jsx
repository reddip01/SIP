// src/AprobacionModal.jsx
import React, { useState } from 'react';
import apiClient from './api';

// Este modal recibe 3 "props":
// 1. postulacionId: El ID de la postulación a aprobar.
// 2. onClose: La función para cerrarse (si el usuario cancela).
// 3. onSuccess: La función a la que llamar si la aprobación fue exitosa.

function AprobacionModal({ postulacionId, onClose, onSuccess }) {
  // Estados para los campos del formulario
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');
  const [comentarios, setComentarios] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Manejador del formulario
  const handleSubmitAprobacion = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // 1. Creamos el objeto 'datos_aprobacion' que el backend espera
      const datosAprobacion = {
        fecha_inicio_practica: new Date(fechaInicio).toISOString(),
        fecha_fin_practica: new Date(fechaFin).toISOString(),
        comentarios: comentarios
      };

      // 2. Enviamos los datos al endpoint que ya existe
      await apiClient.patch(
        `/api/admin/postulaciones/${postulacionId}/aprobar`, 
        datosAprobacion
      );

      alert('¡Postulación Aprobada!');
      onSuccess(); // ¡Avisamos al componente padre que todo salió bien!

    } catch (err) {
      setError(err.response?.data?.detail || "Error al aprobar. Revisa las fechas.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeButton}>X</button>
        <h2>Aprobación Final de Práctica (ID: {postulacionId})</h2>
        <p>Por favor, define las fechas de la práctica y añade un comentario de aprobación.</p>

        <form onSubmit={handleSubmitAprobacion}>
          <div style={styles.formGroup}>
            <label>Fecha de Inicio:</label>
            <input 
              type="date" // <-- ¡Selector de calendario!
              value={fechaInicio}
              onChange={(e) => setFechaInicio(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Fecha de Fin:</label>
            <input 
              type="date" // <-- ¡Selector de calendario!
              value={fechaFin}
              onChange={(e) => setFechaFin(e.target.value)}
              required
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label>Comentario (Opcional):</label>
            <textarea
              value={comentarios}
              onChange={(e) => setComentarios(e.target.value)}
              placeholder="Ej: Se aprueba la práctica..."
              style={{...styles.input, minHeight: '80px'}}
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" disabled={loading} style={styles.submitButton}>
            {loading ? "Aprobando..." : "Confirmar Aprobación"}
          </button>
        </form>
      </div>
    </div>
  );
}

// Estilos (reusamos los del otro modal para consistencia)
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white', padding: '2rem', borderRadius: '8px',
    width: '90%', maxWidth: '500px',
  },
  closeButton: {
    position: 'absolute', top: '1rem', right: '1rem',
    background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    boxSizing: 'border-box',
    border: '1px solid #ddd',
    borderRadius: '4px',
  },
  submitButton: {
    width: '100%',
    backgroundColor: '#007bff',
    color: 'white',
    padding: '0.75rem',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: '600',
    cursor: 'pointer',
  }
};

export default AprobacionModal;