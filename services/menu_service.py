"""
Servicio para gestión del menú usando patrones de diseño
"""
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime
from utils.timezone import get_bogota_now, format_bogota_timestamp
from models.schemas import (
    MenuItemResponse, MenuItemCreate, MenuItemUpdate,
    CategoryResponse, CategoryCreate, CategoryUpdate,
    PaginatedResponse
)
from patterns.singleton import logger
from patterns.factory import MenuItemFactory, CustomerFactory
from patterns.builder import MenuItemBuilder, OrderBuilder
from patterns.prototype import MenuItemPrototype, PrototypeManager
from repositories.menu_repository import MenuRepositoryInterface, SupabaseMenuRepository


class MenuService:
    """Servicio para gestión del menú usando patrones de diseño"""
    
    def __init__(self, repository: MenuRepositoryInterface = None):
        self.repository = repository or SupabaseMenuRepository()
        self.prototype_manager = PrototypeManager()
        self._initialize_prototypes()
    
    def _initialize_prototypes(self):
        """Inicializa prototipos de elementos del menú"""
        # Crear prototipos para elementos comunes
        try:
            # Prototipo para ensaladas
            salad_template = MenuItemBuilder().set_basic_info(
                "Ensalada", "Ensalada fresca", 10.99
            ).set_category("550e8400-e29b-41d4-a716-446655440001").build()
            
            self.prototype_manager.register_prototype(
                "salad_template", 
                MenuItemPrototype(salad_template)
            )
            
            # Prototipo para pizza
            pizza_template = MenuItemBuilder().set_basic_info(
                "Pizza", "Pizza italiana tradicional", 15.99
            ).set_category("550e8400-e29b-41d4-a716-446655440001").build()
            
            self.prototype_manager.register_prototype(
                "pizza", 
                MenuItemPrototype(pizza_template)
            )
            
            # Prototipo para pastas
            pasta_template = MenuItemBuilder().set_basic_info(
                "Pasta", "Pasta italiana", 15.99
            ).set_category("550e8400-e29b-41d4-a716-446655440002").build()
            
            self.prototype_manager.register_prototype(
                "pasta_template", 
                MenuItemPrototype(pasta_template)
            )
            
        except Exception as e:
            logger.log("warning", f"Error inicializando prototipos: {e}")
    
    async def get_menu_items_paginated(self, page: int = 1, limit: int = 10, 
                                     category_id: Optional[UUID] = None,
                                     available_only: bool = True,
                                     featured_only: bool = False,
                                     search: Optional[str] = None,
                                     sort_by: str = "name",
                                     sort_order: str = "asc") -> PaginatedResponse:
        """Obtiene elementos del menú paginados con filtros"""
        try:
            # Construir filtros usando Builder pattern
            filters = self._build_filters(
                category_id=category_id,
                available_only=available_only,
                featured_only=featured_only,
                search=search,
                sort_by=sort_by,
                sort_order=sort_order
            )
            
            # Usar repositorio para obtener datos
            return await self.repository.get_menu_items_paginated(page, limit, filters)
            
        except Exception as e:
            logger.log("error", f"Error al obtener elementos del menú: {e}")
            raise
    
    def _build_filters(self, **kwargs) -> Dict[str, Any]:
        """Construye filtros usando Builder pattern"""
        filters = {}
        
        if kwargs.get('category_id'):
            filters['category_id'] = kwargs['category_id']
        if kwargs.get('available_only', False):
            filters['available_only'] = True
        if kwargs.get('featured_only', False):
            filters['featured_only'] = True
        if kwargs.get('search'):
            filters['search'] = kwargs['search']
        if kwargs.get('sort_by'):
            filters['sort_by'] = kwargs['sort_by']
        if kwargs.get('sort_order'):
            filters['sort_order'] = kwargs['sort_order']
            
        return filters
    
    async def get_menu_item(self, item_id: UUID) -> Optional[MenuItemResponse]:
        """Obtiene un elemento del menú por ID"""
        try:
            return await self.repository.get_menu_item_by_id(item_id)
        except Exception as e:
            logger.log("error", f"Error al obtener elemento del menú: {e}")
            raise
    
    async def create_menu_item(self, item_data: MenuItemCreate) -> MenuItemResponse:
        """Crea un nuevo elemento del menú usando Factory pattern"""
        try:
            # Usar Factory para validar y crear el elemento
            menu_item = MenuItemFactory.create_menu_item(item_data.dict())
            
            # Preparar datos para inserción
            item_dict = menu_item.dict()
            item_dict['id'] = str(uuid4())
            item_dict['created_at'] = format_bogota_timestamp()
            item_dict['updated_at'] = None
            
            return await self.repository.create_menu_item(item_dict)
            
        except Exception as e:
            logger.log("error", f"Error al crear elemento del menú: {e}")
            raise
    
    async def create_menu_item_from_template(self, template_name: str, 
                                           customizations: Dict[str, Any]) -> MenuItemResponse:
        """Crea un elemento del menú desde una plantilla usando Prototype pattern"""
        try:
            # Usar Prototype para crear desde plantilla
            prototype = self.prototype_manager.get_prototype(template_name)
            if isinstance(prototype, MenuItemPrototype):
                menu_item = prototype.customize(customizations)
                
                # Preparar datos para inserción
                item_dict = menu_item.dict()
                item_dict['id'] = str(uuid4())
                item_dict['created_at'] = format_bogota_timestamp()
                item_dict['updated_at'] = None
                
                return await self.repository.create_menu_item(item_dict)
            else:
                raise ValueError("El prototipo no es un MenuItemPrototype")
                
        except Exception as e:
            logger.log("error", f"Error al crear elemento desde plantilla: {e}")
            raise
    
    async def update_menu_item(self, item_id: UUID, item_data: MenuItemUpdate) -> Optional[MenuItemResponse]:
        """Actualiza un elemento del menú"""
        try:
            # Preparar datos para actualización
            update_dict = item_data.dict(exclude_unset=True)
            update_dict['updated_at'] = format_bogota_timestamp()
            
            return await self.repository.update_menu_item(item_id, update_dict)
            
        except Exception as e:
            logger.log("error", f"Error al actualizar elemento del menú: {e}")
            raise
    
    async def delete_menu_item(self, item_id: UUID) -> bool:
        """Elimina un elemento del menú"""
        try:
            return await self.repository.delete_menu_item(item_id)
        except Exception as e:
            logger.log("error", f"Error al eliminar elemento del menú: {e}")
            raise
    
    # ==================== MÉTODOS PARA CATEGORÍAS ====================
    
    async def get_categories(self, active_only: bool = True) -> List[CategoryResponse]:
        """Obtiene todas las categorías del menú"""
        try:
            return await self.repository.get_categories(active_only)
        except Exception as e:
            logger.log("error", f"Error al obtener categorías: {e}")
            raise
    
    async def get_category(self, category_id: UUID) -> Optional[CategoryResponse]:
        """Obtiene una categoría por ID"""
        try:
            return await self.repository.get_category_by_id(category_id)
        except Exception as e:
            logger.log("error", f"Error al obtener categoría: {e}")
            raise
    
    async def create_category(self, category_data: CategoryCreate) -> CategoryResponse:
        """Crea una nueva categoría"""
        try:
            category_dict = category_data.dict()
            category_dict['id'] = str(uuid4())
            category_dict['created_at'] = format_bogota_timestamp()
            category_dict['updated_at'] = None
            
            return await self.repository.create_category(category_dict)
            
        except Exception as e:
            logger.log("error", f"Error al crear categoría: {e}")
            raise
    
    async def update_category(self, category_id: UUID, category_data: CategoryUpdate) -> Optional[CategoryResponse]:
        """Actualiza una categoría"""
        try:
            update_dict = category_data.dict(exclude_unset=True)
            update_dict['updated_at'] = format_bogota_timestamp()
            
            return await self.repository.update_category(category_id, update_dict)
            
        except Exception as e:
            logger.log("error", f"Error al actualizar categoría: {e}")
            raise
    
    async def delete_category(self, category_id: UUID) -> bool:
        """Elimina una categoría"""
        try:
            return await self.repository.delete_category(category_id)
        except Exception as e:
            logger.log("error", f"Error al eliminar categoría: {e}")
            raise
    
    # ==================== MÉTODOS ADICIONALES ====================
    
    async def search_menu_items(self, search_term: str) -> List[MenuItemResponse]:
        """Busca elementos del menú por término de búsqueda"""
        try:
            # Usar el método paginado con búsqueda
            result = await self.get_menu_items_paginated(
                page=1, 
                limit=100, 
                search=search_term,
                available_only=False
            )
            return result.items
            
        except Exception as e:
            logger.log("error", f"Error al buscar elementos del menú: {e}")
            raise
    
    async def get_items_by_allergen(self, allergen: str) -> List[MenuItemResponse]:
        """Obtiene elementos del menú que contienen un alérgeno específico"""
        try:
            # Obtener todos los elementos y filtrar por alérgeno
            result = await self.get_menu_items_paginated(
                page=1, 
                limit=1000, 
                available_only=False
            )
            
            # Filtrar por alérgeno
            filtered_items = [
                item for item in result.items 
                if allergen.lower() in [a.lower() for a in item.allergen_info]
            ]
            
            return filtered_items
            
        except Exception as e:
            logger.log("error", f"Error al obtener elementos por alérgeno: {e}")
            raise
    
    async def toggle_item_availability(self, item_id: UUID) -> Optional[MenuItemResponse]:
        """Alterna la disponibilidad de un elemento del menú"""
        try:
            # Primero obtener el elemento actual
            current_item = await self.get_menu_item(item_id)
            if not current_item:
                return None
            
            # Alternar disponibilidad
            new_availability = not current_item.is_available
            
            update_data = {
                'is_available': new_availability,
                'updated_at': format_bogota_timestamp()
            }
            
            return await self.repository.update_menu_item(item_id, update_data)
            
        except Exception as e:
            logger.log("error", f"Error al alternar disponibilidad: {e}")
            raise
    
    async def get_featured_items(self) -> List[MenuItemResponse]:
        """Obtiene elementos destacados del menú"""
        try:
            result = await self.get_menu_items_paginated(
                page=1, 
                limit=20, 
                featured_only=True,
                available_only=True
            )
            return result.items
            
        except Exception as e:
            logger.log("error", f"Error al obtener elementos destacados: {e}")
            raise
    
    async def get_items_by_category(self, category_id: UUID) -> List[MenuItemResponse]:
        """Obtiene elementos del menú por categoría"""
        try:
            result = await self.get_menu_items_paginated(
                page=1, 
                limit=100, 
                category_id=category_id,
                available_only=True
            )
            return result.items
            
        except Exception as e:
            logger.log("error", f"Error al obtener elementos por categoría: {e}")
            raise