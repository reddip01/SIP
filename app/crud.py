from sqlalchemy.orm import Session
from typing import List
from . import models, schemas, security # Importamos security para hashear

# --- FUNCIONES DE BÚSQUEDA DE USUARIOS (Para Login) ---

def get_admin_by_email(db: Session, email: str) -> models.UsuarioUniversidad:
    """Busca un usuario administrador por su email."""
    return db.query(models.UsuarioUniversidad).filter(models.UsuarioUniversidad.email == email).first()

def get_student_by_email(db: Session, email: str) -> models.Estudiante:
    """Busca un estudiante por su email institucional."""
    return db.query(models.Estudiante).filter(models.Estudiante.email_institucional == email).first()

# --- FUNCIONES DE CREACIÓN DE USUARIOS (Para Módulo Admin) ---

def create_usuario_universidad(db: Session, user: schemas.UsuarioUniversidadCreate) -> models.UsuarioUniversidad:
    """Crea un nuevo usuario de la universidad (Admin, Coord, etc.)"""
    hashed_pass = security.hash_password(user.password)
    db_user = models.UsuarioUniversidad(
        email=user.email,
        nombre=user.nombre,
        rol=user.rol.value,  
        hashed_password=hashed_pass
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def create_estudiante(db: Session, student: schemas.EstudianteCreate) -> models.Estudiante:
    """Crea un nuevo estudiante"""
    hashed_pass = security.hash_password(student.password)
    db_student = models.Estudiante(
        email_institucional=student.email_institucional,
        nombre=student.nombre,
        apellido=student.apellido,
        id_programa=student.id_programa,
        hashed_password=hashed_pass
    )
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

# funcion de conteo

def get_usuario_universidad_count(db: Session) -> int:
    """Cuenta el número total de usuarios de universidad."""
    return db.query(models.UsuarioUniversidad).count()

# Registro de empresas

def get_empresa_by_nit(db: Session, nit: str) -> models.Empresa:
    """Busca una empresa por su NIT."""
    return db.query(models.Empresa).filter(models.Empresa.nit == nit).first()

def get_empresa_by_email(db: Session, email: str) -> models.Empresa:
    """Busca una empresa por su email de contacto."""
    return db.query(models.Empresa).filter(models.Empresa.email_contacto == email).first()

def create_empresa(db: Session, empresa: schemas.EmpresaCreate) -> models.Empresa:
    """Crea una nueva empresa con contraseña hasheada."""
    hashed_pass = security.hash_password(empresa.password) # <-- CAMBIO
    db_empresa = models.Empresa(
        razon_social=empresa.razon_social,
        nit=empresa.nit,
        email_contacto=empresa.email_contacto,
        descripcion=empresa.descripcion,
        hashed_password=hashed_pass # <-- CAMBIO
    )
    db.add(db_empresa)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

# validacion de programa apra registro de estudiantes

def get_programa_by_id(db: Session, programa_id: int) -> models.ProgramaAcademico:
    """Busca un programa académico por su ID."""
    return db.query(models.ProgramaAcademico).filter(models.ProgramaAcademico.id_programa == programa_id).first()

# funcion para crear vacantes

def create_vacante(db: Session, vacante: schemas.VacanteBase, empresa_id: int) -> models.Vacante:
    """Crea una nueva vacante asociada a una empresa.
    Por defecto, se crea en estado 'En Revisión' para aprobación del admin.
    """
    db_vacante = models.Vacante(
        titulo_vacante=vacante.titulo_vacante,
        descripcion_funciones=vacante.descripcion_funciones,
        # Usamos .value para obtener el string "En Revisión" (con espacio)
        estado=models.EstadoVacanteEnum.En_Revision.value, 
        id_empresa=empresa_id
    )
    db.add(db_vacante)
    db.commit()
    db.refresh(db_vacante)
    return db_vacante

# Logica estudiante

def get_vacantes_disponibles(db: Session) -> List[models.Vacante]:
    """[ESTUDIANTE] Obtiene todas las vacantes que están 'Abierta'."""
    return db.query(models.Vacante).filter(
        models.Vacante.estado == models.EstadoVacanteEnum.Abierta.value # <-- ¡ARREGLADO!
    ).all()

def get_postulacion_existente(db: Session, estudiante_id: int, vacante_id: int) -> models.Postulacion:
    """[ESTUDIANTE] Verifica si un estudiante ya se postuló a una vacante."""
    return db.query(models.Postulacion).filter(
        models.Postulacion.id_estudiante == estudiante_id,
        models.Postulacion.id_vacante == vacante_id
    ).first()

def create_postulacion(db: Session, estudiante_id: int, vacante_id: int) -> models.Postulacion:
    """[ESTUDIANTE] Crea una nueva postulación para un estudiante."""
    db_postulacion = models.Postulacion(
        id_estudiante=estudiante_id,
        id_vacante=vacante_id,
        # Usamos .value para el estado por defecto
        estado_actual=models.EstadoPostulacionEnum.Recibida.value # <-- ¡ARREGLADO!
    )
    db.add(db_postulacion)
    db.commit()
    db.refresh(db_postulacion)
    return db_postulacion

# funcion mostrar vacantes para revision a admin

def get_vacantes_por_estado(db: Session, estado: models.EstadoVacanteEnum) -> List[models.Vacante]:
    """Obtiene todas las vacantes con un estado específico."""
    # Usamos .value para comparar el string "En Revisión" con la BD
    return db.query(models.Vacante).filter(models.Vacante.estado == estado.value).all()

# funciones para ver y actualizar las postulaciones

def get_postulaciones_por_empresa(db: Session, empresa_id: int) -> List[models.Postulacion]:
    """Obtiene todas las postulaciones asociadas a las vacantes de una empresa."""
    return db.query(models.Postulacion)\
             .join(models.Vacante)\
             .filter(models.Vacante.id_empresa == empresa_id)\
             .all()

# verificar postulaciones aporbadas por empresas desde admin

def get_postulaciones_por_estado(db: Session, estado: models.EstadoPostulacionEnum) -> List[models.Postulacion]:
    """Obtiene todas las postulaciones con un estado específico."""
    return db.query(models.Postulacion).filter(
        models.Postulacion.estado_actual == estado.value
    ).all()