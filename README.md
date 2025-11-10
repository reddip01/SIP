## INFORMACIÓN INICIAL

Este proyecto fue desarrollado como parte del entregable final para el curso de **Ingeniería de Software**.

* **Autor:** José Daniel Castañeda Alzate
* **Institución:** Fundación Universitaria Católica del Norte

# Sistema Integrado de Prácticas (SIP)

## 1. Descripción del Proyecto

El **Sistema Integrado de Prácticas (SIP)** es una plataforma web completa diseñada para centralizar, digitalizar y optimizar la gestión de las prácticas profesionales de la universidad.

Este proyecto nace como solución a la problemática actual, donde el proceso de prácticas se gestiona de forma manual y fragmentada a través de correos electrónicos, documentos físicos y formularios independientes[cite: 29, 127, 131]. Esto genera sobrecarga administrativa, demoras en las aprobaciones y una falta total de trazabilidad para los estudiantes, las empresas y el personal de la universidad.

El SIP reemplaza este caos por una única fuente de verdad, conectando a los tres actores clave del proceso en un solo lugar.

## 2. Características Principales

El sistema está construido con una arquitectura de tres módulos (frontend + API) y se basa en roles, proveyendo un *dashboard* específico para cada actor.

### Módulo de Administrador (Universidad)
* **Gestión Total de Usuarios:** Crear, activar e inactivar perfiles de Estudiantes, Empresas y Programas Académicos.
* **Flujo de Aprobación de Vacantes:** Revisar y aprobar las vacantes que publican las empresas antes de que sean visibles para los estudiantes.
* **Flujo de Aprobación de Prácticas:** Dar la aprobación final a las postulaciones de los estudiantes, asignando fechas de inicio/fin y añadiendo comentarios de historial.
* **Seguimiento Integral:** Acceder a un panel de "Seguimiento" con el historial completo de todas las prácticas (aprobadas, canceladas, etc.).
* **Panel de Detalles:** Editar fechas, cancelar prácticas y añadir comentarios de seguimiento a cualquier práctica activa.
* **Dashboard con KPIs:** Ver estadísticas clave (KPIs) del estado de la plataforma (Estudiantes Activos, Prácticas por Aprobar, etc.).

### Módulo de Empresa
* **Autenticación Propia:** Login seguro para el panel de empresa.
* **Gestión de Vacantes:** Publicar nuevas vacantes (que van a revisión del Admin), ver el estado de sus vacantes (ej. "En Revisión", "Abierta", "Cubierta") y cerrarlas manualmente.
* **Gestión de Candidatos:** Ver y gestionar la lista de estudiantes que se han postulado a sus vacantes.
* **Flujo de Aprobación (Empresa):** Aprobar o rechazar candidatos, enviando la postulación al Admin para la revisión final.
* **Seguimiento de Prácticas:** Ver un historial de sus prácticas activas y finalizadas, y añadir comentarios de seguimiento desde su propio "Panel de Detalles".

### Módulo de Estudiante
* **Autenticación Propia:** Login seguro para el panel de estudiante.
* **Dashboard con KPIs:** Ver un resumen de su proceso (Postulaciones Activas, Vacantes Disponibles, Mensajes Nuevos).
* **Búsqueda Segura de Vacantes:** Buscar y postularse *únicamente* a vacantes que ya han sido aprobadas por la universidad.
* **Seguimiento de Postulaciones:** Ver el estado en tiempo real de "Mis Postulaciones" (ej. "Recibida", "En Revisión Universidad", "Aprobada", "Rechazada por Empresa", etc.).
* **Seguimiento de Prácticas Activas:** Acceder al "Panel de Detalles" de sus prácticas aprobadas para ver el historial y añadir sus propios comentarios de seguimiento.

## 3. Stack Tecnológico

* **Backend:** **Python 3.12** con **FastAPI**.
* **Frontend:** **React.js 18** (construido con Vite).
* **Base de Datos:** **PostgreSQL**.
* **Autenticación:** Sistema de tokens JWT con hashing de contraseñas (Argon2).
* **Librerías Clave (Backend):** SQLAlchemy (ORM), Pydantic (Validación), Uvicorn (Servidor ASGI).
* **Librerías Clave (Frontend):** Axios (Cliente HTTP), React Router DOM (Enrutamiento).
* **Entorno de Despliegue (Pruebas):** Contenedores **LXC** en Proxmox.

