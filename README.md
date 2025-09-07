# Proyecto Construccion API Restaurante

# autores
- [@johanstivenrengifo](https://github.com/johanstivenrengifo)
- [@TatianaDaza](https://github.com/TatianaDaza)

## Relaciones de Modelos

### 1. Gestión de Clientes y Pedidos

**Relación Principal**: `CUSTOMER` → `ORDER` (1:N)
- Un cliente puede realizar múltiples pedidos
- Un pedido pertenece a un cliente (opcional para pedidos anónimos)
- **Campos de relación**: `customer_id` en `ORDER`

**Características**:
- Los clientes tienen información de contacto, preferencias y sistema de fidelidad
- Los pedidos pueden ser anónimos (customer_id nullable)
- Se mantiene historial completo de pedidos por cliente

### 2. Gestión de Mesas y Zonas

**Relación Principal**: `ZONE` → `TABLE` (1:N)
- Una zona puede contener múltiples mesas
- Una mesa pertenece a una zona específica
- **Campos de relación**: `zone_id` en `TABLE`

**Relación Secundaria**: `TABLE` → `ORDER` (1:N)
- Una mesa puede tener múltiples pedidos (histórico)
- Un pedido puede estar asociado a una mesa
- **Campos de relación**: `table_id` en `ORDER`

### 3. Gestión del Menú

**Relación Principal**: `MENU_CATEGORY` → `MENU_ITEM` (1:N)
- Una categoría puede contener múltiples elementos del menú
- Un elemento del menú pertenece a una categoría
- **Campos de relación**: `category_id` en `MENU_ITEM`

**Relación de Recetas**: `MENU_ITEM` → `RECIPE` (1:N)
- Un elemento del menú puede tener múltiples ingredientes en su receta
- Una receta pertenece a un elemento del menú específico
- **Campos de relación**: `menu_item_id` en `RECIPE`

### 4. Gestión de Inventario

**Relación Principal**: `INGREDIENT_CATEGORY` → `INGREDIENT` (1:N)
- Una categoría de ingrediente puede contener múltiples ingredientes
- Un ingrediente pertenece a una categoría
- **Campos de relación**: `category_id` en `INGREDIENT`

**Relación de Recetas**: `INGREDIENT` → `RECIPE` (1:N)
- Un ingrediente puede ser usado en múltiples recetas
- Una receta usa un ingrediente específico
- **Campos de relación**: `ingredient_id` en `RECIPE`

**Relación de Unidades**: `UNIT` → `INGREDIENT` (1:N) y `UNIT` → `RECIPE` (1:N)
- Las unidades se reutilizan para medir ingredientes y recetas
- **Campos de relación**: `unit_id` en `INGREDIENT` y `RECIPE`

### 5. Gestión de Pedidos

**Relación Principal**: `ORDER` → `ORDER_ITEM` (1:N)
- Un pedido puede contener múltiples elementos
- Un elemento de pedido pertenece a un pedido específico
- **Campos de relación**: `order_id` en `ORDER_ITEM`

**Relación con Menú**: `MENU_ITEM` → `ORDER_ITEM` (1:N)
- Un elemento del menú puede aparecer en múltiples pedidos
- Un elemento de pedido referencia un elemento del menú
- **Campos de relación**: `menu_item_id` en `ORDER_ITEM`

### 6. Gestión de Facturación

**Relación Principal**: `ORDER` → `INVOICE` (1:1)
- Un pedido puede generar una factura
- Una factura pertenece a un pedido específico
- **Campos de relación**: `order_id` en `INVOICE`

**Relación con Cliente**: `CUSTOMER` → `INVOICE` (1:N)
- Un cliente puede tener múltiples facturas
- Una factura puede pertenecer a un cliente
- **Campos de relación**: `customer_id` en `INVOICE`

**Relación de Pagos**: `INVOICE` → `PAYMENT` (1:N)
- Una factura puede tener múltiples pagos (parciales)
- Un pago pertenece a una factura específica
- **Campos de relación**: `invoice_id` en `PAYMENT`

### 7. Gestión de Usuarios y Seguridad

**Relación Principal**: `ROLE` → `USER` (1:N)
- Un rol puede ser asignado a múltiples usuarios
- Un usuario tiene un rol específico
- **Campos de relación**: `role_id` en `USER`

**Relación de Auditoría**: `USER` → `ACTIVITY_LOG` (1:N)
- Un usuario puede generar múltiples logs de actividad
- Un log de actividad pertenece a un usuario
- **Campos de relación**: `user_id` en `ACTIVITY_LOG`

## Enums y Estados

### Estados de Pedido
- `PENDING`: Pendiente
- `PREPARING`: En preparación
- `READY`: Listo
- `SERVED`: Servido
- `CANCELLED`: Cancelado

### Tipos de Pedido
- `DINE_IN`: Comer en el local
- `TAKEAWAY`: Para llevar
- `DELIVERY`: Domicilio

### Estados de Pago
- `PENDING`: Pendiente
- `COMPLETED`: Completado
- `FAILED`: Fallido
- `REFUNDED`: Reembolsado

### Estados de Factura
- `PENDING`: Pendiente
- `PAID`: Pagada
- `CANCELLED`: Cancelada
- `REFUNDED`: Reembolsada

## Patrones de Diseño Aplicados

### 1. Singleton Pattern
- **Aplicación**: Gestión de conexión a base de datos y logging
- **Archivos**: `patterns/singleton.py`
- **Beneficio**: Garantiza una única instancia de conexión y logger

### 2. Factory Method Pattern
- **Aplicación**: Creación de elementos del menú y clientes
- **Archivos**: `patterns/factory.py`
- **Beneficio**: Encapsula la lógica de creación de objetos complejos

### 3. Builder Pattern
- **Aplicación**: Construcción de elementos del menú y pedidos
- **Archivos**: `patterns/builder.py`
- **Beneficio**: Permite construcción paso a paso de objetos complejos

### 4. Abstract Factory Pattern
- **Aplicación**: Creación de familias de objetos relacionados
- **Archivos**: `patterns/abstract_factory.py`
- **Beneficio**: Proporciona interfaz para crear familias de objetos

### 5. Prototype Pattern
- **Aplicación**: Clonación de elementos del menú desde plantillas
- **Archivos**: `patterns/prototype.py`
- **Beneficio**: Permite clonación eficiente de objetos complejos

### 6. Repository Pattern
- **Aplicación**: Abstracción del acceso a datos
- **Archivos**: `repositories/`
- **Beneficio**: Separa la lógica de acceso a datos de la lógica de negocio

## Flujo de Datos Principal

1. **Cliente** realiza un **Pedido** en una **Mesa** específica
2. **Pedido** contiene múltiples **Elementos de Pedido**
3. **Elementos de Pedido** referencian **Elementos del Menú**
4. **Elementos del Menú** tienen **Recetas** con **Ingredientes**
5. **Pedido** genera una **Factura**
6. **Factura** puede tener múltiples **Pagos**
7. **Usuario** del sistema registra todas las actividades en **Logs**

## Consideraciones de Escalabilidad

### Índices Recomendados
- `customer_id` en `orders`
- `table_id` en `orders`
- `menu_item_id` en `order_items`
- `category_id` en `menu_items`
- `ingredient_id` en `recipes`

### Optimizaciones
- Paginación en todas las consultas de listado
- Caché para elementos del menú frecuentemente consultados
- Índices compuestos para consultas complejas
- Soft deletes para mantener historial

### Validaciones
- Validación de integridad referencial
- Validación de estados de transición
- Validación de stock de ingredientes
- Validación de disponibilidad de mesas


## Visión General

El sistema de gestión de restaurante implementa una arquitectura robusta basada en **FastAPI** y **Pydantic**, utilizando múltiples patrones de diseño para garantizar escalabilidad, mantenibilidad y extensibilidad. El análisis revela un modelo de datos bien estructurado que maneja eficientemente las relaciones complejas entre entidades del dominio del restaurante.

## Entidades Principales Identificadas

### 1. **Gestión de Clientes** (Customer)
- **Propósito**: Administración de información de clientes y sistema de fidelidad
- **Relaciones**: 1:N con Orders, Invoices, Reservations
- **Características**: Sistema VIP, puntos de fidelidad, preferencias y alergias

### 2. **Gestión de Pedidos** (Order)
- **Propósito**: Control del flujo de pedidos desde creación hasta entrega
- **Relaciones**: N:1 con Customer, Table; 1:N con OrderItem, Invoice
- **Estados**: PENDING → PREPARING → READY → SERVED → CANCELLED

### 3. **Gestión del Menú** (MenuItem)
- **Propósito**: Catálogo de productos disponibles
- **Relaciones**: N:1 con MenuCategory; 1:N con Recipe, OrderItem
- **Características**: Información nutricional, alérgenos, disponibilidad

### 4. **Gestión de Inventario** (Ingredient)
- **Propósito**: Control de stock y costos de ingredientes
- **Relaciones**: N:1 con IngredientCategory, Unit; 1:N con Recipe, InventoryMovement
- **Características**: Control de stock mínimo, proveedores, costos

### 5. **Gestión de Facturación** (Invoice)
- **Propósito**: Procesamiento de pagos y facturación
- **Relaciones**: N:1 con Order, Customer; 1:N con Payment
- **Estados**: PENDING → PAID → CANCELLED → REFUNDED

## Patrones de Diseño Implementados

| Patrón | Aplicación | Beneficio |
|--------|------------|-----------|
| **Singleton** | Conexión DB, Logging | Instancia única, gestión centralizada |
| **Factory Method** | Creación de objetos | Encapsulación de lógica de creación |
| **Builder** | Construcción compleja | Construcción paso a paso |
| **Abstract Factory** | Familias de objetos | Interfaz unificada |
| **Prototype** | Clonación de plantillas | Eficiencia en creación |
| **Repository** | Acceso a datos | Abstracción de persistencia |
| **Service Layer** | Lógica de negocio | Separación de responsabilidades |

## Relaciones Críticas

### Flujo Principal de Datos
```
Cliente → Pedido → Elementos de Pedido → Elementos del Menú → Recetas → Ingredientes
                ↓
            Factura → Pagos
```

### Relaciones de Integridad
- **Customer ↔ Order**: Relación opcional (pedidos anónimos permitidos)
- **Order ↔ OrderItem**: Relación obligatoria (pedido debe tener elementos)
- **MenuItem ↔ Recipe**: Relación opcional (elementos sin receta)
- **Invoice ↔ Payment**: Relación opcional (facturas sin pago)

## Arquitectura de Capas

```
┌─────────────────┐
│   API Routes    │ ← Capa de Presentación
├─────────────────┤
│   Services      │ ← Capa de Lógica de Negocio
├─────────────────┤
│  Repositories   │ ← Capa de Acceso a Datos
├─────────────────┤
│    Models       │ ← Capa de Entidades
├─────────────────┤
│   Patterns      │ ← Capa de Patrones de Diseño
├─────────────────┤
│   Database      │ ← Capa de Persistencia
└─────────────────┘
```
