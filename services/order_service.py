"""
Servicio para gestión de pedidos - Versión simplificada
"""
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime

from models.schemas import OrderResponse, OrderCreate, OrderUpdate, OrderItemCreate, OrderItemResponse
from patterns.singleton import logger, db_singleton
from repositories.order_repository import OrderRepository, OrderItemRepository
from utils.timezone import get_bogota_now, format_bogota_timestamp

class OrderService:
    """Servicio para gestión de pedidos"""
    
    def __init__(self, db_connection=None):
        self.db_connection = db_connection
        self.order_repo = OrderRepository()
        self.order_item_repo = OrderItemRepository()
    
    async def get_orders(self, status_filter: Optional[str] = None, 
                        customer_id: Optional[UUID] = None,
                        table_id: Optional[UUID] = None) -> List[OrderResponse]:
        """Obtiene todos los pedidos con filtros opcionales"""
        try:
            logger.log("info", "Obteniendo pedidos", {
                "status_filter": status_filter,
                "customer_id": customer_id,
                "table_id": table_id
            })
            # Obtener pedidos de la DB usando el repositorio
            if customer_id:
                orders = self.order_repo.get_by_customer(str(customer_id))
            elif table_id:
                orders = self.order_repo.get_by_table(str(table_id))
            elif status_filter:
                orders = self.order_repo.get_by_status(status_filter)
            else:
                orders = self.order_repo.get_all()
            # Convertir a OrderResponse
            return [
                OrderResponse(
                    id=UUID(order.id),
                    order_number=order.order_number,
                    customer_id=UUID(order.customer_id),
                    table_id=UUID(order.table_id) if order.table_id else None,
                    status="pending",  # Por ahora hardcodeado, se puede implementar después
                    order_type="dine_in",  # Por ahora hardcodeado, se puede implementar después
                    subtotal=order.subtotal,
                    total_amount=order.total_amount,
                    tax_amount=order.tax_amount,
                    discount_amount=order.discount_amount,
                    special_instructions=order.special_instructions,
                    items=[],
                    created_at=order.created_at,
                    updated_at=order.updated_at
                )
                for order in orders
            ]
        except Exception as e:
            logger.log("error", f"Error al obtener pedidos: {e}")
            raise
    
    async def get_order(self, order_id: UUID) -> Optional[OrderResponse]:
        """Obtiene un pedido por ID"""
        try:
            logger.log("info", f"Obteniendo pedido: {order_id}")
            # Obtener pedido de la DB usando el repositorio
            order = self.order_repo.get_by_id(str(order_id))
            if not order:
                return None
            # Convertir a OrderResponse
            return OrderResponse(
                id=UUID(order.id),
                order_number=order.order_number,
                customer_id=UUID(order.customer_id),
                table_id=UUID(order.table_id) if order.table_id else None,
                status="pending",  # Por ahora hardcodeado, se puede implementar después
                order_type="dine_in",  # Por ahora hardcodeado, se puede implementar después
                subtotal=order.subtotal,
                total_amount=order.total_amount,
                tax_amount=order.tax_amount,
                discount_amount=order.discount_amount,
                special_instructions=order.special_instructions,
                items=[],
                created_at=order.created_at,
                updated_at=order.updated_at
                )
        except Exception as e:
            logger.log("error", f"Error al obtener pedido: {e}")
            raise
    
    async def create_order(self, order: OrderCreate) -> OrderResponse:
        """Crea un nuevo pedido"""
        try:
            logger.log("info", "Creando pedido", {"customer_id": order.customer_id})
            # Crear pedido en la DB usando el repositorio
            from models.entities import Order
            order_entity = Order(
                id=str(uuid4()),
                order_number=f"ORD-{int(get_bogota_now().timestamp())}",
                customer_id=str(order.customer_id),
                table_id=str(order.table_id) if order.table_id else None,
                order_type_id=None,  # Por ahora None, se puede implementar después
                status_id=None,  # Por ahora None, se puede implementar después
                subtotal=0.0,
                total_amount=0.0,
                tax_amount=0.0,
                discount_amount=0.0,
                special_instructions=order.special_instructions,
                created_by=None
            )
            created_order = self.order_repo.create(order_entity)
            if not created_order:
                raise Exception("Error al crear pedido en la DB")
            # Convertir a OrderResponse
            return OrderResponse(
                id=UUID(created_order.id),
                order_number=created_order.order_number,
                customer_id=UUID(created_order.customer_id),
                table_id=UUID(created_order.table_id) if created_order.table_id else None,
                status="pending",  # Por ahora hardcodeado, se puede implementar después
                order_type="dine_in",  # Por ahora hardcodeado, se puede implementar después
                subtotal=created_order.subtotal,
                total_amount=created_order.total_amount,
                tax_amount=created_order.tax_amount,
                discount_amount=created_order.discount_amount,
                special_instructions=created_order.special_instructions,
                items=[],
                created_at=created_order.created_at,
                updated_at=created_order.updated_at
            )
        except Exception as e:
            logger.log("error", f"Error al crear pedido: {e}")
            raise
    
    async def update_order(self, order_id: UUID, order: OrderUpdate) -> Optional[OrderResponse]:
        """Actualiza un pedido existente"""
        try:
            logger.log("info", f"Actualizando pedido: {order_id}")
            # Actualizar pedido en la DB usando el repositorio
            update_data = {
                "special_instructions": order.special_instructions,
                "updated_at": format_bogota_timestamp()
            }
            updated_order = self.order_repo.update(str(order_id), update_data)
            if not updated_order:
                return None
            # Convertir a OrderResponse
            return OrderResponse(
                id=UUID(updated_order.id),
                order_number=updated_order.order_number,
                customer_id=UUID(updated_order.customer_id),
                table_id=UUID(updated_order.table_id) if updated_order.table_id else None,
                status="pending",  # Por ahora hardcodeado, se puede implementar después
                order_type="dine_in",  # Por ahora hardcodeado, se puede implementar después
                subtotal=updated_order.subtotal,
                total_amount=updated_order.total_amount,
                tax_amount=updated_order.tax_amount,
                discount_amount=updated_order.discount_amount,
                special_instructions=updated_order.special_instructions,
                items=[],
                created_at=updated_order.created_at,
                updated_at=updated_order.updated_at
            )
        except Exception as e:
            logger.log("error", f"Error al actualizar pedido: {e}")
            raise
    
    async def delete_order(self, order_id: UUID) -> bool:
        """Elimina un pedido"""
        try:
            logger.log("info", f"Eliminando pedido: {order_id}")
            # Eliminar pedido de la DB usando el repositorio
            return self.order_repo.delete(str(order_id))
        except Exception as e:
            logger.log("error", f"Error al eliminar pedido: {e}")
            raise
    
    async def add_order_item(self, order_id: UUID, item: OrderItemCreate) -> OrderItemResponse:
        """Añade un elemento a un pedido"""
        try:
            logger.log("info", f"Añadiendo elemento al pedido: {order_id}")
            # Crear elemento de pedido en la DB usando el repositorio
            from models.entities import OrderItem
            item_entity = OrderItem(
                id=str(uuid4()),
                order_id=str(order_id),
                menu_item_id=str(item.menu_item_id),
                quantity=item.quantity,
                unit_price=0.0,
                total_price=0.0,
                special_instructions=item.special_instructions
            )
            created_item = self.order_item_repo.create(item_entity)
            if not created_item:
                raise Exception("Error al crear elemento de pedido en la DB")
            # Convertir a OrderItemResponse
            return OrderItemResponse(
                id=UUID(created_item.id),
                order_id=UUID(created_item.order_id),
                menu_item_id=UUID(created_item.menu_item_id),
                quantity=created_item.quantity,
                unit_price=created_item.unit_price,
                total_price=created_item.total_price,
                special_instructions=created_item.special_instructions,
                created_at=created_item.created_at
                )
        except Exception as e:
            logger.log("error", f"Error al añadir elemento al pedido: {e}")
            raise
    
    async def get_order_items(self, order_id: UUID) -> List[OrderItemResponse]:
        """Obtiene elementos de un pedido"""
        try:
            logger.log("info", f"Obteniendo elementos del pedido: {order_id}")
            # Obtener elementos de pedido de la DB usando el repositorio
            items = self.order_item_repo.get_by_order(str(order_id))
            # Convertir a OrderItemResponse
            return [
                OrderItemResponse(
                    id=UUID(item.id),
                    order_id=UUID(item.order_id),
                    menu_item_id=UUID(item.menu_item_id),
                    quantity=item.quantity,
                    unit_price=item.unit_price,
                    total_price=item.total_price,
                    special_instructions=item.special_instructions,
                    created_at=item.created_at
                )
                for item in items
            ]
        except Exception as e:
            logger.log("error", f"Error al obtener elementos del pedido: {e}")
            raise
    
    async def update_order_status(self, order_id: UUID, new_status: str) -> Optional[OrderResponse]:
        """Actualiza el estado de un pedido"""
        try:
            logger.log("info", f"Actualizando estado del pedido: {order_id} a {new_status}")
            # Actualizar estado del pedido en la DB usando el repositorio
            updated_order = self.order_repo.update_status(str(order_id), new_status)
            if not updated_order:
                return None
            # Convertir a OrderResponse
            return OrderResponse(
                id=UUID(updated_order.id),
                order_number=updated_order.order_number,
                customer_id=UUID(updated_order.customer_id),
                table_id=UUID(updated_order.table_id) if updated_order.table_id else None,
                status=new_status,  # Usar el nuevo estado
                order_type="dine_in",  # Por ahora hardcodeado, se puede implementar después
                subtotal=updated_order.subtotal,
                total_amount=updated_order.total_amount,
                tax_amount=updated_order.tax_amount,
                discount_amount=updated_order.discount_amount,
                special_instructions=updated_order.special_instructions,
                items=[],
                created_at=updated_order.created_at,
                updated_at=updated_order.updated_at
            )
        except Exception as e:
            logger.log("error", f"Error al actualizar estado del pedido: {e}")
            raise