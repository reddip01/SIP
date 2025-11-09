from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas, database, security, models

router = APIRouter()

# router para listar vacantes en empresa
@router.get("/vacantes/me", response_model=List[schemas.VacanteResponse])
def get_mis_vacantes(
    db: Session = Depends(database.get_db),
    current_empresa: models.Empresa = Depends(security.get_current_empresa_user)
):
    """
    [EMPRESA] Obtiene una lista de todas las vacantes creadas por la empresa autenticada.
    (Protegido: Solo Empresa)
    """
    return crud.get_vacantes_por_empresa(db=db, empresa_id=current_empresa.id_empresa)

@router.post("/vacantes", response_model=schemas.VacanteResponse, status_code=status.HTTP_201_CREATED)
def create_nueva_vacante(
    vacante: schemas.VacanteBase,
    db: Session = Depends(database.get_db),
    current_empresa: models.Empresa = Depends(security.get_current_empresa_user)
):
    """
    Crea una nueva vacante.
    El ID de la empresa se toma automáticamente del token de la empresa autenticada.
    (Protegido: Solo Empresas)
    """
    # Pasamos el id de la empresa desde el token, no desde el body del JSON
    return crud.create_vacante(db=db, vacante=vacante, empresa_id=current_empresa.id_empresa)

# botones para aprobar o rechazar la postulacion

@router.get("/postulaciones", response_model=List[schemas.PostulacionResponse])
def get_postulaciones_recibidas(
    db: Session = Depends(database.get_db),
    current_empresa: models.Empresa = Depends(security.get_current_empresa_user)
):
    """
    [EMPRESA] Obtiene todas las postulaciones recibidas para sus vacantes.
    (Protegido: Solo Empresa)
    """
    return crud.get_postulaciones_por_empresa(db=db, empresa_id=current_empresa.id_empresa)


@router.patch("/postulaciones/{postulacion_id}/aprobar", response_model=schemas.PostulacionResponse)
def aprobar_postulacion_empresa(
    postulacion_id: int,
    db: Session = Depends(database.get_db),
    current_empresa: models.Empresa = Depends(security.get_current_empresa_user)
):
    """
    [EMPRESA] Aprueba una postulación.
    Cambia el estado de 'Recibida' a 'En Revisión Universidad'.
    (Protegido: Solo Empresa)
    """
    postulacion = db.get(models.Postulacion, postulacion_id)
    if not postulacion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Postulación no encontrada.")
    
    # Seguridad: Asegurarse de que esta empresa sea dueña de la vacante
    if postulacion.vacante.id_empresa != current_empresa.id_empresa:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene permisos sobre esta postulación.")
        
    # Lógica de estado
    if postulacion.estado_actual != models.EstadoPostulacionEnum.Recibida.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"La postulación no está en estado 'Recibida'. Estado actual: {postulacion.estado_actual}")

    postulacion.estado_actual = models.EstadoPostulacionEnum.En_Revision_Universidad.value
    db.commit()
    db.refresh(postulacion)
    return postulacion


@router.patch("/postulaciones/{postulacion_id}/rechazar", response_model=schemas.PostulacionResponse)
def rechazar_postulacion_empresa(
    postulacion_id: int,
    # ¡CAMBIO 1! Aceptamos el nuevo schema
    datos_rechazo: schemas.RechazoInput,
    db: Session = Depends(database.get_db),
    current_empresa: models.Empresa = Depends(security.get_current_empresa_user)
):
    """
    [EMPRESA] Rechaza una postulación.
    Cambia el estado a 'Rechazada por Empresa' y guarda un comentario en el historial.
    """
    postulacion = db.get(models.Postulacion, postulacion_id)
    if not postulacion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Postulación no encontrada.")

    if postulacion.vacante.id_empresa != current_empresa.id_empresa:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="No tiene permisos sobre esta postulación.")

    # ¡CAMBIO 2! Actualizamos el estado
    postulacion.estado_actual = models.EstadoPostulacionEnum.Rechazada_por_Empresa.value

    # ¡CAMBIO 3! Creamos el registro en el historial
    historial = models.HistorialEstadoPostulacion(
        id_postulacion=postulacion_id,
        estado=models.EstadoPostulacionEnum.Rechazada_por_Empresa,
        id_actor_empresa=current_empresa.id_empresa, # Guardamos QUÉ empresa rechazó
        comentarios=datos_rechazo.comentarios       # Guardamos POR QUÉ
    )
    db.add(historial)

    db.commit()
    db.refresh(postulacion)
    return postulacion