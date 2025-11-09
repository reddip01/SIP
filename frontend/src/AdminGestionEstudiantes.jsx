// src/AdminGestionEstudiantes.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';

function AdminGestionEstudiantes() {
  const [estudiantes, setEstudiantes] = useState([]);
  const [programas, setProgramas] = useState([]); // <-- Nuevo: para el <select>
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el formulario de NUEVO estudiante
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [idPrograma, setIdPrograma] = useState(''); // <-- Nuevo
  const [formError, setFormError] = useState(null);

  // --- 1. LÓGICA DE DATOS ---

  const fetchDatos = async () => {
    try {
      setLoading(true);
      // Hacemos dos peticiones en paralelo
      const [estudiantesRes, programasRes] = await Promise.all([
        apiClient.get('/api/admin/estudiantes'), // Endpoint que acabamos de crear
        apiClient.get('/api/admin/programas')  // Endpoint que ya existía
      ]);
      
      setEstudiantes(estudiantesRes.data);
      setProgramas(programasRes.data);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar los datos de estudiantes.");
    } finally {
      setLoading(false);
    }
  };

  // Cargar los datos al iniciar
  useEffect(() => {
    fetchDatos();
  }, []);

  // --- 2. MANEJADORES DE ACCIONES ---

  // Manejador para el formulario de creación
  const handleCrearEstudiante = async (e) => {
    e.preventDefault();
    setFormError(null);
    if (!idPrograma) {
      setFormError("Debes seleccionar un programa.");
      return;
    }
    
    try {
      // Este endpoint ya existe
      await apiClient.post('/api/admin/estudiantes', {
        nombre: nombre,
        apellido: apellido,
        email_institucional: email,
        id_programa: parseInt(idPrograma),
        password: password,
      });
      alert('¡Estudiante creado exitosamente!');
      // Limpiamos el formulario
      setNombre('');
      setApellido('');
      setEmail('');
      setPassword('');
      setIdPrograma('');
      fetchDatos(); // Recargamos la tabla de estudiantes
    } catch (err) {
      setFormError(err.response?.data?.detail || "Error al crear el estudiante.");
    }
  };

  // Manejador para los botones de Activar/Inactivar
  const handleToggleActivo = async (estudiante) => {
    const endpoint = estudiante.esta_activo ? 
      `/api/admin/estudiantes/${estudiante.id_estudiante}/inactivar` : 
      `/api/admin/estudiantes/${estudiante.id_estudiante}/activar`;
    
    try {
      // 1. Llamamos a la API y ESPERAMOS la respuesta
      const response = await apiClient.patch(endpoint);
      
      // 2. 'response.data' es el estudiante actualizado (con el nuevo estado)
      const estudianteActualizado = response.data;
      
      alert(`Estudiante ${estudianteActualizado.esta_activo ? 'activado' : 'inactivado'}.`);

      // 3. Actualizamos el estado de React MANUALMENTE
      // Esto es más rápido y fiable que volver a llamar a fetchDatos()
      setEstudiantes(estudiantesActuales => {
        // Creamos un nuevo array basado en el anterior
        return estudiantesActuales.map(est => {
          // Si encontramos el estudiante que cambiamos...
          if (est.id_estudiante === estudianteActualizado.id_estudiante) {
            // ...lo reemplazamos por la versión actualizada del backend.
            return estudianteActualizado;
          }
          // Si no, devolvemos el estudiante sin cambios.
          return est;
        });
      });

    } catch (err) {
      alert('Error al cambiar el estado del estudiante.');
      console.error(err);
    }
  };

  // --- 3. RENDERIZADO ---

  return (
    <>
      {/* SECCIÓN 1: FORMULARIO DE CREACIÓN */}
      <div className="content-card">
        <h2>Crear Nuevo Estudiante</h2>
        <form onSubmit={handleCrearEstudiante}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label>Nombre:</label>
              <input
                type="text"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label>Apellido:</label>
              <input
                type="text"
                value={apellido}
                onChange={(e) => setApellido(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label>Email Institucional:</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div>
              <label>Contraseña Inicial:</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}> {/* Ocupa ambas columnas */}
              <label>Programa Académico:</label>
              <select
                value={idPrograma}
                onChange={(e) => setIdPrograma(e.target.value)}
                required
                style={{ width: '100%', padding: '0.5rem' }}
              >
                <option value="">-- Seleccione un programa --</option>
                {programas.map((programa) => (
                  <option key={programa.id_programa} value={programa.id_programa}>
                    {programa.nombre_programa}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {formError && <p className="error-message">{formError}</p>}
          <button type="submit" style={{ marginTop: '1rem' }}>Crear Estudiante</button>
        </form>
      </div>

      {/* SECCIÓN 2: TABLA DE ESTUDIANTES EXISTENTES */}
      <div className="content-card">
        <h2>Estudiantes Registrados</h2>
        {loading && <p>Cargando estudiantes...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Programa</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {estudiantes.map((est) => (
                <tr key={est.id_estudiante}>
                  <td>{est.nombre} {est.apellido}</td>
                  <td>{est.email_institucional}</td>
                  <td>{est.programa.nombre_programa}</td>
                  <td>
                    {est.esta_activo ? 
                      <span style={{ color: 'green', fontWeight: 'bold' }}>Activo</span> : 
                      <span style={{ color: 'red', fontWeight: 'bold' }}>Inactivo</span>
                    }
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleActivo(est)}
                      className={est.esta_activo ? 'btn-danger' : ''}
                    >
                      {est.esta_activo ? 'Inactivar' : 'Activar'}
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

export default AdminGestionEstudiantes;