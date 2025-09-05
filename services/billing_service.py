"""
Servicio para gestión de facturación - Con persistencia real
"""
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime

from models.schemas import InvoiceResponse, InvoiceCreate, InvoiceUpdate
from models.entities import Invoice, InvoiceStatus
from patterns.singleton import logger, db_singleton
from repositories.billing_repository import BillingRepository
from utils.timezone import get_bogota_now, format_bogota_timestamp


class BillingService:
    """Servicio para gestión de facturación"""
    
    def __init__(self, db_connection=None):
        self.db_connection = db_connection or db_singleton.connection
        self.billing_repo = BillingRepository(self.db_connection)
    
    async def get_invoices(self, status_filter: Optional[str] = None, 
                          customer_id: Optional[UUID] = None) -> List[InvoiceResponse]:
        """Obtiene todas las facturas con filtros opcionales"""
        try:
            logger.log("info", "Obteniendo facturas", {
                "status_filter": status_filter,
                "customer_id": customer_id
            })
            
            invoices = await self.billing_repo.get_invoices(status_filter, customer_id)
            
            # Convertir entidades a respuestas
            invoice_responses = []
            for invoice in invoices:
                invoice_responses.append(InvoiceResponse(
                    id=invoice.id,
                    invoice_number=invoice.invoice_number,
                    order_id=invoice.order_id,
                    customer_id=invoice.customer_id,
                    subtotal=invoice.subtotal,
                    tax_amount=invoice.tax_amount,
                    discount_amount=invoice.discount_amount,
                    total_amount=invoice.total_amount,
                    status=invoice.status.value if invoice.status else "pending",
                    issued_at=invoice.issued_at,
                    paid_at=invoice.paid_at,
                    created_by=invoice.created_by,
                    created_at=invoice.created_at,
                    updated_at=invoice.updated_at
                ))
            
            return invoice_responses
            
        except Exception as e:
            logger.log("error", f"Error al obtener facturas: {e}")
            raise
    
    async def get_invoice(self, invoice_id: UUID) -> Optional[InvoiceResponse]:
        """Obtiene una factura por ID (alias para get_invoice_by_id)"""
        return await self.get_invoice_by_id(invoice_id)
    
    async def get_invoice_by_id(self, invoice_id: UUID) -> Optional[InvoiceResponse]:
        """Obtiene una factura por ID"""
        try:
            logger.log("info", f"Obteniendo factura: {invoice_id}")
            
            invoice = await self.billing_repo.get_invoice_by_id(invoice_id)
            if not invoice:
                return None
            
            return InvoiceResponse(
                id=invoice.id,
                invoice_number=invoice.invoice_number,
                order_id=invoice.order_id,
                customer_id=invoice.customer_id,
                subtotal=invoice.subtotal,
                tax_amount=invoice.tax_amount,
                discount_amount=invoice.discount_amount,
                total_amount=invoice.total_amount,
                status=invoice.status.value if invoice.status else "pending",
                issued_at=invoice.issued_at,
                paid_at=invoice.paid_at,
                created_by=invoice.created_by,
                created_at=invoice.created_at,
                updated_at=invoice.updated_at
            )
            
        except Exception as e:
            logger.log("error", f"Error al obtener factura: {e}")
            raise
    
    async def create_invoice(self, invoice: InvoiceCreate) -> InvoiceResponse:
        """Crea una nueva factura"""
        try:
            logger.log("info", "Creando factura", {"customer_id": invoice.customer_id})
            
            # Generar número de factura único
            invoice_number = f"INV-{int(get_bogota_now().timestamp())}"
            
            # Crear entidad Invoice
            invoice_entity = Invoice(
                id=uuid4(),
                invoice_number=invoice_number,
                order_id=invoice.order_id,
                customer_id=invoice.customer_id,
                subtotal=invoice.subtotal,
                tax_amount=invoice.tax_amount,
                discount_amount=invoice.discount_amount,
                total_amount=invoice.total_amount,
                status=InvoiceStatus.PENDING,
                issued_at=get_bogota_now(),
                paid_at=None,
                created_by=None
            )
            
            # Guardar en la base de datos usando mode='json' para serialización automática
            invoice_data = invoice_entity.model_dump(mode='json')
            
            created_invoice = await self.billing_repo.create_invoice(invoice_data)
            if not created_invoice:
                raise Exception("No se pudo crear la factura en la base de datos")
            
            # Convertir a respuesta
            return InvoiceResponse(
                id=created_invoice.id,
                invoice_number=created_invoice.invoice_number,
                order_id=created_invoice.order_id,
                customer_id=created_invoice.customer_id,
                subtotal=created_invoice.subtotal,
                tax_amount=created_invoice.tax_amount,
                discount_amount=created_invoice.discount_amount,
                total_amount=created_invoice.total_amount,
                status=created_invoice.status.value if created_invoice.status else "pending",
                issued_at=created_invoice.issued_at,
                paid_at=created_invoice.paid_at,
                created_by=created_invoice.created_by,
                created_at=created_invoice.created_at,
                updated_at=created_invoice.updated_at
            )
            
        except Exception as e:
            logger.log("error", f"Error al crear factura: {e}")
            raise
    
    async def update_invoice_payment_status(self, invoice_id: UUID, status: str, 
                                          payment_method: str) -> Optional[InvoiceResponse]:
        """Actualiza el estado de pago de una factura"""
        try:
            logger.log("info", f"Actualizando estado de pago de factura: {invoice_id} a {status}")
            
            # Mapear status string a InvoiceStatus enum
            status_mapping = {
                "pending": InvoiceStatus.PENDING,
                "paid": InvoiceStatus.PAID,
                "cancelled": InvoiceStatus.CANCELLED,
                "refunded": InvoiceStatus.REFUNDED
            }
            
            invoice_status = status_mapping.get(status.lower(), InvoiceStatus.PENDING)
            
            # Preparar datos de actualización
            update_data = {
                "status": invoice_status.value,
                "paid_at": get_bogota_now() if status.lower() == "paid" else None
            }
            
            # Actualizar en la base de datos
            updated_invoice = await self.billing_repo.update_invoice_payment_status(invoice_id, invoice_status.value)
            if not updated_invoice:
                return None
            
            # Convertir a respuesta
            return InvoiceResponse(
                id=updated_invoice.id,
                invoice_number=updated_invoice.invoice_number,
                order_id=updated_invoice.order_id,
                customer_id=updated_invoice.customer_id,
                subtotal=updated_invoice.subtotal,
                tax_amount=updated_invoice.tax_amount,
                discount_amount=updated_invoice.discount_amount,
                total_amount=updated_invoice.total_amount,
                status=updated_invoice.status.value if updated_invoice.status else "pending",
                issued_at=updated_invoice.issued_at,
                paid_at=updated_invoice.paid_at,
                created_by=updated_invoice.created_by,
                created_at=updated_invoice.created_at,
                updated_at=updated_invoice.updated_at
            )
            
        except Exception as e:
            logger.log("error", f"Error al actualizar estado de pago: {e}")
            raise
    
    async def get_billing_stats(self) -> Dict[str, Any]:
        """Obtiene estadísticas de facturación"""
        try:
            logger.log("info", "Obteniendo estadísticas de facturación")
            
            # Obtener todas las facturas
            all_invoices = await self.billing_repo.get_invoices()
            
            total_invoices = len(all_invoices)
            total_revenue = sum(invoice.total_amount for invoice in all_invoices)
            paid_invoices = len([inv for inv in all_invoices if inv.status == InvoiceStatus.PAID])
            pending_invoices = len([inv for inv in all_invoices if inv.status == InvoiceStatus.PENDING])
            
            return {
                "total_invoices": total_invoices,
                "total_revenue": total_revenue,
                "paid_invoices": paid_invoices,
                "pending_invoices": pending_invoices,
                "average_invoice_amount": total_revenue / total_invoices if total_invoices > 0 else 0,
                "payment_rate": (paid_invoices / total_invoices * 100) if total_invoices > 0 else 0
            }
            
        except Exception as e:
            logger.log("error", f"Error al obtener estadísticas: {e}")
            raise