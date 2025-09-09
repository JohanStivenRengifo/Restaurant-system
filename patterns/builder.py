"""
Patrón Builder para construir objetos complejos paso a paso
"""
from typing import Dict, Any, List, Optional
from models.entities import Order, OrderItem, MenuItem, Customer, Invoice


class OrderBuilder:
    """Builder para construir pedidos complejos"""
    
    def __init__(self):
        self._order_data: Dict[str, Any] = {}
        self._order_items: List[Dict[str, Any]] = []
    
    def set_customer(self, customer_id: str) -> 'OrderBuilder':
        """Establece el cliente del pedido"""
        self._order_data["customer_id"] = customer_id
        return self
    
    def set_table(self, table_id: str) -> 'OrderBuilder':
        """Establece la mesa del pedido"""
        self._order_data["table_id"] = table_id
        return self
    
    def set_order_type(self, order_type_id: str) -> 'OrderBuilder':
        """Establece el tipo de pedido"""
        self._order_data["order_type_id"] = order_type_id
        return self
    
    def set_status(self, status_id: str) -> 'OrderBuilder':
        """Establece el estado del pedido"""
        self._order_data["status_id"] = status_id
        return self
    
    def set_special_instructions(self, instructions: str) -> 'OrderBuilder':
        """Establece instrucciones especiales"""
        self._order_data["special_instructions"] = instructions
        return self
    
    def add_order_item(self, menu_item_id: str, quantity: int, 
                      unit_price: float, customizations: Optional[List[Dict[str, Any]]] = None,
                      special_instructions: Optional[str] = None) -> 'OrderBuilder':
        """Añade un elemento al pedido"""
        item = {
            "menu_item_id": menu_item_id,
            "quantity": quantity,
            "unit_price": unit_price,
            "total_price": quantity * unit_price,
            "customizations": customizations or [],
            "special_instructions": special_instructions
        }
        self._order_items.append(item)
        return self
    
    def calculate_totals(self, tax_rate: float = 0.19, discount_amount: float = 0.0) -> 'OrderBuilder':
        """Calcula los totales del pedido"""
        subtotal = sum(item["total_price"] for item in self._order_items)
        tax_amount = subtotal * tax_rate
        total_amount = subtotal + tax_amount - discount_amount
        
        self._order_data.update({
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "discount_amount": discount_amount,
            "total_amount": total_amount
        })
        return self
    
    def build(self) -> Order:
        """Construye el pedido final"""
        if not self._order_data.get("order_number"):
            self._order_data["order_number"] = f"ORD-{self._order_data.get('customer_id', 'UNK')[:8]}"
        
        order = Order(**self._order_data)
        # Los order_items se manejarían por separado en el repositorio
        return order


class MenuItemBuilder:
    """Builder para construir elementos del menú complejos"""
    
    def __init__(self):
        self._item_data: Dict[str, Any] = {}
    
    def set_basic_info(self, name: str, description: str, price: float) -> 'MenuItemBuilder':
        """Establece información básica"""
        self._item_data.update({
            "name": name,
            "description": description,
            "price": price
        })
        return self
    
    def set_category(self, category_id: str) -> 'MenuItemBuilder':
        """Establece la categoría"""
        self._item_data["category_id"] = category_id
        return self
    
    def set_pricing(self, cost: float = 0.0) -> 'MenuItemBuilder':
        """Establece información de costos"""
        self._item_data["cost"] = cost
        return self
    
    def set_preparation(self, preparation_time: int = 0) -> 'MenuItemBuilder':
        """Establece tiempo de preparación"""
        self._item_data["preparation_time"] = preparation_time
        return self
    
    def set_availability(self, is_available: bool = True, is_featured: bool = False) -> 'MenuItemBuilder':
        """Establece disponibilidad"""
        self._item_data.update({
            "is_available": is_available,
            "is_featured": is_featured
        })
        return self
    
    def set_image(self, image_url: str) -> 'MenuItemBuilder':
        """Establece URL de imagen"""
        self._item_data["image_url"] = image_url
        return self
    
    def set_allergen_info(self, allergens: List[str]) -> 'MenuItemBuilder':
        """Establece información de alérgenos"""
        self._item_data["allergen_info"] = allergens
        return self
    
    def set_nutritional_info(self, nutritional_data: Dict[str, Any]) -> 'MenuItemBuilder':
        """Establece información nutricional"""
        self._item_data["nutritional_info"] = nutritional_data
        return self
    
    def build(self) -> MenuItem:
        """Construye el elemento del menú final"""
        return MenuItem(**self._item_data)


class CustomerBuilder:
    """Builder para construir clientes complejos"""
    
    def __init__(self):
        self._customer_data: Dict[str, Any] = {}
    
    def set_personal_info(self, first_name: str, last_name: str, 
                         email: Optional[str] = None, phone: Optional[str] = None) -> 'CustomerBuilder':
        """Establece información personal"""
        self._customer_data.update({
            "first_name": first_name,
            "last_name": last_name,
            "email": email,
            "phone": phone
        })
        return self
    
    def set_address(self, address: str) -> 'CustomerBuilder':
        """Establece dirección"""
        self._customer_data["address"] = address
        return self
    
    def set_birth_date(self, birth_date: str) -> 'CustomerBuilder':
        """Establece fecha de nacimiento"""
        self._customer_data["birth_date"] = birth_date
        return self
    
    def set_allergies(self, allergies: List[str]) -> 'CustomerBuilder':
        """Establece alergias"""
        self._customer_data["allergies"] = allergies
        return self
    
    def set_preferences(self, preferences: Dict[str, Any]) -> 'CustomerBuilder':
        """Establece preferencias"""
        self._customer_data["preferences"] = preferences
        return self
    
    def set_loyalty(self, loyalty_points: int = 0, is_vip: bool = False) -> 'CustomerBuilder':
        """Establece información de lealtad"""
        self._customer_data.update({
            "loyalty_points": loyalty_points,
            "is_vip": is_vip
        })
        return self
    
    def build(self) -> Customer:
        """Construye el cliente final"""
        return Customer(**self._customer_data)


class InvoiceBuilder:
    """Builder para construir facturas complejas"""
    
    def __init__(self):
        self._invoice_data: Dict[str, Any] = {}
    
    def set_order_info(self, order_id: str, customer_id: Optional[str] = None) -> 'InvoiceBuilder':
        """Establece información del pedido"""
        self._invoice_data.update({
            "order_id": order_id,
            "customer_id": customer_id
        })
        return self
    
    def set_amounts(self, subtotal: float, tax_amount: float, 
                   discount_amount: float = 0.0) -> 'InvoiceBuilder':
        """Establece montos"""
        total_amount = subtotal + tax_amount - discount_amount
        self._invoice_data.update({
            "subtotal": subtotal,
            "tax_amount": tax_amount,
            "discount_amount": discount_amount,
            "total_amount": total_amount
        })
        return self
    
    def set_status(self, status: str = "pending") -> 'InvoiceBuilder':
        """Establece estado"""
        self._invoice_data["status"] = status
        return self
    
    def set_invoice_number(self, invoice_number: str) -> 'InvoiceBuilder':
        """Establece número de factura"""
        self._invoice_data["invoice_number"] = invoice_number
        return self
    
    def set_created_by(self, created_by: str) -> 'InvoiceBuilder':
        """Establece creador"""
        self._invoice_data["created_by"] = created_by
        return self
    
    def build(self) -> Invoice:
        """Construye la factura final"""
        if not self._invoice_data.get("invoice_number"):
            order_id = self._invoice_data.get("order_id", "UNK")
            self._invoice_data["invoice_number"] = f"INV-{order_id[:8]}"
        
        return Invoice(**self._invoice_data)
