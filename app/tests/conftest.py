# /app/tests/conftest.py
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.main import app
from app.database import Base, get_db

# --- 1. CONFIGURACIÓN DE LA BASE DE DATOS DE PRUEBAS ---
# Usamos tu IP, pero la base de datos "sip_db_test"
SQLALCHEMY_DATABASE_URL = "postgresql://postgres:q1w2e3r4@192.168.1.2/sip_db_test"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# --- 2. FIXTURE DE BASE DE DATOS (El corazón de la prueba) ---
# Esto crea una sesión de BD limpia PARA CADA PRUEBA
@pytest.fixture(scope="function")
def db_session():
    # Antes de la prueba:
    Base.metadata.create_all(bind=engine)  # Crea todas las tablas
    db = TestingSessionLocal()
    try:
        yield db  # "Pausa" y entrega la sesión a la prueba
    finally:
        # Después de la prueba:
        db.close()
        Base.metadata.drop_all(bind=engine) # Borra todas las tablas

# --- 3. FIXTURE DEL CLIENTE DE API ---
# Esto simula tu aplicación
@pytest.fixture(scope="function")
def client(db_session):
    
    # Función "falsa" que usa la BD de pruebas
    def override_get_db():
        try:
            yield db_session
        finally:
            db_session.close()

    # Le decimos a FastAPI que use nuestra BD de pruebas en lugar de la real
    app.dependency_overrides[get_db] = override_get_db
    
    # Creamos y entregamos el "cliente" para hacer peticiones
    with TestClient(app) as c:
        yield c
    
    # Limpiamos la anulación después de la prueba
    app.dependency_overrides.pop(get_db, None)

# (Añadir al final de app/tests/conftest.py)
from app import models, security

@pytest.fixture(scope="function")
def test_admin(db_session):
    """Crea un usuario admin de prueba y lo guarda en la BD de pruebas."""
    admin_user = models.UsuarioUniversidad(
        nombre="Admin de Prueba Fixture",
        email="admin.fixture@ucn.edu.co",
        rol=models.RolUniversidadEnum.Administrador,
        hashed_password=security.hash_password("adminpass")
    )
    db_session.add(admin_user)
    db_session.commit()
    db_session.refresh(admin_user)
    return admin_user

@pytest.fixture(scope="function")
def test_empresa(db_session):
    """Crea una empresa de prueba y la guarda en la BD de pruebas."""
    empresa_user = models.Empresa(
        razon_social="Empresa de Prueba Fixture S.A.S.",
        nit="123.456.789-0",
        email_contacto="empresa.fixture@test.com",
        esta_activo=True,
        hashed_password=security.hash_password("empresapass")
    )
    db_session.add(empresa_user)
    db_session.commit()
    db_session.refresh(empresa_user)
    return empresa_user

@pytest.fixture(scope="function")
def test_programa(db_session):
    """Crea un programa académico de prueba."""
    programa = models.ProgramaAcademico(
        nombre_programa="Ingeniería de Software (Prueba)",
        facultad="Ingenierías",
        esta_activo=True
    )
    db_session.add(programa)
    db_session.commit()
    db_session.refresh(programa)
    return programa

@pytest.fixture(scope="function")
def test_student(db_session, test_programa):
    """Crea un estudiante de prueba (depende de test_programa)."""
    student_user = models.Estudiante(
        id_programa=test_programa.id_programa,
        nombre="Estudiante",
        apellido="De Prueba",
        email_institucional="estudiante.fixture@ucn.edu.co",
        esta_activo=True,
        hashed_password=security.hash_password("studentpass")
    )
    db_session.add(student_user)
    db_session.commit()
    db_session.refresh(student_user)
    return student_user