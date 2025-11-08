// src/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';

const API_URL = 'http://192.168.1.12:8000';

// Aceptamos el "prop" onLoginSuccess que nos pasa App.jsx
function LoginPage({ onLoginSuccess }) { 
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault(); 
    setError(null); 
    const formData = new URLSearchParams();
    formData.append('username', email); 
    formData.append('password', password);

    try {
      const response = await axios.post(`${API_URL}/api/auth/login`, formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      });

      const token = response.data.access_token;

      // ¡CAMBIO CLAVE!
      // Ya no guardamos el token aquí, solo "avisamos" al padre (App.jsx)
      onLoginSuccess(token); 

    } catch (err) {
      console.error('Error en el login:', err);
      if (err.response && err.response.status === 401) {
        setError('Email o contraseña incorrectos.');
      } else {
        setError('Ocurrió un error. Intenta de nuevo.');
      }
    }
  };

  // (El JSX/HTML del return no cambia, así que lo omito por brevedad)
  return (
    <div className="login-container">
      <h2>Sistema Integrado de Prácticas</h2>
      <h3>Bienvenido</h3>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email-input">Correo Electrónico:</label>
          <input
            id="email-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="password-input">Contraseña:</label>
          <input
            id="password-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit">Ingresar</button>
        <a href="#" className="forgot-password">
          ¿Olvidaste tu contraseña?
        </a>
      </form>
    </div>
  );
}

export default LoginPage;