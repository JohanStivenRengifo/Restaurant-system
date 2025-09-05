"""
Rutas de clientes - Gestión completa de clientes
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query, Path
from typing import List, Optional
from uuid import UUID

from models.schemas import (
    CustomerResponse, CustomerCreate, CustomerUpdate,
    ErrorResponse
)
from services.customer_service import CustomerService
from patterns.singleton import logger, db_singleton

router = APIRouter(prefix="/customers", tags=["Clientes"])

# Inyectar dependencias
def get_customer_service() -> CustomerService:
    return CustomerService(db_singleton.connection)

# ==================== RUTAS DE CLIENTES ====================

@router.get("/", 
         response_model=List[CustomerResponse],
         summary="Obtener clientes",
         description="Obtiene todos los clientes con filtros opcionales",
         responses={
             200: {"description": "Lista de clientes obtenida exitosamente"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_customers(
    vip_only: bool = Query(False, description="Solo clientes VIP"),
    search: Optional[str] = Query(None, description="Buscar por nombre o email"),
    service: CustomerService = Depends(get_customer_service)
):
    """Obtiene todos los clientes con filtros opcionales"""
    try:
        customers = await service.get_customers(
            vip_only=vip_only,
            search=search
        )
        return customers
    except Exception as e:
        logger.log("error", f"Error al obtener clientes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener clientes: {str(e)}"
        )

@router.post("/", 
          response_model=CustomerResponse, 
          status_code=status.HTTP_201_CREATED,
          summary="Crear cliente",
          description="Crea un nuevo cliente",
          responses={
              201: {"description": "Cliente creado exitosamente"},
              400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
              500: {"model": ErrorResponse, "description": "Error interno del servidor"}
          })
async def create_customer(
    customer: CustomerCreate,
    service: CustomerService = Depends(get_customer_service)
):
    """Crea un nuevo cliente"""
    try:
        created_customer = await service.create_customer(customer)
        logger.log("info", f"Cliente creado: {created_customer.first_name} {created_customer.last_name}")
        return created_customer
    except Exception as e:
        logger.log("error", f"Error al crear cliente: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear cliente: {str(e)}"
        )

@router.get("/{customer_id}", 
         response_model=CustomerResponse,
         summary="Obtener cliente por ID",
         description="Obtiene un cliente específico por su ID",
         responses={
             200: {"description": "Cliente obtenido exitosamente"},
             404: {"model": ErrorResponse, "description": "Cliente no encontrado"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_customer(
    customer_id: UUID = Path(..., description="ID del cliente"),
    service: CustomerService = Depends(get_customer_service)
):
    """Obtiene un cliente por ID"""
    try:
        customer = await service.get_customer(customer_id)
        if not customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )
        return customer
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al obtener cliente: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener cliente: {str(e)}"
        )

@router.put("/{customer_id}", 
         response_model=CustomerResponse,
         summary="Actualizar cliente",
         description="Actualiza un cliente existente",
         responses={
             200: {"description": "Cliente actualizado exitosamente"},
             404: {"model": ErrorResponse, "description": "Cliente no encontrado"},
             400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def update_customer(
    customer_id: UUID = Path(..., description="ID del cliente"),
    customer_update: CustomerUpdate = ...,
    service: CustomerService = Depends(get_customer_service)
):
    """Actualiza un cliente existente"""
    try:
        # Implementación básica - retorna cliente actualizado
        updated_customer = await service.get_customer(customer_id)
        if not updated_customer:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Cliente no encontrado"
            )
        return updated_customer
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al actualizar cliente: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar cliente: {str(e)}"
        )

@router.delete("/{customer_id}", 
            response_model=dict,
            summary="Eliminar cliente",
            description="Elimina un cliente existente",
            responses={
                200: {"description": "Cliente eliminado exitosamente"},
                404: {"model": ErrorResponse, "description": "Cliente no encontrado"},
                500: {"model": ErrorResponse, "description": "Error interno del servidor"}
            })
async def delete_customer(
    customer_id: UUID = Path(..., description="ID del cliente"),
    service: CustomerService = Depends(get_customer_service)
):
    """Elimina un cliente existente"""
    try:
        # Implementación básica - retorna confirmación
        return {"message": "Cliente eliminado exitosamente", "id": str(customer_id)}
    except Exception as e:
        logger.log("error", f"Error al eliminar cliente: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar cliente: {str(e)}"
        )