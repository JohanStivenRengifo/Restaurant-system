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

## 7. Diagrama de Estados – Chain of Responsibility (Validación de Pedidos)

```mermaid
stateDiagram-v2
    [*] --> Inicializado : crearCadena()
    
    Inicializado --> ValidandoPlatillos : iniciarValidacion()
    
    ValidandoPlatillos --> ValidandoPlatillos : validarExistencia()
    ValidandoPlatillos --> ValidandoPlatillos : validarActivo()
    ValidandoPlatillos --> ValidandoPlatillos : validarCantidad()
    
    ValidandoPlatillos --> ErrorValidacion : errorEnPlatillos()
    ValidandoPlatillos --> ValidandoTotal : platillosOK()
    
    ValidandoTotal --> ValidandoTotal : calcularTotal()
    ValidandoTotal --> ValidandoTotal : prepararPlatillosConPrecio()
    
    ValidandoTotal --> ErrorValidacion : errorEnTotal()
    ValidandoTotal --> ValidandoMesa : totalOK()
    
    ValidandoMesa --> ValidandoMesa : verificarTipoPedido()
    ValidandoMesa --> ValidandoMesa : validarDisponibilidadMesa()
    
    ValidandoMesa --> ErrorValidacion : mesaNoDisponible()
    ValidandoMesa --> ValidandoCliente : mesaOK() o noEsMesa()
    
    ValidandoCliente --> ValidandoCliente : verificarClienteExiste()
    ValidandoCliente --> ValidandoCliente : validarClienteActivo()
    
    ValidandoCliente --> ErrorValidacion : clienteInvalido()
    ValidandoCliente --> ValidandoDomicilio : clienteOK() o noRequiereCliente()
    
    ValidandoDomicilio --> ValidandoDomicilio : verificarTipoDomicilio()
    ValidandoDomicilio --> ValidandoDomicilio : validarDireccion()
    ValidandoDomicilio --> ValidandoDomicilio : validarTelefono()
    
    ValidandoDomicilio --> ErrorValidacion : errorEnDomicilio()
    ValidandoDomicilio --> ValidacionCompleta : domicilioOK() o noEsDomicilio()
    
    ValidacionCompleta --> ValidacionCompleta : consolidarErrores()
    ValidacionCompleta --> ValidacionExitosa : sinErrores()
    ValidacionCompleta --> ErrorValidacion : conErrores()
    
    ErrorValidacion --> [*] : finalizarConError()
    ValidacionExitosa --> [*] : finalizarConExito()
    
    note right of ValidandoPlatillos
        Valida:
        - Existencia de platillos
        - Estado activo
        - Cantidades válidas (1-100)
    end note
    
    note right of ValidandoTotal
        Calcula:
        - Total del pedido
        - Precios unitarios
        - Subtotal por platillo
    end note
    
    note right of ValidandoMesa
        Valida:
        - Tipo de pedido (MESA)
        - Mesa disponible
        - Estado de mesa
    end note
    
    note right of ValidandoCliente
        Valida:
        - Cliente existe
        - Cliente activo
        - Datos completos
    end note
    
    note right of ValidandoDomicilio
        Valida:
        - Dirección válida
        - Teléfono válido
        - Solo si tipo = DOMICILIO
    end note
```

## 8. Diagrama de Paquetes – Estructura de Módulos del Sistema

```mermaid
graph TB
    subgraph "restaurant [Sistema Principal]"
        subgraph "app [Aplicación Next.js]"
            subgraph "app/api [API Routes]"
                API_Pedidos["api/pedidos<br/>- POST /crear<br/>- GET /listar<br/>- GET /:id"]
                API_Clientes["api/clientes<br/>- GET /listar<br/>- POST /crear"]
                API_Mesas["api/mesas<br/>- GET /estado<br/>- PUT /actualizar"]
                API_Facturacion["api/facturacion<br/>- POST /generar<br/>- GET /pdf/:id"]
            end
            
            subgraph "app/patterns [Patrones de Diseño]"
                subgraph "app/patterns/behavioral [Patrones de Comportamiento]"
                    subgraph "app/patterns/behavioral/chainOfResponsibility [Chain of Responsibility]"
                        COR_Handler["ValidadorPedidoHandler<br/>(clase abstracta)"]
                        COR_Platillos["ValidadorPlatillosHandler"]
                        COR_Total["ValidadorTotalHandler"]
                        COR_Mesa["ValidadorMesaHandler"]
                        COR_Cliente["ValidadorClienteHandler"]
                        COR_Domicilio["ValidadorDomicilioHandler"]
                        COR_Cadena["CadenaValidacionPedido"]
                        COR_Types["ContextoValidacion<br/>ResultadoValidacion"]
                    end
                end
                
                subgraph "app/patterns/creational [Patrones Creacionales]"
                    CREA_Singleton["singleton/"]
                    CREA_Factory["factory/"]
                    CREA_Builder["builder/"]
                    CREA_Prototype["prototype/"]
                end
                
                subgraph "app/patterns/structural [Patrones Estructurales]"
                    STRU_Decorator["decorator/"]
                    STRU_Adapter["adapter/"]
                    STRU_Bridge["bridge/"]
                    STRU_Proxy["proxy/"]
                end
            end
            
            subgraph "app/services [Servicios de Negocio]"
                SVC_Pedido["PedidoService<br/>- crearPedido()<br/>- obtenerPedido()<br/>- listarPedidos()"]
                SVC_Inventario["InventarioService<br/>- verificarStock()<br/>- actualizarStock()"]
                SVC_Facturacion["FacturacionService<br/>- generarFactura()<br/>- enviarAFactusAPI()"]
                SVC_Auth["AutenticacionService<br/>- login()<br/>- verificarToken()"]
            end
            
            subgraph "app/types [Tipos y Entidades]"
                TYPES_Entidades["Entidades de Dominio<br/>- Pedido<br/>- Cliente<br/>- Mesa<br/>- Platillo<br/>- Factura<br/>- Pago"]
                TYPES_Requests["Tipos de Request<br/>- CrearPedidoRequest<br/>- FactusInvoiceRequest"]
            end
        end
        
        subgraph "prisma [ORM y Base de Datos]"
            PRISMA_Schema["schema.prisma<br/>- Modelos de datos<br/>- Relaciones<br/>- Migrations"]
            PRISMA_Client["Prisma Client<br/>- Queries<br/>- Transactions"]
        end
        
        subgraph "lib [Bibliotecas y Utilidades]"
            LIB_Utils["utils/<br/>- Helpers<br/>- Formatters"]
            LIB_Constants["constants/<br/>- Configuración<br/>- Enums"]
        end
        
        subgraph "scripts [Scripts de Utilidad]"
            SCRIPTS_Migrate["migrate-data.ts"]
            SCRIPTS_Seed["insert-sample-data.ts"]
            SCRIPTS_Setup["setup-db.js"]
        end
    end
    
    subgraph "External [Servicios Externos]"
        EXT_Factus["Factus API<br/>- OAuth2<br/>- Invoice Management"]
        EXT_DIAN["DIAN<br/>- Validación Fiscal"]
    end
    
    %% Relaciones API Routes
    API_Pedidos --> SVC_Pedido
    API_Clientes --> SVC_Pedido
    API_Mesas --> SVC_Pedido
    API_Facturacion --> SVC_Facturacion
    
    %% Relaciones Servicios con Chain of Responsibility
    SVC_Pedido --> COR_Cadena
    COR_Cadena --> COR_Handler
    COR_Handler --> COR_Platillos
    COR_Handler --> COR_Total
    COR_Handler --> COR_Mesa
    COR_Handler --> COR_Cliente
    COR_Handler --> COR_Domicilio
    COR_Cadena --> COR_Types
    
    %% Relaciones Servicios con Base de Datos
    SVC_Pedido --> PRISMA_Client
    SVC_Inventario --> PRISMA_Client
    SVC_Facturacion --> PRISMA_Client
    SVC_Auth --> PRISMA_Client
    
    %% Relaciones Chain of Responsibility con Base de Datos
    COR_Platillos --> PRISMA_Client
    COR_Total --> PRISMA_Client
    COR_Mesa --> PRISMA_Client
    COR_Cliente --> PRISMA_Client
    
    %% Relaciones Servicios con Tipos
    SVC_Pedido --> TYPES_Entidades
    SVC_Pedido --> TYPES_Requests
    COR_Cadena --> TYPES_Requests
    
    %% Relaciones Facturación con Externos
    SVC_Facturacion --> EXT_Factus
    EXT_Factus --> EXT_DIAN
    
    %% Relaciones Scripts
    SCRIPTS_Migrate --> PRISMA_Client
    SCRIPTS_Seed --> PRISMA_Client
    SCRIPTS_Setup --> PRISMA_Client
    
    %% Estilos
    classDef api fill:#e3f2fd,stroke:#1976d2,stroke-width:2px
    classDef cor fill:#f3e5f5,stroke:#7b1fa2,stroke-width:3px
    classDef service fill:#e8f5e9,stroke:#388e3c,stroke-width:2px
    classDef database fill:#fff3e0,stroke:#f57c00,stroke-width:2px
    classDef external fill:#ffebee,stroke:#c62828,stroke-width:2px
    classDef types fill:#f1f8e9,stroke:#558b2f,stroke-width:2px
    
    class API_Pedidos,API_Clientes,API_Mesas,API_Facturacion api
    class COR_Handler,COR_Platillos,COR_Total,COR_Mesa,COR_Cliente,COR_Domicilio,COR_Cadena,COR_Types cor
    class SVC_Pedido,SVC_Inventario,SVC_Facturacion,SVC_Auth service
    class PRISMA_Schema,PRISMA_Client database
    class EXT_Factus,EXT_DIAN external
    class TYPES_Entidades,TYPES_Requests types
```

## 9. Diagrama de Paquetes Detallado – Chain of Responsibility

```mermaid
graph TB
    subgraph "app/patterns/behavioral/chainOfResponsibility [Módulo Chain of Responsibility]"
        subgraph "Handlers [Manejadores de Validación]"
            Handler_Base["ValidadorPedidoHandler<br/>(abstract class)<br/>+ setSiguiente()<br/>+ validar()<br/># procesar()"]
            
            Handler_Platillos["ValidadorPlatillosHandler<br/>- db: PrismaDatabaseService<br/># procesar()<br/>  • Validar existencia<br/>  • Validar activo<br/>  • Validar cantidad"]
            
            Handler_Total["ValidadorTotalHandler<br/>- db: PrismaDatabaseService<br/># procesar()<br/>  • Calcular total<br/>  • Preparar platillosConPrecio"]
            
            Handler_Mesa["ValidadorMesaHandler<br/>- db: PrismaDatabaseService<br/># procesar()<br/>  • Verificar tipo MESA<br/>  • Validar disponibilidad"]
            
            Handler_Cliente["ValidadorClienteHandler<br/>- db: PrismaDatabaseService<br/># procesar()<br/>  • Validar existencia<br/>  • Validar activo"]
            
            Handler_Domicilio["ValidadorDomicilioHandler<br/># procesar()<br/>  • Verificar tipo DOMICILIO<br/>  • Validar dirección<br/>  • Validar teléfono"]
        end
        
        subgraph "Core [Núcleo de la Cadena]"
            Core_Cadena["CadenaValidacionPedido<br/>- cadena: ValidadorPedidoHandler<br/>+ validar()<br/>  • Construir cadena<br/>  • Ejecutar validación<br/>  • Retornar resultado"]
        end
        
        subgraph "Types [Tipos y Contextos]"
            Types_Contexto["ContextoValidacion<br/>+ pedido: CrearPedidoRequest<br/>+ platillosConPrecio: Array<br/>+ totalCalculado: number<br/>+ errores: string[]"]
            
            Types_Resultado["ResultadoValidacion<br/>+ valido: boolean<br/>+ errores: string[]"]
            
            Types_Completo["ResultadoValidacionCompleto<br/>+ valido: boolean<br/>+ errores: string[]<br/>+ contexto: ContextoValidacion"]
        end
        
        subgraph "Interfaces [Interfaces Públicas]"
            Interface_Request["CrearPedidoRequest<br/>+ clienteId?: string<br/>+ mesaId?: string<br/>+ tipo: string<br/>+ platillos: Array<br/>+ direccion?: string<br/>+ telefono?: string"]
        end
    end
    
    subgraph "Dependencies [Dependencias Externas]"
        Dep_Prisma["PrismaDatabaseService<br/>(Singleton)<br/>+ obtenerPlatillos()<br/>+ obtenerMesa()<br/>+ obtenerCliente()"]
        
        Dep_PedidoService["PedidoService<br/>- cadenaValidacion: CadenaValidacionPedido<br/>+ crearPedido()"]
    end
    
    %% Herencia
    Handler_Base --> Handler_Platillos
    Handler_Base --> Handler_Total
    Handler_Base --> Handler_Mesa
    Handler_Base --> Handler_Cliente
    Handler_Base --> Handler_Domicilio
    
    %% Composición de Cadena
    Core_Cadena --> Handler_Base
    Core_Cadena --> Handler_Platillos
    Core_Cadena --> Handler_Total
    Core_Cadena --> Handler_Mesa
    Core_Cadena --> Handler_Cliente
    Core_Cadena --> Handler_Domicilio
    
    %% Uso de Tipos
    Core_Cadena --> Types_Contexto
    Core_Cadena --> Types_Resultado
    Core_Cadena --> Types_Completo
    Handler_Base --> Types_Contexto
    Handler_Base --> Types_Resultado
    
    %% Dependencias de Base de Datos
    Handler_Platillos --> Dep_Prisma
    Handler_Total --> Dep_Prisma
    Handler_Mesa --> Dep_Prisma
    Handler_Cliente --> Dep_Prisma
    
    %% Integración con Servicio
    Dep_PedidoService --> Core_Cadena
    Dep_PedidoService --> Interface_Request
    
    %% Flujo de Datos
    Interface_Request --> Types_Contexto
    
    %% Estilos
    classDef handler fill:#e1bee7,stroke:#7b1fa2,stroke-width:2px
    classDef core fill:#ce93d8,stroke:#6a1b9a,stroke-width:3px
    classDef types fill:#f3e5f5,stroke:#4a148c,stroke-width:2px
    classDef dependency fill:#fff9c4,stroke:#f57f17,stroke-width:2px
    
    class Handler_Base,Handler_Platillos,Handler_Total,Handler_Mesa,Handler_Cliente,Handler_Domicilio handler
    class Core_Cadena core
    class Types_Contexto,Types_Resultado,Types_Completo,Interface_Request types
    class Dep_Prisma,Dep_PedidoService dependency
```
