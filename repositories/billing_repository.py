"""
Repositorio para gestión de facturación
"""
from typing import List, Optional, Dict, Any
from uuid import UUID
from datetime import datetime

from repositories.base import BaseRepository
from models.entities import Invoice, InvoiceStatus
from patterns.singleton import db_singleton
from utils.timezone import get_bogota_now, format_bogota_timestamp


class BillingRepository(BaseRepository[Invoice]):
    """Repositorio para gestión de facturación"""
    
    def __init__(self, db_connection=None):
        super().__init__('invoices')
        self.db_connection = db_connection or db_singleton.connection
    
    async def create_invoice(self, invoice_data: Dict[str, Any]) -> Optional[Invoice]:
        """Crea una nueva factura"""
        try:
            # Filtrar solo los campos que existen en la tabla invoices
            allowed_fields = {
                'id', 'invoice_number', 'order_id', 'customer_id', 
                'subtotal', 'tax_amount', 'discount_amount', 'total_amount',
                'status', 'issued_at', 'paid_at', 'created_by'
            }
            
            # Crear datos filtrados
            filtered_data = {k: v for k, v in invoice_data.items() if k in allowed_fields}
            
            # Asegurar que los timestamps estén en timezone de Bogotá
            if 'issued_at' in filtered_data and filtered_data['issued_at']:
                if hasattr(filtered_data['issued_at'], 'isoformat'):
                    filtered_data['issued_at'] = filtered_data['issued_at'].isoformat()
            if 'paid_at' in filtered_data and filtered_data['paid_at']:
                if hasattr(filtered_data['paid_at'], 'isoformat'):
                    filtered_data['paid_at'] = filtered_data['paid_at'].isoformat()
            
            # Convertir UUIDs a strings para la base de datos
            if 'id' in filtered_data and filtered_data['id']:
                filtered_data['id'] = str(filtered_data['id'])
            if 'order_id' in filtered_data and filtered_data['order_id']:
                filtered_data['order_id'] = str(filtered_data['order_id'])
            if 'customer_id' in filtered_data and filtered_data['customer_id']:
                filtered_data['customer_id'] = str(filtered_data['customer_id'])
            if 'created_by' in filtered_data and filtered_data['created_by']:
                filtered_data['created_by'] = str(filtered_data['created_by'])
            
            result = self.db_connection.table('invoices').insert(filtered_data).execute()
            
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
            
        except Exception as e:
            print(f"Error al crear factura: {e}")
            raise
    
    async def get_invoices(self, status_filter: Optional[str] = None, 
                          customer_id: Optional[UUID] = None) -> List[Invoice]:
        """Obtiene todas las facturas con filtros opcionales"""
        try:
            query = self.db_connection.table('invoices').select('*')
            
            if status_filter:
                query = query.eq('status', status_filter)
            
            if customer_id:
                query = query.eq('customer_id', str(customer_id))
            
            result = query.execute()
            
            if result.data:
                return [self._map_to_entity(item) for item in result.data]
            return []
            
        except Exception as e:
            print(f"Error al obtener facturas: {e}")
            raise
    
    async def get_invoice_by_id(self, invoice_id: UUID) -> Optional[Invoice]:
        """Obtiene una factura por ID"""
        try:
            result = self.db_connection.table('invoices').select('*').eq('id', str(invoice_id)).execute()
            
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
    
        except Exception as e:
            print(f"Error al obtener factura por ID: {e}")
            raise
    
    async def update_invoice(self, invoice_id: UUID, update_data: Dict[str, Any]) -> Optional[Invoice]:
        """Actualiza una factura"""
        try:
            # Asegurar que updated_at esté en timezone de Bogotá
            update_data['updated_at'] = get_bogota_now()
            
            # Convertir UUIDs a strings si existen
            if 'order_id' in update_data and update_data['order_id']:
                update_data['order_id'] = str(update_data['order_id'])
            if 'customer_id' in update_data and update_data['customer_id']:
                update_data['customer_id'] = str(update_data['customer_id'])
            
            result = self.db_connection.table('invoices').update(update_data).eq('id', str(invoice_id)).execute()
            
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
            
        except Exception as e:
            print(f"Error al actualizar factura: {e}")
            raise
    
    async def update_invoice_payment_status(self, invoice_id: UUID, status: str) -> Optional[Invoice]:
        """Actualiza el estado de pago de una factura"""
        try:
            update_data = {
                "status": status
            }
            
            if status == "paid":
                update_data["paid_at"] = get_bogota_now().isoformat()
            
            result = self.db_connection.table('invoices').update(update_data).eq('id', str(invoice_id)).execute()
            
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
            
        except Exception as e:
            print(f"Error al actualizar estado de pago: {e}")
            import traceback
            traceback.print_exc()
            raise
    
    async def delete_invoice(self, invoice_id: UUID) -> bool:
        """Elimina una factura"""
        try:
            result = self.db_connection.table('invoices').delete().eq('id', str(invoice_id)).execute()
            return len(result.data) > 0
            
        except Exception as e:
            print(f"Error al eliminar factura: {e}")
            raise
    
    def _map_to_entity(self, data: Dict[str, Any]) -> Invoice:
        """Mapea datos de la base de datos a entidad Invoice"""
        try:
            # Convertir string ID a UUID si es necesario
            if 'id' in data and isinstance(data['id'], str):
                data['id'] = UUID(data['id'])
            
            # Convertir order_id y customer_id a UUID si es necesario
            if 'order_id' in data and data['order_id'] and isinstance(data['order_id'], str):
                data['order_id'] = UUID(data['order_id'])
            if 'customer_id' in data and data['customer_id'] and isinstance(data['customer_id'], str):
                data['customer_id'] = UUID(data['customer_id'])
            if 'created_by' in data and data['created_by'] and isinstance(data['created_by'], str):
                data['created_by'] = UUID(data['created_by'])
            
            # Convertir fechas si es necesario
            if 'issued_at' in data and data['issued_at'] and isinstance(data['issued_at'], str):
                data['issued_at'] = datetime.fromisoformat(data['issued_at'].replace('Z', '+00:00'))
            if 'paid_at' in data and data['paid_at'] and isinstance(data['paid_at'], str):
                data['paid_at'] = datetime.fromisoformat(data['paid_at'].replace('Z', '+00:00'))
            if 'created_at' in data and data['created_at'] and isinstance(data['created_at'], str):
                data['created_at'] = datetime.fromisoformat(data['created_at'].replace('Z', '+00:00'))
            if 'updated_at' in data and data['updated_at'] and isinstance(data['updated_at'], str):
                data['updated_at'] = datetime.fromisoformat(data['updated_at'].replace('Z', '+00:00'))
            
            # Convertir objetos datetime a strings para evitar problemas de serialización
            for key, value in data.items():
                if isinstance(value, datetime):
                    data[key] = value.isoformat()
            
            return Invoice(**data)
            
        except Exception as e:
            print(f"Error al mapear datos de factura: {e}")
            raise