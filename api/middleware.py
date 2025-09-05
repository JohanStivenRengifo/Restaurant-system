"""
Middleware personalizado para la API
"""
from fastapi import Request, HTTPException, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.types import ASGIApp
import time
import json
from typing import Callable

from patterns.singleton import logger, cache


class ErrorHandlerMiddleware(BaseHTTPMiddleware):
    """Middleware para manejo global de errores"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        try:
            response = await call_next(request)
            return response
        except HTTPException:
            raise
        except Exception as e:
            logger.log("error", "Error no manejado en la API", {
                "error": str(e),
                "path": request.url.path,
                "method": request.method
            })
            
            return JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={
                    "success": False,
                    "message": "Error interno del servidor",
                    "error": str(e) if logger.get_logs()[-1]["level"] == "debug" else "Error interno"
                }
            )


class LoggingMiddleware(BaseHTTPMiddleware):
    """Middleware para logging de requests"""
    
    async def dispatch(self, request: Request, call_next: Callable):
        start_time = time.time()
        
        # Log del request
        logger.log("info", f"Request: {request.method} {request.url.path}", {
            "method": request.method,
            "path": request.url.path,
            "query_params": dict(request.query_params),
            "client_ip": request.client.host if request.client else None
        })
        
        response = await call_next(request)
        
        # Calcular tiempo de procesamiento
        process_time = time.time() - start_time
        
        # Log del response
        logger.log("info", f"Response: {response.status_code}", {
            "method": request.method,
            "path": request.url.path,
            "status_code": response.status_code,
            "process_time": process_time
        })
        
        return response


class RateLimitMiddleware(BaseHTTPMiddleware):
    """Middleware para rate limiting básico"""
    
    def __init__(self, app: ASGIApp, requests_per_minute: int = 60):
        super().__init__(app)
        self.requests_per_minute = requests_per_minute
        self.requests = {}
    
    async def dispatch(self, request: Request, call_next: Callable):
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Limpiar requests antiguos (más de 1 minuto)
        if client_ip in self.requests:
            self.requests[client_ip] = [
                req_time for req_time in self.requests[client_ip]
                if current_time - req_time < 60
            ]
        else:
            self.requests[client_ip] = []
        
        # Verificar rate limit
        if len(self.requests[client_ip]) >= self.requests_per_minute:
            logger.log("warning", "Rate limit excedido", {
                "client_ip": client_ip,
                "requests_count": len(self.requests[client_ip])
            })
            
            return JSONResponse(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                content={
                    "success": False,
                    "message": "Demasiadas solicitudes. Intente nuevamente en un minuto.",
                    "retry_after": 60
                }
            )
        
        # Registrar request
        self.requests[client_ip].append(current_time)
        
        response = await call_next(request)
        return response


class CacheMiddleware(BaseHTTPMiddleware):
    """Middleware para cache de respuestas"""
    
    def __init__(self, app: ASGIApp, cache_ttl: int = 300):
        super().__init__(app)
        self.cache_ttl = cache_ttl
    
    async def dispatch(self, request: Request, call_next: Callable):
        # Solo cachear GET requests
        if request.method != "GET":
            return await call_next(request)
        
        # Crear clave de cache
        cache_key = f"{request.method}:{request.url.path}:{str(request.query_params)}"
        
        # Verificar cache
        cached_response = cache.get(cache_key)
        if cached_response:
            logger.log("info", "Cache hit", {"cache_key": cache_key})
            return JSONResponse(**cached_response)
        
        # Procesar request
        response = await call_next(request)
        
        # Cachear response si es exitoso
        if response.status_code == 200:
            try:
                response_body = json.loads(response.body.decode())
                cache.set(cache_key, {
                    "status_code": response.status_code,
                    "content": response_body
                }, self.cache_ttl)
                logger.log("info", "Response cached", {"cache_key": cache_key})
            except Exception as e:
                logger.log("warning", "Error al cachear response", {"error": str(e)})
        
        return response
