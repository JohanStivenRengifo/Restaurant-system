"""
Patrón Abstract Factory para crear familias de objetos relacionados
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from models.entities import Order, OrderItem, Invoice, Payment, Reservation


class OrderSystemFactory(ABC):
    """Factory abstracto para sistemas de pedidos"""
    
    @abstractmethod
    def create_order(self, order_data: Dict[str, Any]) -> Order:
        pass
    
    @abstractmethod
    def create_order_item(self, item_data: Dict[str, Any]) -> OrderItem:
        pass
    
    @abstractmethod
    def create_invoice(self, invoice_data: Dict[str, Any]) -> Invoice:
        pass
    
    @abstractmethod
    def create_payment(self, payment_data: Dict[str, Any]) -> Payment:
        pass


class DineInSystemFactory(OrderSystemFactory):
    """Factory para sistema de pedidos en mesa"""
    
    def create_order(self, order_data: Dict[str, Any]) -> Order:
        order_data.update({
            "order_type_id": "dine_in",
            "special_instructions": order_data.get("special_instructions", "")
        })
        return Order(**order_data)
    
    def create_order_item(self, item_data: Dict[str, Any]) -> OrderItem:
        # Para pedidos en mesa, se pueden añadir customizaciones especiales
        if not item_data.get("customizations"):
            item_data["customizations"] = []
        return OrderItem(**item_data)
    
    def create_invoice(self, invoice_data: Dict[str, Any]) -> Invoice:
        # Para pedidos en mesa, la factura se genera al final
        invoice_data.update({
            "status": "pending"
        })
        return Invoice(**invoice_data)
    
    def create_payment(self, payment_data: Dict[str, Any]) -> Payment:
        # Para pedidos en mesa, se puede pagar en efectivo o tarjeta
        return Payment(**payment_data)


class TakeawaySystemFactory(OrderSystemFactory):
    """Factory para sistema de pedidos para llevar"""
    
    def create_order(self, order_data: Dict[str, Any]) -> Order:
        order_data.update({
            "order_type_id": "takeaway",
            "table_id": None  # No hay mesa
        })
        return Order(**order_data)
    
    def create_order_item(self, item_data: Dict[str, Any]) -> OrderItem:
        # Para pedidos para llevar, se pueden añadir instrucciones de empaque
        if not item_data.get("customizations"):
            item_data["customizations"] = []
        return OrderItem(**item_data)
    
    def create_invoice(self, invoice_data: Dict[str, Any]) -> Invoice:
        # Para pedidos para llevar, la factura se genera inmediatamente
        invoice_data.update({
            "status": "pending"
        })
        return Invoice(**invoice_data)
    
    def create_payment(self, payment_data: Dict[str, Any]) -> Payment:
        # Para pedidos para llevar, se puede pagar al recoger
        return Payment(**payment_data)


class DeliverySystemFactory(OrderSystemFactory):
    """Factory para sistema de pedidos a domicilio"""
    
    def create_order(self, order_data: Dict[str, Any]) -> Order:
        order_data.update({
            "order_type_id": "delivery",
            "table_id": None  # No hay mesa
        })
        return Order(**order_data)
    
    def create_order_item(self, item_data: Dict[str, Any]) -> OrderItem:
        # Para pedidos a domicilio, se pueden añadir instrucciones de entrega
        if not item_data.get("customizations"):
            item_data["customizations"] = []
        return OrderItem(**item_data)
    
    def create_invoice(self, invoice_data: Dict[str, Any]) -> Invoice:
        # Para pedidos a domicilio, la factura se genera con la orden
        invoice_data.update({
            "status": "pending"
        })
        return Invoice(**invoice_data)
    
    def create_payment(self, payment_data: Dict[str, Any]) -> Payment:
        # Para pedidos a domicilio, se puede pagar online o al recibir
        return Payment(**payment_data)


class ReservationSystemFactory(ABC):
    """Factory abstracto para sistemas de reservas"""
    
    @abstractmethod
    def create_reservation(self, reservation_data: Dict[str, Any]) -> Reservation:
        pass
    
    @abstractmethod
    def create_customer_for_reservation(self, customer_data: Dict[str, Any]) -> 'Customer':
        pass


class StandardReservationFactory(ReservationSystemFactory):
    """Factory para reservas estándar"""
    
    def create_reservation(self, reservation_data: Dict[str, Any]) -> Reservation:
        # Validaciones específicas para reservas estándar
        if reservation_data.get("party_size", 0) > 8:
            reservation_data["status"] = "pending"  # Requiere confirmación
        return Reservation(**reservation_data)
    
    def create_customer_for_reservation(self, customer_data: Dict[str, Any]) -> 'Customer':
        from models.entities import Customer
        return Customer(**customer_data)


class VIPReservationFactory(ReservationSystemFactory):
    """Factory para reservas VIP"""
    
    def create_reservation(self, reservation_data: Dict[str, Any]) -> Reservation:
        # Para clientes VIP, las reservas se confirman automáticamente
        reservation_data.update({
            "status": "confirmed"
        })
        return Reservation(**reservation_data)
    
    def create_customer_for_reservation(self, customer_data: Dict[str, Any]) -> 'Customer':
        from models.entities import Customer
        customer_data.update({
            "is_vip": True,
            "loyalty_points": customer_data.get("loyalty_points", 0) + 100
        })
        return Customer(**customer_data)


class FactoryProducer:
    """Productor de factories del sistema"""
    
    @staticmethod
    def get_order_system_factory(system_type: str) -> OrderSystemFactory:
        """Obtiene el factory del sistema de pedidos apropiado"""
        factories = {
            "dine_in": DineInSystemFactory(),
            "takeaway": TakeawaySystemFactory(),
            "delivery": DeliverySystemFactory()
        }
        
        factory = factories.get(system_type)
        if not factory:
            raise ValueError(f"Tipo de sistema no soportado: {system_type}")
        return factory
    
    @staticmethod
    def get_reservation_system_factory(customer_type: str) -> ReservationSystemFactory:
        """Obtiene el factory del sistema de reservas apropiado"""
        factories = {
            "standard": StandardReservationFactory(),
            "vip": VIPReservationFactory()
        }
        
        factory = factories.get(customer_type)
        if not factory:
            raise ValueError(f"Tipo de cliente no soportado: {customer_type}")
        return factory
