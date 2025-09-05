"""
Modelos base usando Pydantic
"""
from pydantic import BaseModel, Field
from typing import Optional, Any, Dict
from datetime import datetime
from uuid import UUID, uuid4
from utils.timezone import get_bogota_now, format_bogota_timestamp


class BaseEntity(BaseModel):
    """Modelo base para todas las entidades"""
    id: UUID = Field(default_factory=uuid4)
    created_at: datetime = Field(default_factory=get_bogota_now)
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True
        json_encoders = {
            datetime: lambda v: format_bogota_timestamp(v),
            UUID: lambda v: str(v)
        }


class BaseResponse(BaseModel):
    """Modelo base para respuestas de la API"""
    success: bool = True
    message: str = ""
    data: Optional[Any] = None
    errors: Optional[Dict[str, Any]] = None


class PaginationParams(BaseModel):
    """Parámetros de paginación"""
    page: int = Field(default=1, ge=1)
    limit: int = Field(default=10, ge=1, le=100)
    sort_by: Optional[str] = None
    sort_order: str = Field(default="asc", pattern="^(asc|desc)$")


class PaginatedResponse(BaseResponse):
    """Respuesta paginada"""
    pagination: Optional[Dict[str, Any]] = None
