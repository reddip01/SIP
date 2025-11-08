// src/LoginPage.jsx
import React, { useState } from 'react';
import axios from 'axios';

// Esta es la URL de tu API de backend
const API_URL = 'http://192.168.1.12:8000';

function LoginPage() {
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
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      });

      const token = response.data.access_token;
      localStorage.setItem('sip_token', token); 
      
      console.log('¡Login exitoso!', response.data);
      alert('¡Login exitoso! Token guardado.');

    } catch (err) {
      console.error('Error en el login:', err);
      if (err.response && err.response.status === 401) {
        setError('Email o contraseña incorrectos.');
      } else {
        setError('Ocurrió un error. Intenta de nuevo.');
      }
    }
  };

  // --- HTML/JSX ACTUALIZADO CON CLASES CSS Y EL LINK ---
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
        
        {/* Muestra el mensaje de error si existe */}
        {error && <p className="error-message">{error}</p>}
        
        <button type="submit">Ingresar</button>

        {/* --- LINK AÑADIDO --- */}
        <a href="#" className="forgot-password">
          ¿Olvidaste tu contraseña?
        </a>
        {/* (Por ahora, href="#" no hace nada. Luego se puede implementar) */}

      </form>
    </div>
  );
}

export default LoginPage;