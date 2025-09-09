"""
Patrón Singleton para garantizar una única instancia de clases críticas
"""
from typing import Optional, Dict, Any
import threading
from database.connection import db_connection


class LoggerSingleton:
    """Singleton para el sistema de logging"""
    
    _instance: Optional['LoggerSingleton'] = None
    _lock = threading.Lock()
    
    def __new__(cls) -> 'LoggerSingleton':
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._logs: list = []
            self._initialized = True
    
    def log(self, level: str, message: str, data: Optional[Dict[str, Any]] = None) -> None:
        """Registra un log"""
        import datetime
        log_entry = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "level": level,
            "message": message,
            "data": data or {}
        }
        self._logs.append(log_entry)
        print(f"[{level.upper()}] {message}")
    
    def get_logs(self, level: Optional[str] = None) -> list:
        """Obtiene los logs, opcionalmente filtrados por nivel"""
        if level:
            return [log for log in self._logs if log["level"] == level]
        return self._logs.copy()
    
    def clear_logs(self) -> None:
        """Limpia los logs"""
        self._logs.clear()


class CacheSingleton:
    """Singleton para el sistema de caché"""
    
    _instance: Optional['CacheSingleton'] = None
    _lock = threading.Lock()
    
    def __new__(cls) -> 'CacheSingleton':
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._cache: Dict[str, Any] = {}
            self._ttl: Dict[str, float] = {}
            self._initialized = True
    
    def set(self, key: str, value: Any, ttl_seconds: int = 3600) -> None:
        """Establece un valor en el caché con TTL"""
        import time
        self._cache[key] = value
        self._ttl[key] = time.time() + ttl_seconds
    
    def get(self, key: str) -> Any:
        """Obtiene un valor del caché"""
        import time
        if key in self._cache:
            if time.time() < self._ttl.get(key, 0):
                return self._cache[key]
            else:
                # TTL expirado, eliminar
                del self._cache[key]
                del self._ttl[key]
        return None
    
    def delete(self, key: str) -> bool:
        """Elimina un valor del caché"""
        if key in self._cache:
            del self._cache[key]
            del self._ttl[key]
            return True
        return False
    
    def clear(self) -> None:
        """Limpia todo el caché"""
        self._cache.clear()
        self._ttl.clear()


class NotificationSingleton:
    """Singleton para el sistema de notificaciones"""
    
    _instance: Optional['NotificationSingleton'] = None
    _lock = threading.Lock()
    
    def __new__(cls) -> 'NotificationSingleton':
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._notifications: list = []
            self._subscribers: Dict[str, list] = {}
            self._initialized = True
    
    def subscribe(self, event_type: str, callback) -> None:
        """Suscribe un callback a un tipo de evento"""
        if event_type not in self._subscribers:
            self._subscribers[event_type] = []
        self._subscribers[event_type].append(callback)
    
    def notify(self, event_type: str, data: Dict[str, Any]) -> None:
        """Envía una notificación"""
        import datetime
        notification = {
            "timestamp": datetime.datetime.utcnow().isoformat(),
            "event_type": event_type,
            "data": data
        }
        self._notifications.append(notification)
        
        # Notificar a los suscriptores
        if event_type in self._subscribers:
            for callback in self._subscribers[event_type]:
                try:
                    callback(notification)
                except Exception as e:
                    print(f"Error en callback de notificación: {e}")
    
    def get_notifications(self, event_type: Optional[str] = None) -> list:
        """Obtiene las notificaciones, opcionalmente filtradas por tipo"""
        if event_type:
            return [n for n in self._notifications if n["event_type"] == event_type]
        return self._notifications.copy()


class ConfigurationSingleton:
    """Singleton para la configuración global de la aplicación"""
    
    _instance: Optional['ConfigurationSingleton'] = None
    _lock = threading.Lock()
    
    def __new__(cls) -> 'ConfigurationSingleton':
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._config: Dict[str, Any] = {
                "tax_rate": 0.19,
                "currency": "CLP",
                "timezone": "America/Bogota",
                "timezone_offset": "-05:00",
                "max_party_size": 20,
                "reservation_advance_days": 30,
                "low_stock_threshold": 10,
                "order_timeout_minutes": 30,
                "auto_confirm_vip_reservations": True
            }
            self._initialized = True
    
    def get(self, key: str, default: Any = None) -> Any:
        """Obtiene un valor de configuración"""
        return self._config.get(key, default)
    
    def set(self, key: str, value: Any) -> None:
        """Establece un valor de configuración"""
        self._config[key] = value
    
    def get_all(self) -> Dict[str, Any]:
        """Obtiene toda la configuración"""
        return self._config.copy()
    
    def update(self, config_dict: Dict[str, Any]) -> None:
        """Actualiza múltiples valores de configuración"""
        self._config.update(config_dict)


class DatabaseConnectionSingleton:
    """Singleton para la conexión a la base de datos (wrapper del existente)"""
    
    _instance: Optional['DatabaseConnectionSingleton'] = None
    _lock = threading.Lock()
    
    def __new__(cls) -> 'DatabaseConnectionSingleton':
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super().__new__(cls)
                    cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if not self._initialized:
            self._connection = db_connection
            self._initialized = True
    
    @property
    def connection(self):
        """Obtiene la conexión a la base de datos"""
        return self._connection.client
    
    def health_check(self) -> bool:
        """Verifica la salud de la conexión"""
        try:
            if self._connection and self._connection.client:
                # Intentar una consulta simple
                result = self._connection.client.table("users").select("id").limit(1).execute()
                return True
            return False
        except Exception:
            return False


# Instancias globales de los singletons
logger = LoggerSingleton()
cache = CacheSingleton()
notifications = NotificationSingleton()
config = ConfigurationSingleton()
db_singleton = DatabaseConnectionSingleton()
