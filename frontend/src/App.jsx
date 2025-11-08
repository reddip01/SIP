// src/App.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import LoginPage from './LoginPage';
import DashboardAdmin from './DashboardAdmin';
import DashboardEmpresa from './DashboardEmpresa';
import DashboardEstudiante from './DashboardEstudiante';

const API_URL = 'http://192.168.1.12:8000';

function App() {
  // Estado para guardar el token y el tipo de usuario
  const [token, setToken] = useState(localStorage.getItem('sip_token'));
  const [userType, setUserType] = useState(null);
  const [loading, setLoading] = useState(true);

  // Este 'useEffect' se ejecuta CADA VEZ que el 'token' cambia
  useEffect(() => {
    const fetchUserRole = async () => {
      if (token) {
        try {
          // 3. Usamos el token para llamar a /api/auth/me
          const response = await axios.get(`${API_URL}/api/auth/me`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          // 4. Guardamos el rol del usuario
          setUserType(response.data.user_type);

        } catch (error) {
          console.error("Error al verificar el token:", error);
          // Si el token es inválido (ej. expiró), lo borramos
          localStorage.removeItem('sip_token');
          setToken(null);
        }
      }
      setLoading(false);
    };

    fetchUserRole();
  }, [token]); // Depende del token


  // Función que pasaremos a LoginPage para que nos "avise" del login
  const handleLoginSuccess = (newToken) => {
    // 1. El usuario hizo login, guardamos el token
    localStorage.setItem('sip_token', newToken);
    // 2. Actualizamos el estado, lo que dispara el 'useEffect' de arriba
    setToken(newToken); 
  };

  // --- LÓGICA DE RENDERIZADO ---

  if (loading) {
    return <div>Cargando...</div>;
  }

  // Si tenemos token Y tipo de usuario, mostramos el Dashboard correcto
  if (token && userType) {
    if (userType === 'admin') {
      return <DashboardAdmin />;
    }
    if (userType === 'empresa') {
      return <DashboardEmpresa />;
    }
    if (userType === 'estudiante') {
      return <DashboardEstudiante />;
    }
  }

  // Si no hay token, mostramos el Login
  // Pasamos la función 'handleLoginSuccess' como un "prop"
  return <LoginPage onLoginSuccess={handleLoginSuccess} />;
}

export default App;