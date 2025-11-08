from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
from datetime import timedelta

from .. import crud, schemas, security, database

router = APIRouter()

@router.post("/login", response_model=schemas.Token)
def login_for_access_token(
    db: Session = Depends(database.get_db), 
    form_data: OAuth2PasswordRequestForm = Depends()
):
    """
    Endpoint de inicio de sesión.
    Recibe un 'username' (que es el email) y 'password'.
    """
    user = None
    user_email = form_data.username
    
    # 1. Intentar autenticar como Administrador/Coordinador
    admin_user = crud.get_admin_by_email(db, email=user_email)
    if admin_user and security.verify_password(form_data.password, admin_user.hashed_password):
        user = admin_user
    
    # 2. Si no es admin, intentar autenticar como Estudiante
    if not user:
        student_user = crud.get_student_by_email(db, email=user_email)
        if student_user and security.verify_password(form_data.password, student_user.hashed_password):
            user = student_user
            user_email = student_user.email_institucional # Actualizamos al email correcto
            
    # 3. Si no, intentar autenticar como Empresa
    if not user:
        empresa_user = crud.get_empresa_by_email(db, email=user_email)
        if empresa_user and security.verify_password(form_data.password, empresa_user.hashed_password):
            user = empresa_user
            user_email = empresa_user.email_contacto # Actualizamos al email correcto

    # 4. Si no se encontró en ninguna tabla o la contraseña es incorrecta
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Email o contraseña incorrectos",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    # 5. Crear el token JWT
    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        data={"sub": user_email}, # Usamos la variable user_email 
        expires_delta=access_token_expires
    )
    
    return {"access_token": access_token, "token_type": "bearer"}