"""
Utilidades para manejo de timezone de Bogotá/América
"""
import pytz
from datetime import datetime
from typing import Optional


# Timezone de Bogotá/Colombia
BOGOTA_TZ = pytz.timezone('America/Bogota')


def get_bogota_now() -> datetime:
    """Obtiene la fecha y hora actual en timezone de Bogotá"""
    return datetime.now(BOGOTA_TZ)


def to_bogota_timezone(dt: datetime) -> datetime:
    """Convierte un datetime a timezone de Bogotá"""
    if dt.tzinfo is None:
        # Si no tiene timezone, asumir que es UTC
        dt = pytz.utc.localize(dt)
    
    return dt.astimezone(BOGOTA_TZ)


def format_bogota_timestamp(dt: Optional[datetime] = None) -> str:
    """Formatea un timestamp en timezone de Bogotá para la API"""
    if dt is None:
        dt = get_bogota_now()
    else:
        dt = to_bogota_timezone(dt)
    
    return dt.isoformat()


def parse_bogota_datetime(dt_str: str) -> datetime:
    """Parsea un string de datetime y lo convierte a timezone de Bogotá"""
    # Intentar parsear el datetime
    if 'T' in dt_str:
        dt = datetime.fromisoformat(dt_str.replace('Z', '+00:00'))
    else:
        dt = datetime.fromisoformat(dt_str)
    
    return to_bogota_timezone(dt)


def get_bogota_utc_offset() -> str:
    """Obtiene el offset UTC de Bogotá (ej: -05:00)"""
    now = get_bogota_now()
    offset = now.strftime('%z')
    return f"{offset[:3]}:{offset[3:]}" if len(offset) == 5 else "-05:00"
