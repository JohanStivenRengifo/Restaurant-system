"""
API REST principal del sistema de restaurante
Sistema completo con documentación mejorada, patrones de diseño y funcionalidad completa
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.trustedhost import TrustedHostMiddleware
from fastapi.openapi.utils import get_openapi
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from contextlib import asynccontextmanager
import uvicorn
import os

# Importar configuración y patrones
from config import settings
from patterns.singleton import logger, notifications

# Importar middleware y rutas
from api.middleware import ErrorHandlerMiddleware, LoggingMiddleware, RateLimitMiddleware
from api.routes import api_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Gestión del ciclo de vida de la aplicación"""
    # Startup
    logger.log("info", "Iniciando aplicación de restaurante", {
        "version": "1.1.0",
        "environment": "development" if settings.debug else "production"
    })
    
    # Configurar notificaciones
    notifications.subscribe("low_stock_alert", lambda data: logger.log("warning", "Alerta de stock bajo", data))
    notifications.subscribe("out_of_stock_alert", lambda data: logger.log("error", "Alerta de stock agotado", data))
    
    yield
    
    # Shutdown
    logger.log("info", "Cerrando aplicación de restaurante")


def custom_openapi():
    """Generar documentación OpenAPI personalizada con UI/UX mejorada"""
    if app.openapi_schema:
        return app.openapi_schema
    
    openapi_schema = get_openapi(
        title="🍽️ Sistema de Restaurante API",
        version="1.1.0",
        description="""

Sistema completo de gestión de restaurante con API REST moderna.

---
*Desarrollado con ❤️ usando FastAPI, Swagger UI y patrones de diseño avanzados*
        """,
        routes=app.routes,
    )
    
    # Personalizar la documentación
    openapi_schema["info"]["x-logo"] = {
        "url": "https://fastapi.tiangolo.com/img/logo-margin/logo-teal.png"
    }
    
    # Añadir tags personalizados con mejor organización
    openapi_schema["tags"] = [
        {
            "name": "Sistema",
            "description": "⚙️ Endpoints del sistema y configuración",
            "x-displayName": "Sistema",
            "x-order": 1
        },
        {
            "name": "Menú",
            "description": "🍽️ Gestión de categorías y elementos del menú con patrones de diseño",
            "x-displayName": "Menú",
            "x-order": 2
        },
        {
            "name": "Pedidos",
            "description": "📋 Procesamiento y gestión completa de pedidos",
            "x-displayName": "Pedidos",
            "x-order": 3
        },
        {
            "name": "Clientes",
            "description": "👥 Gestión de clientes y programa de fidelidad",
            "x-displayName": "Clientes",
            "x-order": 4
        },
        {
            "name": "Mesas",
            "description": "🪑 Control de mesas y reservas",
            "x-displayName": "Mesas",
            "x-order": 5
        },
        {
            "name": "Inventario",
            "description": "📦 Gestión de stock e ingredientes",
            "x-displayName": "Inventario",
            "x-order": 6
        },
        {
            "name": "Cocina",
            "description": "👨‍🍳 Panel de control para la cocina",
            "x-displayName": "Cocina",
            "x-order": 7
        },
        {
            "name": "Facturación",
            "description": "🧾 Sistema de facturación y pagos",
            "x-displayName": "Facturación",
            "x-order": 8
        },
        {
            "name": "Reportes",
            "description": "📊 Análisis y reportes del negocio",
            "x-displayName": "Reportes",
            "x-order": 9
        }
    ]
    
    app.openapi_schema = openapi_schema
    return app.openapi_schema


# Crear aplicación FastAPI
app = FastAPI(
    title="Sistema de Restaurante API",
    description="API REST para gestión de un restaurante",
    version="1.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    lifespan=lifespan
)

# Configurar OpenAPI personalizada
app.openapi = custom_openapi

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else ["https://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configurar middleware de seguridad
app.add_middleware(
    TrustedHostMiddleware,
    allowed_hosts=["*"] if settings.debug else ["localhost:3000"]
)

# Añadir middleware personalizados
app.add_middleware(ErrorHandlerMiddleware)
app.add_middleware(LoggingMiddleware)
app.add_middleware(RateLimitMiddleware)

# Incluir todas las rutas modularizadas
app.include_router(api_router)

# Endpoint de salud simple
@app.get("/health", include_in_schema=False)
async def health_check():
    """Endpoint de salud simple"""
    return {"status": "ok", "message": "Sistema de restaurante funcionando"}

# Endpoint de datos de prueba para el dashboard
@app.get("/api/v1/test-data", include_in_schema=False)
async def get_test_data():
    """Datos de prueba para el dashboard"""
    return {
        "menu_items": [
            {
                "id": "1",
                "name": "Ensalada César",
                "description": "Lechuga romana, crutones, queso parmesano",
                "price": 12.99,
                "category_name": "Entradas",
                "available": True
            },
            {
                "id": "2",
                "name": "Pasta Carbonara",
                "description": "Pasta con salsa carbonara y panceta",
                "price": 18.50,
                "category_name": "Platos Principales",
                "available": True
            }
        ],
        "orders": [
            {
                "id": "1",
                "order_number": "ORD-001",
                "customer_name": "Juan Pérez",
                "table_number": 1,
                "status": "preparing",
                "total": 45.98
            }
        ],
        "customers": [
            {
                "id": "1",
                "first_name": "Juan",
                "last_name": "Pérez",
                "email": "juan@email.com",
                "phone": "+1234567890",
                "is_vip": True
            }
        ],
        "tables": [
            {
                "id": "1",
                "number": 1,
                "capacity": 4,
                "status": "available",
                "zone": "Terraza"
            },
            {
                "id": "2",
                "number": 2,
                "capacity": 2,
                "status": "occupied",
                "zone": "Interior"
            }
        ],
        "categories": [
            {
                "id": "550e8400-e29b-41d4-a716-446655440001",
                "name": "Entradas",
                "description": "Aperitivos y entradas"
            },
            {
                "id": "550e8400-e29b-41d4-a716-446655440002",
                "name": "Platos Principales",
                "description": "Platos principales del menú"
            },
            {
                "id": "550e8400-e29b-41d4-a716-446655440003",
                "name": "Postres",
                "description": "Postres y dulces"
            },
            {
                "id": "550e8400-e29b-41d4-a716-446655440004",
                "name": "Bebidas",
                "description": "Bebidas y refrescos"
            }
        ]
    }

# Montar archivos estáticos
app.mount("/static", StaticFiles(directory="static"), name="static")

# Endpoint personalizado para la documentación mejorada
@app.get("/docs", response_class=HTMLResponse, include_in_schema=False)
async def custom_docs():
    """Documentación personalizada con UI/UX mejorada"""
    try:
        with open("static/swagger-ui.html", "r", encoding="utf-8") as f:
            content = f.read()
            return HTMLResponse(content=content)
    except FileNotFoundError:
        # Fallback a la documentación por defecto
        return get_swagger_ui_html(
            openapi_url="/openapi.json",
            title="🍽️ Sistema de Restaurante API",
            swagger_js_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui-bundle.js",
            swagger_css_url="https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.9.0/swagger-ui.css",
            swagger_favicon_url="https://fastapi.tiangolo.com/img/favicon.png"
        )

# Endpoint para la documentación original (como respaldo)
@app.get("/docs-original", response_class=HTMLResponse, include_in_schema=False)
async def original_docs():
    """Documentación original de Swagger UI"""
    from fastapi.openapi.docs import get_swagger_ui_html
    return get_swagger_ui_html(openapi_url="/openapi.json", title="API Docs")

# Endpoint del dashboard
@app.get("/dashboard", response_class=HTMLResponse, include_in_schema=False)
async def dashboard():
    """Dashboard visual del sistema de restaurante"""
    try:
        with open("static/dashboard.html", "r", encoding="utf-8") as f:
            content = f.read()
            return HTMLResponse(content=content)
    except FileNotFoundError:
        return HTMLResponse(
            content="""
            <html>
                <head><title>Dashboard no encontrado</title></head>
                <body>
                    <h1>Dashboard no disponible</h1>
                    <p>El archivo dashboard.html no se encontró en la carpeta static/</p>
                    <a href="/docs">Ver documentación de la API</a>
                </body>
            </html>
            """,
            status_code=404
        )


if __name__ == "__main__":
    # Obtener puerto de Railway o usar el configurado
    port = int(os.environ.get("PORT", str(settings.port)))
    host = os.environ.get("HOST", settings.host)
    
    print("🍽️  Iniciando Sistema de Restaurante...")
    print(f"📱 API disponible en: http://{host}:{port}")
    print(f"📊 Dashboard visual en: http://{host}:{port}/dashboard")
    print(f"📚 Documentación en: http://{host}:{port}/docs")
    print("🌱 Para poblar con datos: POST /api/v1/seed")
    print("🔧 Configuración: GET /api/v1/config")
    print("❤️  Health Check: GET /health")
    
    uvicorn.run(
        "main:app",
        host=host,
        port=port,
        reload=False,  # Desactivar reload en producción
        log_level="info"
    )