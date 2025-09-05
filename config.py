"""
Configuración de la aplicación usando Pydantic Settings
"""
from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    """Configuración de la aplicación"""
    
    # Supabase
    next_public_supabase_url: str
    next_public_supabase_anon_key: str
    
    # JWT
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30
    
    # Application
    debug: bool = True
    host: str = "0.0.0.0"
    port: int = 8000
    
    # Timezone
    timezone: str = "America/Bogota"
    
    class Config:
        env_file = ".env"
        case_sensitive = False


# Instancia singleton de configuración
settings = Settings()
