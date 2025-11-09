# /app/routers/postulaciones.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas, database, security, models

router = APIRouter()

@router.get("/{postulacion_id}/historial", response_model=List[schemas.HistorialEstadoPostulacionResponse])
def get_historial_de_postulacion(
    postulacion_id: int,
    db: Session = Depends(database.get_db),
    current_user = Depends(security.get_current_user) # Protegido: debe estar logueado
):
    """
    [TODOS LOS ROLES] Obtiene el historial de seguimiento (comentarios)
    de una postulación específica.
    """
    # (En el futuro, aquí se puede añadir lógica de permisos
    # para asegurar que el estudiante/empresa solo vea sus propias postulaciones)
    
    postulacion = db.get(models.Postulacion, postulacion_id)
    if not postulacion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Postulación no encontrada.")

    return crud.get_historial_por_postulacion(db=db, postulacion_id=postulacion_id)


@router.post("/{postulacion_id}/comentarios", response_model=schemas.HistorialEstadoPostulacionResponse)
def add_comentario_a_postulacion(
    postulacion_id: int,
    comentario: schemas.ComentarioCreate,
    db: Session = Depends(database.get_db),
    current_user = Depends(security.get_current_user) # Protegido
):
    """
    [TODOS LOS ROLES] Añade un comentario de seguimiento a una postulación.
    """
    postulacion = db.get(models.Postulacion, postulacion_id)
    if not postulacion:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Postulación no encontrada.")
    
    # (Aquí también iría la lógica de permisos)

    return crud.create_historial_comentario(
        db=db,
        postulacion=postulacion,
        comentario=comentario.comentarios,
        actor=current_user
    )