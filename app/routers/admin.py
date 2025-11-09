from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas, database, security, models

router = APIRouter()

# --- Endpoint de Creación de Usuarios de Universidad  ---

@router.post("/usuarios", response_model=schemas.UsuarioUniversidadResponse, status_code=status.HTTP_201_CREATED)
def create_admin_user(
    user: schemas.UsuarioUniversidadCreate, 
    db: Session = Depends(database.get_db)
):
    """
    Crea un usuario de la universidad (Admin, Coordinador, Asistente).
    
    **IMPORTANTE:** Este endpoint tiene una lógica especial.
    1. Si es el PRIMER usuario creado en el sistema, permite crearlo sin autenticación
       y DEBE tener el rol de 'Administrador'.
    2. Si ya existen usuarios, SÓLO un 'Administrador' autenticado puede crear más.
    """
    
    # 1. Comprobar si es el primer usuario
    user_count = crud.get_usuario_universidad_count(db)
    
    if user_count > 0:
        # Si ya hay usuarios, exigir autenticación de admin
        # (fallará si no se provee un token de admin válido)
        try:
            admin_user = security.get_current_admin_user(Depends(security.get_current_user), db)
        except HTTPException:
             raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Se requiere autenticación de administrador para crear nuevos usuarios."
            )

    else:
        # Es el primer usuario. Forzar que sea 'Administrador'
        if user.rol != models.RolUniversidadEnum.Administrador:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="El primer usuario del sistema debe tener el rol de 'Administrador'."
            )

    # 2. Verificar que el email no exista ya
    db_user = crud.get_admin_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="El correo electrónico ya está registrado."
        )
    
    # 3. Crear el usuario
    return crud.create_usuario_universidad(db=db, user=user)


# --- Endpoints Protegidos (requieren ser Admin/Coordinador) ---

@router.post("/programas", response_model=schemas.ProgramaAcademicoResponse, status_code=status.HTTP_201_CREATED)
def create_programa_academico(
    programa: schemas.ProgramaAcademicoCreate,
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    Crea un nuevo programa académico.
    (Protegido: Solo Admin/Coordinador)
    """
    # Aquí iría la lógica para verificar si ya existe,
    db_programa = models.ProgramaAcademico(**programa.dict())
    db.add(db_programa)
    db.commit()
    db.refresh(db_programa)
    return db_programa

@router.post("/estudiantes", response_model=schemas.EstudianteResponse, status_code=status.HTTP_201_CREATED)
def create_estudiante_user(
    student: schemas.EstudianteCreate,
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    Crea un nuevo estudiante en el sistema.
    (Protegido: Solo Admin/Coordinador)
    """
    db_student = crud.get_student_by_email(db, email=student.email_institucional)
    if db_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="El correo institucional del estudiante ya está registrado."
        )
    
    # --- VALIDACIÓN DE PROGRAMA ---
    # Verificamos que el id_programa exista antes de crear el estudiante
    db_programa = crud.get_programa_by_id(db, programa_id=student.id_programa)
    if not db_programa:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail=f"El programa con id {student.id_programa} no existe. No se puede crear el estudiante."
        )
    # --- FIN DE VALIDACIÓN ---
    
    return crud.create_estudiante(db=db, student=student)

#creacion de empresa

@router.post("/empresas", response_model=schemas.EmpresaResponse, status_code=status.HTTP_201_CREATED)
def create_empresa_registro(
    empresa: schemas.EmpresaCreate,
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    Crea una nueva empresa en el sistema.
    (Protegido: Solo Admin/Coordinador)
    """
    db_empresa = crud.get_empresa_by_nit(db, nit=empresa.nit)
    if db_empresa:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, 
            detail="El NIT de la empresa ya está registrado."
        )
    
    
    return crud.create_empresa(db=db, empresa=empresa)

# vacantes por estado
def get_vacantes_por_estado(db: Session, estado: models.EstadoVacanteEnum) -> List[models.Vacante]:
    """Obtiene todas las vacantes con un estado específico."""
    return db.query(models.Vacante).filter(models.Vacante.estado == estado).all()

# endpoints para gestionar las vacantes

@router.get("/vacantes/pendientes", response_model=List[schemas.VacanteResponse])
def get_vacantes_pendientes_revision(
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Obtiene todas las vacantes que están 'En Revisión' (pendientes de aprobar).
    (Protegido: Solo Admin/Coordinador)
    """
    return crud.get_vacantes_por_estado(db, estado=models.EstadoVacanteEnum.En_Revision)


@router.patch("/vacantes/{vacante_id}/aprobar", response_model=schemas.VacanteResponse)
def aprobar_vacante(
    vacante_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Aprueba una vacante, cambiándola a estado 'Abierta'.
    (Protegido: Solo Admin/Coordinador)
    """
    vacante = db.get(models.Vacante, vacante_id)
    if not vacante:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La vacante no existe.")
    
    # Comprobamos que esté en revisión para no aprobar algo ya aprobado
    if vacante.estado != models.EstadoVacanteEnum.En_Revision.value:
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La vacante no está en estado 'En Revisión'.")

    vacante.estado = models.EstadoVacanteEnum.Abierta.value
    db.commit()
    db.refresh(vacante)
    return vacante


@router.patch("/vacantes/{vacante_id}/rechazar", response_model=schemas.VacanteResponse)
def rechazar_vacante(
    vacante_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Rechaza una vacante, cambiándola a estado 'Cerrada'.
    (Protegido: Solo Admin/Coordinador)
    """
    vacante = db.get(models.Vacante, vacante_id)
    if not vacante:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La vacante no existe.")
        
    vacante.estado = models.EstadoVacanteEnum.Cerrada.value
    db.commit()
    db.refresh(vacante)
    return vacante

# endpoints para que la universidad pueda aporbar o rechazar la postulacion aprobada por la empresa.

@router.get("/postulaciones/pendientes", response_model=List[schemas.PostulacionResponse])
def get_postulaciones_pendientes_admin(
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Obtiene todas las postulaciones pendientes de revisión por la universidad.
    (Protegido: Solo Admin/Coordinador)
    """
    return crud.get_postulaciones_por_estado(
        db, estado=models.EstadoPostulacionEnum.En_Revision_Universidad
    )


@router.patch("/postulaciones/{postulacion_id}/aprobar", response_model=schemas.PostulacionResponse)
def aprobar_postulacion_admin(
    postulacion_id: int,
    datos_aprobacion: schemas.AprobacionAdminInput, # Recibimos las fechas
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Da la aprobación final a una postulación.
    Cambia el estado a 'Aprobada' y guarda las fechas de inicio/fin.
    """
    postulacion = db.get(models.Postulacion, postulacion_id)
    if not postulacion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Postulación no encontrada.")

    if postulacion.estado_actual != models.EstadoPostulacionEnum.En_Revision_Universidad.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La postulación no está pendiente de revisión por la universidad.")

    # Actualizamos la postulación
    postulacion.estado_actual = models.EstadoPostulacionEnum.Aprobada.value
    postulacion.fecha_inicio_practica = datos_aprobacion.fecha_inicio_practica
    postulacion.fecha_fin_practica = datos_aprobacion.fecha_fin_practica
    # Marcamos la vacante como 'Cubierta'
    postulacion.vacante.estado = models.EstadoVacanteEnum.Cubierta.value 

    # Creamos el registro en el historial
    historial = models.HistorialEstadoPostulacion(
        id_postulacion=postulacion_id,
        estado=models.EstadoPostulacionEnum.Aprobada,
        # ¡Usamos el nuevo campo!
        id_actor_universidad=current_admin.id_usuario, 
        comentarios=datos_aprobacion.comentarios
    )
    db.add(historial)

    db.commit()
    db.refresh(postulacion)
    return postulacion

# para rechazo de una postulacion

@router.patch("/postulaciones/{postulacion_id}/rechazar", response_model=schemas.PostulacionResponse)
def rechazar_postulacion_admin(
    postulacion_id: int,
    # ¡CAMBIO 1! Aceptamos el nuevo schema
    datos_rechazo: schemas.RechazoInput, 
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Rechaza finalmente una postulación.
    Cambia el estado a 'Rechazada por Universidad' y guarda un comentario en el historial.
    """
    postulacion = db.get(models.Postulacion, postulacion_id)
    if not postulacion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Postulación no encontrada.")

    # ¡CAMBIO 2! Actualizamos el estado de la postulación
    postulacion.estado_actual = models.EstadoPostulacionEnum.Rechazada_por_Universidad.value

    # ¡CAMBIO 3! Creamos el registro en el historial
    historial = models.HistorialEstadoPostulacion(
        id_postulacion=postulacion_id,
        estado=models.EstadoPostulacionEnum.Rechazada_por_Universidad,
        id_actor_universidad=current_admin.id_usuario, # Guardamos QUIÉN rechazó
        comentarios=datos_rechazo.comentarios         # Guardamos POR QUÉ
    )
    db.add(historial)

    db.commit()
    db.refresh(postulacion)
    return postulacion

# Listar las empresas existentes.

@router.get("/empresas", response_model=List[schemas.EmpresaResponse])
def get_all_empresas(
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Obtiene una lista de todas las empresas registradas en el sistema.
    (Protegido: Solo Admin/Coordinador)
    """
    return crud.get_empresas(db=db)

# endpoints para activar e inactivar empresas

@router.patch("/empresas/{empresa_id}/activar", response_model=schemas.EmpresaResponse)
def activar_empresa(
    empresa_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Activa una empresa (esta_activo = True).
    (Protegido: Solo Admin/Coordinador)
    """
    empresa = db.get(models.Empresa, empresa_id)
    if not empresa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa no encontrada.")

    empresa.esta_activo = True
    db.commit()
    db.refresh(empresa)
    return empresa


@router.patch("/empresas/{empresa_id}/inactivar", response_model=schemas.EmpresaResponse)
def inactivar_empresa(
    empresa_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Inactiva una empresa (esta_activo = False).
    (Protegido: Solo Admin/Coordinador)
    """
    empresa = db.get(models.Empresa, empresa_id)
    if not empresa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Empresa no encontrada.")

    empresa.esta_activo = False
    db.commit()
    db.refresh(empresa)
    return empresa

# endpoints para activar e inactivar estudiantes

@router.get("/estudiantes", response_model=List[schemas.EstudianteResponse])
def get_all_estudiantes(
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Obtiene una lista de todos los estudiantes registrados.
    (Protegido: Solo Admin/Coordinador)
    """
    return crud.get_estudiantes(db=db)


@router.patch("/estudiantes/{estudiante_id}/activar", response_model=schemas.EstudianteResponse)
def activar_estudiante(
    estudiante_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Activa un estudiante (esta_activo = True).
    (Protegido: Solo Admin/Coordinador)
    """
    estudiante = db.get(models.Estudiante, estudiante_id)
    if not estudiante:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Estudiante no encontrado.")

    estudiante.esta_activo = True
    db.commit()
    db.refresh(estudiante)
    return estudiante


@router.patch("/estudiantes/{estudiante_id}/inactivar", response_model=schemas.EstudianteResponse)
def inactivar_estudiante(
    estudiante_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Inactiva un estudiante (esta_activo = False).
    (Protegido: Solo Admin/Coordinador)
    """
    estudiante = db.get(models.Estudiante, estudiante_id)
    if not estudiante:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Estudiante no encontrado.")

    estudiante.esta_activo = False
    db.commit()
    db.refresh(estudiante)
    return estudiante

# listar los programas

@router.get("/programas", response_model=List[schemas.ProgramaAcademicoResponse])
def get_all_programas(
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Obtiene una lista de todos los programas académicos.
    (Protegido: Solo Admin/Coordinador)
    """
    return crud.get_programas(db=db)

# activar o inactivar programas

@router.patch("/programas/{programa_id}/activar", response_model=schemas.ProgramaAcademicoResponse)
def activar_programa(
    programa_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Activa un programa académico (esta_activo = True).
    (Protegido: Solo Admin/Coordinador)
    """
    programa = db.get(models.ProgramaAcademico, programa_id)
    if not programa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Programa no encontrado.")

    programa.esta_activo = True
    db.commit()
    db.refresh(programa)
    return programa


@router.patch("/programas/{programa_id}/inactivar", response_model=schemas.ProgramaAcademicoResponse)
def inactivar_programa(
    programa_id: int,
    db: Session = Depends(database.get_db),
    current_admin: models.UsuarioUniversidad = Depends(security.get_current_admin_user)
):
    """
    [ADMIN] Inactiva un programa académico (esta_activo = False).
    (Protegido: Solo Admin/Coordinador)
    """
    programa = db.get(models.ProgramaAcademico, programa_id)
    if not programa:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Programa no encontrado.")

    programa.esta_activo = False
    db.commit()
    db.refresh(programa)
    return programa