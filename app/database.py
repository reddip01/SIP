from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker

# --- CONFIGURACIÓN DE LA BASE DE DATOS ---
# Usamos los datos que me proporcionaste.
POSTGRES_USER = "postgres"
POSTGRES_PASSWORD = "q1w2e3r4"
POSTGRES_SERVER = "192.168.1.2"  # La IP de tu LXC de Base de Datos
POSTGRES_PORT = "5432"
POSTGRES_DB = "sip_db"           # Asegúrate de que esta BD exista

# URL de conexión de SQLAlchemy
DATABASE_URL = f"postgresql://{POSTGRES_USER}:{POSTGRES_PASSWORD}@{POSTGRES_SERVER}:{POSTGRES_PORT}/{POSTGRES_DB}"

# ------------------------------------------

# Motor de SQLAlchemy
engine = create_engine(DATABASE_URL)

# Creación de la sesión
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos (lo usaremos en models.py)
Base = declarative_base()

# Función para obtener la sesión de la base de datos en los endpoints
# Esto es crucial para un entorno de producción
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()