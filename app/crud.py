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

# Listar las empresas en el panel admin

def get_empresas(db: Session) -> List[models.Empresa]:
    """
    [ADMIN] Obtiene una lista de todas las empresas registradas.
    """
    return db.query(models.Empresa).order_by(models.Empresa.razon_social).all()

# funcion para activar e inactivar estudiantes
def get_estudiantes(db: Session) -> List[models.Estudiante]:
    """
    [ADMIN] Obtiene una lista de todos los estudiantes registrados.
    Carga la información de su programa.
    """
    return db.query(models.Estudiante)\
        .options(joinedload(models.Estudiante.programa))\
        .order_by(models.Estudiante.apellido)\
        .all()

# listar los programas

def get_programas(db: Session) -> List[models.ProgramaAcademico]:
    """
    [ADMIN] Obtiene una lista de todos los programas académicos.
    """
    return db.query(models.ProgramaAcademico).order_by(models.ProgramaAcademico.nombre_programa).all()

# traer practicas activas y finalizadas

def get_practicas_activas_y_finalizadas(db: Session) -> List[models.Postulacion]:
    """
    [ADMIN] Obtiene una lista de todas las prácticas Aprobadas o Cubiertas.
    Carga toda la información anidada para seguimiento.
    """
    estados_finalizados = [
        models.EstadoPostulacionEnum.Aprobada.value,
        models.EstadoPostulacionEnum.Rechazada_por_Empresa.value,
        models.EstadoPostulacionEnum.Rechazada_por_Universidad.value
    ]

    return db.query(models.Postulacion)\
        .options(
            joinedload(models.Postulacion.estudiante)
                .joinedload(models.Estudiante.programa),
            joinedload(models.Postulacion.vacante)
                .joinedload(models.Vacante.empresa)
        )\
        .filter(
            models.Postulacion.estado_actual.in_(estados_finalizados)
        )\
        .order_by(models.Postulacion.fecha_postulacion.desc())\
        .all()

# para traer los comentarios por postulacion

def get_historial_por_postulacion(db: Session, postulacion_id: int) -> List[models.HistorialEstadoPostulacion]:
    """
    Obtiene el historial completo de una postulación, cargando
    la info del actor (admin, empresa, o estudiante) que hizo el cambio.
    """
    return db.query(models.HistorialEstadoPostulacion)\
        .options(
            joinedload(models.HistorialEstadoPostulacion.usuario_universidad),
            joinedload(models.HistorialEstadoPostulacion.empresa),
            joinedload(models.HistorialEstadoPostulacion.estudiante)
        )\
        .filter(models.HistorialEstadoPostulacion.id_postulacion == postulacion_id)\
        .order_by(models.HistorialEstadoPostulacion.fecha_cambio.asc())\
        .all()

# crear un comentario en el historial

def create_historial_comentario(
    db: Session, 
    postulacion: models.Postulacion, 
    comentario: str, 
    actor: models.UsuarioUniversidad | models.Empresa | models.Estudiante
) -> models.HistorialEstadoPostulacion:
    """
    Crea una nueva entrada en el historial (solo un comentario, no un cambio de estado).
    Determina qué tipo de actor (admin, empresa, estudiante) lo está creando.
    """
    actor_data = {
        "id_actor_universidad": None,
        "id_actor_empresa": None,
        "id_actor_estudiante": None
    }

    if isinstance(actor, models.UsuarioUniversidad):
        actor_data["id_actor_universidad"] = actor.id_usuario
    elif isinstance(actor, models.Empresa):
        actor_data["id_actor_empresa"] = actor.id_empresa
    elif isinstance(actor, models.Estudiante):
        actor_data["id_actor_estudiante"] = actor.id_estudiante

    historial_entry = models.HistorialEstadoPostulacion(
        id_postulacion=postulacion.id_postulacion,
        estado=models.EstadoPostulacionEnum(postulacion.estado_actual), # Mantiene el estado actual
        comentarios=comentario,
        **actor_data
    )
    db.add(historial_entry)
    db.commit()
    db.refresh(historial_entry)
    return historial_entry

# Seguimiento practicas por empresa.

def get_practicas_finalizadas_por_empresa(db: Session, empresa_id: int) -> List[models.Postulacion]:
    """
    [EMPRESA] Obtiene un historial de todas las prácticas Aprobadas,
    Canceladas o Rechazadas asociadas a sus vacantes.
    """
    estados_finalizados = [
        models.EstadoPostulacionEnum.Aprobada.value,
        models.EstadoPostulacionEnum.Cancelada.value,
        models.EstadoPostulacionEnum.Rechazada_por_Empresa.value,
        models.EstadoPostulacionEnum.Rechazada_por_Universidad.value
    ]

    return db.query(models.Postulacion)\
        .join(models.Vacante)\
        .filter(models.Vacante.id_empresa == empresa_id)\
        .filter(models.Postulacion.estado_actual.in_(estados_finalizados))\
        .options(
            joinedload(models.Postulacion.estudiante),
            joinedload(models.Postulacion.vacante) # Ya no necesitamos cargar la empresa de nuevo
        )\
        .order_by(models.Postulacion.fecha_postulacion.desc())\
        .all()