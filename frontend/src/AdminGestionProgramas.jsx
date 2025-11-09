// src/AdminGestionProgramas.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';

function AdminGestionProgramas() {
  const [programas, setProgramas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el formulario de NUEVO programa
  const [nombrePrograma, setNombrePrograma] = useState('');
  const [facultad, setFacultad] = useState('');
  const [formError, setFormError] = useState(null);

  // --- 1. LÓGICA DE DATOS ---

  const fetchProgramas = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/programas');
      setProgramas(response.data);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar los programas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProgramas();
  }, []);

  // --- 2. MANEJADORES DE ACCIONES ---

  const handleCrearPrograma = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await apiClient.post('/api/admin/programas', {
        nombre_programa: nombrePrograma,
        facultad: facultad,
      });
      alert('¡Programa creado exitosamente!');
      setNombrePrograma('');
      setFacultad('');
      fetchProgramas(); // Recargamos la tabla
    } catch (err) {
      setFormError(err.response?.data?.detail || "Error al crear el programa.");
    }
  };

  // ¡NUEVA FUNCIÓN!
  const handleToggleActivo = async (programa) => {
    const endpoint = programa.esta_activo ? 
      `/api/admin/programas/${programa.id_programa}/inactivar` : 
      `/api/admin/programas/${programa.id_programa}/activar`;

    try {
      const response = await apiClient.patch(endpoint);
      const programaActualizado = response.data;

      alert(`Programa ${programaActualizado.esta_activo ? 'activado' : 'inactivado'}.`);

      // Actualizamos el estado en React
      setProgramas(programasActuales => 
        programasActuales.map(p => 
          p.id_programa === programaActualizado.id_programa ? programaActualizado : p
        )
      );

    } catch (err) {
      alert('Error al cambiar el estado del programa.');
    }
  };

  // --- 3. RENDERIZADO ---

  return (
    <>
      {/* SECCIÓN 1: FORMULARIO DE CREACIÓN */}
      <div className="content-card">
        <h2>Crear Nuevo Programa Académico</h2>
        <form onSubmit={handleCrearPrograma}>
          {/* ... (el formulario no cambia) ... */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Nombre del Programa:</label>
              <input
                type="text"
                value={nombrePrograma}
                onChange={(e) => setNombrePrograma(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label>Facultad:</label>
              <input
                type="text"
                value={facultad}
                onChange={(e) => setFacultad(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
          </div>
          {formError && <p className="error-message">{formError}</p>}
          <button type="submit" style={{ marginTop: '1rem' }}>Crear Programa</button>
        </form>
      </div>

      {/* SECCIÓN 2: TABLA DE PROGRAMAS EXISTENTES */}
      <div className="content-card">
        <h2>Programas Registrados</h2>
        {loading && <p>Cargando programas...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Nombre del Programa</th>
                <th>Facultad</th>
                {/* --- NUEVAS COLUMNAS --- */}
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {programas.map((prog) => (
                <tr key={prog.id_programa}>
                  <td>{prog.nombre_programa}</td>
                  <td>{prog.facultad}</td>
                  {/* --- NUEVAS CELDAS --- */}
                  <td>
                    {prog.esta_activo ? 
                      <span style={{ color: 'green', fontWeight: 'bold' }}>Activo</span> : 
                      <span style={{ color: 'red', fontWeight: 'bold' }}>Inactivo</span>
                    }
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleActivo(prog)}
                      className={prog.esta_activo ? 'btn-danger' : ''}
                    >
                      {prog.esta_activo ? 'Inactivar' : 'Activar'}
                    </button>
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

export default AdminGestionProgramas;