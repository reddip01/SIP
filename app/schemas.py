from __future__ import annotations
from pydantic import BaseModel, EmailStr
from typing import Optional, List, Union
from datetime import datetime
from .models import (EstadoPostulacionEnum, EstadoVacanteEnum, 
                       RolUniversidadEnum, TipoDocumentoEnum)

# --- Schemas para Tokens (Autenticación) ---

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[EmailStr] = None


# --- Schemas para ProgramaAcademico ---

class ProgramaAcademicoBase(BaseModel):
    nombre_programa: str
    facultad: str

class ProgramaAcademicoCreate(ProgramaAcademicoBase):
    pass

class ProgramaAcademicoResponse(ProgramaAcademicoBase):
    id_programa: int
    esta_activo: bool
    class Config:
        from_attributes = True # Permite a Pydantic leer modelos de SQLAlchemy


# --- Schemas para Empresa ---

class EmpresaBase(BaseModel):
    razon_social: str
    nit: str
    email_contacto: EmailStr
    descripcion: Optional[str] = None

class EmpresaCreate(EmpresaBase):
    password: str

class EmpresaResponse(EmpresaBase):
    id_empresa: int
    esta_activo: bool
    fecha_creacion: datetime

    class Config:
        from_attributes = True


# --- Schemas para UsuarioUniversidad (Admin) ---

class UsuarioUniversidadBase(BaseModel):
    nombre: str
    email: EmailStr
    rol: RolUniversidadEnum

class UsuarioUniversidadCreate(UsuarioUniversidadBase):
    password: str # Se recibe la contraseña en texto plano al crear

class UsuarioUniversidadResponse(UsuarioUniversidadBase):
    id_usuario: int

    class Config:
        from_attributes = True
        

# --- Schemas para Estudiante ---

class EstudianteBase(BaseModel):
    nombre: str
    apellido: str
    email_institucional: EmailStr
    id_programa: int

class EstudianteCreate(EstudianteBase):
    password: str # Se recibe la contraseña en texto plano al crear

class EstudianteResponse(EstudianteBase):
    id_estudiante: int
    esta_activo: bool
    fecha_creacion: datetime
    programa: ProgramaAcademicoResponse 

    class Config:
        from_attributes = True


# --- Schemas para Vacante ---

class VacanteBase(BaseModel):
    titulo_vacante: str
    descripcion_funciones: str


class VacanteCreate(VacanteBase):
    id_empresa: int # Se necesita saber qué empresa la crea

class VacanteResponse(VacanteBase):
    id_vacante: int
    id_empresa: int
    fecha_publicacion: datetime
    estado: EstadoVacanteEnum
    empresa: EmpresaResponse

    class Config:
        from_attributes = True


# --- Schemas para Postulacion ---

class PostulacionBase(BaseModel):
    id_estudiante: int
    id_vacante: int

class PostulacionCreate(PostulacionBase):
    pass # Los IDs son suficientes para crear

class PostulacionResponse(BaseModel):
    id_postulacion: int
    fecha_postulacion: datetime
    estado_actual: EstadoPostulacionEnum
    estudiante: EstudianteResponse
    vacante: VacanteResponse
    fecha_inicio_practica: Optional[datetime] = None
    fecha_fin_practica: Optional[datetime] = None

    class Config:
        from_attributes = True
        
# --- Schemas para DocumentoAdjunto ---

class DocumentoAdjuntoBase(BaseModel):
    nombre_archivo: str
    tipo_documento: TipoDocumentoEnum
    ruta_almacenamiento: str

class DocumentoAdjuntoCreate(DocumentoAdjuntoBase):
    id_postulacion: int

class DocumentoAdjuntoResponse(DocumentoAdjuntoBase):
    id_documento: int
    id_postulacion: int
    fecha_carga: datetime
    
    class Config:
        from_attributes = True

# --- Schemas para HistorialEstadoPostulacion ---

class HistorialEstadoBase(BaseModel):
    estado: EstadoPostulacionEnum
    comentarios: Optional[str] = None

class HistorialEstadoCreate(HistorialEstadoBase):
    id_postulacion: int
    # El ID del actor se manejará en el backend, no se envía desde el frontend
    
    
# --- REEMPLAZA TU HistorialEstadoPostulacionResponse POR ESTE ---
class HistorialEstadoPostulacionResponse(BaseModel):
    id_historial: int
    id_postulacion: int
    estado: EstadoPostulacionEnum
    fecha_cambio: datetime
    comentarios: Optional[str] = None
    
    # --- ¡DATOS DEL ACTOR! ---
    # Incluimos los objetos completos para saber QUIÉN hizo el comentario
    usuario_universidad: Optional[UsuarioUniversidadResponse] = None
    empresa: Optional[EmpresaResponse] = None
    estudiante: Optional[EstudianteResponse] = None

    class Config:
        from_attributes = True

# Este schema especial le dice al frontend que la respuesta
# puede ser CUALQUIERA de estos tres tipos de usuario.
class UserMeResponse(BaseModel):
    user_data: Union[UsuarioUniversidadResponse, EstudianteResponse, EmpresaResponse]
    user_type: str # Añadimos un campo extra para facilitar la vida al frontend

# schema para aprobacion
class AprobacionAdminInput(BaseModel):
    fecha_inicio_practica: datetime
    fecha_fin_practica: datetime
    comentarios: Optional[str] = None

# Para que se sepa como enviar comentarios
class RechazoInput(BaseModel):
    comentarios: Optional[str] = None

# Para el manejo de comentarios e historial

class ComentarioCreate(BaseModel):
    comentarios: str # El comentario es obligatorio

class FechasPracticaUpdate(BaseModel):
    fecha_inicio_practica: datetime
    fecha_fin_practica: datetime