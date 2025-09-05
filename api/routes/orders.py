"""
Rutas de pedidos - Gestión completa de pedidos
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query, Path
from typing import List, Optional
from uuid import UUID

from models.schemas import (
    OrderResponse, OrderCreate, OrderUpdate, OrderItemCreate, OrderItemResponse,
    ErrorResponse
)
from pydantic import BaseModel
from services.order_service import OrderService
from patterns.singleton import logger, db_singleton
from models.entities import OrderStatus, OrderType

router = APIRouter(prefix="/orders", tags=["Pedidos"])

# Schema para actualizar estado
class OrderStatusUpdate(BaseModel):
    status: OrderStatus

# Inyectar dependencias
def get_order_service() -> OrderService:
    return OrderService(db_singleton.connection)

# ==================== RUTAS DE PEDIDOS ====================

@router.get("/", 
         response_model=List[OrderResponse],
         summary="Obtener pedidos",
         description="Obtiene todos los pedidos con filtros opcionales",
         responses={
             200: {"description": "Lista de pedidos obtenida exitosamente"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_orders(
    status_filter: Optional[OrderStatus] = Query(None, description="Filtrar por estado"),
    customer_id: Optional[UUID] = Query(None, description="Filtrar por cliente"),
    table_id: Optional[UUID] = Query(None, description="Filtrar por mesa"),
    service: OrderService = Depends(get_order_service)
):
    """Obtiene todos los pedidos con filtros opcionales"""
    try:
        orders = await service.get_orders(
            status_filter=status_filter,
            customer_id=customer_id,
            table_id=table_id
        )
        return orders
    except Exception as e:
        logger.log("error", f"Error al obtener pedidos: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener pedidos: {str(e)}"
        )

@router.get("/{order_id}", 
         response_model=OrderResponse,
         summary="Obtener pedido por ID",
         description="Obtiene un pedido específico por su ID",
         responses={
             200: {"description": "Pedido encontrado exitosamente"},
             404: {"model": ErrorResponse, "description": "Pedido no encontrado"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_order(
    order_id: UUID = Path(..., description="ID único del pedido"),
    service: OrderService = Depends(get_order_service)
):
    """Obtiene un pedido específico por su ID"""
    try:
        order = await service.get_order(order_id)
        if not order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado"
            )
        return order
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al obtener pedido: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener pedido: {str(e)}"
        )

@router.post("/", 
          response_model=OrderResponse, 
          status_code=status.HTTP_201_CREATED,
          summary="Crear pedido",
          description="Crea un nuevo pedido",
          responses={
              201: {"description": "Pedido creado exitosamente"},
              400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
              500: {"model": ErrorResponse, "description": "Error interno del servidor"}
          })
async def create_order(
    order: OrderCreate,
    service: OrderService = Depends(get_order_service)
):
    """Crea un nuevo pedido"""
    try:
        created_order = await service.create_order(order)
        logger.log("info", f"Pedido creado: {created_order.order_number}")
        return created_order
    except Exception as e:
        logger.log("error", f"Error al crear pedido: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear pedido: {str(e)}"
        )

@router.put("/{order_id}", 
           response_model=OrderResponse,
           summary="Actualizar pedido",
           description="Actualiza un pedido existente",
           responses={
               200: {"description": "Pedido actualizado exitosamente"},
               404: {"model": ErrorResponse, "description": "Pedido no encontrado"},
               400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def update_order(
    order: OrderUpdate,
    order_id: UUID = Path(..., description="ID único del pedido"),
    service: OrderService = Depends(get_order_service)
):
    """Actualiza un pedido existente"""
    try:
        updated_order = await service.update_order(order_id, order)
        if not updated_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado"
            )
        return updated_order
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al actualizar pedido: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar pedido: {str(e)}"
        )

@router.delete("/{order_id}", 
              status_code=status.HTTP_204_NO_CONTENT,
              summary="Eliminar pedido",
              description="Elimina un pedido",
              responses={
                  204: {"description": "Pedido eliminado exitosamente"},
                  404: {"model": ErrorResponse, "description": "Pedido no encontrado"},
                  500: {"model": ErrorResponse, "description": "Error interno del servidor"}
              })
async def delete_order(
    order_id: UUID = Path(..., description="ID único del pedido"),
    service: OrderService = Depends(get_order_service)
):
    """Elimina un pedido"""
    try:
        success = await service.delete_order(order_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado"
            )
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al eliminar pedido: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar pedido: {str(e)}"
        )

# ==================== RUTAS DE ELEMENTOS DE PEDIDO ====================

@router.post("/{order_id}/items", 
            response_model=OrderItemResponse, 
            status_code=status.HTTP_201_CREATED,
            summary="Añadir elemento al pedido",
            description="Añade un elemento a un pedido existente",
            responses={
                201: {"description": "Elemento añadido al pedido exitosamente"},
                404: {"model": ErrorResponse, "description": "Pedido no encontrado"},
                400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
                500: {"model": ErrorResponse, "description": "Error interno del servidor"}
            })
async def add_order_item(
    item: OrderItemCreate,
    order_id: UUID = Path(..., description="ID único del pedido"),
    service: OrderService = Depends(get_order_service)
):
    """Añade un elemento a un pedido existente"""
    try:
        order_item = await service.add_order_item(order_id, item)
        return order_item
    except Exception as e:
        logger.log("error", f"Error al añadir elemento al pedido: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al añadir elemento al pedido: {str(e)}"
        )

@router.get("/{order_id}/items", 
           response_model=List[OrderItemResponse],
           summary="Obtener elementos del pedido",
           description="Obtiene todos los elementos de un pedido",
           responses={
               200: {"description": "Elementos del pedido obtenidos exitosamente"},
               404: {"model": ErrorResponse, "description": "Pedido no encontrado"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def get_order_items(
    order_id: UUID = Path(..., description="ID único del pedido"),
    service: OrderService = Depends(get_order_service)
):
    """Obtiene todos los elementos de un pedido"""
    try:
        items = await service.get_order_items(order_id)
        return items
    except Exception as e:
        logger.log("error", f"Error al obtener elementos del pedido: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener elementos del pedido: {str(e)}"
        )

# ==================== RUTAS DE ESTADO DE PEDIDO ====================

@router.patch("/{order_id}/status", 
             response_model=OrderResponse,
             summary="Actualizar estado del pedido",
             description="Actualiza el estado de un pedido",
             responses={
                 200: {"description": "Estado del pedido actualizado exitosamente"},
                 404: {"model": ErrorResponse, "description": "Pedido no encontrado"},
                 400: {"model": ErrorResponse, "description": "Estado inválido"},
                 500: {"model": ErrorResponse, "description": "Error interno del servidor"}
             })
async def update_order_status(
    status_update: OrderStatusUpdate,
    order_id: UUID = Path(..., description="ID único del pedido"),
    service: OrderService = Depends(get_order_service)
):
    """Actualiza el estado de un pedido"""
    try:
        updated_order = await service.update_order_status(order_id, status_update.status)
        if not updated_order:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Pedido no encontrado"
            )
        return updated_order
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al actualizar estado del pedido: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar estado del pedido: {str(e)}"
        )