from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .. import crud, schemas, database, security, models

router = APIRouter()


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