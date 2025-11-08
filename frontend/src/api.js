// src/api.js
import axios from 'axios';

// Esta es la URL de tu API de backend
const API_URL = 'http://192.168.1.12:8000';

const apiClient = axios.create({
  baseURL: API_URL,
});

// --- ¡La Magia! ---
// Esto "intercepta" CADA petición antes de que se envíe
apiClient.interceptors.request.use(
  (config) => {
    // Obtiene el token guardado en el Local Storage
    const token = localStorage.getItem('sip_token');
    if (token) {
      // Si el token existe, lo añade a los headers
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;