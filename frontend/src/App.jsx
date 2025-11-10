// src/App.jsx
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';

// Importa todas tus páginas "padre"
import LoginPage from './LoginPage';
import DashboardAdmin from './DashboardAdmin';
import DashboardEmpresa from './DashboardEmpresa';
import DashboardEstudiante from './DashboardEstudiante';

const API_URL = 'http://192.168.1.12:8000';

// Función para obtener el token del localStorage
const getAuthToken = () => localStorage.getItem('sip_token');

function App() {
  const [token, setToken] = useState(getAuthToken());
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate(); // Hook para redirigir

  // Este useEffect se ejecuta UNA VEZ al cargar la app
  // para verificar si ya existe un token válido.
  useEffect(() => {
    const fetchUserRole = async () => {
      if (token) {
        try {
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUserType(response.data.user_type);
        } catch (error) {
          console.error("Token inválido:", error);
          localStorage.removeItem('sip_token');
          setToken(null);
        }
      }
      setLoading(false);
    };
    fetchUserRole();
  }, []); // El array vacío [] asegura que se ejecute solo al inicio

  
  // Esta función se llama desde LoginPage
  const handleLoginSuccess = async (newToken) => {
    localStorage.setItem('sip_token', newToken);
    setToken(newToken);
    
    // Inmediatamente después de hacer login, verificamos el rol y redirigimos
    try {
      const response = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${newToken}` }
      });
      const type = response.data.user_type;
      setUserType(type);
      
      // --- ¡REDIRECCIÓN POR ROL! ---
      if (type === 'admin') navigate('/admin');
      if (type === 'empresa') navigate('/empresa');
      if (type === 'estudiante') navigate('/estudiante');

    } catch (error) {
      console.error("Error al verificar token post-login:", error);
      handleLogout(); // Si falla, limpiamos todo
    }
  };

  // Esta función se pasará a los dashboards
  const handleLogout = () => {
    localStorage.removeItem('sip_token');
    setToken(null);
    setUserType(null);
    navigate('/'); // Redirige al login
  };

  if (loading) {
    return <div>Cargando...</div>;
  }

  // --- DEFINICIÓN DE RUTAS ---
  return (
    <Routes>
      {/* Ruta de Login (Pública) */}
      <Route 
        path="/" 
        element={
          !token ? <LoginPage onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/" />
        } 
      />
      
      {/* Rutas Protegidas de Admin */}
      <Route 
        path="/admin/*" 
        element={
          token && userType === 'admin' ? 
          <DashboardAdmin handleLogout={handleLogout} userType={userType} /> :
          <Navigate to="/" />
        } 
      />
      
      {/* Rutas Protegidas de Empresa */}
      <Route 
        path="/empresa/*" 
        element={
          token && userType === 'empresa' ? 
          <DashboardEmpresa handleLogout={handleLogout} userType={userType} /> :
          <Navigate to="/" />
        } 
      />
      
      {/* Rutas Protegidas de Estudiante */}
      <Route 
        path="/estudiante/*" 
        element={
          token && userType === 'estudiante' ? 
          <DashboardEstudiante handleLogout={handleLogout} userType={userType} /> :
          <Navigate to="/" />
        } 
      />
      
      {/* Si el usuario está logueado pero va a '/', lo redirigimos */}
      <Route 
        path="/" 
        element={
          token ? 
          (userType === 'admin' ? <Navigate to="/admin" /> :
           userType === 'empresa' ? <Navigate to="/empresa" /> :
           userType === 'estudiante' ? <Navigate to="/estudiante" /> :
           <LoginPage onLoginSuccess={handleLoginSuccess} />) :
          <LoginPage onLoginSuccess={handleLoginSuccess} />
        }
      />
      
      {/* Cualquier otra ruta vuelve al login */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default App;