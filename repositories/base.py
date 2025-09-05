"""
Repositorio base con operaciones CRUD genéricas
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any, TypeVar, Generic
from models.base import BaseEntity, PaginationParams, PaginatedResponse
from database.connection import db_connection
from patterns.singleton import logger

T = TypeVar('T', bound=BaseEntity)


class BaseRepository(ABC, Generic[T]):
    """Repositorio base con operaciones CRUD genéricas"""
    
    def __init__(self, table_name: str):
        self.table_name = table_name
        self.db = db_connection.client
        self.logger = logger
    
    def create(self, entity: T) -> T:
        """Crea una nueva entidad"""
        try:
            data = entity.model_dump(exclude={'id', 'created_at', 'updated_at'})
            result = self.db.table(self.table_name).insert(data).execute()
            
            if result.data:
                created_entity = self._map_to_entity(result.data[0])
                self.logger.log("info", f"Entidad creada en {self.table_name}", {"id": str(created_entity.id)})
                return created_entity
            else:
                raise Exception("No se pudo crear la entidad")
                
        except Exception as e:
            self.logger.log("error", f"Error al crear entidad en {self.table_name}", {"error": str(e)})
            raise
    
    def get_by_id(self, entity_id: str) -> Optional[T]:
        """Obtiene una entidad por ID"""
        try:
            result = self.db.table(self.table_name).select("*").eq("id", entity_id).execute()
            
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
            
        except Exception as e:
            self.logger.log("error", f"Error al obtener entidad por ID en {self.table_name}", {"error": str(e)})
            raise
    
    def get_all(self, filters: Optional[Dict[str, Any]] = None, 
                pagination: Optional[PaginationParams] = None) -> List[T]:
        """Obtiene todas las entidades con filtros opcionales"""
        try:
            query = self.db.table(self.table_name).select("*")
            
            # Aplicar filtros
            if filters:
                for key, value in filters.items():
                    if isinstance(value, list):
                        query = query.in_(key, value)
                    else:
                        query = query.eq(key, value)
            
            # Aplicar paginación
            if pagination:
                offset = (pagination.page - 1) * pagination.limit
                query = query.range(offset, offset + pagination.limit - 1)
            
            result = query.execute()
            return [self._map_to_entity(item) for item in result.data]
            
        except Exception as e:
            self.logger.log("error", f"Error al obtener entidades en {self.table_name}", {"error": str(e)})
            raise
    
    def update(self, entity_id: str, update_data: Dict[str, Any]) -> Optional[T]:
        """Actualiza una entidad"""
        try:
            from datetime import datetime
            update_data["updated_at"] = datetime.utcnow().isoformat()
            
            result = self.db.table(self.table_name).update(update_data).eq("id", entity_id).execute()
            
            if result.data:
                updated_entity = self._map_to_entity(result.data[0])
                self.logger.log("info", f"Entidad actualizada en {self.table_name}", {"id": str(updated_entity.id)})
                return updated_entity
            return None
            
        except Exception as e:
            self.logger.log("error", f"Error al actualizar entidad en {self.table_name}", {"error": str(e)})
            raise
    
    def delete(self, entity_id: str) -> bool:
        """Elimina una entidad"""
        try:
            result = self.db.table(self.table_name).delete().eq("id", entity_id).execute()
            
            if result.data:
                self.logger.log("info", f"Entidad eliminada en {self.table_name}", {"id": entity_id})
                return True
            return False
            
        except Exception as e:
            self.logger.log("error", f"Error al eliminar entidad en {self.table_name}", {"error": str(e)})
            raise
    
    def count(self, filters: Optional[Dict[str, Any]] = None) -> int:
        """Cuenta las entidades con filtros opcionales"""
        try:
            query = self.db.table(self.table_name).select("id", count="exact")
            
            if filters:
                for key, value in filters.items():
                    if isinstance(value, list):
                        query = query.in_(key, value)
                    else:
                        query = query.eq(key, value)
            
            result = query.execute()
            return result.count or 0
            
        except Exception as e:
            self.logger.log("error", f"Error al contar entidades en {self.table_name}", {"error": str(e)})
            raise
    
    def exists(self, entity_id: str) -> bool:
        """Verifica si una entidad existe"""
        try:
            result = self.db.table(self.table_name).select("id").eq("id", entity_id).execute()
            return len(result.data) > 0
            
        except Exception as e:
            self.logger.log("error", f"Error al verificar existencia en {self.table_name}", {"error": str(e)})
            raise
    
    @abstractmethod
    def _map_to_entity(self, data: Dict[str, Any]) -> T:
        """Mapea los datos de la base de datos a la entidad"""
        pass
    
    def get_paginated(self, filters: Optional[Dict[str, Any]] = None,
                     pagination: Optional[PaginationParams] = None) -> PaginatedResponse:
        """Obtiene entidades paginadas"""
        try:
            entities = self.get_all(filters, pagination)
            total_count = self.count(filters)
            
            pagination_info = None
            if pagination:
                total_pages = (total_count + pagination.limit - 1) // pagination.limit
                pagination_info = {
                    "page": pagination.page,
                    "limit": pagination.limit,
                    "total_count": total_count,
                    "total_pages": total_pages,
                    "has_next": pagination.page < total_pages,
                    "has_prev": pagination.page > 1
                }
            
            return PaginatedResponse(
                success=True,
                message="Entidades obtenidas exitosamente",
                data=entities,
                pagination=pagination_info
            )
            
        except Exception as e:
            self.logger.log("error", f"Error al obtener entidades paginadas en {self.table_name}", {"error": str(e)})
            return PaginatedResponse(
                success=False,
                message=f"Error al obtener entidades: {str(e)}",
                data=None
            )
