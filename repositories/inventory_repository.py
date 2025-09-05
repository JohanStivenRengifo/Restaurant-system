"""
Repositorio para gestión de inventario
"""
from typing import List, Optional, Dict, Any
from models.entities import Ingredient, IngredientCategory, InventoryMovement, Unit
from repositories.base import BaseRepository
from patterns.singleton import logger


class IngredientCategoryRepository(BaseRepository[IngredientCategory]):
    """Repositorio para categorías de ingredientes"""
    
    def __init__(self):
        super().__init__("ingredient_categories")
    
    def _map_to_entity(self, data: Dict[str, Any]) -> IngredientCategory:
        """Mapea los datos a la entidad IngredientCategory"""
        return IngredientCategory(**data)
    
    def get_active_categories(self) -> List[IngredientCategory]:
        """Obtiene todas las categorías activas"""
        try:
            result = self.db.table(self.table_name).select("*").order("name").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener categorías de ingredientes", {"error": str(e)})
            raise


class UnitRepository(BaseRepository[Unit]):
    """Repositorio para unidades de medida"""
    
    def __init__(self):
        super().__init__("units")
    
    def _map_to_entity(self, data: Dict[str, Any]) -> Unit:
        """Mapea los datos a la entidad Unit"""
        return Unit(**data)
    
    def get_by_type(self, unit_type: str) -> List[Unit]:
        """Obtiene unidades por tipo"""
        try:
            result = self.db.table(self.table_name).select("*").eq("type", unit_type).order("name").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener unidades por tipo", {"error": str(e)})
            raise
    
    def get_all_units(self) -> List[Unit]:
        """Obtiene todas las unidades"""
        try:
            result = self.db.table(self.table_name).select("*").order("type", "name").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener todas las unidades", {"error": str(e)})
            raise


class InventoryMovementRepository(BaseRepository[InventoryMovement]):
    """Repositorio para movimientos de inventario"""
    
    def __init__(self):
        super().__init__("inventory_movements")
    
    def _map_to_entity(self, data: Dict[str, Any]) -> InventoryMovement:
        """Mapea los datos a la entidad InventoryMovement"""
        return InventoryMovement(**data)
    
    def get_by_ingredient(self, ingredient_id: str) -> List[InventoryMovement]:
        """Obtiene movimientos por ingrediente"""
        try:
            result = self.db.table(self.table_name).select("*").eq("ingredient_id", ingredient_id).order("created_at", desc=True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener movimientos por ingrediente", {"error": str(e)})
            raise
    
    def get_by_movement_type(self, movement_type: str) -> List[InventoryMovement]:
        """Obtiene movimientos por tipo"""
        try:
            result = self.db.table(self.table_name).select("*").eq("movement_type", movement_type).order("created_at", desc=True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener movimientos por tipo", {"error": str(e)})
            raise
    
    def get_by_user(self, user_id: str) -> List[InventoryMovement]:
        """Obtiene movimientos por usuario"""
        try:
            result = self.db.table(self.table_name).select("*").eq("user_id", user_id).order("created_at", desc=True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener movimientos por usuario", {"error": str(e)})
            raise
    
    def get_recent_movements(self, limit: int = 50) -> List[InventoryMovement]:
        """Obtiene movimientos recientes"""
        try:
            result = self.db.table(self.table_name).select("*").order("created_at", desc=True).limit(limit).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener movimientos recientes", {"error": str(e)})
            raise
    
    def get_movements_by_date_range(self, start_date: str, end_date: str) -> List[InventoryMovement]:
        """Obtiene movimientos en un rango de fechas"""
        try:
            result = self.db.table(self.table_name).select("*").gte("created_at", f"{start_date}T00:00:00").lte("created_at", f"{end_date}T23:59:59").order("created_at", desc=True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener movimientos por rango de fechas", {"error": str(e)})
            raise
    
    def get_movements_by_reference(self, reference_type: str, reference_id: str) -> List[InventoryMovement]:
        """Obtiene movimientos por referencia"""
        try:
            result = self.db.table(self.table_name).select("*").eq("reference_type", reference_type).eq("reference_id", reference_id).order("created_at", desc=True).execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener movimientos por referencia", {"error": str(e)})
            raise


class IngredientRepository(BaseRepository[Ingredient]):
    """Repositorio para ingredientes (extendido del menu_repository)"""
    
    def __init__(self):
        super().__init__("ingredients")
    
    def _map_to_entity(self, data: Dict[str, Any]) -> Ingredient:
        """Mapea los datos a la entidad Ingredient"""
        return Ingredient(**data)
    
    def get_low_stock_items(self, threshold: float = 10.0) -> List[Ingredient]:
        """Obtiene ingredientes con stock bajo"""
        try:
            result = self.db.table(self.table_name).select("*").lte("current_stock", threshold).eq("is_active", True).order("current_stock").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener ingredientes con stock bajo", {"error": str(e)})
            raise
    
    def get_by_category(self, category_id: str) -> List[Ingredient]:
        """Obtiene ingredientes por categoría"""
        try:
            result = self.db.table(self.table_name).select("*").eq("category_id", category_id).eq("is_active", True).order("name").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener ingredientes por categoría", {"error": str(e)})
            raise
    
    def get_by_supplier(self, supplier: str) -> List[Ingredient]:
        """Obtiene ingredientes por proveedor"""
        try:
            result = self.db.table(self.table_name).select("*").eq("supplier", supplier).eq("is_active", True).order("name").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener ingredientes por proveedor", {"error": str(e)})
            raise
    
    def search_ingredients(self, search_term: str) -> List[Ingredient]:
        """Busca ingredientes por nombre"""
        try:
            result = self.db.table(self.table_name).select("*").ilike("name", f"%{search_term}%").eq("is_active", True).order("name").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al buscar ingredientes", {"error": str(e)})
            raise
    
    def get_out_of_stock_items(self) -> List[Ingredient]:
        """Obtiene ingredientes sin stock"""
        try:
            result = self.db.table(self.table_name).select("*").eq("current_stock", 0).eq("is_active", True).order("name").execute()
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener ingredientes sin stock", {"error": str(e)})
            raise
    
    def get_ingredients_needing_restock(self, threshold: float = None) -> List[Ingredient]:
        """Obtiene ingredientes que necesitan reabastecimiento"""
        try:
            if threshold is None:
                # Usar el threshold mínimo de stock de cada ingrediente
                result = self.db.table(self.table_name).select("*").lte("current_stock", "min_stock").eq("is_active", True).order("current_stock").execute()
            else:
                result = self.db.table(self.table_name).select("*").lte("current_stock", threshold).eq("is_active", True).order("current_stock").execute()
            
            return [self._map_to_entity(item) for item in result.data]
        except Exception as e:
            logger.log("error", f"Error al obtener ingredientes que necesitan reabastecimiento", {"error": str(e)})
            raise
    
    def update_stock(self, ingredient_id: str, new_stock: float) -> Optional[Ingredient]:
        """Actualiza el stock de un ingrediente"""
        try:
            result = self.db.table(self.table_name).update({"current_stock": new_stock}).eq("id", ingredient_id).execute()
            if result.data:
                return self._map_to_entity(result.data[0])
            return None
        except Exception as e:
            logger.log("error", f"Error al actualizar stock", {"error": str(e)})
            raise
    
    def adjust_stock(self, ingredient_id: str, adjustment: float, reason: str = None, user_id: str = None) -> Optional[Ingredient]:
        """Ajusta el stock de un ingrediente y registra el movimiento"""
        try:
            # Obtener el ingrediente actual
            ingredient = self.get_by_id(ingredient_id)
            if not ingredient:
                return None
            
            # Calcular nuevo stock
            new_stock = max(0, ingredient.current_stock + adjustment)
            
            # Actualizar stock
            updated_ingredient = self.update_stock(ingredient_id, new_stock)
            
            if updated_ingredient:
                # Registrar movimiento de inventario
                movement_data = {
                    "ingredient_id": ingredient_id,
                    "movement_type": "adjustment",
                    "quantity": abs(adjustment),
                    "reason": reason or "Ajuste manual de stock",
                    "user_id": user_id
                }
                
                # Crear movimiento (esto se haría a través del servicio)
                logger.log("info", f"Stock ajustado para {ingredient.name}", {
                    "ingredient_id": ingredient_id,
                    "old_stock": ingredient.current_stock,
                    "new_stock": new_stock,
                    "adjustment": adjustment
                })
            
            return updated_ingredient
        except Exception as e:
            logger.log("error", f"Error al ajustar stock", {"error": str(e)})
            raise
