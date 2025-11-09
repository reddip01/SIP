from sqlalchemy import (Column, Integer, String, Text, ForeignKey, 
                        DateTime, Enum, UniqueConstraint, Boolean)
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum

from .database import Base # Importamos la Base declarativa de database.py

# --- Definición de ENUMs de Python ---

class EstadoPostulacionEnum(str, enum.Enum):
    Recibida = "Recibida"
    En_Revision_Empresa = "En Revisión Empresa" 
    En_Revision_Universidad = "En Revisión Universidad" 
    
    # Nuevos estados de rechazo
    Rechazada_por_Empresa = "Rechazada por Empresa"
    Rechazada_por_Universidad = "Rechazada por Universidad"

    Aprobada = "Aprobada"
    Rechazada = "Rechazada" 

class EstadoVacanteEnum(str, enum.Enum):
    En_Revision = "En Revisión"
    Abierta = "Abierta"
    Cerrada = "Cerrada"
    En_Proceso = "En Proceso"
    Cubierta = "Cubierta"

class RolUniversidadEnum(str, enum.Enum):
    Coordinador = "Coordinador"
    Administrador = "Administrador"
    Asistente = "Asistente"

class TipoDocumentoEnum(str, enum.Enum):
    Hoja_de_Vida = "Hoja de Vida"
    Certificado_Academico = "Certificado Académico"
    Informe_de_Practica = "Informe de Práctica"
    Otro = "Otro"

# --- Definición de Modelos (Tablas) ---

class ProgramaAcademico(Base):
    __tablename__ = "programas_academicos"

    id_programa = Column(Integer, primary_key=True, index=True)
    nombre_programa = Column(String(150), nullable=False, unique=True)
    facultad = Column(String(100), nullable=False)
    esta_activo = Column(Boolean, default=True, nullable=False)
    # Relación: Un programa tiene muchos estudiantes
    estudiantes = relationship("Estudiante", back_populates="programa")


class Empresa(Base):
    __tablename__ = "empresas"

    id_empresa = Column(Integer, primary_key=True, index=True)
    razon_social = Column(String(200), nullable=False, unique=True)
    nit = Column(String(20), nullable=False, unique=True)
    email_contacto = Column(String(100), nullable=False, unique=True)
    descripcion = Column(Text, nullable=True)
    hashed_password = Column(String, nullable=False)
    esta_activo = Column(Boolean, default=True, nullable=False)
    esta_activo = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())
    # Relación: Una empresa tiene muchas vacantes
    vacantes = relationship("Vacante", back_populates="empresa")


class UsuarioUniversidad(Base):
    __tablename__ = "usuarios_universidad"

    id_usuario = Column(Integer, primary_key=True, index=True)
    nombre = Column(String(100), nullable=False)
    email = Column(String(100), nullable=False, unique=True, index=True)
    rol = Column(Enum(RolUniversidadEnum, native_enum=False), nullable=False)
    
    # Campo para la contraseña hasheada (¡IMPORTANTE!)
    hashed_password = Column(String, nullable=False) 

    # Relación: Un usuario de U gestiona muchos historiales
    historiales_gestionados = relationship("HistorialEstadoPostulacion", back_populates="usuario_universidad")


class Estudiante(Base):
    __tablename__ = "estudiantes"

    id_estudiante = Column(Integer, primary_key=True, index=True)
    id_programa = Column(Integer, ForeignKey("programas_academicos.id_programa", ondelete="RESTRICT"), nullable=False)
    nombre = Column(String(100), nullable=False)
    apellido = Column(String(100), nullable=False)
    email_institucional = Column(String(100), nullable=False, unique=True, index=True)
    esta_activo = Column(Boolean, default=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    esta_activo = Column(Boolean, default=True, nullable=False)
    fecha_creacion = Column(DateTime(timezone=True), server_default=func.now())

    # Relación: Un estudiante pertenece a un programa
    programa = relationship("ProgramaAcademico", back_populates="estudiantes")
    # Relación: Un estudiante tiene muchas postulaciones
    postulaciones = relationship("Postulacion", back_populates="estudiante")


class Vacante(Base):
    __tablename__ = "vacantes"

    id_vacante = Column(Integer, primary_key=True, index=True)
    id_empresa = Column(Integer, ForeignKey("empresas.id_empresa", ondelete="CASCADE"), nullable=False)
    titulo_vacante = Column(String(200), nullable=False)
    descripcion_funciones = Column(Text, nullable=False)
    fecha_publicacion = Column(DateTime(timezone=True), server_default=func.now())
    estado = Column(Enum(EstadoVacanteEnum, native_enum=False), nullable=False, default=EstadoVacanteEnum.Abierta)

    # Relación: Una vacante pertenece a una empresa
    empresa = relationship("Empresa", back_populates="vacantes")
    # Relación: Una vacante tiene muchas postulaciones
    postulaciones = relationship("Postulacion", back_populates="vacante")


class Postulacion(Base):
    __tablename__ = "postulaciones"

    id_postulacion = Column(Integer, primary_key=True, index=True)
    id_estudiante = Column(Integer, ForeignKey("estudiantes.id_estudiante", ondelete="CASCADE"), nullable=False)
    id_vacante = Column(Integer, ForeignKey("vacantes.id_vacante", ondelete="CASCADE"), nullable=False)
    fecha_postulacion = Column(DateTime(timezone=True), server_default=func.now())
    estado_actual = Column(Enum(EstadoPostulacionEnum, native_enum=False), nullable=False, default=EstadoPostulacionEnum.Recibida)
    fecha_inicio_practica = Column(DateTime(timezone=True), nullable=True)
    fecha_fin_practica = Column(DateTime(timezone=True), nullable=True)

    # Relación: Una postulación es de un estudiante
    estudiante = relationship("Estudiante", back_populates="postulaciones")
    # Relación: Una postulación es para una vacante
    vacante = relationship("Vacante", back_populates="postulaciones")
    # Relación: Una postulación tiene muchos documentos
    documentos = relationship("DocumentoAdjunto", back_populates="postulacion")
    # Relación: Una postulación tiene un historial de estados
    historial_estados = relationship("HistorialEstadoPostulacion", back_populates="postulacion")


class DocumentoAdjunto(Base):
    __tablename__ = "documentos_adjuntos"

    id_documento = Column(Integer, primary_key=True, index=True)
    id_postulacion = Column(Integer, ForeignKey("postulaciones.id_postulacion", ondelete="CASCADE"), nullable=False)
    nombre_archivo = Column(String(255), nullable=False)
    tipo_documento = Column(Enum(TipoDocumentoEnum, native_enum=False), nullable=False)
    ruta_almacenamiento = Column(Text, nullable=False)
    fecha_carga = Column(DateTime(timezone=True), server_default=func.now())

    # Relación: Un documento pertenece a una postulación
    postulacion = relationship("Postulacion", back_populates="documentos")


class HistorialEstadoPostulacion(Base):
    __tablename__ = "historial_estados_postulacion"

    id_historial = Column(Integer, primary_key=True, index=True)
    id_postulacion = Column(Integer, ForeignKey("postulaciones.id_postulacion", ondelete="CASCADE"), nullable=False)
    estado = Column(Enum(EstadoPostulacionEnum, native_enum=False), nullable=False)
    fecha_cambio = Column(DateTime(timezone=True), server_default=func.now())
    comentarios = Column(Text, nullable=True)
    id_actor_universidad = Column(Integer, ForeignKey("usuarios_universidad.id_usuario", ondelete="SET NULL"), nullable=True)
    id_actor_empresa = Column(Integer, ForeignKey("empresas.id_empresa", ondelete="SET NULL"), nullable=True)
    id_actor_estudiante = Column(Integer, ForeignKey("estudiantes.id_estudiante", ondelete="SET NULL"), nullable=True)
    
    # Relación: Un historial pertenece a una postulación
    postulacion = relationship("Postulacion", back_populates="historial_estados")
    # Relación: Un historial es gestionado por un usuario de U
    usuario_universidad = relationship("UsuarioUniversidad", back_populates="historiales_gestionados")
    empresa = relationship("Empresa") # Nueva relación simple
    estudiante = relationship("Estudiante") # Nueva relación simple