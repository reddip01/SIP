from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas, database, security, models

router = APIRouter()

# postulaciones por estudiante
@router.get("/postulaciones/me", response_model=List[schemas.PostulacionResponse])
def get_mis_postulaciones(
    db: Session = Depends(database.get_db),
    current_student: models.Estudiante = Depends(security.get_current_student_user)
):
    """
    [ESTUDIANTE] Obtiene un historial de todas las postulaciones del estudiante autenticado.
    (Protegido: Solo Estudiante)
    """
    return crud.get_postulaciones_por_estudiante(db=db, estudiante_id=current_student.id_estudiante)

@router.get("/vacantes", response_model=List[schemas.VacanteResponse])
def get_todas_las_vacantes(
    db: Session = Depends(database.get_db),
    current_student: models.Estudiante = Depends(security.get_current_student_user)
):
    """
    Obtiene la lista de todas las vacantes disponibles (estado 'Abierta').
    (Protegido: Solo Estudiantes)
    """
    return crud.get_vacantes_disponibles(db=db)


@router.post("/vacantes/{vacante_id}/postular", response_model=schemas.PostulacionResponse, status_code=status.HTTP_201_CREATED)
def postular_a_vacante(
    vacante_id: int,
    db: Session = Depends(database.get_db),
    current_student: models.Estudiante = Depends(security.get_current_student_user)
):
    """
    Permite al estudiante autenticado postularse a una vacante específica.
    (Protegido: Solo Estudiantes)
    """
    # 1. Verificar que la vacante exista y esté abierta
    vacante = db.get(models.Vacante, vacante_id)
    if not vacante:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="La vacante no existe.")
    
    if vacante.estado != models.EstadoVacanteEnum.Abierta.value:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="La vacante no está abierta a postulaciones.")

    # 2. Verificar que el estudiante no se haya postulado ya
    postulacion_existente = crud.get_postulacion_existente(
        db, estudiante_id=current_student.id_estudiante, vacante_id=vacante_id
    )
    if postulacion_existente:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Ya te has postulado a esta vacante.")
        
    # 3. Crear la postulación
    return crud.create_postulacion(
        db=db, estudiante_id=current_student.id_estudiante, vacante_id=vacante_id
    )