"""
Rutas del menú con documentación completa y funcionalidad con Supabase
"""
from fastapi import APIRouter, HTTPException, Depends, status, Query, Path
from typing import List, Optional, Dict, Any
from uuid import UUID

from models.schemas import (
    MenuItemResponse, MenuItemCreate, MenuItemUpdate, 
    CategoryResponse, CategoryCreate, CategoryUpdate,
    PaginatedResponse, BaseResponse, ErrorResponse
)
from services.menu_service import MenuService
from patterns.singleton import logger

router = APIRouter(prefix="/menu", tags=["Menú"])

# Inyectar dependencias
def get_menu_service() -> MenuService:
    return MenuService()

# ==================== RUTAS DE ELEMENTOS DEL MENÚ ====================

@router.get("/items", 
           response_model=PaginatedResponse,
           summary="Obtener elementos del menú",
           description="Obtiene una lista paginada de elementos del menú con filtros opcionales",
           responses={
               200: {"description": "Lista de elementos del menú obtenida exitosamente"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def get_menu_items(
    page: int = Query(1, ge=1, description="Número de página"),
    limit: int = Query(10, ge=1, le=100, description="Elementos por página"),
    category_id: Optional[UUID] = Query(None, description="Filtrar por categoría"),
    available_only: bool = Query(True, description="Solo elementos disponibles"),
    featured_only: bool = Query(False, description="Solo elementos destacados"),
    search: Optional[str] = Query(None, description="Buscar por nombre o descripción"),
    sort_by: Optional[str] = Query("name", description="Campo para ordenar"),
    sort_order: str = Query("asc", pattern="^(asc|desc)$", description="Orden de clasificación"),
    service: MenuService = Depends(get_menu_service)
):
    """Obtiene una lista paginada de elementos del menú con filtros opcionales"""
    try:
        result = await service.get_menu_items_paginated(
            page=page,
            limit=limit,
            category_id=category_id,
            available_only=available_only,
            featured_only=featured_only,
            search=search,
            sort_by=sort_by,
            sort_order=sort_order
        )
        return result
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener elementos del menú: {str(e)}"
        )

# ==================== RUTAS DE BÚSQUEDA (ANTES DE RUTAS CON PARÁMETROS) ====================

@router.get("/items/search", 
           response_model=List[MenuItemResponse],
           summary="Buscar elementos del menú",
           description="Busca elementos del menú por término de búsqueda",
           responses={
               200: {"description": "Resultados de búsqueda obtenidos exitosamente"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def search_menu_items(
    search_term: str = Query(..., min_length=1, description="Término de búsqueda"),
    service: MenuService = Depends(get_menu_service)
):
    """Busca elementos del menú por término de búsqueda"""
    try:
        results = await service.search_menu_items(search_term)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al buscar elementos del menú: {str(e)}"
        )

@router.get("/items/featured", 
           response_model=List[MenuItemResponse],
           summary="Obtener elementos destacados",
           description="Obtiene elementos del menú marcados como destacados",
           responses={
               200: {"description": "Elementos destacados obtenidos exitosamente"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def get_featured_items(service: MenuService = Depends(get_menu_service)):
    """Obtiene elementos del menú marcados como destacados"""
    try:
        items = await service.get_featured_items()
        return items
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener elementos destacados: {str(e)}"
        )

@router.get("/items/by-category/{category_id}", 
           response_model=List[MenuItemResponse],
           summary="Obtener elementos por categoría",
           description="Obtiene elementos del menú de una categoría específica",
           responses={
               200: {"description": "Elementos de la categoría obtenidos exitosamente"},
               404: {"model": ErrorResponse, "description": "Categoría no encontrada"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def get_items_by_category(
    category_id: UUID = Path(..., description="ID de la categoría"),
    service: MenuService = Depends(get_menu_service)
):
    """Obtiene elementos del menú de una categoría específica"""
    try:
        items = await service.get_items_by_category(category_id)
        return items
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener elementos por categoría: {str(e)}"
        )

@router.get("/items/allergen/{allergen}", 
           response_model=List[MenuItemResponse],
           summary="Obtener elementos por alérgeno",
           description="Obtiene elementos del menú que contienen un alérgeno específico",
           responses={
               200: {"description": "Elementos con alérgeno obtenidos exitosamente"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def get_items_by_allergen(
    allergen: str = Path(..., description="Nombre del alérgeno"),
    service: MenuService = Depends(get_menu_service)
):
    """Obtiene elementos del menú que contienen un alérgeno específico"""
    try:
        results = await service.get_items_by_allergen(allergen)
        return results
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener elementos por alérgeno: {str(e)}"
        )

# ==================== RUTAS CON PARÁMETROS ====================

@router.post("/items", 
          response_model=MenuItemResponse, 
          status_code=status.HTTP_201_CREATED,
          summary="Crear elemento del menú",
          description="Crea un nuevo elemento del menú",
          responses={
              201: {"description": "Elemento del menú creado exitosamente"},
              400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
              500: {"model": ErrorResponse, "description": "Error interno del servidor"}
          })
async def create_menu_item(
    item: MenuItemCreate,
    service: MenuService = Depends(get_menu_service)
):
    """Crea un nuevo elemento del menú"""
    try:
        created_item = await service.create_menu_item(item)
        return created_item
    except Exception as e:
        logger.log("error", f"Error al crear elemento del menú: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear elemento del menú: {str(e)}"
        )

@router.get("/items/{item_id}", 
           response_model=MenuItemResponse,
           summary="Obtener elemento del menú por ID",
           description="Obtiene un elemento específico del menú por su ID",
           responses={
               200: {"description": "Elemento del menú obtenido exitosamente"},
               404: {"model": ErrorResponse, "description": "Elemento del menú no encontrado"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def get_menu_item(
    item_id: UUID = Path(..., description="ID del elemento del menú"),
    service: MenuService = Depends(get_menu_service)
):
    """Obtiene un elemento específico del menú por su ID"""
    try:
        item = await service.get_menu_item(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Elemento del menú no encontrado"
            )
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener elemento del menú: {str(e)}"
        )

@router.put("/items/{item_id}", 
           response_model=MenuItemResponse,
           summary="Actualizar elemento del menú",
           description="Actualiza un elemento existente del menú",
           responses={
               200: {"description": "Elemento del menú actualizado exitosamente"},
               404: {"model": ErrorResponse, "description": "Elemento del menú no encontrado"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def update_menu_item(
    item_id: UUID = Path(..., description="ID del elemento del menú"),
    item_update: MenuItemUpdate = ...,
    service: MenuService = Depends(get_menu_service)
):
    """Actualiza un elemento existente del menú"""
    try:
        updated_item = await service.update_menu_item(item_id, item_update)
        if not updated_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Elemento del menú no encontrado"
            )
        return updated_item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar elemento del menú: {str(e)}"
        )

@router.delete("/items/{item_id}", 
              response_model=BaseResponse,
              summary="Eliminar elemento del menú",
              description="Elimina un elemento del menú",
              responses={
                  200: {"description": "Elemento del menú eliminado exitosamente"},
                  404: {"model": ErrorResponse, "description": "Elemento del menú no encontrado"},
                  500: {"model": ErrorResponse, "description": "Error interno del servidor"}
              })
async def delete_menu_item(
    item_id: UUID = Path(..., description="ID del elemento del menú"),
    service: MenuService = Depends(get_menu_service)
):
    """Elimina un elemento del menú"""
    try:
        success = await service.delete_menu_item(item_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Elemento del menú no encontrado"
            )
        return BaseResponse(message="Elemento del menú eliminado exitosamente")
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar elemento del menú: {str(e)}"
        )

@router.patch("/items/{item_id}/availability", 
             response_model=MenuItemResponse,
             summary="Alternar disponibilidad",
             description="Alterna la disponibilidad de un elemento del menú",
             responses={
                 200: {"description": "Disponibilidad actualizada exitosamente"},
                 404: {"model": ErrorResponse, "description": "Elemento del menú no encontrado"},
                 500: {"model": ErrorResponse, "description": "Error interno del servidor"}
             })
async def toggle_item_availability(
    item_id: UUID = Path(..., description="ID del elemento del menú"),
    service: MenuService = Depends(get_menu_service)
):
    """Alterna la disponibilidad de un elemento del menú"""
    try:
        item = await service.toggle_item_availability(item_id)
        if not item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Elemento del menú no encontrado"
            )
        return item
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al alternar disponibilidad: {str(e)}"
        )

@router.post("/items/from-template", 
            response_model=MenuItemResponse,
            summary="Crear elemento desde plantilla",
            description="Crea un elemento del menú usando una plantilla (Patrón Prototype)",
            responses={
                201: {"description": "Elemento creado desde plantilla exitosamente"},
                400: {"model": ErrorResponse, "description": "Plantilla no encontrada"},
                500: {"model": ErrorResponse, "description": "Error interno del servidor"}
            })
async def create_menu_item_from_template(
    template_name: str = Query(..., description="Nombre de la plantilla"),
    service: MenuService = Depends(get_menu_service)
):
    """Crea un elemento del menú usando una plantilla (Patrón Prototype)"""
    try:
        # Usar plantilla por defecto si no se especifica
        customizations = {"size": "medium", "special_requests": ""}
        item = await service.create_menu_item_from_template(template_name, customizations)
        return item
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear elemento desde plantilla: {str(e)}"
        )

# ==================== RUTAS DE CATEGORÍAS ====================

@router.get("/categories", 
           response_model=List[CategoryResponse],
           summary="Obtener categorías del menú",
           description="Obtiene todas las categorías del menú",
           responses={
               200: {"description": "Lista de categorías obtenida exitosamente"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def get_categories(service: MenuService = Depends(get_menu_service)):
    """Obtiene todas las categorías del menú"""
    try:
        categories = await service.get_categories()
        return categories
    except Exception as e:
        logger.log("error", f"Error al obtener categorías: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener categorías: {str(e)}"
        )

@router.post("/categories", 
            response_model=CategoryResponse,
            status_code=status.HTTP_201_CREATED,
            summary="Crear categoría",
            description="Crea una nueva categoría del menú",
            responses={
                201: {"description": "Categoría creada exitosamente"},
                400: {"model": ErrorResponse, "description": "Datos de entrada inválidos"},
                500: {"model": ErrorResponse, "description": "Error interno del servidor"}
            })
async def create_category(
    category: CategoryCreate,
    service: MenuService = Depends(get_menu_service)
):
    """Crea una nueva categoría del menú"""
    try:
        created_category = await service.create_category(category)
        return created_category
    except Exception as e:
        logger.log("error", f"Error al crear categoría: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al crear categoría: {str(e)}"
        )

@router.get("/categories/{category_id}", 
           response_model=CategoryResponse,
           summary="Obtener categoría por ID",
           description="Obtiene una categoría específica por su ID",
           responses={
               200: {"description": "Categoría obtenida exitosamente"},
               404: {"model": ErrorResponse, "description": "Categoría no encontrada"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def get_category(
    category_id: UUID = Path(..., description="ID de la categoría"),
    service: MenuService = Depends(get_menu_service)
):
    """Obtiene una categoría específica por su ID"""
    try:
        category = await service.get_category(category_id)
        if not category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada"
            )
        return category
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al obtener categoría: {str(e)}"
        )

@router.put("/categories/{category_id}", 
           response_model=CategoryResponse,
           summary="Actualizar categoría",
           description="Actualiza una categoría existente",
           responses={
               200: {"description": "Categoría actualizada exitosamente"},
               404: {"model": ErrorResponse, "description": "Categoría no encontrada"},
               500: {"model": ErrorResponse, "description": "Error interno del servidor"}
           })
async def update_category(
    category_id: UUID = Path(..., description="ID de la categoría"),
    category_update: CategoryUpdate = ...,
    service: MenuService = Depends(get_menu_service)
):
    """Actualiza una categoría existente"""
    try:
        updated_category = await service.update_category(category_id, category_update)
        if not updated_category:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada"
            )
        return updated_category
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al actualizar categoría: {str(e)}"
        )

@router.delete("/categories/{category_id}", 
              response_model=BaseResponse,
              summary="Eliminar categoría",
              description="Elimina una categoría del menú",
              responses={
                  200: {"description": "Categoría eliminada exitosamente"},
                  404: {"model": ErrorResponse, "description": "Categoría no encontrada"},
                  500: {"model": ErrorResponse, "description": "Error interno del servidor"}
              })
async def delete_category(
    category_id: UUID = Path(..., description="ID de la categoría"),
    service: MenuService = Depends(get_menu_service)
):
    """Elimina una categoría del menú"""
    try:
        success = await service.delete_category(category_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Categoría no encontrada"
            )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al eliminar categoría: {str(e)}"
        )
