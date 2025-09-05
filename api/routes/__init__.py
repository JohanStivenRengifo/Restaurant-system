"""
Módulo de rutas - Importa todas las rutas del sistema
"""
from fastapi import APIRouter
from .system import router as system_router
from .menu import router as menu_router
from .orders import router as orders_router
from .customers import router as customers_router
from .tables import router as tables_router
from .inventory import router as inventory_router
from .kitchen import router as kitchen_router
from .billing import router as billing_router
from .reports import router as reports_router

# Crear router principal
api_router = APIRouter()

# Incluir todas las rutas
api_router.include_router(system_router)  # Sin prefijo para rutas del sistema
api_router.include_router(menu_router, prefix="/api/v1")
api_router.include_router(orders_router, prefix="/api/v1")
api_router.include_router(customers_router, prefix="/api/v1")
api_router.include_router(tables_router, prefix="/api/v1")
api_router.include_router(inventory_router, prefix="/api/v1")
api_router.include_router(kitchen_router, prefix="/api/v1")
api_router.include_router(billing_router, prefix="/api/v1")
api_router.include_router(reports_router, prefix="/api/v1")

# Exportar el router principal
__all__ = ["api_router"]