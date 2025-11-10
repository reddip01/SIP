// src/PerfilPagina.jsx
import React, { useState, useEffect } from 'react'; // Importamos useEffect
import apiClient from './api';
import './Dashboard.css'; // Reutilizamos los estilos

function PerfilPagina() {
  // --- Estados para la INFO DEL USUARIO ---
  const [user, setUser] = useState(null); // Aquí guardaremos los datos del usuario
  const [loadingUser, setLoadingUser] = useState(true);

  // --- Estados para el FORMULARIO DE CONTRASEÑA ---
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  const [loadingPassword, setLoadingPassword] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // --- 1. Cargar datos del usuario al montar la página ---
  useEffect(() => {
    const fetchMe = async () => {
      try {
        setLoadingUser(true);
        // Usamos el endpoint que ya existe
        const response = await apiClient.get('/api/auth/me');
        setUser(response.data); // Guardamos la data (ej: { user_data: {...}, user_type: "admin" })
      } catch (err) {
        setError("No se pudo cargar la información del perfil.");
      } finally {
        setLoadingUser(false);
      }
    };
    fetchMe();
  }, []); // El array vacío [] significa "ejecutar solo una vez"

  // --- 2. Lógica para cambiar contraseña (sin cambios) ---
  const handleSubmitPassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    if (newPassword !== confirmPassword) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    
    setLoadingPassword(true);
    try {
      await apiClient.post('/api/auth/change-password', {
        old_password: oldPassword,
        new_password: newPassword
      });
      setSuccess("¡Contraseña actualizada exitosamente!");
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      setError(err.response?.data?.detail || "Error al cambiar la contraseña.");
    } finally {
      setLoadingPassword(false);
    }
  };

  // --- 3. Helper para renderizar la info del perfil ---
  const renderUserInfo = () => {
    if (loadingUser) return <p>Cargando información del perfil...</p>;
    if (!user) return null; // No mostrar nada si falla la carga

    const data = user.user_data;
    const type = user.user_type;

    if (type === 'admin') {
      return (
        <>
          <p><strong>Nombre:</strong> {data.nombre}</p>
          <p><strong>Email:</strong> {data.email}</p>
          <p><strong>Rol:</strong> {data.rol}</p>
        </>
      );
    }
    if (type === 'empresa') {
      return (
        <>
          <p><strong>Razón Social:</strong> {data.razon_social}</p>
          <p><strong>NIT:</strong> {data.nit}</p>
          <p><strong>Email de Contacto:</strong> {data.email_contacto}</p>
        </>
      );
    }
    if (type === 'estudiante') {
      return (
        <>
          <p><strong>Nombre:</strong> {data.nombre} {data.apellido}</p>
          <p><strong>Email:</strong> {data.email_institucional}</p>
          {/* El bug que arreglamos en security.py permite que esto funcione */}
          <p><strong>Programa:</strong> {data.programa.nombre_programa}</p>
        </>
      );
    }
    return null;
  };

  // --- 4. RENDERIZADO (ACTUALIZADO) ---
  return (
    <>
      {/* --- SECCIÓN 1: Información de la Cuenta --- */}
      <div className="content-card">
        <h2>Información de la Cuenta</h2>
        {renderUserInfo()}
        {/* (En el futuro, aquí iría un botón "Editar" que active los campos) */}
      </div>

      {/* --- SECCIÓN 2: Cambiar Contraseña --- */}
      <div className="content-card" style={{ marginTop: '2rem' }}>
        <h3>Cambiar Contraseña</h3>
        <form onSubmit={handleSubmitPassword}>
          {/* ... (el formulario de contraseña no cambia) ... */}
          <div style={{ marginBottom: '1rem' }}>
            <label>Contraseña Antigua:</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Nueva Contraseña:</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          <div style={{ marginBottom: '1rem' }}>
            <label>Confirmar Nueva Contraseña:</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ width: '100%', padding: '0.5rem' }}
            />
          </div>
          {error && <p className="error-message">{error}</p>}
          {success && <p style={{ color: 'green', fontWeight: 'bold' }}>{success}</p>}
          <button type="submit" disabled={loadingPassword}>
            {loadingPassword ? "Actualizando..." : "Actualizar Contraseña"}
          </button>
        </form>
      </div>
    </>
  );
}

export default PerfilPagina;