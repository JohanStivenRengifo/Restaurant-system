"""
Rutas de reportes - Gestión completa de reportes y análisis
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query, Path
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from models.schemas import (
    ReportResponse, ReportCreate, ReportUpdate,
    ErrorResponse
)
from services.report_service import ReportService
from patterns.singleton import logger, db_singleton

router = APIRouter(prefix="/reports", tags=["Reportes"])

# Inyectar dependencias
def get_report_service() -> ReportService:
    return ReportService(db_singleton.connection)

# ==================== RUTAS DE REPORTES ====================

@router.get("/", 
         response_model=List[ReportResponse],
         summary="Obtener reportes",
         description="Obtiene todos los reportes con filtros opcionales",
         responses={
             200: {"description": "Lista de reportes obtenida exitosamente"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_reports(
    report_type: Optional[str] = Query(None, description="Filtrar por tipo de reporte"),
    service: ReportService = Depends(get_report_service)
):
    """Obtiene todos los reportes con filtros opcionales"""
    try:
        reports = await service.get_reports(report_type=report_type)
        return reports
    except Exception as e:
        logger.log("error", f"Error al obtener reportes: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener reportes: {str(e)}"
        )

@router.get("/{report_id}", 
         response_model=ReportResponse,
         summary="Obtener reporte por ID",
         description="Obtiene un reporte específico por su ID",
         responses={
             200: {"description": "Reporte encontrado exitosamente"},
             404: {"model": ErrorResponse, "description": "Reporte no encontrado"},
             500: {"model": ErrorResponse, "description": "Error interno del servidor"}
         })
async def get_report(
    report_id: UUID = Path(..., description="ID único del reporte"),
    service: ReportService = Depends(get_report_service)
):
    """Obtiene un reporte específico por su ID"""
    try:
        report = await service.get_report(report_id)
        if not report:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Reporte no encontrado"
            )
        return report
    except HTTPException:
        raise
    except Exception as e:
        logger.log("error", f"Error al obtener reporte: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener reporte: {str(e)}"
        )

@router.post("/", 
          response_model=ReportResponse, 
          status_code=status.HTTP_201_CREATED,
          summary="Crear reporte",
          description="Crea un nuevo reporte",
          responses={
              201: {"description": "Reporte creado exitosamente"},
              400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
              500: {"model": ErrorResponse, "description": "Error interno del servidor"}
          })
async def create_report(
    report: ReportCreate,
    service: ReportService = Depends(get_report_service)
):
    """Crea un nuevo reporte"""
    try:
        created_report = await service.create_report(report)
        logger.log("info", f"Reporte creado: {created_report.name}")
        return created_report
    except Exception as e:
        logger.log("error", f"Error al crear reporte: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear reporte: {str(e)}"
        )

@router.get("/sales/generate", 
           summary="Generar reporte de ventas",
           description="Genera un reporte de ventas para un período específico",
           responses={
               200: {
                   "description": "Reporte de ventas generado exitosamente",
                   "content": {
                       "application/json": {
                           "example": {
                               "period": {
                                   "start": "2025-09-01T00:00:00Z",
                                   "end": "2025-09-30T23:59:59Z"
                               },
                               "summary": {
                                   "total_revenue": 3750.25,
                                   "total_orders": 135,
                                   "average_order_value": 27.78,
                                   "growth_rate": 12.5
                               },
                               "top_items": [
                                   {"name": "Ensalada César", "quantity": 45, "revenue": 584.55}
                               ]
                           }
                       }
                   }
               },
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def generate_sales_report(
    start_date: datetime = Query(..., description="Fecha de inicio del período"),
    end_date: datetime = Query(..., description="Fecha de fin del período"),
    service: ReportService = Depends(get_report_service)
):
    """Genera un reporte de ventas para un período específico"""
    try:
        report = await service.generate_sales_report(start_date, end_date)
        return report
    except Exception as e:
        logger.log("error", f"Error al generar reporte de ventas: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar reporte de ventas: {str(e)}"
        )

@router.get("/inventory/generate", 
           summary="Generar reporte de inventario",
           description="Genera un reporte de inventario actual",
           responses={
               200: {
                   "description": "Reporte de inventario generado exitosamente",
                   "content": {
                       "application/json": {
                           "example": {
                               "summary": {
                                   "total_items": 45,
                                   "low_stock_items": 8,
                                   "out_of_stock_items": 2,
                                   "total_value": 1250.75
                               },
                               "low_stock": [
                                   {"name": "Tomates", "current": 5, "minimum": 10}
                               ]
                           }
                       }
                   }
               },
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def generate_inventory_report(service: ReportService = Depends(get_report_service)):
    """Genera un reporte de inventario actual"""
    try:
        report = await service.generate_inventory_report()
        return report
    except Exception as e:
        logger.log("error", f"Error al generar reporte de inventario: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al generar reporte de inventario: {str(e)}"
        )