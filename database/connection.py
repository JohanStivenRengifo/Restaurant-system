"""
Conexión a Supabase usando patrón Singleton con manejo robusto de errores
"""
from supabase import create_client, Client
from config import settings
from typing import Optional, Dict, Any
import logging

logger = logging.getLogger(__name__)


class SupabaseConnection:
    """
    Singleton para manejar la conexión a Supabase con manejo robusto de errores
    """
    _instance: Optional['SupabaseConnection'] = None
    _client: Optional[Client] = None
    
    def __new__(cls) -> 'SupabaseConnection':
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        if self._client is None:
            self._connect()
    
    def _connect(self):
        """Establece la conexión con Supabase"""
        try:
            self._client = create_client(
                settings.next_public_supabase_url,
                settings.next_public_supabase_anon_key
            )
            logger.info("Conexión a Supabase establecida correctamente")
        except Exception as e:
            logger.error(f"Error al conectar con Supabase: {e}")
            self._client = None
    
    @property
    def client(self) -> Optional[Client]:
        """Obtiene el cliente de Supabase"""
        if self._client is None:
            self._connect()
        return self._client
    
    def get_connection(self) -> Optional[Client]:
        """Método para obtener la conexión (alias del cliente)"""
        return self.client
    
    def health_check(self) -> bool:
        """Verifica la salud de la conexión"""
        try:
            if self._client is None:
                return False
            
            # Intentar una consulta simple
            result = self._client.table('menu_categories').select('id').limit(1).execute()
            return True
        except Exception as e:
            logger.error(f"Error en health check de Supabase: {e}")
            return False
    
    def execute_query(self, table: str, operation: str, **kwargs) -> Dict[str, Any]:
        """Ejecuta una consulta en Supabase"""
        try:
            client = self.get_connection()
            if client is None:
                return {"error": "No hay conexión a Supabase"}
            
            if operation == "select":
                query = client.table(table).select(kwargs.get('select', '*'))
                if 'filter' in kwargs:
                    for key, value in kwargs['filter'].items():
                        query = query.eq(key, value)
                if 'limit' in kwargs:
                    query = query.limit(kwargs['limit'])
                if 'offset' in kwargs:
                    query = query.offset(kwargs['offset'])
                result = query.execute()
                return {"data": result.data, "count": result.count}
            
            elif operation == "insert":
                result = client.table(table).insert(kwargs['data']).execute()
                return {"data": result.data}
            
            elif operation == "update":
                query = client.table(table).update(kwargs['data'])
                if 'filter' in kwargs:
                    for key, value in kwargs['filter'].items():
                        query = query.eq(key, value)
                result = query.execute()
                return {"data": result.data}
            
            elif operation == "delete":
                query = client.table(table).delete()
                if 'filter' in kwargs:
                    for key, value in kwargs['filter'].items():
                        query = query.eq(key, value)
                result = query.execute()
                return {"data": result.data}
            
            else:
                return {"error": f"Operación no soportada: {operation}"}
                
        except Exception as e:
            logger.error(f"Error ejecutando consulta en {table}: {e}")
            return {"error": str(e)}


# Instancia global del singleton
db_connection = SupabaseConnection()
