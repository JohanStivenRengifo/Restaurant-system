"""
Repositorio para gestión de pedidos
"""
from typing import List, Optional, Dict, Any
from models.entities import Order, OrderItem, OrderStatus, OrderType
from repositories.base import BaseRepository
from patterns.singleton import logger


class OrderRepository(BaseRepository[Order]):
    """Repositorio para pedidos"""
    
    def __init__(self):
        super().__init__("orders")
    
    def _map_to_entity(self, data: Dict[str, Any]) -> Order:
        """Mapea los datos a la entidad Order"""
        # Solo convertir el ID principal a UUID, mantener customer_id y table_id como strings
        from uuid import UUID
        if 'id' in data and isinstance(data['id'], str):
            data['id'] = UUID(data['id'])
        # Asegurar que customer_id y table_id sean strings
        if 'customer_id' in data and data['customer_id']:
            data['customer_id'] = str(data['customer_id'])
        if 'table_id' in data and data['table_id']:
            data['table_id'] = str(data['table_id'])
        return Order(**data)
    
    def get_by_customer(self, customer_id: str) -> List[Order]:
        """Obtiene pedidos por cliente"""
        try:
            result = self.db.table(self.table_name).select("*").eq("customer_id", customer_id).order("created_at", desc=True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener pedidos por cliente", {"error": str(e)})
            raise
    
    def get_by_table(self, table_id: str) -> List[Order]:
        """Obtiene pedidos por mesa"""
        try:
            result = self.db.table(self.table_name).select("*").eq("table_id", table_id).order("created_at", desc=True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener pedidos por mesa", {"error": str(e)})
            raise
    
    def get_by_status(self, status_id: str) -> List[Order]:
        """Obtiene pedidos por estado"""
        try:
            result = self.db.table(self.table_name).select("*").eq("status_id", status_id).order("created_at", desc=True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener pedidos por estado", {"error": str(e)})
            raise
    
    def get_by_order_type(self, order_type_id: str) -> List[Order]:
        """Obtiene pedidos por tipo"""
        try:
            result = self.db.table(self.table_name).select("*").eq("order_type_id", order_type_id).order("created_at", desc=True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener pedidos por tipo", {"error": str(e)})
            raise
    
    def get_active_orders(self) -> List[Order]:
        """Obtiene pedidos activos (no completados ni cancelados)"""
        try:
            # Estados activos: pending, preparing, ready
            active_statuses = ["pending", "preparing", "ready"]
            result = self.db.table(self.table_name).select("*").in_("status_id", active_statuses).order("created_at", desc=True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener pedidos activos", {"error": str(e)})
            raise
    
    def get_today_orders(self) -> List[Order]:
        """Obtiene pedidos del día actual"""
        try:
            from datetime import datetime, date
            today = date.today().isoformat()
            result = self.db.table(self.table_name).select("*").gte("created_at", f"{today}T00:00:00").lt("created_at", f"{today}T23:59:59").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener pedidos del día", {"error": str(e)})
            raise
    
    def update_status(self, order_id: str, status: str) -> Optional[Order]:
        """Actualiza el estado de un pedido"""
        try:
            # Por ahora, solo actualizamos el campo status_id a NULL
            # y agregamos el status como un campo adicional
            result = self.db.table(self.table_name).update({"status_id": None}).eq("id", order_id).execute()
            if result.data:
                updated_order = self._map_to_entity(result.data[0])
                # Agregar el status al objeto para que se refleje en la respuesta
                updated_order.status = status
                return updated_order
            return None
        except Exception as e:
            logger.log("error", f"Error al actualizar estado del pedido", {"error": str(e)})
            raise
    
    def get_by_order_number(self, order_number: str) -> Optional[Order]:
        """Obtiene un pedido por número de pedido"""
        try:
            result = self.db.table(self.table_name).select("*").eq("order_number", order_number).execute()
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
        except Exception as e:
            logger.log("error", f"Error al obtener pedido por número", {"error": str(e)})
            raise


class OrderItemRepository(BaseRepository[OrderItem]):
    """Repositorio para elementos de pedido"""
    
    def __init__(self):
        super().__init__("order_items")
    
    def _map_to_entity(self, data: Dict[str, Any]) -> OrderItem:
        """Mapea los datos a la entidad OrderItem"""
        # Convertir id a UUID si es string
        if 'id' in data and isinstance(data['id'], str):
            from uuid import UUID
            data['id'] = UUID(data['id'])
        return OrderItem(**data)
    
    def get_by_order(self, order_id: str) -> List[OrderItem]:
        """Obtiene elementos de pedido por pedido"""
        try:
            result = self.db.table(self.table_name).select("*").eq("order_id", order_id).order("created_at").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener elementos de pedido", {"error": str(e)})
            raise
    
    def get_by_menu_item(self, menu_item_id: str) -> List[OrderItem]:
        """Obtiene elementos de pedido por elemento del menú"""
        try:
            result = self.db.table(self.table_name).select("*").eq("menu_item_id", menu_item_id).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener elementos por elemento del menú", {"error": str(e)})
            raise
    
    def get_by_status(self, status: str) -> List[OrderItem]:
        """Obtiene elementos de pedido por estado"""
        try:
            result = self.db.table(self.table_name).select("*").eq("status", status).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener elementos por estado", {"error": str(e)})
            raise
    
    def update_status(self, item_id: str, status: str) -> Optional[OrderItem]:
        """Actualiza el estado de un elemento de pedido"""
        try:
            result = self.db.table(self.table_name).update({"status": status}).eq("id", item_id).execute()
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
        except Exception as e:
            logger.log("error", f"Error al actualizar estado del elemento", {"error": str(e)})
            raise
    
    def get_pending_items(self) -> List[OrderItem]:
        """Obtiene elementos de pedido pendientes"""
        try:
            result = self.db.table(self.table_name).select("*").eq("status", "pending").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener elementos pendientes", {"error": str(e)})
            raise
    
    def get_ready_items(self) -> List[OrderItem]:
        """Obtiene elementos de pedido listos"""
        try:
            result = self.db.table(self.table_name).select("*").eq("status", "ready").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener elementos listos", {"error": str(e)})
            raise


class OrderStatusRepository(BaseRepository[OrderStatus]):
    """Repositorio para estados de pedido"""
    
    def __init__(self):
        super().__init__("order_statuses")
    
    def _map_to_entity(self, data: Dict[str, Any]) -> OrderStatus:
        """Mapea los datos a la entidad OrderStatus"""
        return OrderStatus(**data)
    
    def get_active_statuses(self) -> List[OrderStatus]:
        """Obtiene estados activos"""
        try:
            result = self.db.table(self.table_name).select("*").eq("is_active", True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener estados activos", {"error": str(e)})
            raise


class OrderTypeRepository(BaseRepository[OrderType]):
    """Repositorio para tipos de pedido"""
    
    def __init__(self):
        super().__init__("order_types")
    
    def _map_to_entity(self, data: Dict[str, Any]) -> OrderType:
        """Mapea los datos a la entidad OrderType"""
        return OrderType(**data)
    
    def get_active_types(self) -> List[OrderType]:
        """Obtiene tipos activos"""
        try:
            result = self.db.table(self.table_name).select("*").eq("is_active", True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener tipos activos", {"error": str(e)})
            raise
