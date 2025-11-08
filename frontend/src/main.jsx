// src/main.jsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import LoginPage from './LoginPage.jsx' // Importa tu nueva página
import './index.css' // (El CSS que vaciamos)

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <LoginPage /> 
  </React.StrictMode>,
)