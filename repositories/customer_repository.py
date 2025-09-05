"""
Repositorio para gestión de clientes
"""
from typing import List, Optional, Dict, Any
from models.entities import Customer, Reservation
from repositories.base import BaseRepository
from patterns.singleton import logger


class CustomerRepository(BaseRepository[Customer]):
    """Repositorio para clientes"""
    
    def __init__(self):
        super().__init__("customers")
    
    def _map_to_entity(self, data: Dict[str, Any]) -> Customer:
        """Mapea los datos a la entidad Customer"""
        # Convertir id a UUID si es string
        if 'id' in data and isinstance(data['id'], str):
            from uuid import UUID
            data['id'] = UUID(data['id'])
        return Customer(**data)
    
    def get_by_email(self, email: str) -> Optional[Customer]:
        """Obtiene un cliente por email"""
        try:
            result = self.db.table(self.table_name).select("*").eq("email", email).execute()
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
        except Exception as e:
            logger.log("error", f"Error al obtener cliente por email", {"error": str(e)})
            raise
    
    def get_by_phone(self, phone: str) -> Optional[Customer]:
        """Obtiene un cliente por teléfono"""
        try:
            result = self.db.table(self.table_name).select("*").eq("phone", phone).execute()
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
        except Exception as e:
            logger.log("error", f"Error al obtener cliente por teléfono", {"error": str(e)})
            raise
    
    def get_vip_customers(self) -> List[Customer]:
        """Obtiene clientes VIP"""
        try:
            result = self.db.table(self.table_name).select("*").eq("is_vip", True).order("created_at", desc=True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener clientes VIP", {"error": str(e)})
            raise
    
    def get_by_loyalty_points(self, min_points: int = 0) -> List[Customer]:
        """Obtiene clientes por puntos de lealtad mínimos"""
        try:
            result = self.db.table(self.table_name).select("*").gte("loyalty_points", min_points).order("loyalty_points", desc=True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener clientes por puntos de lealtad", {"error": str(e)})
            raise
    
    def search_customers(self, search_term: str) -> List[Customer]:
        """Busca clientes por nombre o email"""
        try:
            result = self.db.table(self.table_name).select("*").or_(
                f"first_name.ilike.%{search_term}%,last_name.ilike.%{search_term}%,email.ilike.%{search_term}%"
            ).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al buscar clientes", {"error": str(e)})
            raise
    
    def update_loyalty_points(self, customer_id: str, points: int) -> Optional[Customer]:
        """Actualiza los puntos de lealtad de un cliente"""
        try:
            result = self.db.table(self.table_name).update({"loyalty_points": points}).eq("id", customer_id).execute()
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
        except Exception as e:
            logger.log("error", f"Error al actualizar puntos de lealtad", {"error": str(e)})
            raise
    
    def add_loyalty_points(self, customer_id: str, points_to_add: int) -> Optional[Customer]:
        """Añade puntos de lealtad a un cliente"""
        try:
            customer = self.get_by_id(customer_id)
            if customer:
                new_points = customer.loyalty_points + points_to_add
                return self.update_loyalty_points(customer_id, new_points)
            return None
        except Exception as e:
            logger.log("error", f"Error al añadir puntos de lealtad", {"error": str(e)})
            raise
    
    def set_vip_status(self, customer_id: str, is_vip: bool) -> Optional[Customer]:
        """Establece el estado VIP de un cliente"""
        try:
            result = self.db.table(self.table_name).update({"is_vip": is_vip}).eq("id", customer_id).execute()
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
        except Exception as e:
            logger.log("error", f"Error al actualizar estado VIP", {"error": str(e)})
            raise


class ReservationRepository(BaseRepository[Reservation]):
    """Repositorio para reservas"""
    
    def __init__(self):
        super().__init__("reservations")
    
    def _map_to_entity(self, data: Dict[str, Any]) -> Reservation:
        """Mapea los datos a la entidad Reservation"""
        return Reservation(**data)
    
    def get_by_customer(self, customer_id: str) -> List[Reservation]:
        """Obtiene reservas por cliente"""
        try:
            result = self.db.table(self.table_name).select("*").eq("customer_id", customer_id).order("reservation_date", desc=True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener reservas por cliente", {"error": str(e)})
            raise
    
    def get_by_table(self, table_id: str) -> List[Reservation]:
        """Obtiene reservas por mesa"""
        try:
            result = self.db.table(self.table_name).select("*").eq("table_id", table_id).order("reservation_date").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener reservas por mesa", {"error": str(e)})
            raise
    
    def get_by_date(self, date: str) -> List[Reservation]:
        """Obtiene reservas por fecha"""
        try:
            result = self.db.table(self.table_name).select("*").eq("reservation_date", date).order("reservation_time").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener reservas por fecha", {"error": str(e)})
            raise
    
    def get_by_status(self, status: str) -> List[Reservation]:
        """Obtiene reservas por estado"""
        try:
            result = self.db.table(self.table_name).select("*").eq("status", status).order("reservation_date").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener reservas por estado", {"error": str(e)})
            raise
    
    def get_pending_reservations(self) -> List[Reservation]:
        """Obtiene reservas pendientes"""
        try:
            result = self.db.table(self.table_name).select("*").eq("status", "pending").order("reservation_date").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener reservas pendientes", {"error": str(e)})
            raise
    
    def get_confirmed_reservations(self) -> List[Reservation]:
        """Obtiene reservas confirmadas"""
        try:
            result = self.db.table(self.table_name).select("*").eq("status", "confirmed").order("reservation_date").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener reservas confirmadas", {"error": str(e)})
            raise
    
    def update_status(self, reservation_id: str, status: str) -> Optional[Reservation]:
        """Actualiza el estado de una reserva"""
        try:
            result = self.db.table(self.table_name).update({"status": status}).eq("id", reservation_id).execute()
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
        except Exception as e:
            logger.log("error", f"Error al actualizar estado de reserva", {"error": str(e)})
            raise
    
    def get_by_date_range(self, start_date: str, end_date: str) -> List[Reservation]:
        """Obtiene reservas en un rango de fechas"""
        try:
            result = self.db.table(self.table_name).select("*").gte("reservation_date", start_date).lte("reservation_date", end_date).order("reservation_date").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener reservas por rango de fechas", {"error": str(e)})
            raise
    
    def get_available_tables(self, date: str, time: str, duration: int = 120) -> List[str]:
        """Obtiene mesas disponibles para una fecha y hora específica"""
        try:
            # Obtener todas las reservas para la fecha
            reservations = self.get_by_date(date)
            
            # Obtener todas las mesas
            tables_result = self.db.table("tables").select("id").eq("is_active", True).execute()
            all_tables = [table["id"] for table in tables_result.data]
            
            # Filtrar mesas ocupadas
            occupied_tables = set()
            for reservation in reservations:
                if reservation.status in ["confirmed", "seated"]:
                    # Verificar si hay conflicto de horario
                    if self._time_conflicts(reservation.reservation_time, time, reservation.duration, duration):
                        occupied_tables.add(reservation.table_id)
            
            # Retornar mesas disponibles
            available_tables = [table_id for table_id in all_tables if table_id not in occupied_tables]
            return available_tables
            
        except Exception as e:
            logger.log("error", f"Error al obtener mesas disponibles", {"error": str(e)})
            raise
    
    def _time_conflicts(self, time1: str, time2: str, duration1: int, duration2: int) -> bool:
        """Verifica si dos horarios de reserva entran en conflicto"""
        try:
            from datetime import datetime, timedelta
            
            # Convertir strings de tiempo a objetos datetime
            t1 = datetime.strptime(time1, "%H:%M:%S").time()
            t2 = datetime.strptime(time2, "%H:%M:%S").time()
            
            # Calcular horarios de fin
            t1_end = (datetime.combine(datetime.today(), t1) + timedelta(minutes=duration1)).time()
            t2_end = (datetime.combine(datetime.today(), t2) + timedelta(minutes=duration2)).time()
            
            # Verificar solapamiento
            return not (t1_end <= t2 or t2_end <= t1)
        except Exception:
            return True  # En caso de error, asumir conflicto
