from fastapi import FastAPI
from . import models
from .database import engine, Base

# Importar los routers (¡ahora importamos auth!)
from .routers import auth , admin , empresas , estudiantes

# --- CREACIÓN DE TABLAS ---
Base.metadata.create_all(bind=engine)


# Instancia principal de la aplicación
app = FastAPI(
    title="Sistema Integrado de Prácticas (SIP)",
    description="API para la gestión de prácticas profesionales de la universidad.",
    version="0.1.0"
)

# --- Montar los Routers ---
# ¡Activamos el router de autenticación!
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(admin.router, prefix="/api/admin", tags=["Administrador"])
app.include_router(empresas.router, prefix="/api/empresas", tags=["Empresas"])
app.include_router(estudiantes.router, prefix="/api/estudiantes", tags=["Estudiantes"])


@app.get("/")
def read_root():
    return {"mensaje": "Bienvenido a la API del Sistema Integrado de Prácticas"}