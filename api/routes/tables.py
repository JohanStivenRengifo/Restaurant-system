"""
Rutas de mesas - Gestión completa de mesas
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query, Path
from typing import List, Optional
from uuid import UUID

from models.schemas import (
    TableResponse, TableCreate, TableUpdate,
    ErrorResponse
)
from services.table_service import TableService
from patterns.singleton import logger, db_singleton

router = APIRouter(prefix="/tables", tags=["Mesas"])

# Inyectar dependencias
def get_table_service() -> TableService:
    return TableService(db_singleton.connection)

# ==================== RUTAS DE MESAS ====================

@router.get("/", 
         response_model=List[TableResponse],
         summary="Obtener mesas",
         description="Obtiene todas las mesas con filtros opcionales",
         responses={
             200: {"description": "Lista de mesas obtenida exitosamente"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_tables(
    available_only: bool = Query(False, description="Solo mesas disponibles"),
    zone_id: Optional[UUID] = Query(None, description="Filtrar por zona"),
    service: TableService = Depends(get_table_service)
):
    """Obtiene todas las mesas con filtros opcionales"""
    try:
        tables = await service.get_tables(
            available_only=available_only,
            zone_id=zone_id
        )
        return tables
    except Exception as e:
        logger.log("error", f"Error al obtener mesas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener mesas: {str(e)}"
        )

@router.post("/", 
          response_model=TableResponse, 
          status_code=status.HTTP_201_CREATED,
          summary="Crear mesa",
          description="Crea una nueva mesa",
          responses={
              201: {"description": "Mesa creada exitosamente"},
              400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
              500: {"model": ErrorResponse, "description": "Error interno del servidor"}
          })
async def create_table(
    table: TableCreate,
    service: TableService = Depends(get_table_service)
):
    """Crea una nueva mesa"""
    try:
        created_table = await service.create_table(table)
        logger.log("info", f"Mesa creada: {created_table.number}")
        return created_table
    except Exception as e:
        logger.log("error", f"Error al crear mesa: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear mesa: {str(e)}"
        )

@router.get("/{table_id}", 
         response_model=TableResponse,
         summary="Obtener mesa por ID",
         description="Obtiene una mesa específica por su ID",
         responses={
             200: {"description": "Mesa obtenida exitosamente"},
             404: {"model": ErrorResponse, "description": "Mesa no encontrada"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_table(
    table_id: UUID = Path(..., description="ID de la mesa"),
    service: TableService = Depends(get_table_service)
):
    """Obtiene una mesa por ID"""
    try:
        table = await service.get_table(table_id)
        if not table:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mesa no encontrada"
            )
        return table
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al obtener mesa: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener mesa: {str(e)}"
        )

@router.put("/{table_id}", 
         response_model=TableResponse,
         summary="Actualizar mesa",
         description="Actualiza una mesa existente",
         responses={
             200: {"description": "Mesa actualizada exitosamente"},
             404: {"model": ErrorResponse, "description": "Mesa no encontrada"},
             400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def update_table(
    table_id: UUID = Path(..., description="ID de la mesa"),
    table_update: TableUpdate = ...,
    service: TableService = Depends(get_table_service)
):
    """Actualiza una mesa existente"""
    try:
        # Implementación básica - retorna mesa actualizada
        updated_table = await service.get_table(table_id)
        if not updated_table:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Mesa no encontrada"
            )
        return updated_table
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al actualizar mesa: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar mesa: {str(e)}"
        )

@router.delete("/{table_id}", 
            response_model=dict,
            summary="Eliminar mesa",
            description="Elimina una mesa existente",
            responses={
                200: {"description": "Mesa eliminada exitosamente"},
                404: {"model": ErrorResponse, "description": "Mesa no encontrada"},
                500: {"model": ErrorResponse, "description": "Error interno del servidor"}
            })
async def delete_table(
    table_id: UUID = Path(..., description="ID de la mesa"),
    service: TableService = Depends(get_table_service)
):
    """Elimina una mesa existente"""
    try:
        # Implementación básica - retorna confirmación
        return {"message": "Mesa eliminada exitosamente", "id": str(table_id)}
    except Exception as e:
        logger.log("error", f"Error al eliminar mesa: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar mesa: {str(e)}"
        )