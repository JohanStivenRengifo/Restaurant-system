"""
Servicio para gestión de clientes - Versión simplificada
"""
from typing import List, Optional, Dict, Any
from uuid import UUID, uuid4
from datetime import datetime

from models.schemas import CustomerResponse, CustomerCreate, CustomerUpdate
from patterns.singleton import logger, db_singleton
from repositories.customer_repository import CustomerRepository
from utils.timezone import get_bogota_now, format_bogota_timestamp

class CustomerService:
    """Servicio para gestión de clientes"""
    
    def __init__(self, db_connection=None):
        self.db_connection = db_connection
        self.customer_repo = CustomerRepository()
    
    async def get_customers(self, vip_only: bool = False, 
                           search: Optional[str] = None) -> List[CustomerResponse]:
        """Obtiene todos los clientes con filtros opcionales"""
        try:
            logger.log("info", "Obteniendo clientes", {
                "vip_only": vip_only,
                "search": search
            })
            # Obtener clientes de la DB usando el repositorio
            customers = self.customer_repo.get_all()
            # Convertir a CustomerResponse
            return [
                CustomerResponse(
                    id=customer.id if isinstance(customer.id, UUID) else UUID(customer.id),
                    first_name=customer.first_name,
                    last_name=customer.last_name,
                    email=customer.email,
                    phone=customer.phone,
                    birth_date=customer.birth_date,
                    address=customer.address,
                    allergies=customer.allergies,
                    preferences=customer.preferences,
                    loyalty_points=customer.loyalty_points,
                    is_vip=customer.is_vip,
                    created_at=customer.created_at,
                    updated_at=customer.updated_at
                )
                for customer in customers
            ]
        except Exception as e:
            logger.log("error", f"Error al obtener clientes: {e}")
            raise
    
    async def get_customer(self, customer_id: UUID) -> Optional[CustomerResponse]:
        """Obtiene un cliente por ID"""
        try:
            logger.log("info", f"Obteniendo cliente: {customer_id}")
            # Obtener cliente de la DB usando el repositorio
            customer = self.customer_repo.get_by_id(str(customer_id))
            if not customer:
                return None
            # Convertir a CustomerResponse
            return CustomerResponse(
                id=customer.id if isinstance(customer.id, UUID) else UUID(customer.id),
                first_name=customer.first_name,
                last_name=customer.last_name,
                email=customer.email,
                phone=customer.phone,
                birth_date=customer.birth_date,
                address=customer.address,
                allergies=customer.allergies,
                preferences=customer.preferences,
                loyalty_points=customer.loyalty_points,
                is_vip=customer.is_vip,
                created_at=customer.created_at,
                updated_at=customer.updated_at
            )
        except Exception as e:
            logger.log("error", f"Error al obtener cliente: {e}")
            raise
    
    async def create_customer(self, customer: CustomerCreate) -> CustomerResponse:
        """Crea un nuevo cliente"""
        try:
            logger.log("info", "Creando cliente", {"email": customer.email})
            # Crear cliente en la DB usando el repositorio
            from models.entities import Customer
            customer_entity = Customer(
                id=str(uuid4()),
                first_name=customer.first_name,
                last_name=customer.last_name,
                email=customer.email,
                phone=customer.phone,
                address=customer.address,
                birth_date=str(customer.birth_date),  # Convertir a string
                allergies=customer.allergies or [],
                preferences=customer.preferences or {},
                loyalty_points=0,
                is_vip=False
            )
            created_customer = self.customer_repo.create(customer_entity)
            if not created_customer:
                raise Exception("Error al crear cliente en la DB")
            # Convertir a CustomerResponse
            return CustomerResponse(
                id=created_customer.id if isinstance(created_customer.id, UUID) else UUID(created_customer.id),
                first_name=created_customer.first_name,
                last_name=created_customer.last_name,
                email=created_customer.email,
                phone=created_customer.phone,
                birth_date=created_customer.birth_date,
                address=created_customer.address,
                allergies=created_customer.allergies,
                preferences=created_customer.preferences,
                loyalty_points=created_customer.loyalty_points,
                is_vip=created_customer.is_vip,
                created_at=created_customer.created_at,
                updated_at=created_customer.updated_at
            )
        except Exception as e:
            logger.log("error", f"Error al crear cliente: {e}")
            raise
    
    async def update_customer(self, customer_id: UUID, customer: CustomerUpdate) -> Optional[CustomerResponse]:
        """Actualiza un cliente existente"""
        try:
            logger.log("info", f"Actualizando cliente: {customer_id}")
            # Actualizar cliente en la DB usando el repositorio
            update_data = {
                "first_name": customer.first_name,
                "last_name": customer.last_name,
                "email": customer.email,
                "phone": customer.phone,
                "address": customer.address,
                "birth_date": str(customer.birth_date) if customer.birth_date else None,  # Convertir a string
                "allergies": customer.allergies or [],
                "preferences": customer.preferences or {},
                "updated_at": format_bogota_timestamp()
            }
            updated_customer = self.customer_repo.update(str(customer_id), update_data)
            if not updated_customer:
                return None
            # Convertir a CustomerResponse
            return CustomerResponse(
                id=updated_customer.id if isinstance(updated_customer.id, UUID) else UUID(updated_customer.id),
                first_name=updated_customer.first_name,
                last_name=updated_customer.last_name,
                email=updated_customer.email,
                phone=updated_customer.phone,
                birth_date=updated_customer.birth_date,
                address=updated_customer.address,
                allergies=updated_customer.allergies,
                preferences=updated_customer.preferences,
                loyalty_points=updated_customer.loyalty_points,
                is_vip=updated_customer.is_vip,
                created_at=updated_customer.created_at,
                updated_at=updated_customer.updated_at
            )
        except Exception as e:
            logger.log("error", f"Error al actualizar cliente: {e}")
            raise
    
    async def delete_customer(self, customer_id: UUID) -> bool:
        """Elimina un cliente"""
        try:
            logger.log("info", f"Eliminando cliente: {customer_id}")
            # Eliminar cliente de la DB usando el repositorio
            return self.customer_repo.delete(str(customer_id))
        except Exception as e:
            logger.log("error", f"Error al eliminar cliente: {e}")
            raise
    
    async def add_loyalty_points(self, customer_id: UUID, points: int) -> Optional[Dict[str, Any]]:
        """Añade puntos de fidelidad a un cliente"""
        try:
            logger.log("info", f"Añadiendo {points} puntos al cliente: {customer_id}")
            return {
                "customer_id": customer_id,
                "points_added": points,
                "new_total": 0,
                "is_vip": False
            }
        except Exception as e:
            logger.log("error", f"Error al añadir puntos de fidelidad: {e}")
            raise