"""
Modelos de entidades del dominio del restaurante
"""
from models.base import BaseEntity
from typing import Optional, List, Dict, Any
from pydantic import Field
from enum import Enum
from datetime import datetime
from uuid import UUID


class OrderStatus(str, Enum):
    """Estados de pedido"""
    PENDING = "pending"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"
    CANCELLED = "cancelled"


class OrderType(str, Enum):
    """Tipos de pedido"""
    DINE_IN = "dine_in"
    TAKEAWAY = "takeaway"
    DELIVERY = "delivery"


class PaymentStatus(str, Enum):
    """Estados de pago"""
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"


class InvoiceStatus(str, Enum):
    """Estados de factura"""
    PENDING = "pending"
    PAID = "paid"
    CANCELLED = "cancelled"
    REFUNDED = "refunded"


class MovementType(str, Enum):
    """Tipos de movimiento de inventario"""
    IN = "in"
    OUT = "out"
    ADJUSTMENT = "adjustment"
    WASTE = "waste"


class UnitType(str, Enum):
    """Tipos de unidades"""
    WEIGHT = "weight"
    VOLUME = "volume"
    COUNT = "count"
    LENGTH = "length"


class ValueType(str, Enum):
    """Tipos de valor de descuento"""
    PERCENTAGE = "percentage"
    FIXED = "fixed"


# Modelos de entidades principales
class Customer(BaseEntity):
    """Modelo de cliente"""
    first_name: str
    last_name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    birth_date: Optional[str] = None
    allergies: List[str] = Field(default_factory=list)
    preferences: Dict[str, Any] = Field(default_factory=dict)
    loyalty_points: int = 0
    is_vip: bool = False


class Zone(BaseEntity):
    """Modelo de zona"""
    name: str
    description: Optional[str] = None
    is_active: bool = True


class Table(BaseEntity):
    """Modelo de mesa"""
    number: str
    zone_id: Optional[str] = None
    capacity: int
    is_active: bool = True


class Unit(BaseEntity):
    """Modelo de unidad"""
    name: str
    abbreviation: str
    type: UnitType


class IngredientCategory(BaseEntity):
    """Modelo de categoría de ingrediente"""
    name: str
    description: Optional[str] = None


class Ingredient(BaseEntity):
    """Modelo de ingrediente"""
    name: str
    description: Optional[str] = None
    category_id: Optional[str] = None
    unit_id: Optional[str] = None
    cost_per_unit: float = 0.0
    min_stock: float = 0.0
    current_stock: float = 0.0
    supplier: Optional[str] = None
    allergen_info: List[str] = Field(default_factory=list)
    is_active: bool = True


class MenuCategory(BaseEntity):
    """Modelo de categoría de menú"""
    name: str
    description: Optional[str] = None
    display_order: int = 0
    is_active: bool = True


class MenuItem(BaseEntity):
    """Modelo de elemento del menú"""
    name: str
    description: Optional[str] = None
    category_id: Optional[str] = None
    price: float
    cost: float = 0.0
    preparation_time: int = 0
    is_available: bool = True
    is_featured: bool = False
    image_url: Optional[str] = None
    allergen_info: List[str] = Field(default_factory=list)
    nutritional_info: Dict[str, Any] = Field(default_factory=dict)


class Recipe(BaseEntity):
    """Modelo de receta"""
    menu_item_id: str
    ingredient_id: str
    quantity: float
    unit_id: Optional[str] = None
    notes: Optional[str] = None


class OrderTypeEntity(BaseEntity):
    """Modelo de tipo de pedido"""
    name: str
    description: Optional[str] = None
    is_active: bool = True


class OrderStatusEntity(BaseEntity):
    """Modelo de estado de pedido"""
    name: str
    description: Optional[str] = None
    color: str = "#000000"
    is_active: bool = True


class Order(BaseEntity):
    """Modelo de pedido"""
    order_number: str
    customer_id: Optional[str] = None
    table_id: Optional[str] = None
    order_type_id: Optional[str] = None
    status_id: Optional[str] = None
    subtotal: float = 0.0
    tax_amount: float = 0.0
    discount_amount: float = 0.0
    total_amount: float = 0.0
    special_instructions: Optional[str] = None
    created_by: Optional[str] = None


class OrderItem(BaseEntity):
    """Modelo de elemento de pedido"""
    order_id: str
    menu_item_id: str
    quantity: int = 1
    unit_price: float
    total_price: float
    customizations: List[Dict[str, Any]] = Field(default_factory=list)
    special_instructions: Optional[str] = None
    status: OrderStatus = OrderStatus.PENDING


class DiscountType(BaseEntity):
    """Modelo de tipo de descuento"""
    name: str
    description: Optional[str] = None
    is_active: bool = True


class Discount(BaseEntity):
    """Modelo de descuento"""
    name: str
    code: Optional[str] = None
    type_id: Optional[str] = None
    value: float
    value_type: ValueType
    min_order_amount: float = 0.0
    max_discount_amount: Optional[float] = None
    usage_limit: Optional[int] = None
    used_count: int = 0
    valid_from: Optional[datetime] = None
    valid_until: Optional[datetime] = None
    is_active: bool = True


class PaymentMethod(BaseEntity):
    """Modelo de método de pago"""
    name: str
    description: Optional[str] = None
    is_active: bool = True
    requires_processing: bool = False


class Invoice(BaseEntity):
    """Modelo de factura"""
    invoice_number: str
    order_id: Optional[UUID] = None
    customer_id: Optional[UUID] = None
    subtotal: float
    tax_amount: float
    discount_amount: float
    total_amount: float
    status: InvoiceStatus = InvoiceStatus.PENDING
    issued_at: Optional[datetime] = None
    paid_at: Optional[datetime] = None
    created_by: Optional[UUID] = None


class Payment(BaseEntity):
    """Modelo de pago"""
    invoice_id: str
    payment_method_id: str
    amount: float
    reference: Optional[str] = None
    status: PaymentStatus = PaymentStatus.PENDING
    processed_at: Optional[datetime] = None


class Reservation(BaseEntity):
    """Modelo de reserva"""
    customer_id: str
    table_id: str
    reservation_date: str
    reservation_time: str
    duration: int = 120
    party_size: int
    status: str = "pending"
    special_requests: Optional[str] = None


class InventoryMovement(BaseEntity):
    """Modelo de movimiento de inventario"""
    ingredient_id: str
    movement_type: MovementType
    quantity: float
    unit_cost: Optional[float] = None
    reason: Optional[str] = None
    reference_type: Optional[str] = None
    reference_id: Optional[str] = None
    user_id: Optional[str] = None


class Role(BaseEntity):
    """Modelo de rol"""
    name: str
    description: Optional[str] = None
    permissions: Dict[str, Any] = Field(default_factory=dict)


class User(BaseEntity):
    """Modelo de usuario"""
    auth_id: Optional[str] = None
    email: str
    first_name: str
    last_name: str
    phone: Optional[str] = None
    role_id: Optional[str] = None
    is_active: bool = True
    last_login: Optional[datetime] = None


class ActivityLog(BaseEntity):
    """Modelo de log de actividad"""
    user_id: Optional[str] = None
    action: str
    table_name: Optional[str] = None
    record_id: Optional[str] = None
    old_values: Optional[Dict[str, Any]] = None
    new_values: Optional[Dict[str, Any]] = None
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
