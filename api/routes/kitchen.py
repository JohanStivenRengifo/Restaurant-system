"""
Rutas de cocina - Gestión completa de órdenes de cocina
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query, Path
from typing import List, Optional
from uuid import UUID

from models.schemas import (
    KitchenOrderResponse, KitchenOrderCreate, KitchenOrderUpdate,
    ErrorResponse
)
from services.kitchen_service import KitchenService
from patterns.singleton import logger, db_singleton

router = APIRouter(prefix="/kitchen", tags=["Cocina"])

# Inyectar dependencias
def get_kitchen_service() -> KitchenService:
    return KitchenService(db_singleton.connection)

# ==================== RUTAS DE COCINA ====================

@router.get("/", 
         response_model=List[KitchenOrderResponse],
         summary="Obtener órdenes de cocina",
         description="Obtiene todas las órdenes de cocina con filtros opcionales",
         responses={
             200: {"description": "Lista de órdenes de cocina obtenida exitosamente"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_kitchen_orders(
    status_filter: Optional[str] = Query(None, description="Filtrar por estado"),
    service: KitchenService = Depends(get_kitchen_service)
):
    """Obtiene todas las órdenes de cocina con filtros opcionales"""
    try:
        orders = await service.get_kitchen_orders(status_filter=status_filter)
        return orders
    except Exception as e:
        logger.log("error", f"Error al obtener órdenes de cocina: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener órdenes de cocina: {str(e)}"
        )

@router.get("/{order_id}", 
         response_model=KitchenOrderResponse,
         summary="Obtener orden de cocina por ID",
         description="Obtiene una orden específica de cocina por su ID",
         responses={
             200: {"description": "Orden de cocina encontrada exitosamente"},
             404: {"model": ErrorResponse, "description": "Orden de cocina no encontrada"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_kitchen_order(
    order_id: UUID = Path(..., description="ID único de la orden de cocina"),
    service: KitchenService = Depends(get_kitchen_service)
):
    """Obtiene una orden específica de cocina por su ID"""
    try:
        order = await service.get_kitchen_order(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Orden de cocina no encontrada"
            )
        return order
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al obtener orden de cocina: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener orden de cocina: {str(e)}"
        )

@router.post("/", 
          response_model=KitchenOrderResponse, 
          status_code=status.HTTP_201_CREATED,
          summary="Crear orden de cocina",
          description="Crea una nueva orden de cocina",
          responses={
              201: {"description": "Orden de cocina creada exitosamente"},
              400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
              500: {"model": ErrorResponse, "description": "Error interno del servidor"}
          })
async def create_kitchen_order(
    order: KitchenOrderCreate,
    service: KitchenService = Depends(get_kitchen_service)
):
    """Crea una nueva orden de cocina"""
    try:
        created_order = await service.create_kitchen_order(order)
        logger.log("info", f"Orden de cocina creada: {created_order.id}")
        return created_order
    except Exception as e:
        logger.log("error", f"Error al crear orden de cocina: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear orden de cocina: {str(e)}"
        )

@router.put("/{order_id}", 
           response_model=KitchenOrderResponse,
           summary="Actualizar orden de cocina",
           description="Actualiza una orden existente de cocina",
           responses={
               200: {"description": "Orden de cocina actualizada exitosamente"},
               404: {"model": ErrorResponse, "description": "Orden de cocina no encontrada"},
               400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def update_kitchen_order(
    order_id: UUID = Path(..., description="ID único de la orden de cocina"),
    order: KitchenOrderUpdate = ...,
    service: KitchenService = Depends(get_kitchen_service)
):
    """Actualiza una orden existente de cocina"""
    try:
        updated_order = await service.update_kitchen_order_status(order_id, order.status or "preparing")
        if not updated_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Orden de cocina no encontrada"
            )
        return updated_order
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al actualizar orden de cocina: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar orden de cocina: {str(e)}"
        )

@router.patch("/{order_id}/status", 
             response_model=KitchenOrderResponse,
             summary="Actualizar estado de orden",
             description="Actualiza el estado de una orden de cocina",
             responses={
                 200: {"description": "Estado de orden actualizado exitosamente"},
                 404: {"model": ErrorResponse, "description": "Orden de cocina no encontrada"},
                 400: {"model": ErrorResponse, "description": "Estado inválido"},
                 500: {"model": ErrorResponse, "description": "Error interno del servidor"}
             })
async def update_kitchen_order_status(
    order_id: UUID = Path(..., description="ID único de la orden de cocina"),
    new_status: str = Query(..., description="Nuevo estado de la orden"),
    service: KitchenService = Depends(get_kitchen_service)
):
    """Actualiza el estado de una orden de cocina"""
    try:
        updated_order = await service.update_kitchen_order_status(order_id, new_status)
        if not updated_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Orden de cocina no encontrada"
            )
        return updated_order
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al actualizar estado de orden: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar estado de orden: {str(e)}"
        )

@router.get("/stats/overview", 
           summary="Obtener estadísticas de cocina",
           description="Obtiene estadísticas generales de la cocina",
           responses={
               200: {
                   "description": "Estadísticas obtenidas exitosamente",
                   "content": {
                       "application/json": {
                           "example": {
                               "orders_pending": 5,
                               "orders_preparing": 3,
                               "orders_ready": 2,
                               "average_prep_time": 18.5,
                               "busy_hours": ["12:00-14:00", "19:00-21:00"],
                               "most_ordered_items": [
                                   {"name": "Ensalada César", "count": 15},
                                   {"name": "Pasta Carbonara", "count": 12}
                               ]
                           }
                       }
                   }
               },
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def get_kitchen_stats(service: KitchenService = Depends(get_kitchen_service)):
    """Obtiene estadísticas generales de la cocina"""
    try:
        stats = await service.get_kitchen_stats()
        return stats
    except Exception as e:
        logger.log("error", f"Error al obtener estadísticas de cocina: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estadísticas de cocina: {str(e)}"
        )