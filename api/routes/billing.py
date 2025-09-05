"""
Rutas de facturación - Gestión completa de facturación y pagos
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query, Path
from typing import List, Optional
from uuid import UUID

from models.schemas import (
    InvoiceResponse, InvoiceCreate, InvoiceUpdate,
    ErrorResponse
)
from services.billing_service import BillingService
from patterns.singleton import logger, db_singleton

router = APIRouter(prefix="/billing", tags=["Facturación"])

# Inyectar dependencias
def get_billing_service() -> BillingService:
    return BillingService(db_singleton.connection)

# ==================== RUTAS DE FACTURACIÓN ====================

@router.get("/", 
         response_model=List[InvoiceResponse],
         summary="Obtener facturas",
         description="Obtiene todas las facturas con filtros opcionales",
         responses={
             200: {"description": "Lista de facturas obtenida exitosamente"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_invoices(
    status_filter: Optional[str] = Query(None, description="Filtrar por estado de pago"),
    customer_id: Optional[UUID] = Query(None, description="Filtrar por ID de cliente"),
    service: BillingService = Depends(get_billing_service)
):
    """Obtiene todas las facturas con filtros opcionales"""
    try:
        invoices = await service.get_invoices(
            status_filter=status_filter,
            customer_id=customer_id
        )
        return invoices
    except Exception as e:
        logger.log("error", f"Error al obtener facturas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener facturas: {str(e)}"
        )

@router.get("/{invoice_id}", 
         response_model=InvoiceResponse,
         summary="Obtener factura por ID",
         description="Obtiene una factura específica por su ID",
         responses={
             200: {"description": "Factura encontrada exitosamente"},
             404: {"model": ErrorResponse, "description": "Factura no encontrada"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_invoice(
    invoice_id: UUID = Path(..., description="ID único de la factura"),
    service: BillingService = Depends(get_billing_service)
):
    """Obtiene una factura específica por su ID"""
    try:
        invoice = await service.get_invoice(invoice_id)
        if not invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Factura no encontrada"
            )
        return invoice
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al obtener factura: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener factura: {str(e)}"
        )

@router.post("/", 
          response_model=InvoiceResponse, 
          status_code=status.HTTP_201_CREATED,
          summary="Crear factura",
          description="Crea una nueva factura",
          responses={
              201: {"description": "Factura creada exitosamente"},
              400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
              500: {"model": ErrorResponse, "description": "Error interno del servidor"}
          })
async def create_invoice(
    invoice: InvoiceCreate,
    service: BillingService = Depends(get_billing_service)
):
    """Crea una nueva factura"""
    try:
        created_invoice = await service.create_invoice(invoice)
        logger.log("info", f"Factura creada: {created_invoice.invoice_number}")
        return created_invoice
    except Exception as e:
        logger.log("error", f"Error al crear factura: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear factura: {str(e)}"
        )

@router.patch("/{invoice_id}/payment", 
             response_model=InvoiceResponse,
             summary="Actualizar estado de pago",
             description="Actualiza el estado de pago de una factura",
             responses={
                 200: {"description": "Estado de pago actualizado exitosamente"},
                 404: {"model": ErrorResponse, "description": "Factura no encontrada"},
                 400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
                 500: {"model": ErrorResponse, "description": "Error interno del servidor"}
             })
async def update_payment_status(
    invoice_id: UUID = Path(..., description="ID único de la factura"),
    payment_status: str = Query(..., description="Nuevo estado de pago"),
    payment_method: str = Query(..., description="Método de pago"),
    service: BillingService = Depends(get_billing_service)
):
    """Actualiza el estado de pago de una factura"""
    try:
        updated_invoice = await service.update_invoice_payment_status(
            invoice_id, payment_status, payment_method
        )
        if not updated_invoice:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Factura no encontrada"
            )
        return updated_invoice
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al actualizar estado de pago: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar estado de pago: {str(e)}"
        )

@router.get("/stats/overview", 
           summary="Obtener estadísticas de facturación",
           description="Obtiene estadísticas generales de facturación",
           responses={
               200: {
                   "description": "Estadísticas obtenidas exitosamente",
                   "content": {
                       "application/json": {
                           "example": {
                               "total_revenue": 1250.50,
                               "pending_payments": 150.25,
                               "paid_invoices": 45,
                               "pending_invoices": 3,
                               "average_invoice_amount": 27.79,
                               "payment_methods": {
                                   "credit_card": 60,
                                   "cash": 25,
                                   "debit_card": 15
                               }
                           }
                       }
                   }
               },
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def get_billing_stats(service: BillingService = Depends(get_billing_service)):
    """Obtiene estadísticas generales de facturación"""
    try:
        stats = await service.get_billing_stats()
        return stats
    except Exception as e:
        logger.log("error", f"Error al obtener estadísticas de facturación: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener estadísticas de facturación: {str(e)}"
        )