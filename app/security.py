from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import JWTError, jwt
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional

from . import schemas, models, database
from sqlalchemy.orm import Session, joinedload

# --- CONFIGURACIÓN DE JWT ---
SECRET_KEY = "tu-clave-secreta-muy-larga-y-dificil-de-adivinar"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60  # Duración del token

# --- CONFIGURACIÓN DE HASHING DE CONTRASEÑAS ---
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# OAuth2 scheme: le dice a FastAPI cómo "extraer" el token del header
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña en texto plano coincide con el hash."""
    return pwd_context.verify(plain_password, hashed_password)

def hash_password(password: str) -> str:
    """Retorna el hash de una contraseña en texto plano."""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Crea un nuevo token de acceso JWT."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str, credentials_exception) -> schemas.TokenData:
    """Decodifica un token. Si es inválido, lanza una excepción."""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = schemas.TokenData(email=email)
    except JWTError:
        raise credentials_exception
    return token_data

# --- Función de Dependencia (para proteger endpoints) ---

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(database.get_db)):
    """
    Dependencia de FastAPI para obtener el usuario actual a partir del token.
    Esto se usará para proteger rutas.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudieron validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    token_data = decode_access_token(token, credentials_exception)
    
    # Busca el usuario en las TRES tablas
    user = db.query(models.UsuarioUniversidad).filter(models.UsuarioUniversidad.email == token_data.email).first()
    if user:
        return user
        
    user = db.query(models.Estudiante).options(joinedload(models.Estudiante.programa)).filter(models.Estudiante.email_institucional == token_data.email).first()
    if user:
        return user

    user = db.query(models.Empresa).filter(models.Empresa.email_contacto == token_data.email).first()
    if user:
        return user

    # Si no se encuentra en ninguna tabla, el token es válido pero el usuario ya no existe
    raise credentials_exception

# habilitar creacion de usuarios desde admin

def get_current_admin_user(
    current_user: models.UsuarioUniversidad = Depends(get_current_user)
) -> models.UsuarioUniversidad:
    """
    Dependencia que verifica que el usuario actual sea un
    'Administrador' o 'Coordinador'.
    """
    # Primero, nos aseguramos de que sea un UsuarioUniversidad (no un Estudiante)
    if not isinstance(current_user, models.UsuarioUniversidad):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Acceso denegado: Se requiere rol de administrador."
        )
        
    # Segundo, verificamos el rol
    if current_user.rol not in [models.RolUniversidadEnum.Administrador, models.RolUniversidadEnum.Coordinador]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail=f"Acceso denegado: El rol '{current_user.rol}' no tiene permisos."
        )
        
    return current_user

# Autorizacion para las empresas

def get_current_empresa_user(
    current_user: models.Empresa = Depends(get_current_user)
) -> models.Empresa:
    """
    Dependencia que verifica que el usuario actual sea una Empresa.
    """
    if not isinstance(current_user, models.Empresa):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Acceso denegado: Se requiere rol de empresa."
        )
    return current_user

# verificacion de usuario estudiante

def get_current_student_user(
    current_user: models.Estudiante = Depends(get_current_user)
) -> models.Estudiante:
    """
    Dependencia que verifica que el usuario actual sea un Estudiante.
    """
    if not isinstance(current_user, models.Estudiante):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, 
            detail="Acceso denegado: Se requiere rol de estudiante."
        )
    return current_user