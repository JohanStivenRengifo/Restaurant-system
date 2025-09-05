"""
Patrón Prototype para clonar objetos existentes
"""
from abc import ABC, abstractmethod
from typing import Dict, Any, List
from copy import deepcopy
from models.entities import MenuItem, Order, Customer, Invoice


class Prototype(ABC):
    """Interfaz para objetos que pueden ser clonados"""
    
    @abstractmethod
    def clone(self) -> 'Prototype':
        pass


class MenuItemPrototype(Prototype):
    """Prototipo para elementos del menú"""
    
    def __init__(self, menu_item: MenuItem):
        self.menu_item = menu_item
    
    def clone(self) -> 'MenuItemPrototype':
        """Clona el elemento del menú"""
        from uuid import uuid4
        cloned_item = deepcopy(self.menu_item)
        # Generar nuevo ID para el clon
        cloned_item.id = uuid4()
        return MenuItemPrototype(cloned_item)
    
    def customize(self, customizations: Dict[str, Any]) -> MenuItem:
        """Personaliza el elemento clonado"""
        from uuid import uuid4
        cloned_item = self.menu_item.model_copy()
        cloned_item.id = uuid4()
        
        # Aplicar personalizaciones
        if "name" in customizations:
            cloned_item.name = customizations["name"]
        if "price" in customizations:
            cloned_item.price = customizations["price"]
        if "description" in customizations:
            cloned_item.description = customizations["description"]
        if "allergen_info" in customizations:
            cloned_item.allergen_info = customizations["allergen_info"]
        
        return cloned_item


class OrderPrototype(Prototype):
    """Prototipo para pedidos"""
    
    def __init__(self, order: Order):
        self.order = order
    
    def clone(self) -> 'OrderPrototype':
        """Clona el pedido"""
        cloned_order = deepcopy(self.order)
        # Generar nuevo ID y número de pedido
        from uuid import uuid4
        cloned_order.id = uuid4()
        cloned_order.order_number = f"ORD-{str(uuid4())[:8]}"
        return OrderPrototype(cloned_order)
    
    def customize_for_customer(self, customer_id: str, table_id: str = None) -> Order:
        """Personaliza el pedido para un cliente específico"""
        cloned_order = self.order.model_copy()
        cloned_order.id = uuid4()
        cloned_order.order_number = f"ORD-{str(uuid4())[:8]}"
        cloned_order.customer_id = customer_id
        cloned_order.table_id = table_id
        return cloned_order


class CustomerPrototype(Prototype):
    """Prototipo para clientes"""
    
    def __init__(self, customer: Customer):
        self.customer = customer
    
    def clone(self) -> 'CustomerPrototype':
        """Clona el cliente"""
        cloned_customer = deepcopy(self.customer)
        # Generar nuevo ID
        from uuid import uuid4
        cloned_customer.id = uuid4()
        return CustomerPrototype(cloned_customer)
    
    def create_family_member(self, first_name: str, last_name: str, 
                           relationship: str = "family") -> Customer:
        """Crea un miembro de la familia basado en el cliente existente"""
        cloned_customer = self.customer.model_copy()
        cloned_customer.id = uuid4()
        cloned_customer.first_name = first_name
        cloned_customer.last_name = last_name
        
        # Copiar preferencias y alergias de la familia
        if "family_members" not in cloned_customer.preferences:
            cloned_customer.preferences["family_members"] = []
        
        cloned_customer.preferences["family_members"].append({
            "name": f"{first_name} {last_name}",
            "relationship": relationship
        })
        
        return cloned_customer


class InvoicePrototype(Prototype):
    """Prototipo para facturas"""
    
    def __init__(self, invoice: Invoice):
        self.invoice = invoice
    
    def clone(self) -> 'InvoicePrototype':
        """Clona la factura"""
        cloned_invoice = deepcopy(self.invoice)
        # Generar nuevo ID y número de factura
        from uuid import uuid4
        cloned_invoice.id = uuid4()
        cloned_invoice.invoice_number = f"INV-{str(uuid4())[:8]}"
        return InvoicePrototype(cloned_invoice)
    
    def create_credit_note(self, reason: str) -> Invoice:
        """Crea una nota de crédito basada en la factura original"""
        cloned_invoice = self.invoice.model_copy()
        cloned_invoice.id = uuid4()
        cloned_invoice.invoice_number = f"CN-{str(uuid4())[:8]}"
        cloned_invoice.status = "refunded"
        
        # Invertir los montos para la nota de crédito
        cloned_invoice.subtotal = -cloned_invoice.subtotal
        cloned_invoice.tax_amount = -cloned_invoice.tax_amount
        cloned_invoice.discount_amount = -cloned_invoice.discount_amount
        cloned_invoice.total_amount = -cloned_invoice.total_amount
        
        return cloned_invoice


class PrototypeManager:
    """Gestor de prototipos para el sistema"""
    
    def __init__(self):
        self._prototypes: Dict[str, Prototype] = {}
    
    def register_prototype(self, name: str, prototype: Prototype) -> None:
        """Registra un prototipo"""
        self._prototypes[name] = prototype
    
    def get_prototype(self, name: str) -> Prototype:
        """Obtiene un prototipo por nombre"""
        prototype = self._prototypes.get(name)
        if not prototype:
            raise ValueError(f"Prototipo no encontrado: {name}")
        return prototype
    
    def clone_prototype(self, name: str) -> Prototype:
        """Clona un prototipo por nombre"""
        prototype = self.get_prototype(name)
        return prototype.clone()
    
    def list_prototypes(self) -> List[str]:
        """Lista todos los prototipos registrados"""
        return list(self._prototypes.keys())


class MenuTemplateManager:
    """Gestor de plantillas de menú usando prototipos"""
    
    def __init__(self):
        self.prototype_manager = PrototypeManager()
        self._menu_templates: Dict[str, MenuItem] = {}
    
    def create_template(self, name: str, menu_item: MenuItem) -> None:
        """Crea una plantilla de menú"""
        self._menu_templates[name] = menu_item
        prototype = MenuItemPrototype(menu_item)
        self.prototype_manager.register_prototype(name, prototype)
    
    def create_from_template(self, template_name: str, 
                           customizations: Dict[str, Any] = None) -> MenuItem:
        """Crea un elemento del menú desde una plantilla"""
        prototype = self.prototype_manager.get_prototype(template_name)
        if isinstance(prototype, MenuItemPrototype):
            if customizations:
                return prototype.customize(customizations)
            else:
                return prototype.clone().menu_item
        raise ValueError("El prototipo no es un MenuItemPrototype")
    
    def create_seasonal_variant(self, template_name: str, 
                              seasonal_name: str, price_modifier: float = 1.0) -> MenuItem:
        """Crea una variante estacional de un elemento del menú"""
        customizations = {
            "name": f"{seasonal_name} - {self._menu_templates[template_name].name}",
            "price": self._menu_templates[template_name].price * price_modifier
        }
        return self.create_from_template(template_name, customizations)
