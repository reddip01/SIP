from sqlalchemy.orm import Session, joinedload
from typing import List
from . import models, schemas, security

# --- FUNCIONES DE BÚSQUEDA DE USUARIOS (Para Login) ---

def get_admin_by_email(db: Session, email: str) -> models.UsuarioUniversidad | None:
    return db.query(models.UsuarioUniversidad).filter(models.UsuarioUniversidad.email == email).first()

def get_student_by_email(db: Session, email: str) -> models.Estudiante | None:
    return db.query(models.Estudiante).filter(models.Estudiante.email_institucional == email).first()

def get_empresa_by_email(db: Session, email: str) -> models.Empresa | None:
    return db.query(models.Empresa).filter(models.Empresa.email_contacto == email).first()

# --- FUNCIONES DE BÚSQUEDA POR ID ---

def get_programa_by_id(db: Session, programa_id: int) -> models.ProgramaAcademico | None:
    return db.query(models.ProgramaAcademico).filter(models.ProgramaAcademico.id_programa == programa_id).first()

def get_empresa_by_nit(db: Session, nit: str) -> models.Empresa | None:
    return db.query(models.Empresa).filter(models.Empresa.nit == nit).first()

# --- FUNCIONES DE CONTEO ---

def get_usuario_universidad_count(db: Session) -> int:
    return db.query(models.UsuarioUniversidad).count()

# --- FUNCIONES DE CREACIÓN (CREATE) ---

def create_usuario_universidad(db: Session, user: schemas.UsuarioUniversidadCreate) -> models.UsuarioUniversidad:
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

def create_empresa(db: Session, empresa: schemas.EmpresaCreate) -> models.Empresa:
    hashed_pass = security.hash_password(empresa.password)
    db_empresa = models.Empresa(
        razon_social=empresa.razon_social,
        nit=empresa.nit,
        email_contacto=empresa.email_contacto,
        descripcion=empresa.descripcion,
        hashed_password=hashed_pass
    )
    db.add(db_empresa)
    db.commit()
    db.refresh(db_empresa)
    return db_empresa

def create_vacante(db: Session, vacante: schemas.VacanteBase, empresa_id: int) -> models.Vacante:
    """Crea vacante en estado 'En Revisión' por defecto."""
    db_vacante = models.Vacante(
        titulo_vacante=vacante.titulo_vacante,
        descripcion_funciones=vacante.descripcion_funciones,
        estado=models.EstadoVacanteEnum.En_Revision.value, # Forzamos el estado con "En Revisión"
        id_empresa=empresa_id
    )
    db.add(db_vacante)
    db.commit()
    db.refresh(db_vacante)
    return db_vacante

def create_postulacion(db: Session, estudiante_id: int, vacante_id: int) -> models.Postulacion:
    """Crea postulación en estado 'Recibida' por defecto."""
    db_postulacion = models.Postulacion(
        id_estudiante=estudiante_id,
        id_vacante=vacante_id,
        estado_actual=models.EstadoPostulacionEnum.Recibida.value
    )
    db.add(db_postulacion)
    db.commit()
    db.refresh(db_postulacion)
    return db_postulacion

# --- LÓGICA DE NEGOCIO (GETTERS PARA DASHBOARDS) ---

# --- Funciones para ADMIN ---

def get_vacantes_por_estado(db: Session, estado: models.EstadoVacanteEnum) -> List[models.Vacante]:
    """[ADMIN] Obtiene vacantes por estado, cargando info de la empresa."""
    return db.query(models.Vacante)\
        .options(joinedload(models.Vacante.empresa))\
        .filter(models.Vacante.estado == estado.value)\
        .all()

def get_postulaciones_por_estado(db: Session, estado: models.EstadoPostulacionEnum) -> List[models.Postulacion]:
    """[ADMIN] Obtiene postulaciones por estado, cargando info de estudiante y vacante."""
    return db.query(models.Postulacion)\
        .options(
            joinedload(models.Postulacion.estudiante)
                .joinedload(models.Estudiante.programa), # Estudiante -> Programa
            joinedload(models.Postulacion.vacante)
                .joinedload(models.Vacante.empresa)     # Vacante -> Empresa
        )\
        .filter(models.Postulacion.estado_actual == estado.value)\
        .all()

# --- Funciones para EMPRESA ---

def get_vacantes_por_empresa(db: Session, empresa_id: int) -> List[models.Vacante]:
    """[EMPRESA] Obtiene todas las vacantes de una empresa."""
    return db.query(models.Vacante)\
        .filter(models.Vacante.id_empresa == empresa_id)\
        .order_by(models.Vacante.fecha_publicacion.desc())\
        .all()

def get_postulaciones_por_empresa(db: Session, empresa_id: int) -> List[models.Postulacion]:
    """[EMPRESA] Obtiene todas las postulaciones de una empresa, cargando info de estudiante."""
    return db.query(models.Postulacion)\
        .join(models.Vacante)\
        .filter(models.Vacante.id_empresa == empresa_id)\
        .options(
            joinedload(models.Postulacion.estudiante), # Carga el Estudiante
            joinedload(models.Postulacion.vacante)    # Carga la Vacante (para el título)
        )\
        .order_by(models.Postulacion.fecha_postulacion.desc())\
        .all()

# --- Funciones para ESTUDIANTE ---

def get_vacantes_disponibles(db: Session) -> List[models.Vacante]:
    """[ESTUDIANTE] Obtiene todas las vacantes 'Abiertas', cargando info de la empresa."""
    return db.query(models.Vacante)\
        .options(joinedload(models.Vacante.empresa))\
        .filter(models.Vacante.estado == models.EstadoVacanteEnum.Abierta.value)\
        .all()

def get_postulacion_existente(db: Session, estudiante_id: int, vacante_id: int) -> models.Postulacion | None:
    """[ESTUDIANTE] Verifica si un estudiante ya se postuló a una vacante."""
    return db.query(models.Postulacion).filter(
        models.Postulacion.id_estudiante == estudiante_id,
        models.Postulacion.id_vacante == vacante_id
    ).first()

def get_postulaciones_por_estudiante(db: Session, estudiante_id: int) -> List[models.Postulacion]:
    """[ESTUDIANTE] Obtiene el historial de postulaciones, cargando info de la vacante."""
    return db.query(models.Postulacion)\
        .options(
            joinedload(models.Postulacion.vacante)
                .joinedload(models.Vacante.empresa) # Vacante -> Empresa
        )\
        .filter(models.Postulacion.id_estudiante == estudiante_id)\
        .order_by(models.Postulacion.fecha_postulacion.desc())\
        .all()