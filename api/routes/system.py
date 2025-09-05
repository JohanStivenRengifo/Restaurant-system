"""
Rutas del sistema - Endpoints de configuración, salud y seed
"""
from fastapi import APIRouter, HTTPException, Depends, status
from fastapi.responses import JSONResponse
from datetime import datetime
from typing import Dict, Any

from patterns.singleton import logger, notifications, config, db_singleton
from config import settings
from utils.timezone import get_bogota_now, format_bogota_timestamp

router = APIRouter(tags=["Sistema"])

# ==================== ENDPOINTS DEL SISTEMA ====================

@router.get("/", 
         summary="Información de la API",
         description="Endpoint raíz que proporciona información básica sobre la API del sistema de restaurante",
         responses={
             200: {
                 "description": "Información de la API obtenida exitosamente",
                 "content": {
                     "application/json": {
                         "example": {
                             "success": True,
                             "message": "Sistema de Restaurante API - Bienvenido",
                             "timestamp": "2025-09-04T18:13:35.283600",
                             "version": "1.0.0",
                             "status": "active",
                             "docs": "/docs"
                         }
                     }
                 }
             }
         })
async def root():
    """Endpoint raíz - Información de la API"""
    return {
        "success": True,
        "message": "Sistema de Restaurante API - Bienvenido",
        "timestamp": format_bogota_timestamp(),
        "version": "1.0.0",
        "status": "active",
        "docs": "/docs",
        "description": "API REST completa para gestión integral de restaurante con patrones de diseño y funcionalidad completa"
    }

@router.get("/health", 
         summary="Estado de salud del sistema",
         description="Verifica el estado de salud del sistema y la conexión a la base de datos",
         responses={
             200: {
                 "description": "Sistema saludable",
                 "content": {
                     "application/json": {
                         "example": {
                             "status": "healthy",
                             "database": "connected",
                             "timestamp": "2025-09-04T18:13:30.184563",
                             "version": "1.0.0"
                         }
                     }
                 }
             },
             503: {
                 "description": "Sistema no saludable",
                 "content": {
                     "application/json": {
                         "example": {
                             "status": "unhealthy",
                             "error": "Error de conexión a la base de datos",
                             "timestamp": "2025-09-04T18:13:30.184563"
                         }
                     }
                 }
             }
         })
async def health_check():
    """Endpoint de verificación de salud del sistema"""
    try:
        # Verificar conexión a la base de datos
        db_healthy = db_singleton.health_check()
        
        return {
            "status": "healthy" if db_healthy else "unhealthy",
            "database": "connected" if db_healthy else "disconnected",
            "timestamp": format_bogota_timestamp(),
            "version": "1.0.0"
        }
    except Exception as e:
        logger.log("error", "Error en health check", {"error": str(e)})
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.utcnow().isoformat()
            }
        )

@router.get("/config",
         summary="Configuración de la aplicación",
         description="Obtiene la configuración actual de la aplicación",
         responses={
             200: {
                 "description": "Configuración obtenida exitosamente",
                 "content": {
                     "application/json": {
                         "example": {
                             "tax_rate": 0.19,
                             "currency": "CLP",
                             "timezone": "America/Bogota",
                             "max_party_size": 20,
                             "low_stock_threshold": 10,
                             "app_version": "1.0.0",
                             "environment": "development"
                         }
                     }
                 }
             }
         })
async def get_config():
    """Obtiene configuración de la aplicación"""
    return {
        "tax_rate": config.get("tax_rate", 0.19),
        "currency": config.get("currency", "CLP"),
        "timezone": config.get("timezone", "America/Bogota"),
        "timezone_offset": config.get("timezone_offset", "-05:00"),
        "max_party_size": config.get("max_party_size", 20),
        "low_stock_threshold": config.get("low_stock_threshold", 10),
        "app_version": "1.0.0",
        "environment": "development" if settings.debug else "production",
        "current_time": format_bogota_timestamp()
    }

@router.post("/seed",
          summary="Poblar base de datos",
          description="Pobla la base de datos con datos de ejemplo para testing y demostración",
          responses={
              200: {
                  "description": "Base de datos poblada exitosamente",
                  "content": {
                      "application/json": {
                          "example": {
                              "success": True,
                              "message": "Base de datos poblada exitosamente con datos de ejemplo",
                              "data": {
                                  "categories_created": 4,
                                  "menu_items_created": 4,
                                  "timestamp": "2025-09-04T18:13:35.283600"
                              }
                          }
                      }
                  }
              },
              500: {
                  "description": "Error al poblar la base de datos",
                  "content": {
                      "application/json": {
                          "example": {
                              "detail": "Error al poblar la base de datos: Error de conexión"
                          }
                      }
                  }
              }
          })
async def seed_database():
    """Pobla la base de datos con datos de ejemplo"""
    try:
        categories_created = 0
        menu_items_created = 0
        
        # Crear categorías
        categories_data = [
            {
                "id": "550e8400-e29b-41d4-a716-446655440001",
                "name": "Entradas",
                "description": "Platos de entrada y aperitivos",
                "display_order": 1,
                "is_active": True,
                "created_at": format_bogota_timestamp(),
                "updated_at": None
            },
            {
                "id": "550e8400-e29b-41d4-a716-446655440002",
                "name": "Platos Principales",
                "description": "Platos principales y especialidades",
                "display_order": 2,
                "is_active": True,
                "created_at": format_bogota_timestamp(),
                "updated_at": None
            },
            {
                "id": "550e8400-e29b-41d4-a716-446655440003",
                "name": "Postres",
                "description": "Postres y dulces",
                "display_order": 3,
                "is_active": True,
                "created_at": format_bogota_timestamp(),
                "updated_at": None
            },
            {
                "id": "550e8400-e29b-41d4-a716-446655440004",
                "name": "Bebidas",
                "description": "Bebidas y refrescos",
                "display_order": 4,
                "is_active": True,
                "created_at": format_bogota_timestamp(),
                "updated_at": None
            }
        ]
        
        # Insertar categorías (usando upsert para evitar duplicados)
        for cat_data in categories_data:
            try:
                result = db_singleton.connection.table('menu_categories').upsert(cat_data).execute()
                if result.data:
                    logger.log("info", f"Categoría creada/actualizada: {cat_data['name']}")
                    categories_created += 1
            except Exception as e:
                logger.log("warning", f"Categoría {cat_data['name']} ya existe o error: {str(e)}")
        
        # Crear elementos del menú
        menu_items_data = [
            {
                "id": "660e8400-e29b-41d4-a716-446655440001",
                "name": "Ensalada César",
                "description": "Lechuga fresca, pollo a la plancha, queso parmesano, aderezo césar",
                "category_id": "550e8400-e29b-41d4-a716-446655440001",
                "price": 12.99,
                "cost": 5.50,
                "preparation_time": 15,
                "is_available": True,
                "is_featured": True,
                "image_url": "https://example.com/cesar.jpg",
                "allergen_info": ["lácteos", "gluten"],
                "nutritional_info": {"calories": 350, "protein": 25, "carbs": 15},
                "created_at": format_bogota_timestamp(),
                "updated_at": None
            },
            {
                "id": "660e8400-e29b-41d4-a716-446655440002",
                "name": "Pasta Carbonara",
                "description": "Pasta con salsa carbonara, panceta, queso parmesano",
                "category_id": "550e8400-e29b-41d4-a716-446655440002",
                "price": 18.99,
                "cost": 8.50,
                "preparation_time": 25,
                "is_available": True,
                "is_featured": False,
                "image_url": "https://example.com/carbonara.jpg",
                "allergen_info": ["lácteos", "gluten", "huevos"],
                "nutritional_info": {"calories": 650, "protein": 35, "carbs": 45},
                "created_at": format_bogota_timestamp(),
                "updated_at": None
            },
            {
                "id": "660e8400-e29b-41d4-a716-446655440003",
                "name": "Tiramisú",
                "description": "Postre italiano con café y mascarpone",
                "category_id": "550e8400-e29b-41d4-a716-446655440003",
                "price": 8.99,
                "cost": 3.50,
                "preparation_time": 10,
                "is_available": True,
                "is_featured": True,
                "image_url": "https://example.com/tiramisu.jpg",
                "allergen_info": ["lácteos", "huevos", "gluten"],
                "nutritional_info": {"calories": 420, "protein": 8, "carbs": 35},
                "created_at": format_bogota_timestamp(),
                "updated_at": None
            },
            {
                "id": "660e8400-e29b-41d4-a716-446655440004",
                "name": "Coca Cola",
                "description": "Refresco de cola",
                "category_id": "550e8400-e29b-41d4-a716-446655440004",
                "price": 3.99,
                "cost": 1.50,
                "preparation_time": 1,
                "is_available": True,
                "is_featured": False,
                "image_url": "https://example.com/coca.jpg",
                "allergen_info": [],
                "nutritional_info": {"calories": 140, "protein": 0, "carbs": 35},
                "created_at": format_bogota_timestamp(),
                "updated_at": None
            }
        ]
        
        # Insertar elementos del menú (usando upsert para evitar duplicados)
        for item_data in menu_items_data:
            try:
                result = db_singleton.connection.table('menu_items').upsert(item_data).execute()
                if result.data:
                    logger.log("info", f"Elemento del menú creado/actualizado: {item_data['name']}")
                    menu_items_created += 1
            except Exception as e:
                logger.log("warning", f"Elemento del menú {item_data['name']} ya existe o error: {str(e)}")
        
        return {
            "success": True,
            "message": "Base de datos poblada exitosamente con datos de ejemplo",
            "data": {
                "categories_created": categories_created,
                "menu_items_created": menu_items_created,
                "timestamp": format_bogota_timestamp()
            }
        }
        
    except Exception as e:
        logger.log("error", "Error al poblar la base de datos", {"error": str(e)})
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error al poblar la base de datos: {str(e)}"
        )
