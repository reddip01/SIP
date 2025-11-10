## INFORMACIÓN INICIAL

Este proyecto fue desarrollado como parte del entregable final para el curso de **Ingeniería de Software**.

* **Autor:** José Daniel Castañeda Alzate
* **Institución:** Fundación Universitaria Católica del Norte

# Sistema Integrado de Prácticas (SIP)

## 1. Descripción del Proyecto

[cite_start]El **Sistema Integrado de Prácticas (SIP)** es una plataforma web completa diseñada para centralizar, digitalizar y optimizar la gestión de las prácticas profesionales de la universidad[cite: 126, 147].

[cite_start]Este proyecto nace como solución a la problemática actual, donde el proceso de prácticas se gestiona de forma manual y fragmentada a través de correos electrónicos, documentos físicos y formularios independientes[cite: 29, 127, 131]. [cite_start]Esto genera sobrecarga administrativa, demoras en las aprobaciones y una falta total de trazabilidad para los estudiantes, las empresas y el personal de la universidad[cite: 30, 132].

[cite_start]El SIP reemplaza este caos por una única fuente de verdad, conectando a los tres actores clave del proceso en un solo lugar[cite: 22, 58].

## 2. Características Principales

[cite_start]El sistema está construido con una arquitectura de tres módulos (frontend + API) y se basa en roles, proveyendo un *dashboard* específico para cada actor[cite: 139, 141, 143].

### Módulo de Administrador (Universidad)
* **Gestión Total de Usuarios:** Crear, activar e inactivar perfiles de Estudiantes, Empresas y Programas Académicos.
* [cite_start]**Flujo de Aprobación de Vacantes:** Revisar y aprobar las vacantes que publican las empresas antes de que sean visibles para los estudiantes[cite: 227].
* [cite_start]**Flujo de Aprobación de Prácticas:** Dar la aprobación final a las postulaciones de los estudiantes, asignando fechas de inicio/fin y añadiendo comentarios de historial[cite: 220, 227].
* **Seguimiento Integral:** Acceder a un panel de "Seguimiento" con el historial completo de todas las prácticas (aprobadas, canceladas, etc.).
* **Panel de Detalles:** Editar fechas, cancelar prácticas y añadir comentarios de seguimiento a cualquier práctica activa.
* [cite_start]**Dashboard con KPIs:** Ver estadísticas clave (KPIs) del estado de la plataforma (Estudiantes Activos, Prácticas por Aprobar, etc.)[cite: 201].

### Módulo de Empresa
* **Autenticación Propia:** Login seguro para el panel de empresa.
* **Gestión de Vacantes:** Publicar nuevas vacantes (que van a revisión del Admin), ver el estado de sus vacantes (ej. "En Revisión", "Abierta", "Cubierta") y cerrarlas manualmente.
* **Gestión de Candidatos:** Ver y gestionar la lista de estudiantes que se han postulado a sus vacantes.
* [cite_start]**Flujo de Aprobación (Empresa):** Aprobar o rechazar candidatos, enviando la postulación al Admin para la revisión final[cite: 227].
* **Seguimiento de Prácticas:** Ver un historial de sus prácticas activas y finalizadas, y añadir comentarios de seguimiento desde su propio "Panel de Detalles".

### Módulo de Estudiante
* **Autenticación Propia:** Login seguro para el panel de estudiante.
* [cite_start]**Dashboard con KPIs:** Ver un resumen de su proceso (Postulaciones Activas, Vacantes Disponibles, Mensajes Nuevos)[cite: 204, 228].
* [cite_start]**Búsqueda Segura de Vacantes:** Buscar y postularse *únicamente* a vacantes que ya han sido aprobadas por la universidad[cite: 217].
* [cite_start]**Seguimiento de Postulaciones:** Ver el estado en tiempo real de "Mis Postulaciones" (ej. "Recibida", "En Revisión Universidad", "Aprobada", "Rechazada por Empresa", etc.)[cite: 218].
* **Seguimiento de Prácticas Activas:** Acceder al "Panel de Detalles" de sus prácticas aprobadas para ver el historial y añadir sus propios comentarios de seguimiento.

## 3. Stack Tecnológico

* [cite_start]**Backend:** **Python 3.12** con **FastAPI**[cite: 186].
* [cite_start]**Frontend:** **React.js 18** (construido con Vite)[cite: 187].
* [cite_start]**Base de Datos:** **PostgreSQL**[cite: 188].
* **Autenticación:** Sistema de tokens JWT con hashing de contraseñas (Argon2).
* **Librerías Clave (Backend):** SQLAlchemy (ORM), Pydantic (Validación), Uvicorn (Servidor ASGI).
* **Librerías Clave (Frontend):** Axios (Cliente HTTP), React Router DOM (Enrutamiento).
* [cite_start]**Entorno de Despliegue (Pruebas):** Contenedores **LXC** en Proxmox[cite: 191].

