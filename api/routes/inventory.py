"""
Rutas de inventario - Gestión completa de inventario
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query, Path
from typing import List, Optional
from uuid import UUID

from models.schemas import (
    InventoryItemResponse, InventoryItemCreate, InventoryItemUpdate,
    ErrorResponse
)
from services.inventory_service import InventoryService
from patterns.singleton import logger, db_singleton

router = APIRouter(prefix="/inventory", tags=["Inventario"])

# Inyectar dependencias
def get_inventory_service() -> InventoryService:
    return InventoryService(db_singleton.connection)

# ==================== RUTAS DE INVENTARIO ====================

@router.get("/", 
         response_model=List[InventoryItemResponse],
         summary="Obtener elementos del inventario",
         description="Obtiene todos los elementos del inventario con filtros opcionales",
         responses={
             200: {"description": "Lista de elementos del inventario obtenida exitosamente"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_inventory_items(
    low_stock_only: bool = Query(False, description="Solo elementos con stock bajo"),
    category: Optional[str] = Query(None, description="Filtrar por categoría"),
    service: InventoryService = Depends(get_inventory_service)
):
    """Obtiene todos los elementos del inventario con filtros opcionales"""
    try:
        items = await service.get_inventory_items(
            low_stock_only=low_stock_only,
            category=category
        )
        return items
    except Exception as e:
        logger.log("error", f"Error al obtener elementos del inventario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener elementos del inventario: {str(e)}"
        )

@router.get("/{item_id}", 
         response_model=InventoryItemResponse,
         summary="Obtener elemento del inventario por ID",
         description="Obtiene un elemento específico del inventario por su ID",
         responses={
             200: {"description": "Elemento del inventario encontrado exitosamente"},
             404: {"model": ErrorResponse, "description": "Elemento del inventario no encontrado"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_inventory_item(
    item_id: UUID = Path(..., description="ID único del elemento del inventario"),
    service: InventoryService = Depends(get_inventory_service)
):
    """Obtiene un elemento específico del inventario por su ID"""
    try:
        item = await service.get_inventory_item(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Elemento del inventario no encontrado"
            )
        return item
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al obtener elemento del inventario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener elemento del inventario: {str(e)}"
        )

@router.post("/", 
          response_model=InventoryItemResponse, 
          status_code=status.HTTP_201_CREATED,
          summary="Crear elemento del inventario",
          description="Crea un nuevo elemento del inventario",
          responses={
              201: {"description": "Elemento del inventario creado exitosamente"},
              400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
              500: {"model": ErrorResponse, "description": "Error interno del servidor"}
          })
async def create_inventory_item(
    item: InventoryItemCreate,
    service: InventoryService = Depends(get_inventory_service)
):
    """Crea un nuevo elemento del inventario"""
    try:
        created_item = await service.create_inventory_item(item)
        logger.log("info", f"Elemento del inventario creado: {created_item.name}")
        return created_item
    except Exception as e:
        logger.log("error", f"Error al crear elemento del inventario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear elemento del inventario: {str(e)}"
        )

@router.put("/{item_id}", 
           response_model=InventoryItemResponse,
           summary="Actualizar elemento del inventario",
           description="Actualiza un elemento existente del inventario",
           responses={
               200: {"description": "Elemento del inventario actualizado exitosamente"},
               404: {"model": ErrorResponse, "description": "Elemento del inventario no encontrado"},
               400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def update_inventory_item(
    item_id: UUID = Path(..., description="ID único del elemento del inventario"),
    item: InventoryItemUpdate = ...,
    service: InventoryService = Depends(get_inventory_service)
):
    """Actualiza un elemento existente del inventario"""
    try:
        updated_item = await service.update_inventory_item(item_id, item)
        if not updated_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Elemento del inventario no encontrado"
            )
        return updated_item
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al actualizar elemento del inventario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar elemento del inventario: {str(e)}"
        )

@router.delete("/{item_id}", 
              status_code=status.HTTP_204_NO_CONTENT,
              summary="Eliminar elemento del inventario",
              description="Elimina un elemento del inventario",
              responses={
                  204: {"description": "Elemento del inventario eliminado exitosamente"},
                  404: {"model": ErrorResponse, "description": "Elemento del inventario no encontrado"},
                  500: {"model": ErrorResponse, "description": "Error interno del servidor"}
              })
async def delete_inventory_item(
    item_id: UUID = Path(..., description="ID único del elemento del inventario"),
    service: InventoryService = Depends(get_inventory_service)
):
    """Elimina un elemento del inventario"""
    try:
        success = await service.delete_inventory_item(item_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Elemento del inventario no encontrado"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al eliminar elemento del inventario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar elemento del inventario: {str(e)}"
        )

@router.patch("/{item_id}/stock", 
             response_model=InventoryItemResponse,
             summary="Actualizar stock",
             description="Actualiza el stock de un elemento del inventario",
             responses={
                 200: {"description": "Stock actualizado exitosamente"},
                 404: {"model": ErrorResponse, "description": "Elemento del inventario no encontrado"},
                 400: {"model": ErrorResponse, "description": "Cantidad inválida"},
                 500: {"model": ErrorResponse, "description": "Error interno del servidor"}
             })
async def update_stock(
    item_id: UUID = Path(..., description="ID único del elemento del inventario"),
    quantity: int = Query(..., ge=0, description="Nueva cantidad de stock"),
    service: InventoryService = Depends(get_inventory_service)
):
    """Actualiza el stock de un elemento del inventario"""
    try:
        updated_item = await service.update_stock(item_id, quantity)
        if not updated_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Elemento del inventario no encontrado"
            )
        return updated_item
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al actualizar stock: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar stock: {str(e)}"
        )