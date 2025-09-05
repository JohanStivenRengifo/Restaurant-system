"""
Repositorio para gestión del menú usando patrón Repository
"""
from abc import ABC, abstractmethod
from typing import List, Optional, Dict, Any
from uuid import UUID
from models.schemas import MenuItemResponse, CategoryResponse, PaginatedResponse
from patterns.singleton import logger, db_singleton


class MenuRepositoryInterface(ABC):
    """Interfaz del repositorio de menú"""
    
    @abstractmethod
    async def get_menu_items_paginated(self, page: int, limit: int, 
                                     filters: Dict[str, Any]) -> PaginatedResponse:
        pass
    
    @abstractmethod
    async def get_menu_item_by_id(self, item_id: UUID) -> Optional[MenuItemResponse]:
        pass
    
    @abstractmethod
    async def create_menu_item(self, item_data: Dict[str, Any]) -> MenuItemResponse:
        pass
    
    @abstractmethod
    async def update_menu_item(self, item_id: UUID, item_data: Dict[str, Any]) -> Optional[MenuItemResponse]:
        pass
    
    @abstractmethod
    async def delete_menu_item(self, item_id: UUID) -> bool:
        pass
    
    @abstractmethod
    async def get_categories(self, active_only: bool = True) -> List[CategoryResponse]:
        pass
    
    @abstractmethod
    async def get_category_by_id(self, category_id: UUID) -> Optional[CategoryResponse]:
        pass
    
    @abstractmethod
    async def create_category(self, category_data: Dict[str, Any]) -> CategoryResponse:
        pass
    
    @abstractmethod
    async def update_category(self, category_id: UUID, category_data: Dict[str, Any]) -> Optional[CategoryResponse]:
        pass
    
    @abstractmethod
    async def delete_category(self, category_id: UUID) -> bool:
        pass


class SupabaseMenuRepository(MenuRepositoryInterface):
    """Implementación del repositorio usando Supabase"""
    
    def __init__(self):
        self.db = db_singleton.connection
    
    async def get_menu_items_paginated(self, page: int, limit: int, 
                                     filters: Dict[str, Any]) -> PaginatedResponse:
        """Obtiene elementos del menú paginados"""
        try:
            offset = (page - 1) * limit
            
            # Construir consulta
            query = self.db.table('menu_items').select('*')
            
            # Aplicar filtros
            if filters.get('category_id'):
                query = query.eq('category_id', str(filters['category_id']))
            if filters.get('available_only', False):
                query = query.eq('is_available', True)
            if filters.get('featured_only', False):
                query = query.eq('is_featured', True)
            
            # Aplicar búsqueda
            if filters.get('search'):
                search_term = filters['search']
                query = query.ilike('name', f'%{search_term}%')
            
            # Aplicar ordenamiento
            sort_by = filters.get('sort_by', 'name')
            sort_order = filters.get('sort_order', 'asc')
            if sort_order == 'desc':
                query = query.order(sort_by, desc=True)
            else:
                query = query.order(sort_by)
            
            # Aplicar paginación
            query = query.range(offset, offset + limit - 1)
            
            result = query.execute()
            
            # Obtener total para paginación
            count_query = self.db.table('menu_items').select('id', count='exact')
            if filters.get('category_id'):
                count_query = count_query.eq('category_id', str(filters['category_id']))
            if filters.get('available_only', False):
                count_query = count_query.eq('is_available', True)
            if filters.get('featured_only', False):
                count_query = count_query.eq('is_featured', True)
            
            count_result = count_query.execute()
            total = count_result.count or 0
            
            # Convertir a modelos de respuesta
            menu_items = [MenuItemResponse(**item) for item in result.data]
            
            return PaginatedResponse(
                items=menu_items,
                total=total,
                page=page,
                limit=limit,
                pages=(total + limit - 1) // limit
            )
            
        except Exception as e:
            logger.log("error", f"Error en repositorio al obtener elementos del menú: {e}")
            raise
    
    async def get_menu_item_by_id(self, item_id: UUID) -> Optional[MenuItemResponse]:
        """Obtiene un elemento del menú por ID"""
        try:
            result = self.db.table('menu_items').select('*').eq('id', str(item_id)).execute()
            
            if not result.data:
                return None
            
            return MenuItemResponse(**result.data[0])
            
        except Exception as e:
            logger.log("error", f"Error en repositorio al obtener elemento del menú: {e}")
            raise
    
    async def create_menu_item(self, item_data: Dict[str, Any]) -> MenuItemResponse:
        """Crea un nuevo elemento del menú"""
        try:
            result = self.db.table('menu_items').insert(item_data).execute()
            
            if not result.data:
                raise Exception("No se pudo crear el elemento del menú")
            
            logger.log("info", f"Elemento del menú creado: {result.data[0]['id']}")
            return MenuItemResponse(**result.data[0])
            
        except Exception as e:
            logger.log("error", f"Error en repositorio al crear elemento del menú: {e}")
            raise
    
    async def update_menu_item(self, item_id: UUID, item_data: Dict[str, Any]) -> Optional[MenuItemResponse]:
        """Actualiza un elemento del menú"""
        try:
            result = self.db.table('menu_items').update(item_data).eq('id', str(item_id)).execute()
            
            if not result.data:
                return None
            
            logger.log("info", f"Elemento del menú actualizado: {item_id}")
            return MenuItemResponse(**result.data[0])
            
        except Exception as e:
            logger.log("error", f"Error en repositorio al actualizar elemento del menú: {e}")
            raise
    
    async def delete_menu_item(self, item_id: UUID) -> bool:
        """Elimina un elemento del menú"""
        try:
            result = self.db.table('menu_items').delete().eq('id', str(item_id)).execute()
            
            success = len(result.data) > 0
            if success:
                logger.log("info", f"Elemento del menú eliminado: {item_id}")
            return success
            
        except Exception as e:
            logger.log("error", f"Error en repositorio al eliminar elemento del menú: {e}")
            raise
    
    async def get_categories(self, active_only: bool = True) -> List[CategoryResponse]:
        """Obtiene todas las categorías"""
        try:
            query = self.db.table('menu_categories').select('*')
            
            if active_only:
                query = query.eq('is_active', True)
            
            query = query.order('display_order')
            result = query.execute()
            
            return [CategoryResponse(**cat) for cat in result.data]
            
        except Exception as e:
            logger.log("error", f"Error en repositorio al obtener categorías: {e}")
            raise
    
    async def get_category_by_id(self, category_id: UUID) -> Optional[CategoryResponse]:
        """Obtiene una categoría por ID"""
        try:
            result = self.db.table('menu_categories').select('*').eq('id', str(category_id)).execute()
            
            if not result.data:
                return None
            
            return CategoryResponse(**result.data[0])
            
        except Exception as e:
            logger.log("error", f"Error en repositorio al obtener categoría: {e}")
            raise
    
    async def create_category(self, category_data: Dict[str, Any]) -> CategoryResponse:
        """Crea una nueva categoría"""
        try:
            result = self.db.table('menu_categories').insert(category_data).execute()
            
            if not result.data:
                raise Exception("No se pudo crear la categoría")
            
            logger.log("info", f"Categoría creada: {result.data[0]['id']}")
            return CategoryResponse(**result.data[0])
            
        except Exception as e:
            logger.log("error", f"Error en repositorio al crear categoría: {e}")
            raise

    async def update_category(self, category_id: UUID, category_data: Dict[str, Any]) -> Optional[CategoryResponse]:
        """Actualiza una categoría"""
        try:
            result = self.db.table('menu_categories').update(category_data).eq('id', str(category_id)).execute()
            
            if not result.data:
                return None
            
            logger.log("info", f"Categoría actualizada: {category_id}")
            return CategoryResponse(**result.data[0])
            
        except Exception as e:
            logger.log("error", f"Error en repositorio al actualizar categoría: {e}")
            raise
    
    async def delete_category(self, category_id: UUID) -> bool:
        """Elimina una categoría"""
        try:
            result = self.db.table('menu_categories').delete().eq('id', str(category_id)).execute()
            
            success = len(result.data) > 0
            if success:
                logger.log("info", f"Categoría eliminada: {category_id}")
            return success
            
        except Exception as e:
            logger.log("error", f"Error en repositorio al eliminar categoría: {e}")
            raise