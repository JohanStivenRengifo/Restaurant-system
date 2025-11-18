# Diagramas del Sistema

## 1. Diagrama de Clases Global del Sistema

```mermaid
classDiagram
    class Usuario {
        +id: string
        +nombre: string
        +email: string
        +passwordHash: string
        +estaActivo: boolean
    }

    class Rol {
        +id: string
        +nombre: string  <<ADMIN, MESERO, CAJERO, GERENTE>>
    }

    class Cliente {
        +id: string
        +nombre: string
        +documento: string
        +telefono: string
        +direccion: string
    }

    class Mesa {
        +id: string
        +numero: int
        +capacidad: int
        +estado: MesaEstado  <<LIBRE, OCUPADA, RESERVADA>>
    }

    class Platillo {
        +id: string
        +nombre: string
        +precio: number
        +tiempoPrepMin: int
        +activo: boolean
    }

    class CategoriaPlatillo {
        +id: string
        +nombre: string    <<ENTRADA, PLATO_FUERTE, POSTRE, BEBIDA>>
    }

    class Pedido {
        +id: string
        +fechaCreacion: Date
        +estado: PedidoEstado
        +tipo: string      <<MESA, DOMICILIO>>
        +total: number
    }

    class DetallePedido {
        +id: string
        +cantidad: int
        +precioUnitario: number
        +subtotal: number
    }

    class Factura {
        +id: string
        +numero: string
        +fechaEmision: Date
        +total: number
        +estado: string    <<PENDIENTE_ENVIO_DIAN, ACEPTADA, RECHAZADA>>
    }

    class Pago {
        +id: string
        +monto: number
        +metodo: string    <<EFECTIVO, TARJETA, TRANSFERENCIA>>
        +fechaPago: Date
    }

    class InventarioItem {
        +id: string
        +nombre: string
        +stockActual: number
        +stockMinimo: number
        +unidad: string
    }

    class PedidoService {
        +crearPedido(datos)
        +obtenerPedido(id)
        +listarPedidos(filtros)
    }

    class InventarioService {
        +verificarStock(platillos)
        +actualizarStock(platillos)
    }

    class FacturacionService {
        +generarFactura(pedido)
        +enviarAFactusAPI(factura)
    }

    class AutenticacionService {
        +login(email, password)
        +verificarToken(token)
    }

    class ChainOfResponsibility {
        <<subsystem>>
    }

    %% Relaciones
    Usuario "1" -- "many" Rol : tiene >
    Cliente "1" -- "many" Pedido : realiza >
    Mesa "1" -- "many" Pedido : asigna >
    Pedido "1" -- "many" DetallePedido : contiene >
    DetallePedido "many" -- "1" Platillo : refiere >
    Platillo "many" -- "1" CategoriaPlatillo : pertenece >

    Pedido "1" -- "0..1" Factura : genera >
    Factura "1" -- "1..*" Pago : sePagaCon >

    InventarioItem "1" -- "0..*" Platillo : usaIngrediente >

    PedidoService --> Pedido : gestiona
    PedidoService --> Cliente : usa
    PedidoService --> Mesa : usa
    PedidoService --> ChainOfResponsibility : validaPedido

    InventarioService --> InventarioItem : gestiona
    FacturacionService --> Factura : crea
    FacturacionService --> Pago : registra
    AutenticacionService --> Usuario : autentica
```

## 2. Diagrama de Estados – Pedido

```mermaid
stateDiagram-v2
    [*] --> Borrador

    Borrador --> EnValidacion : crearPedido()
    EnValidacion --> Rechazado : validacionFallida()
    EnValidacion --> Confirmado : validacionExitosa()

    Confirmado --> EnPreparacion : enviarACocina()
    EnPreparacion --> Listo : marcarListo()

    Listo --> Entregado : entregarAMesa()
    Listo --> EnCamino : enviarDomicilio()

    EnCamino --> Entregado : confirmarEntregaDomicilio()

    Entregado --> Facturado : generarFactura()
    Facturado --> Cerrado : pagoCompleto()

    Borrador --> Cancelado : cancelarPedido()
    Confirmado --> Cancelado : cancelarPorCliente()
    EnPreparacion --> Cancelado : cancelarPorAdministrador()

    Rechazado --> [*]
    Cancelado --> [*]
    Cerrado --> [*]
```

## 3. Diagrama de Comportamiento – Flujo de Creación y Validación de Pedido

```mermaid
flowchart TD
    A[Cliente crea pedido desde la UI] --> B[PedidoService recibe datos]
    B --> C[Construir contexto de validación]
    C --> D[ValidadorPlatillosHandler]
    D -->|Error en platillos| E[Agregar errores al contexto]
    E --> F[Responder error al cliente]
    D -->|OK| G[ValidadorTotalHandler]
    G -->|Error en totales| E
    G -->|OK| H[ValidadorMesaHandler]
    H -->|Mesa no disponible| E
    H -->|OK| I[ValidadorClienteHandler]
    I -->|Cliente no válido| E
    I -->|OK| J[ValidadorDomicilioHandler si aplica]
    J -->|Error en domicilio| E
    J -->|OK| K[Contexto válido]

    K --> L[Persistir Pedido en BD Prisma]
    L --> M[Calcular total definitivo]
    M --> N[Responder éxito al cliente pedido CONFIRMADO]
    F --> O[Fin con error]
    N --> P[Fin con éxito]
```

## 4. Diagrama de Despliegue – Arquitectura en Railway

```mermaid
graph LR
    subgraph Cliente
        Navegador["Navegador Web\n(Cliente/Administrador/Mesero)"]
    end

    subgraph RailwayCloud["Railway - Nube"]
        App["Next.js Application\n(ObraBlanca-POS)"]
        DB["PostgreSQL\nrestaurant_db"]
    end

    subgraph ServiciosExternos["Servicios Externos"]
        Factus["Factus API\n(Facturación electrónica)"]
        DIAN["DIAN\nValidación de facturas"]
        GitHub["GitHub Actions\n(CI/CD Pipeline)"]
    end

    Navegador -->|HTTPS| App
    App -->|Conexion BD| DB
    App -->|API REST| Factus
    Factus -->|Documentos y respuestas| DIAN

    GitHub -->|Despliegue automático| App
```

## 5. Diagrama de Componentes

```mermaid
graph LR
    subgraph UI["Capa de Presentación (Next.js)"]
        Pages["Páginas y Componentes React\n(pedidos, mesas, inventario, facturación)"]
    end

    subgraph AppLayer["Capa de Aplicación"]
        PedidoServiceC["PedidoService"]
        InventarioServiceC["InventarioService"]
        FacturacionServiceC["FacturacionService"]
        AuthServiceC["AutenticacionService"]
    end

    subgraph Domain["Capa de Dominio"]
        Entidades["Entidades de Dominio\n(Pedido, Platillo, Mesa, Cliente, Factura, Pago)"]
        ChainOfResp["Módulo Chain of Responsibility\n(CadenaValidacionPedido + Validadores)"]
    end

    subgraph Infra["Capa de Infraestructura"]
        PrismaRepo["Repositorios Prisma\n(PedidoRepository, ClienteRepository, etc.)"]
        FactusAdapter["Adaptador Factus API"]
        AuthInfra["JWT / Session Manager"]
    end

    Pages --> PedidoServiceC
    Pages --> InventarioServiceC
    Pages --> FacturacionServiceC
    Pages --> AuthServiceC

    PedidoServiceC --> Entidades
    PedidoServiceC --> ChainOfResp
    PedidoServiceC --> PrismaRepo

    InventarioServiceC --> Entidades
    InventarioServiceC --> PrismaRepo

    FacturacionServiceC --> Entidades
    FacturacionServiceC --> FactusAdapter

    AuthServiceC --> AuthInfra

    PrismaRepo --> DB["PostgreSQL"]
    FactusAdapter --> FactusAPI["Factus API"]
```

## 6. Diagrama de Contexto (C4 Nivel 1)

```mermaid
graph LR
    Cliente["Cliente\n(Usuario final)"]
    Mesero["Mesero / Cajero"]
    Administrador["Administrador / Gerente"]

    Sistema["Sistema de Gestión de Restaurante\n(ObraBlanca-POS Web)"]

    FactusExt["Factus API\n(Facturación electrónica)"]
    DIANExt["DIAN"]
    Pasarela["Pasarela de Pago\n(Terminal / TPV)"]

    Cliente -->|Realiza pedidos, consulta cuenta| Sistema
    Mesero -->|Crea y gestiona pedidos, mesas| Sistema
    Administrador -->|Reportes, inventario, configuración| Sistema

    Sistema -->|Envía facturas electrónicas| FactusExt
    FactusExt -->|Validación y respuestas| Sistema

    FactusExt --> DIANExt
    Sistema -->|Registra pagos| Pasarela
```
