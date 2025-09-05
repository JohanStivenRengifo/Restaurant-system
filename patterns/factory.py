"""
Patrón Factory Method para crear diferentes tipos de objetos
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional
from models.entities import (
    Order, OrderType, OrderStatus, MenuItem, Customer, 
    Invoice, Payment, Reservation
)


class OrderFactory(ABC):
    """Factory abstracto para crear pedidos"""
    
    @abstractmethod
    def create_order(self, order_data: Dict[str, Any]) -> Order:
        pass


class DineInOrderFactory(OrderFactory):
    """Factory para pedidos en mesa"""
    
    def create_order(self, order_data: Dict[str, Any]) -> Order:
        order_data.update({
            "order_type_id": "dine_in",
            "special_instructions": order_data.get("special_instructions", "")
        })
        return Order(**order_data)


class TakeawayOrderFactory(OrderFactory):
    """Factory para pedidos para llevar"""
    
    def create_order(self, order_data: Dict[str, Any]) -> Order:
        order_data.update({
            "order_type_id": "takeaway",
            "table_id": None  # No hay mesa para pedidos para llevar
        })
        return Order(**order_data)


class DeliveryOrderFactory(OrderFactory):
    """Factory para pedidos a domicilio"""
    
    def create_order(self, order_data: Dict[str, Any]) -> Order:
        order_data.update({
            "order_type_id": "delivery",
            "table_id": None  # No hay mesa para pedidos a domicilio
        })
        return Order(**order_data)


class OrderFactoryProducer:
    """Productor de factories de pedidos"""
    
    _factories = {
        "dine_in": DineInOrderFactory(),
        "takeaway": TakeawayOrderFactory(),
        "delivery": DeliveryOrderFactory()
    }
    
    @classmethod
    def get_factory(cls, order_type: str) -> OrderFactory:
        """Obtiene el factory apropiado según el tipo de pedido"""
        factory = cls._factories.get(order_type)
        if not factory:
            raise ValueError(f"Tipo de pedido no soportado: {order_type}")
        return factory


class MenuItemFactory:
    """Factory para crear elementos del menú con validaciones"""
    
    @staticmethod
    def create_menu_item(item_data: Dict[str, Any]) -> MenuItem:
        """Crea un elemento del menú con validaciones específicas"""
        # Validar que el precio sea positivo
        if item_data.get("price", 0) <= 0:
            raise ValueError("El precio debe ser mayor a 0")
        
        # Validar que el tiempo de preparación sea no negativo
        if item_data.get("preparation_time", 0) < 0:
            raise ValueError("El tiempo de preparación no puede ser negativo")
        
        return MenuItem(**item_data)


class CustomerFactory:
    """Factory para crear clientes con validaciones"""
    
    @staticmethod
    def create_customer(customer_data: Dict[str, Any]) -> Customer:
        """Crea un cliente con validaciones específicas"""
        # Validar email si se proporciona
        email = customer_data.get("email")
        if email and "@" not in email:
            raise ValueError("Email inválido")
        
        # Validar que los nombres no estén vacíos
        if not customer_data.get("first_name") or not customer_data.get("last_name"):
            raise ValueError("Nombre y apellido son obligatorios")
        
        return Customer(**customer_data)


class InvoiceFactory:
    """Factory para crear facturas"""
    
    @staticmethod
    def create_invoice(invoice_data: Dict[str, Any]) -> Invoice:
        """Crea una factura con validaciones"""
        # Validar que el total sea positivo
        if invoice_data.get("total_amount", 0) <= 0:
            raise ValueError("El monto total debe ser mayor a 0")
        
        # Generar número de factura si no se proporciona
        if not invoice_data.get("invoice_number"):
            invoice_data["invoice_number"] = f"INV-{invoice_data.get('order_id', '')[:8]}"
        
        return Invoice(**invoice_data)


class PaymentFactory:
    """Factory para crear pagos"""
    
    @staticmethod
    def create_payment(payment_data: Dict[str, Any]) -> Payment:
        """Crea un pago con validaciones"""
        # Validar que el monto sea positivo
        if payment_data.get("amount", 0) <= 0:
            raise ValueError("El monto del pago debe ser mayor a 0")
        
        return Payment(**payment_data)


class ReservationFactory:
    """Factory para crear reservas"""
    
    @staticmethod
    def create_reservation(reservation_data: Dict[str, Any]) -> Reservation:
        """Crea una reserva con validaciones"""
        # Validar que el tamaño del grupo sea positivo
        if reservation_data.get("party_size", 0) <= 0:
            raise ValueError("El tamaño del grupo debe ser mayor a 0")
        
        # Validar que la duración sea positiva
        if reservation_data.get("duration", 0) <= 0:
            raise ValueError("La duración debe ser mayor a 0")
        
        return Reservation(**reservation_data)
