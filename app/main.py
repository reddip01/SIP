# /app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from . import models
from .database import engine, Base

# Importar TODOS tus routers
from .routers import auth, admin, empresas, estudiantes, postulaciones

# --- 1. CREACIÓN DE TABLAS ---
# Esto crea las tablas basado en models.py si no existen
Base.metadata.create_all(bind=engine)

# --- 2. INSTANCIA PRINCIPAL DE APP ---
app = FastAPI(
    title="Sistema Integrado de Prácticas (SIP)",
    description="API para la gestión de prácticas profesionales de la universidad.",
    version="0.1.0"
)

# --- 3. CONFIGURACIÓN DE CORS (¡DEBE IR AQUÍ!) ---
# Esto debe ir ANTES de incluir los routers.
origins = [
    "http://localhost:5173",
    "http://192.168.1.12:5173",
    "http://localhost:5174", 
    "http://192.168.1.12:5174", 
    "http://localhost",
    "http://192.168.1.12",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,       # Qué dominios pueden conectarse
    allow_credentials=True,      # Permite cookies/tokens
    allow_methods=["*"],         # Permite todos los métodos (GET, POST, etc.)
    allow_headers=["*"],         # Permite todos los headers
)

# --- 4. INCLUIR LOS ROUTERS (DEBEN IR DESPUÉS DE CORS) ---
app.include_router(auth.router, prefix="/api/auth", tags=["Autenticación"])
app.include_router(admin.router, prefix="/api/admin", tags=["Administrador"])
app.include_router(empresas.router, prefix="/api/empresas", tags=["Empresas"])
app.include_router(estudiantes.router, prefix="/api/estudiantes", tags=["Estudiantes"])
app.include_router(postulaciones.router, prefix="/api/postulaciones", tags=["Postulaciones"])


# --- 5. ENDPOINT RAÍZ ---
@app.get("/")
def read_root():
    return {"mensaje": "Bienvenido a la API del Sistema Integrado de Prácticas"}