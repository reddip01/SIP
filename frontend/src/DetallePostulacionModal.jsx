// src/DetallePostulacionModal.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';

function DetallePostulacionModal({ postulacion, onClose }) {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // --- NUEVO: Estados para los formularios de edición ---
  const [comentario, setComentario] = useState("");
  const [fechaInicio, setFechaInicio] = useState(postulacion.fecha_inicio_practica || "");
  const [fechaFin, setFechaFin] = useState(postulacion.fecha_fin_practica || "");
  const [formError, setFormError] = useState(null);

  // --- Cargar el historial (sin cambios) ---
  const fetchHistorial = async () => {
    if (!postulacion) return;
    setLoading(true);
    try {
      const response = await apiClient.get(`/api/postulaciones/${postulacion.id_postulacion}/historial`);
      setHistorial(response.data);
      setError(null);
    } catch (err) {
      setError("No se pudo cargar el historial.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistorial();
    // Seteamos las fechas cuando la postulación cambia
    setFechaInicio(postulacion.fecha_inicio_practica ? postulacion.fecha_inicio_practica.split('T')[0] : "");
    setFechaFin(postulacion.fecha_fin_practica ? postulacion.fecha_fin_practica.split('T')[0] : "");
  }, [postulacion]);

  // --- NUEVO: Formulario para Añadir Comentario ---
  const handleSubmitComentario = async (e) => {
    e.preventDefault();
    if (comentario.trim() === "") return;

    try {
      await apiClient.post(
        `/api/postulaciones/${postulacion.id_postulacion}/comentarios`, 
        { comentarios: comentario }
      );
      setComentario(""); // Limpiamos el input
      fetchHistorial(); // Recargamos el historial
    } catch (err) {
      setFormError("No se pudo guardar el comentario.");
    }
  };

  // --- NUEVO: Formulario para Editar Fechas ---
  const handleUpdateFechas = async (e) => {
    e.preventDefault();
    try {
      await apiClient.patch(
        `/api/postulaciones/${postulacion.id_postulacion}/fechas`,
        {
          fecha_inicio_practica: new Date(fechaInicio).toISOString(),
          fecha_fin_practica: new Date(fechaFin).toISOString()
        }
      );
      alert("Fechas actualizadas. Cierre y vuelva a abrir el modal para ver los cambios.");
      // (Una solución más avanzada usaría state management para no recargar)
      onClose(); 
    } catch (err) {
      setFormError("Error al actualizar fechas. Asegúrese de que la práctica esté 'Aprobada'.");
    }
  };

  // --- NUEVO: Formulario para Cancelar Práctica ---
  const handleCancelarPractica = async () => {
    const motivo = prompt("Motivo de la cancelación (Este comentario se guardará en el historial):");
    if (!motivo || motivo.trim() === "") return;

    try {
      await apiClient.patch(
        `/api/postulaciones/${postulacion.id_postulacion}/cancelar`,
        { comentarios: motivo } // Reusamos el schema de Comentario
      );
      alert("Práctica cancelada. Cierre y vuelva a abrir el modal para ver los cambios.");
      onClose(); // Cerramos el modal
    } catch (err) {
      setFormError(err.response?.data?.detail || "Error al cancelar la práctica.");
    }
  };


  const getActorNombre = (item) => {
    if (item.usuario_universidad) return `ADMIN: ${item.usuario_universidad.nombre}`;
    if (item.empresa) return `EMPRESA: ${item.empresa.razon_social}`;
    if (item.estudiante) return `ESTUDIANTE: ${item.estudiante.nombre}`;
    return "Sistema";
  };

  // --- RENDERIZADO (ACTUALIZADO CON LOS NUEVOS FORMULARIOS) ---
  return (
    <div style={styles.overlay} onClick={onClose}>
      <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button onClick={onClose} style={styles.closeButton}>X</button>
        <h2>Detalles de la Práctica (ID: {postulacion.id_postulacion})</h2>

        {formError && <p className="error-message">{formError}</p>}

        {/* --- SECCIÓN 1: Información General (con Fechas Editables) --- */}
        <div style={styles.infoSection}>
          <h4>Información General</h4>
          <p><strong>Estudiante:</strong> {postulacion.estudiante.nombre} {postulacion.estudiante.apellido}</p>
          <p><strong>Empresa:</strong> {postulacion.vacante.empresa.razon_social}</p>
          <p><strong>Estado Actual:</strong> {postulacion.estado_actual}</p>

          <form onSubmit={handleUpdateFechas} style={styles.inlineForm}>
            <div style={styles.formGroup}>
              <label>Fecha Inicio:</label>
              <input 
                type="date" 
                value={fechaInicio}
                onChange={(e) => setFechaInicio(e.target.value)}
              />
            </div>
            <div style={styles.formGroup}>
              <label>Fecha Fin:</label>
              <input 
                type="date" 
                value={fechaFin}
                onChange={(e) => setFechaFin(e.target.value)}
              />
            </div>
            <button type="submit">Actualizar Fechas</button>
          </form>
        </div>

        {/* --- SECCIÓN 2: Historial (sin cambios) --- */}
        <div style={styles.infoSection}>
          <h4>Historial de Seguimiento (Comentarios)</h4>
          {/* ... (código de historial, loading, map, etc. - no cambia) ... */}
          {loading && <p>Cargando historial...</p>}
          {error && <p className="error-message">{error}</p>}
          {!loading && historial.length === 0 && <p>Aún no hay comentarios.</p>}
          <div style={styles.historialFeed}>
            {historial.map(item => (
              <div key={item.id_historial} style={styles.historialItem}>
                <strong style={styles.actorNombre}>{getActorNombre(item)}</strong>
                <span style={styles.fecha}>{new Date(item.fecha_cambio).toLocaleString()}</span>
                <p style={styles.comentario}>"{item.comentarios || '(Cambio de estado automático)'}"</p>
                <small>(Estado registrado: {item.estado})</small>
              </div>
            ))}
          </div>
        </div>

        {/* --- SECCIÓN 3: Añadir Comentario (sin cambios) --- */}
        <div style={styles.infoSection}>
          <h4>Añadir Seguimiento</h4>
          <form onSubmit={handleSubmitComentario}>
            <textarea
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Escribe un nuevo comentario de seguimiento..."
              style={{ width: '100%', minHeight: '80px', padding: '0.5rem' }}
              required
            />
            <button type="submit" style={{ marginTop: '0.5rem' }}>Guardar Comentario</button>
          </form>
        </div>

        {/* --- SECCIÓN 4: Acciones de Admin (Cancelar) --- */}
        {postulacion.estado_actual === 'Aprobada' && (
          <div style={styles.infoSection}>
            <h4>Acciones de Administrador</h4>
            <button onClick={handleCancelarPractica} className="btn-danger">
              Cancelar Práctica (Inactivar)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// --- ESTILOS (Añadimos estilos para los nuevos formularios) ---
const styles = {
  overlay: {
    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white', padding: '2rem', borderRadius: '8px',
    width: '90%', maxWidth: '700px', maxHeight: '80vh',
    overflowY: 'auto', position: 'relative',
  },
  closeButton: {
    position: 'absolute', top: '1rem', right: '1rem',
    background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer',
  },
  infoSection: {
    marginBottom: '1.5rem',
    borderBottom: '1px solid #eee',
    paddingBottom: '1.5rem',
  },
  // --- NUEVOS ESTILOS ---
  inlineForm: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'flex-end',
    marginTop: '1rem',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  // --- FIN NUEVOS ESTILOS ---
  historialFeed: {
    maxHeight: '300px', overflowY: 'auto',
    border: '1px solid #eee', padding: '1rem', borderRadius: '4px',
  },
  historialItem: {
    borderBottom: '1px solid #f0f0f0',
    paddingBottom: '0.5rem', marginBottom: '0.5rem',
  },
  actorNombre: {
    color: '#5a0c47',
  },
  fecha: {
    float: 'right', fontSize: '0.8rem', color: '#777',
  },
  comentario: {
    fontStyle: 'italic', margin: '0.25rem 0',
  }
};

export default DetallePostulacionModal;