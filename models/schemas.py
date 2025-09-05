"""
Esquemas Pydantic para documentación completa de la API
"""
from pydantic import BaseModel, Field, validator
from typing import List, Optional, Dict, Any
from datetime import datetime, date, time
from uuid import UUID
from enum import Enum
from .base import BaseEntity

# Enums para validación
class OrderStatus(str, Enum):
    PENDING = "pending"
    CONFIRMED = "confirmed"
    PREPARING = "preparing"
    READY = "ready"
    SERVED = "served"
    CANCELLED = "cancelled"

class OrderType(str, Enum):
    DINE_IN = "dine_in"
    TAKEAWAY = "takeaway"
    DELIVERY = "delivery"

class PaymentStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    REFUNDED = "refunded"

class PaymentMethod(str, Enum):
    CASH = "cash"
    CARD = "card"
    TRANSFER = "transfer"

class TableStatus(str, Enum):
    AVAILABLE = "available"
    OCCUPIED = "occupied"
    RESERVED = "reserved"
    MAINTENANCE = "maintenance"

# Modelos base
class BaseResponse(BaseModel):
    """Modelo base para respuestas"""
    success: bool = Field(True, description="Indica si la operación fue exitosa")
    message: str = Field(..., description="Mensaje descriptivo de la operación")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp de la respuesta")

class PaginationParams(BaseModel):
    """Parámetros de paginación"""
    page: int = Field(1, ge=1, description="Número de página")
    limit: int = Field(10, ge=1, le=100, description="Elementos por página")
    sort_by: Optional[str] = Field(None, description="Campo para ordenar")
    sort_order: str = Field("asc", pattern="^(asc|desc)$", description="Orden de clasificación")

# Modelos de Categorías
class CategoryBase(BaseModel):
    """Modelo base para categorías"""
    name: str = Field(..., min_length=1, max_length=100, description="Nombre de la categoría", example="Entradas")
    description: Optional[str] = Field(None, max_length=500, description="Descripción de la categoría", example="Platos de entrada")
    display_order: int = Field(0, ge=0, description="Orden de visualización", example=1)
    is_active: bool = Field(True, description="Si la categoría está activa", example=True)

class CategoryCreate(CategoryBase):
    """Modelo para crear categorías"""
    pass

class CategoryUpdate(BaseModel):
    """Modelo para actualizar categorías"""
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    display_order: Optional[int] = Field(None, ge=0)
    is_active: Optional[bool] = None

class CategoryResponse(CategoryBase):
    """Modelo de respuesta para categorías"""
    id: UUID = Field(..., description="ID único de la categoría")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: Optional[datetime] = Field(None, description="Fecha de última actualización")

# Modelos de Elementos del Menú
class MenuItemBase(BaseModel):
    """Modelo base para elementos del menú"""
    name: str = Field(..., min_length=1, max_length=200, description="Nombre del elemento", example="Ensalada César")
    description: Optional[str] = Field(None, max_length=1000, description="Descripción detallada", example="Lechuga fresca, pollo a la plancha, queso parmesano, aderezo césar")
    price: float = Field(..., gt=0, description="Precio del elemento", example=12.99)
    cost: float = Field(0, ge=0, description="Costo del elemento", example=5.50)
    preparation_time: int = Field(0, ge=0, description="Tiempo de preparación en minutos", example=15)
    is_available: bool = Field(True, description="Si el elemento está disponible", example=True)
    is_featured: bool = Field(False, description="Si el elemento es destacado", example=False)
    image_url: Optional[str] = Field(None, description="URL de la imagen", example="https://example.com/image.jpg")
    allergen_info: List[str] = Field(default=[], description="Lista de alérgenos", example=["lácteos", "gluten"])
    nutritional_info: Dict[str, Any] = Field(default={}, description="Información nutricional")

class MenuItemCreate(MenuItemBase):
    """Modelo para crear elementos del menú"""
    category_id: Optional[str] = Field(None, description="ID de la categoría")

class MenuItemUpdate(BaseModel):
    """Modelo para actualizar elementos del menú"""
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    price: Optional[float] = Field(None, gt=0)
    cost: Optional[float] = Field(None, ge=0)
    preparation_time: Optional[int] = Field(None, ge=0)
    is_available: Optional[bool] = None
    is_featured: Optional[bool] = None
    image_url: Optional[str] = None
    allergen_info: Optional[List[str]] = None
    nutritional_info: Optional[Dict[str, Any]] = None
    category_id: Optional[UUID] = None

class MenuItemResponse(MenuItemBase):
    """Modelo de respuesta para elementos del menú"""
    id: UUID = Field(..., description="ID único del elemento")
    category_id: Optional[UUID] = Field(None, description="ID de la categoría")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: Optional[datetime] = Field(None, description="Fecha de última actualización")

# Modelos de Clientes
class CustomerBase(BaseModel):
    """Modelo base para clientes"""
    first_name: str = Field(..., min_length=1, max_length=100, description="Nombre del cliente", example="Juan")
    last_name: str = Field(..., min_length=1, max_length=100, description="Apellido del cliente", example="Pérez")
    email: Optional[str] = Field(None, description="Email del cliente", example="juan.perez@email.com")
    phone: Optional[str] = Field(None, description="Teléfono del cliente", example="+56912345678")
    address: Optional[str] = Field(None, max_length=500, description="Dirección del cliente", example="Av. Principal 123")
    birth_date: Optional[date] = Field(None, description="Fecha de nacimiento", example="1990-01-15")
    allergies: List[str] = Field(default=[], description="Lista de alergias", example=["lácteos", "frutos secos"])
    preferences: Dict[str, Any] = Field(default={}, description="Preferencias del cliente")
    loyalty_points: int = Field(0, ge=0, description="Puntos de fidelidad", example=150)
    is_vip: bool = Field(False, description="Si es cliente VIP", example=False)

class CustomerCreate(CustomerBase):
    """Modelo para crear clientes"""
    pass

class CustomerUpdate(BaseModel):
    """Modelo para actualizar clientes"""
    first_name: Optional[str] = Field(None, min_length=1, max_length=100)
    last_name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = Field(None, max_length=500)
    birth_date: Optional[date] = None
    allergies: Optional[List[str]] = None
    preferences: Optional[Dict[str, Any]] = None
    loyalty_points: Optional[int] = Field(None, ge=0)
    is_vip: Optional[bool] = None

class CustomerResponse(CustomerBase):
    """Modelo de respuesta para clientes"""
    id: UUID = Field(..., description="ID único del cliente")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: Optional[datetime] = Field(None, description="Fecha de última actualización")

# Modelos de Mesas
class TableBase(BaseModel):
    """Modelo base para mesas"""
    number: str = Field(..., min_length=1, max_length=20, description="Número de la mesa", example="1")
    capacity: int = Field(..., gt=0, le=20, description="Capacidad de la mesa", example=4)
    zone_id: Optional[UUID] = Field(None, description="ID de la zona")
    is_active: bool = Field(True, description="Si la mesa está activa", example=True)

class TableCreate(TableBase):
    """Modelo para crear mesas"""
    pass

class TableUpdate(BaseModel):
    """Modelo para actualizar mesas"""
    number: Optional[str] = Field(None, min_length=1, max_length=20)
    capacity: Optional[int] = Field(None, gt=0, le=20)
    zone_id: Optional[UUID] = None
    is_active: Optional[bool] = None

class TableResponse(TableBase):
    """Modelo de respuesta para mesas"""
    id: UUID = Field(..., description="ID único de la mesa")
    created_at: datetime = Field(..., description="Fecha de creación")

# Modelos de Pedidos
class OrderItemBase(BaseModel):
    """Modelo base para elementos de pedido"""
    menu_item_id: UUID = Field(..., description="ID del elemento del menú")
    quantity: int = Field(..., gt=0, le=50, description="Cantidad", example=2)
    unit_price: float = Field(..., gt=0, description="Precio unitario", example=12.99)
    total_price: float = Field(..., gt=0, description="Precio total", example=25.98)
    customizations: List[Dict[str, Any]] = Field(default=[], description="Personalizaciones")
    special_instructions: Optional[str] = Field(None, max_length=500, description="Instrucciones especiales", example="Sin gluten")
    status: OrderStatus = Field(OrderStatus.PENDING, description="Estado del elemento")

class OrderItemCreate(BaseModel):
    """Modelo para crear elementos de pedido"""
    menu_item_id: UUID = Field(..., description="ID del elemento del menú")
    quantity: int = Field(..., gt=0, le=50, description="Cantidad", example=2)
    customizations: List[Dict[str, Any]] = Field(default=[], description="Personalizaciones")
    special_instructions: Optional[str] = Field(None, max_length=500, description="Instrucciones especiales")

class OrderItemResponse(OrderItemBase):
    """Modelo de respuesta para elementos de pedido"""
    id: UUID = Field(..., description="ID único del elemento de pedido")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: Optional[datetime] = Field(None, description="Fecha de última actualización")

class OrderBase(BaseModel):
    """Modelo base para pedidos"""
    customer_id: Optional[UUID] = Field(None, description="ID del cliente")
    table_id: Optional[UUID] = Field(None, description="ID de la mesa")
    order_type: OrderType = Field(..., description="Tipo de pedido", example="dine_in")
    special_instructions: Optional[str] = Field(None, max_length=1000, description="Instrucciones especiales del pedido", example="Pedido para llevar")

class OrderCreate(OrderBase):
    """Modelo para crear pedidos"""
    items: List[OrderItemCreate] = Field(default=[], description="Lista de elementos del pedido")

class OrderUpdate(BaseModel):
    """Modelo para actualizar pedidos"""
    customer_id: Optional[UUID] = None
    table_id: Optional[UUID] = None
    order_type: Optional[OrderType] = None
    special_instructions: Optional[str] = Field(None, max_length=1000)
    status: Optional[OrderStatus] = None

class OrderResponse(OrderBase):
    """Modelo de respuesta para pedidos"""
    id: UUID = Field(..., description="ID único del pedido")
    order_number: str = Field(..., description="Número de pedido", example="ORD-2025-001")
    status: OrderStatus = Field(..., description="Estado del pedido")
    subtotal: float = Field(..., description="Subtotal", example=25.98)
    tax_amount: float = Field(..., description="Monto de impuestos", example=4.92)
    discount_amount: float = Field(..., description="Monto de descuento", example=0.00)
    total_amount: float = Field(..., description="Total", example=30.90)
    items: List[OrderItemResponse] = Field(..., description="Elementos del pedido")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: Optional[datetime] = Field(None, description="Fecha de última actualización")

# Modelos de Facturación
class InvoiceBase(BaseModel):
    """Modelo base para facturas"""
    order_id: Optional[UUID] = Field(None, description="ID del pedido")
    customer_id: Optional[UUID] = Field(None, description="ID del cliente")
    subtotal: float = Field(..., gt=0, description="Subtotal", example=25.98)
    tax_amount: float = Field(..., ge=0, description="Monto de impuestos", example=4.92)
    discount_amount: float = Field(..., ge=0, description="Monto de descuento", example=0.00)
    total_amount: float = Field(..., gt=0, description="Total", example=30.90)

class InvoiceCreate(InvoiceBase):
    """Modelo para crear facturas"""
    pass

class InvoiceResponse(BaseModel):
    """Modelo de respuesta para facturas"""
    id: UUID = Field(..., description="ID único de la factura")
    invoice_number: str = Field(..., description="Número de factura", example="INV-2025-001")
    order_id: Optional[UUID] = Field(None, description="ID del pedido")
    customer_id: Optional[UUID] = Field(None, description="ID del cliente")
    subtotal: float = Field(..., gt=0, description="Subtotal", example=25.98)
    tax_amount: float = Field(..., ge=0, description="Monto de impuestos", example=4.92)
    discount_amount: float = Field(..., ge=0, description="Monto de descuento", example=0.00)
    total_amount: float = Field(..., gt=0, description="Total", example=30.90)
    status: str = Field(..., description="Estado de la factura", example="pending")
    issued_at: datetime = Field(..., description="Fecha de emisión")
    paid_at: Optional[datetime] = Field(None, description="Fecha de pago")
    created_by: Optional[UUID] = Field(None, description="ID del usuario que creó la factura")
    created_at: datetime = Field(..., description="Fecha de creación")
    updated_at: Optional[datetime] = Field(None, description="Fecha de actualización")

# Modelos de Pagos
class PaymentBase(BaseModel):
    """Modelo base para pagos"""
    invoice_id: UUID = Field(..., description="ID de la factura")
    payment_method: PaymentMethod = Field(..., description="Método de pago", example="card")
    amount: float = Field(..., gt=0, description="Monto del pago", example=30.90)
    reference: Optional[str] = Field(None, description="Referencia del pago", example="TXN123456")

class PaymentCreate(PaymentBase):
    """Modelo para crear pagos"""
    pass

class PaymentResponse(PaymentBase):
    """Modelo de respuesta para pagos"""
    id: UUID = Field(..., description="ID único del pago")
    status: PaymentStatus = Field(..., description="Estado del pago", example="completed")
    processed_at: Optional[datetime] = Field(None, description="Fecha de procesamiento")
    created_at: datetime = Field(..., description="Fecha de creación")

# Modelos de Respuesta con Paginación
class PaginatedResponse(BaseModel):
    """Modelo base para respuestas paginadas"""
    items: List[Any] = Field(..., description="Lista de elementos")
    total: int = Field(..., description="Total de elementos")
    page: int = Field(..., description="Página actual")
    limit: int = Field(..., description="Elementos por página")
    pages: int = Field(..., description="Total de páginas")

# Modelos de Health Check
class HealthResponse(BaseModel):
    """Modelo de respuesta para health check"""
    status: str = Field(..., description="Estado del sistema", example="healthy")
    database: str = Field(..., description="Estado de la base de datos", example="connected")
    timestamp: datetime = Field(..., description="Timestamp del check")
    version: str = Field(..., description="Versión de la API", example="1.0.0")

# Modelos de Error
class ErrorResponse(BaseModel):
    """Modelo de respuesta para errores"""
    success: bool = Field(False, description="Indica si la operación fue exitosa")
    error: str = Field(..., description="Mensaje de error")
    details: Optional[Dict[str, Any]] = Field(None, description="Detalles del error")
    timestamp: datetime = Field(default_factory=datetime.utcnow, description="Timestamp del error")

# ==================== ESQUEMAS DE INVENTARIO ====================

class InventoryItemCreate(BaseModel):
    """Esquema para crear elemento de inventario"""
    name: str = Field(..., description="Nombre del elemento")
    description: Optional[str] = Field(None, description="Descripción del elemento")
    category: str = Field(..., description="Categoría del elemento")
    current_stock: int = Field(..., ge=0, description="Stock actual")
    min_stock: int = Field(..., ge=0, description="Stock mínimo")
    max_stock: int = Field(..., ge=0, description="Stock máximo")
    unit_price: float = Field(..., gt=0, description="Precio por unidad")
    supplier: str = Field(..., description="Proveedor")

class InventoryItemUpdate(BaseModel):
    """Esquema para actualizar elemento de inventario"""
    name: Optional[str] = Field(None, description="Nombre del elemento")
    description: Optional[str] = Field(None, description="Descripción del elemento")
    category: Optional[str] = Field(None, description="Categoría del elemento")
    current_stock: Optional[int] = Field(None, ge=0, description="Stock actual")
    min_stock: Optional[int] = Field(None, ge=0, description="Stock mínimo")
    max_stock: Optional[int] = Field(None, ge=0, description="Stock máximo")
    unit_price: Optional[float] = Field(None, gt=0, description="Precio por unidad")
    supplier: Optional[str] = Field(None, description="Proveedor")
    is_active: Optional[bool] = Field(None, description="Estado activo")

class InventoryItemResponse(BaseEntity):
    """Esquema de respuesta para elemento de inventario"""
    name: str = Field(..., description="Nombre del elemento")
    description: Optional[str] = Field(None, description="Descripción del elemento")
    category: str = Field(..., description="Categoría del elemento")
    current_stock: int = Field(..., description="Stock actual")
    min_stock: int = Field(..., description="Stock mínimo")
    max_stock: int = Field(..., description="Stock máximo")
    unit_price: float = Field(..., description="Precio por unidad")
    supplier: str = Field(..., description="Proveedor")
    last_restocked: datetime = Field(..., description="Última reposición")
    is_active: bool = Field(..., description="Estado activo")

# ==================== ESQUEMAS DE COCINA ====================

class KitchenOrderCreate(BaseModel):
    """Esquema para crear orden de cocina"""
    order_id: UUID = Field(..., description="ID del pedido")
    table_number: int = Field(..., ge=1, description="Número de mesa")
    items: List[Dict[str, Any]] = Field(..., description="Elementos del pedido")
    estimated_time: int = Field(..., ge=1, description="Tiempo estimado en minutos")
    priority: str = Field("normal", description="Prioridad de la orden")
    chef_notes: Optional[str] = Field(None, description="Notas del chef")

class KitchenOrderUpdate(BaseModel):
    """Esquema para actualizar orden de cocina"""
    status: Optional[str] = Field(None, description="Estado de la orden")
    estimated_time: Optional[int] = Field(None, ge=1, description="Tiempo estimado en minutos")
    priority: Optional[str] = Field(None, description="Prioridad de la orden")
    chef_notes: Optional[str] = Field(None, description="Notas del chef")

class KitchenOrderResponse(BaseEntity):
    """Esquema de respuesta para orden de cocina"""
    order_id: UUID = Field(..., description="ID del pedido")
    table_number: int = Field(..., description="Número de mesa")
    status: str = Field(..., description="Estado de la orden")
    items: List[Dict[str, Any]] = Field(..., description="Elementos del pedido")
    estimated_time: int = Field(..., description="Tiempo estimado en minutos")
    priority: str = Field(..., description="Prioridad de la orden")
    chef_notes: str = Field(..., description="Notas del chef")

# ==================== ESQUEMAS DE FACTURACIÓN ====================

class InvoiceCreate(BaseModel):
    """Esquema para crear factura"""
    order_id: Optional[UUID] = Field(None, description="ID del pedido")
    customer_id: Optional[UUID] = Field(None, description="ID del cliente")
    subtotal: float = Field(..., ge=0, description="Subtotal")
    tax_amount: float = Field(..., ge=0, description="Monto de impuestos")
    discount_amount: float = Field(0, ge=0, description="Monto de descuento")
    total_amount: float = Field(..., ge=0, description="Monto total")
    payment_method: str = Field(..., description="Método de pago")
    due_date: datetime = Field(..., description="Fecha de vencimiento")
    notes: Optional[str] = Field(None, description="Notas adicionales")

class InvoiceUpdate(BaseModel):
    """Esquema para actualizar factura"""
    payment_status: Optional[str] = Field(None, description="Estado del pago")
    payment_method: Optional[str] = Field(None, description="Método de pago")
    notes: Optional[str] = Field(None, description="Notas adicionales")


# ==================== ESQUEMAS DE REPORTES ====================

class ReportCreate(BaseModel):
    """Esquema para crear reporte"""
    name: str = Field(..., description="Nombre del reporte")
    type: str = Field(..., description="Tipo de reporte")
    description: Optional[str] = Field(None, description="Descripción del reporte")
    data: Dict[str, Any] = Field(..., description="Datos del reporte")
    period_start: datetime = Field(..., description="Inicio del período")
    period_end: datetime = Field(..., description="Fin del período")

class ReportUpdate(BaseModel):
    """Esquema para actualizar reporte"""
    name: Optional[str] = Field(None, description="Nombre del reporte")
    description: Optional[str] = Field(None, description="Descripción del reporte")
    data: Optional[Dict[str, Any]] = Field(None, description="Datos del reporte")

class ReportResponse(BaseEntity):
    """Esquema de respuesta para reporte"""
    name: str = Field(..., description="Nombre del reporte")
    type: str = Field(..., description="Tipo de reporte")
    description: str = Field(..., description="Descripción del reporte")
    data: Dict[str, Any] = Field(..., description="Datos del reporte")
    generated_at: datetime = Field(..., description="Fecha de generación")
    period_start: datetime = Field(..., description="Inicio del período")
    period_end: datetime = Field(..., description="Fin del período")
