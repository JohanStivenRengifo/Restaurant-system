"""
Repositorio para gestión de mesas
"""
from typing import List, Optional, Dict, Any
from models.entities import Table, Zone
from repositories.base import BaseRepository
from patterns.singleton import logger


class ZoneRepository(BaseRepository[Zone]):
    """Repositorio para zonas del restaurante"""
    
    def __init__(self):
        super().__init__("zones")
    
    def _map_to_entity(self, data: Dict[str, Any]) -> Zone:
        """Mapea los datos a la entidad Zone"""
        return Zone(**data)
    
    def get_active_zones(self) -> List[Zone]:
        """Obtiene todas las zonas activas"""
        try:
            result = self.db.table(self.table_name).select("*").eq("is_active", True).order("name").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener zonas activas", {"error": str(e)})
            raise


class TableRepository(BaseRepository[Table]):
    """Repositorio para mesas"""
    
    def __init__(self):
        super().__init__("tables")
    
    def _map_to_entity(self, data: Dict[str, Any]) -> Table:
        """Mapea los datos a la entidad Table"""
        return Table(**data)
    
    def get_by_zone(self, zone_id: str) -> List[Table]:
        """Obtiene mesas por zona"""
        try:
            result = self.db.table(self.table_name).select("*").eq("zone_id", zone_id).eq("is_active", True).order("number").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener mesas por zona", {"error": str(e)})
            raise
    
    def get_by_capacity(self, min_capacity: int, max_capacity: int = None) -> List[Table]:
        """Obtiene mesas por capacidad"""
        try:
            query = self.db.table(self.table_name).select("*").gte("capacity", min_capacity).eq("is_active", True)
            
            if max_capacity:
                query = query.lte("capacity", max_capacity)
            
            result = query.order("capacity").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener mesas por capacidad", {"error": str(e)})
            raise
    
    def get_available_tables(self, party_size: int, zone_id: str = None) -> List[Table]:
        """Obtiene mesas disponibles para un tamaño de grupo"""
        try:
            query = self.db.table(self.table_name).select("*").gte("capacity", party_size).eq("is_active", True)
            
            if zone_id:
                query = query.eq("zone_id", zone_id)
            
            result = query.order("capacity").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener mesas disponibles", {"error": str(e)})
            raise
    
    def get_by_number(self, table_number: str) -> Optional[Table]:
        """Obtiene una mesa por número"""
        try:
            result = self.db.table(self.table_name).select("*").eq("number", table_number).execute()
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
        except Exception as e:
            logger.log("error", f"Error al obtener mesa por número", {"error": str(e)})
            raise
    
    def get_active_tables(self) -> List[Table]:
        """Obtiene todas las mesas activas"""
        try:
            result = self.db.table(self.table_name).select("*").eq("is_active", True).order("number").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener mesas activas", {"error": str(e)})
            raise
    
    def update_availability(self, table_id: str, is_active: bool) -> Optional[Table]:
        """Actualiza la disponibilidad de una mesa"""
        try:
            result = self.db.table(self.table_name).update({"is_active": is_active}).eq("id", table_id).execute()
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
        except Exception as e:
            logger.log("error", f"Error al actualizar disponibilidad de mesa", {"error": str(e)})
            raise
    
    def get_table_occupancy_status(self, table_id: str) -> Dict[str, Any]:
        """Obtiene el estado de ocupación de una mesa"""
        try:
            # Verificar si hay pedidos activos en la mesa
            orders_result = self.db.table("orders").select("id, status_id, created_at").eq("table_id", table_id).in_("status_id", ["pending", "preparing", "ready"]).execute()
            
            # Verificar si hay reservas confirmadas para hoy
            from datetime import date
            today = date.today().isoformat()
            reservations_result = self.db.table("reservations").select("id, reservation_time, status").eq("table_id", table_id).eq("reservation_date", today).in_("status", ["confirmed", "seated"]).execute()
            
            is_occupied = len(orders_result.data) > 0
            has_reservation = len(reservations_result.data) > 0
            
            return {
                "table_id": table_id,
                "is_occupied": is_occupied,
                "has_reservation": has_reservation,
                "active_orders": orders_result.data,
                "today_reservations": reservations_result.data
            }
        except Exception as e:
            logger.log("error", f"Error al obtener estado de ocupación", {"error": str(e)})
            raise
    
    def get_tables_by_zone_with_status(self, zone_id: str) -> List[Dict[str, Any]]:
        """Obtiene mesas de una zona con su estado de ocupación"""
        try:
            tables = self.get_by_zone(zone_id)
            tables_with_status = []
            
            for table in tables:
                status = self.get_table_occupancy_status(str(table.id))
                tables_with_status.append({
                    "table": table,
                    "status": status
                })
            
            return tables_with_status
        except Exception as e:
            logger.log("error", f"Error al obtener mesas con estado", {"error": str(e)})
            raise
