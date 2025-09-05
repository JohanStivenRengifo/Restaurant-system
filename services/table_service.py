"""
Servicio para gestión de mesas - Versión simplificada
"""
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime

from models.schemas import TableResponse, TableCreate, TableUpdate
from patterns.singleton import logger, db_singleton
from repositories.table_repository import TableRepository
from utils.timezone import get_bogota_now, format_bogota_timestamp

class TableService:
    """Servicio para gestión de mesas"""
    
    def __init__(self, db_connection=None):
        self.db_connection = db_connection
        self.table_repo = TableRepository()
    
    async def get_tables(self, available_only: bool = False, 
                        zone_id: Optional[UUID] = None) -> List[TableResponse]:
        """Obtiene todas las mesas con filtros opcionales"""
        try:
            logger.log("info", "Obteniendo mesas", {
                "available_only": available_only,
                "zone_id": zone_id
            })
            # Obtener mesas de la DB usando el repositorio
            if zone_id:
                tables = self.table_repo.get_by_zone(str(zone_id))
            else:
                tables = self.table_repo.get_active_tables()
            
            # Convertir a TableResponse
            return [
                TableResponse(
                    id=table.id if isinstance(table.id, UUID) else UUID(table.id),
                    number=table.number,
                    capacity=table.capacity,
                    zone_id=UUID(table.zone_id) if table.zone_id else None,
                    is_available=True,  # Por defecto disponible
                    is_reserved=False,  # Por defecto no reservada
                    created_at=table.created_at,
                    updated_at=table.updated_at
                )
                for table in tables
            ]
        except Exception as e:
            logger.log("error", f"Error al obtener mesas: {e}")
            raise
    
    async def get_table(self, table_id: UUID) -> Optional[TableResponse]:
        """Obtiene una mesa por ID"""
        try:
            logger.log("info", f"Obteniendo mesa: {table_id}")
            # Obtener mesa de la DB usando el repositorio
            table = self.table_repo.get_by_id(str(table_id))
            if not table:
                return None
            
            # Convertir a TableResponse
            return TableResponse(
                id=table.id if isinstance(table.id, UUID) else UUID(table.id),
                number=table.number,
                capacity=table.capacity,
                zone_id=UUID(table.zone_id) if table.zone_id else None,
                is_available=True,  # Por defecto disponible
                is_reserved=False,  # Por defecto no reservada
                created_at=table.created_at,
                updated_at=table.updated_at
            )
        except Exception as e:
            logger.log("error", f"Error al obtener mesa: {e}")
            raise
    
    async def create_table(self, table: TableCreate) -> TableResponse:
        """Crea una nueva mesa"""
        try:
            logger.log("info", "Creando mesa", {"number": table.number})
            # Crear mesa en la DB usando el repositorio
            from models.entities import Table
            table_entity = Table(
                id=str(uuid4()),
                number=table.number,
                capacity=table.capacity,
                zone_id=str(table.zone_id) if table.zone_id else None,
                is_active=True
            )
            created_table = self.table_repo.create(table_entity)
            if not created_table:
                raise Exception("Error al crear mesa en la DB")
            
            # Convertir a TableResponse
            return TableResponse(
                id=created_table.id if isinstance(created_table.id, UUID) else UUID(created_table.id),
                number=created_table.number,
                capacity=created_table.capacity,
                zone_id=UUID(created_table.zone_id) if created_table.zone_id else None,
                is_available=True,  # Por defecto disponible
                is_reserved=False,  # Por defecto no reservada
                created_at=created_table.created_at,
                updated_at=created_table.updated_at
            )
        except Exception as e:
            logger.log("error", f"Error al crear mesa: {e}")
            raise
    
    async def update_table(self, table_id: UUID, table: TableUpdate) -> Optional[TableResponse]:
        """Actualiza una mesa existente"""
        try:
            logger.log("info", f"Actualizando mesa: {table_id}")
            # Actualizar mesa en la DB usando el repositorio
            update_data = {
                "number": table.number,
                "capacity": table.capacity,
                "zone_id": str(table.zone_id) if table.zone_id else None,
                "updated_at": format_bogota_timestamp()
            }
            updated_table = self.table_repo.update(str(table_id), update_data)
            if not updated_table:
                return None
            
            # Convertir a TableResponse
            return TableResponse(
                id=updated_table.id if isinstance(updated_table.id, UUID) else UUID(updated_table.id),
                number=updated_table.number,
                capacity=updated_table.capacity,
                zone_id=UUID(updated_table.zone_id) if updated_table.zone_id else None,
                is_available=True,  # Por defecto disponible
                is_reserved=False,  # Por defecto no reservada
                created_at=updated_table.created_at,
                updated_at=updated_table.updated_at
            )
        except Exception as e:
            logger.log("error", f"Error al actualizar mesa: {e}")
            raise
    
    async def delete_table(self, table_id: UUID) -> bool:
        """Elimina una mesa"""
        try:
            logger.log("info", f"Eliminando mesa: {table_id}")
            # Eliminar mesa de la DB usando el repositorio
            return self.table_repo.delete(str(table_id))
        except Exception as e:
            logger.log("error", f"Error al eliminar mesa: {e}")
            raise