# --- ¡PRUEBA 1! ---

def test_read_root(client):
    """
    Caso de Prueba 1: Probar el endpoint raíz ('/').
    Verifica que la API esté viva y responda correctamente.
    """
    # 1. Hacemos la petición (usando el 'client' del conftest.py)
    response = client.get("/")
    
    # 2. Verificamos (afirmamos) los resultados
    assert response.status_code == 200
    assert response.json() == {"mensaje": "Bienvenido a la API del Sistema Integrado de Prácticas"}

# --- ¡PRUEBA 2! ---
def test_unauthorized_access(client):
    """
    Caso de Prueba 2: Probar que un endpoint protegido (ej. /api/admin/empresas)
    devuelve 401 si no se provee un token.
    """
    # 1. Hacemos la petición SIN token
    response = client.get("/api/admin/empresas")
    
    # 2. Afirmamos que la API nos rechazó correctamente
    assert response.status_code == 401
    assert response.json() == {"detail": "Not authenticated"}


# --- ¡PRUEBA 3! ---
def test_admin_login_and_get_me(client, db_session):
    """
    Caso de Prueba 3: Probar el flujo de creación y login de un Admin.
    1. Crea un Admin manualmente en la BD de pruebas.
    2. Intenta hacer login con ese Admin.
    3. Usa el token obtenido para llamar al endpoint /me.
    """
    from app import models, security, schemas

    # --- 1. SETUP: Crear el admin en la BD de pruebas ---
    # (Esto es lo que hace el "fixture" db_session tan útil)
    admin_user = models.UsuarioUniversidad(
        nombre="Admin de Prueba",
        email="admin.prueba@ucn.edu.co",
        rol=models.RolUniversidadEnum.Administrador,
        hashed_password=security.hash_password("password123")
    )
    db_session.add(admin_user)
    db_session.commit()

    # --- 2. ACCIÓN: Intentar hacer login ---
    login_data = {
        "username": "admin.prueba@ucn.edu.co",
        "password": "password123"
    }
    # (Usamos 'data=' para enviar form-data, no 'json=')
    response_login = client.post("/api/auth/login", data=login_data)

    # --- 3. VERIFICACIÓN (Login) ---
    assert response_login.status_code == 200
    token_data = response_login.json()
    assert "access_token" in token_data
    assert token_data["token_type"] == "bearer"
    
    # --- 4. ACCIÓN 2: Usar el token para llamar a /me ---
    token = token_data["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    response_me = client.get("/api/auth/me", headers=headers)

    # --- 5. VERIFICACIÓN (Get Me) ---
    assert response_me.status_code == 200
    me_data = response_me.json()
    assert me_data["user_type"] == "admin"
    assert me_data["user_data"]["email"] == "admin.prueba@ucn.edu.co"

# --- ¡PRUEBA 4! ---

def test_admin_creates_empresa(client, test_admin):
    """
    Caso de Prueba 4: [ADMIN]
    Prueba que un admin autenticado pueda crear una nueva empresa.
    """
    # 1. Login como el Admin que creó el fixture
    response_login = client.post("/api/auth/login", data={
        "username": "admin.fixture@ucn.edu.co",
        "password": "adminpass"
    })
    assert response_login.status_code == 200
    token = response_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Datos de la nueva empresa
    empresa_data = {
        "razon_social": "Nueva Empresa Creada por Admin",
        "nit": "987.654.321-0",
        "email_contacto": "nueva.empresa@test.com",
        "password": "nuevopassword"
    }
    
    # 3. Petición para crear la empresa (usando el token de admin)
    response_create = client.post("/api/admin/empresas", headers=headers, json=empresa_data)
    
    # 4. Verificación
    assert response_create.status_code == 201 # 201 = Created
    assert response_create.json()["razon_social"] == "Nueva Empresa Creada por Admin"
    assert response_create.json()["esta_activo"] == True

# --- ¡PRUEBA 5! ---

def test_empresa_creates_vacante(client, test_empresa):
    """
    Caso de Prueba 5: [EMPRESA]
    Prueba que una empresa autenticada pueda crear una vacante.
    Verifica que la vacante se cree en estado "En Revisión".
    """
    # 1. Login como la Empresa que creó el fixture
    response_login = client.post("/api/auth/login", data={
        "username": "empresa.fixture@test.com",
        "password": "empresapass"
    })
    assert response_login.status_code == 200
    token = response_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Datos de la nueva vacante
    vacante_data = {
        "titulo_vacante": "Vacante de Prueba de Empresa",
        "descripcion_funciones": "Funciones de prueba."
    }
    
    # 3. Petición para crear la vacante (usando el token de empresa)
    response_create = client.post("/api/empresas/vacantes", headers=headers, json=vacante_data)
    
    # 4. Verificación
    assert response_create.status_code == 201
    assert response_create.json()["titulo_vacante"] == "Vacante de Prueba de Empresa"
    # ¡Esta es una prueba clave de nuestra lógica de negocio!
    assert response_create.json()["estado"] == "En Revisión"

# --- ¡PRUEBA 6! ---

def test_student_views_vacancies(client, test_student):
    """
    Caso de Prueba 6: [ESTUDIANTE]
    Prueba que un estudiante autenticado pueda ver la lista de vacantes.
    Debe estar vacía (porque la vacante de la prueba 5 está "En Revisión", no "Abierta").
    """
    # 1. Login como el Estudiante que creó el fixture
    response_login = client.post("/api/auth/login", data={
        "username": "estudiante.fixture@ucn.edu.co",
        "password": "studentpass"
    })
    assert response_login.status_code == 200
    token = response_login.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Petición para ver vacantes (usando el token de estudiante)
    response_get = client.get("/api/estudiantes/vacantes", headers=headers)
    
    # 3. Verificación
    assert response_get.status_code == 200
    # La lista debe estar vacía porque no hay vacantes en estado "Abierta"
    assert response_get.json() == []

