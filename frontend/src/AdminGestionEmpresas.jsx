// src/AdminGestionEmpresas.jsx
import React, { useState, useEffect } from 'react';
import apiClient from './api';

function AdminGestionEmpresas() {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Estados para el formulario de NUEVA empresa
  const [razonSocial, setRazonSocial] = useState('');
  const [nit, setNit] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formError, setFormError] = useState(null);

  // --- 1. LÓGICA DE DATOS ---

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const response = await apiClient.get('/api/admin/empresas');
      setEmpresas(response.data);
      setError(null);
    } catch (err) {
      setError("No se pudieron cargar las empresas.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  // --- 2. MANEJADORES DE ACCIONES ---

  const handleCrearEmpresa = async (e) => {
    e.preventDefault();
    setFormError(null);
    try {
      await apiClient.post('/api/admin/empresas', {
        razon_social: razonSocial,
        nit: nit,
        email_contacto: email,
        password: password,
      });
      alert('¡Empresa creada exitosamente!');
      setRazonSocial('');
      setNit('');
      setEmail('');
      setPassword('');
      
      // --- ¡ARREGLO 1 AQUÍ! ---
      // Vuelve a cargar la lista de empresas después de crear una
      fetchEmpresas(); 

    } catch (err) {
      setFormError(err.response?.data?.detail || "Error al crear la empresa.");
    }
  };

  const handleToggleActivo = async (empresa) => {
    const endpoint = empresa.esta_activo ? 
      `/api/admin/empresas/${empresa.id_empresa}/inactivar` : 
      `/api/admin/empresas/${empresa.id_empresa}/activar`;
    
    try {
      await apiClient.patch(endpoint);
      alert(`Empresa ${empresa.esta_activo ? 'inactivada' : 'activada'}.`);
      
      // --- ¡ARREGLO 2 AQUÍ! ---
      // Vuelve a cargar la lista de empresas después de cambiar el estado
      fetchEmpresas(); 

    } catch (err) {
      alert('Error al cambiar el estado de la empresa.');
    }
  };

  // --- 3. RENDERIZADO ---
  // (El JSX no cambia, sigue siendo el mismo de antes)

  return (
    <>
      {/* SECCIÓN 1: FORMULARIO DE CREACIÓN */}
      <div className="content-card">
        <h2>Crear Nueva Empresa</h2>
        <form onSubmit={handleCrearEmpresa}>
          <div style={{ marginBottom: '1rem' }}>
            <label>Razón Social:</label>
            <input
              type="text"
              value={razonSocial}
              onChange={(e) => setRazonSocial(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>NIT:</label>
            <input
              type="text"
              value={nit}
              onChange={(e) => setNit(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Email de Contacto:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Contraseña Inicial:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          {formError && <p className="error-message">{formError}</p>}
          <button type="submit">Crear Empresa</button>
        </form>
      </div>

      {/* SECCIÓN 2: TABLA DE EMPRESAS EXISTENTES */}
      <div className="content-card">
        <h2>Empresas Registradas</h2>
        {loading && <p>Cargando empresas...</p>}
        {error && <p className="error-message">{error}</p>}
        {!loading && !error && (
          <table>
            <thead>
              <tr>
                <th>Razón Social</th>
                <th>NIT</th>
                <th>Email</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.id_empresa}>
                  <td>{empresa.razon_social}</td>
                  <td>{empresa.nit}</td>
                  <td>{empresa.email_contacto}</td>
                  <td>
                    {empresa.esta_activo ? 
                      <span style={{ color: 'green', fontWeight: 'bold' }}>Activa</span> : 
                      <span style={{ color: 'red', fontWeight: 'bold' }}>Inactiva</span>
                    }
                  </td>
                  <td>
                    <button 
                      onClick={() => handleToggleActivo(empresa)}
                      className={empresa.esta_activo ? 'btn-danger' : ''}
                    >
                      {empresa.esta_activo ? 'Inactivar' : 'Activar'}
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

export default AdminGestionEmpresas;