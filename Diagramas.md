# Diagramas UML Detallados - Sistema de Gestión de Restaurante

## Diagramas de Clase por Patrón

### Diagramas de Facturación Electrónica

#### 1. Diagrama de Clases - Facturación Electrónica con Factus API

```mermaid
classDiagram
    class FactusAuthService {
        -static instance: FactusAuthService
        -accessToken: string
        -tokenExpiry: Date
        -clientId: string
        -clientSecret: string
        -apiUrl: string
        +static getInstance() FactusAuthService
        +getValidAccessToken() Promise~string~
        -refreshAccessToken() Promise~void~
        +isTokenValid() boolean
        +clearToken() void
    }
    
    class FactusInvoiceService {
        -authService: FactusAuthService
        -apiUrl: string
        +createInvoice(invoiceRequest) Promise~FactusInvoiceResponse~
        +validateInvoice(invoiceRequest) Promise~FactusValidationResult~
        +getNumberingRanges() Promise~FactusNumberingRangeResponse[]~
        +getInvoiceByNumber(invoiceNumber) Promise~FactusInvoiceResponse~
        +listInvoices(page, limit) Promise~object~
        +getInvoicePDF(invoiceNumber) Promise~Buffer~
        +validateInvoiceData(invoiceRequest) FactusValidationResult
        +generateInvoiceSummary(invoiceResponse) FactusInvoiceSummary
    }
    
    class FactusInvoiceBuilder {
        -invoiceRequest: Partial~FactusInvoiceRequest~
        +setReferenceCode(referenceCode) FactusInvoiceBuilder
        +setNumberingRange(rangeId) FactusInvoiceBuilder
        +setObservation(observation) FactusInvoiceBuilder
        +setPaymentForm(paymentForm) FactusInvoiceBuilder
        +setPaymentMethod(paymentMethod) FactusInvoiceBuilder
        +setPaymentDueDate(dueDate) FactusInvoiceBuilder
        +setSendEmail(sendEmail) FactusInvoiceBuilder
        +setCustomer(customer) FactusInvoiceBuilder
        +setEstablishment(establishment) FactusInvoiceBuilder
        +addItem(item) FactusInvoiceBuilder
        +addItems(items) FactusInvoiceBuilder
        +addAllowanceCharge(allowanceCharge) FactusInvoiceBuilder
        +setOrderReference(orderReference) FactusInvoiceBuilder
        +setBillingPeriod(billingPeriod) FactusInvoiceBuilder
        +build() FactusInvoiceRequest
        +reset() FactusInvoiceBuilder
    }
    
    class FactusAdapterService {
        <<static>>
        +adaptarCliente(cliente) FactusCustomer
        +adaptarPlatillo(platillo) FactusItem
        +adaptarPlatillos(platillos) FactusItem[]
        +adaptarPropina(propina, baseAmount) FactusAllowanceCharge
        +adaptarDescuento(descuento, baseAmount, razon) FactusAllowanceCharge
        +adaptarEstablecimiento(establecimiento) FactusEstablishment
        +adaptarMetodoPago(metodoPago) string
        +adaptarFormaPago(formaPago) string
        +adaptarPedidoCompleto(pedido, establecimiento, numberingRangeId) FactusInvoiceRequest
        +validarCliente(cliente) ValidationResult
        +validarPlatillo(platillo) ValidationResult
        +validarPedido(pedido) ValidationResult
        +generarCodigoReferencia(pedidoId, timestamp) string
        +calcularTotalFactura(pedido) FacturaTotal
    }
    
    class FactusInvoiceServiceFactory {
        <<static>>
        +createForTesting() FactusInvoiceService
        +createForProduction() FactusInvoiceService
        +createWithConfig(authService, apiUrl) FactusInvoiceService
    }
    
    class RestauranteCliente {
        +id: string
        +nombre: string
        +apellido: string
        +email: string
        +telefono: string
        +direccion: string
        +tipoDocumento: string
        +numeroDocumento: string
        +digitoVerificacion: string
        +esPersonaJuridica: boolean
        +razonSocial: string
        +nombreComercial: string
        +municipioId: number
    }
    
    class RestaurantePlatillo {
        +id: string
        +nombre: string
        +codigo: string
        +precio: number
        +cantidad: number
        +descuentoPorcentaje: number
        +impuestoPorcentaje: number
        +estaExcluidoIVA: boolean
        +unidadMedida: string
        +categoria: string
    }
    
    class RestaurantePedido {
        +id: string
        +cliente: RestauranteCliente
        +platillos: RestaurantePlatillo[]
        +propina: number
        +descuento: number
        +metodoPago: string
        +formaPago: string
        +fechaVencimiento: string
        +observaciones: string
        +numeroReferencia: string
    }
    
    class FactusCustomer {
        +identification_document_id: number
        +identification: string
        +dv: string
        +company: string
        +trade_name: string
        +names: string
        +address: string
        +email: string
        +phone: string
        +legal_organization_id: number
        +tribute_id: number
        +municipality_id: number
    }
    
    class FactusItem {
        +code_reference: string
        +name: string
        +quantity: number
        +discount_rate: number
        +price: number
        +tax_rate: string
        +unit_measure_id: number
        +standard_code_id: number
        +is_excluded: number
        +tribute_id: number
    }
    
    class FactusInvoiceRequest {
        +document: string
        +numbering_range_id: number
        +reference_code: string
        +observation: string
        +payment_form: string
        +payment_method_code: string
        +payment_due_date: string
        +operation_type: number
        +send_email: boolean
        +customer: FactusCustomer
        +items: FactusItem[]
        +allowance_charges: FactusAllowanceCharge[]
        +establishment: FactusEstablishment
    }
    
    class FactusInvoiceResponse {
        +status: string
        +message: string
        +data: FactusInvoiceData
    }
    
    class FactusValidationResult {
        +isValid: boolean
        +errors: string[]
        +warnings: string[]
    }
    
    class FactusInvoiceSummary {
        +referenceCode: string
        +invoiceNumber: string
        +total: number
        +status: string
        +cufe: string
        +qrUrl: string
        +createdAt: string
    }
    
    FactusAuthService --> FactusInvoiceService : provides auth
    FactusInvoiceServiceFactory --> FactusInvoiceService : creates
    FactusInvoiceBuilder --> FactusInvoiceRequest : builds
    FactusAdapterService --> FactusCustomer : adapts to
    FactusAdapterService --> FactusItem : adapts to
    FactusAdapterService --> FactusInvoiceRequest : adapts to
    
    RestauranteCliente --> FactusAdapterService : input
    RestaurantePlatillo --> FactusAdapterService : input
    RestaurantePedido --> FactusAdapterService : input
    
    FactusInvoiceRequest --> FactusInvoiceService : input
    FactusInvoiceService --> FactusInvoiceResponse : output
    FactusInvoiceService --> FactusValidationResult : output
    FactusInvoiceService --> FactusInvoiceSummary : output
```

#### 2. Diagrama de Secuencia - Proceso Completo de Facturación Electrónica

```mermaid
sequenceDiagram
    participant Cliente as Cliente del Restaurante
    participant UI as Interfaz de Usuario
    participant Adapter as FactusAdapterService
    participant Builder as FactusInvoiceBuilder
    participant Service as FactusInvoiceService
    participant Auth as FactusAuthService
    participant FactusAPI as Factus API
    participant DB as Base de Datos
    
    Cliente->>UI: Crear nueva factura
    UI->>DB: Obtener datos del pedido
    DB->>UI: Datos del pedido
    
    UI->>Adapter: adaptarPedidoCompleto(pedido)
    Adapter->>Adapter: adaptarCliente(cliente)
    Adapter->>Adapter: adaptarPlatillos(platillos)
    Adapter->>Adapter: adaptarDescuentos(descuentos)
    Adapter->>Adapter: adaptarPropina(propina)
    Adapter->>UI: FactusInvoiceRequest
    
    UI->>Builder: new FactusInvoiceBuilder()
    Builder->>Builder: setReferenceCode(codigo)
    Builder->>Builder: setCustomer(clienteFactus)
    Builder->>Builder: addItems(itemsFactus)
    Builder->>Builder: setPaymentMethod(metodo)
    Builder->>Builder: setPaymentForm(forma)
    Builder->>Builder: build()
    Builder->>UI: FactusInvoiceRequest validado
    
    UI->>Service: createInvoice(invoiceRequest)
    Service->>Service: validateInvoiceData(invoiceRequest)
    
    alt Datos válidos
        Service->>Auth: getValidAccessToken()
        
        alt Token válido
            Auth->>Service: access_token
        else Token expirado
            Auth->>FactusAPI: POST /oauth/token
            FactusAPI->>Auth: access_token + expiry
            Auth->>Service: access_token
        end
        
        Service->>FactusAPI: POST /v1/bills/validate
        FactusAPI->>FactusAPI: Validar datos
        FactusAPI->>FactusAPI: Generar CUFE
        FactusAPI->>FactusAPI: Asignar numeración
        FactusAPI->>Service: FactusInvoiceResponse
        
        Service->>DB: Guardar factura generada
        DB->>Service: Factura guardada
        
        Service->>UI: Factura creada exitosamente
        UI->>Cliente: Mostrar confirmación + CUFE
        
    else Datos inválidos
        Service->>UI: Errores de validación
        UI->>Cliente: Mostrar errores
    end
    
    Note over Cliente, FactusAPI: Proceso de descarga de PDF
    
    Cliente->>UI: Descargar PDF de factura
    UI->>Service: getInvoicePDF(invoiceNumber)
    Service->>Auth: getValidAccessToken()
    Auth->>Service: access_token
    Service->>FactusAPI: GET /v1/bills/download-pdf/{invoiceNumber}
    FactusAPI->>Service: PDF en base64
    Service->>Service: Decodificar base64 a Buffer
    Service->>UI: PDF Buffer
    UI->>Cliente: Descargar archivo PDF
```

#### 3. Diagrama de Estados - Ciclo de Vida de Factura Electrónica

```mermaid
stateDiagram-v2
    [*] --> Creando : Iniciar factura
    
    Creando --> Validando : Datos ingresados
    Validando --> DatosInvalidos : Error en validación
    DatosInvalidos --> Creando : Corregir datos
    
    Validando --> Enviando : Datos válidos
    Enviando --> Enviada : Envío exitoso
    Enviando --> ErrorEnvio : Error de conexión
    
    ErrorEnvio --> Enviando : Reintentar
    ErrorEnvio --> Creando : Cancelar
    
    Enviada --> Validada : DIAN aprueba
    Enviada --> Rechazada : DIAN rechaza
    
    Validada --> PDFGenerado : PDF disponible
    PDFGenerado --> EnviadaPorEmail : Email enviado
    PDFGenerado --> Descargado : PDF descargado
    
    Rechazada --> Creando : Corregir y reenviar
    Rechazada --> Cancelada : Cancelar factura
    
    EnviadaPorEmail --> [*] : Proceso completado
    Descargado --> [*] : Proceso completado
    Cancelada --> [*] : Proceso cancelado
    
    note right of Validada
        CUFE generado
        Numeración asignada
        QR disponible
    end note
    
    note right of PDFGenerado
        PDF listo para descarga
        Código QR incluido
        Firma digital aplicada
    end note
```

#### 4. Diagrama de Componentes - Arquitectura de Facturación Electrónica

```mermaid
graph TB
    subgraph Capa_de_Presentacion
        UI[Interfaz de Usuario\n- Formulario de factura\n- Lista de facturas\n- Descarga de PDFs]
        API[API Routes\n- /api/factus/auth\n- /api/factus/invoices\n- /api/factus/invoices/id/pdf]
    end

    subgraph Capa_de_Logica_de_Negocio
        subgraph Patrones_de_Facturacion
            Builder[FactusInvoiceBuilder\n- Construcción paso a paso\n- Validación integrada\n- Fluent interface]
            Factory[FactusInvoiceServiceFactory\n- Creación para diferentes entornos\n- Configuración centralizada]
            Adapter[FactusAdapterService\n- Conversión de datos\n- Mapeo de formatos\n- Validación previa]
        end

        subgraph Servicios_de_Facturacion
            AuthService[FactusAuthService\n- Gestión de tokens OAuth2\n- Renovación automática\n- Singleton pattern]
            InvoiceService[FactusInvoiceService\n- Creación de facturas\n- Validación\n- Descarga de PDFs]
        end
    end

    subgraph Capa_de_Integracion_Externa
        FactusAPI[Factus API\n- Autenticación OAuth2\n- Validación de facturas\n- Generación de CUFE\n- Descarga de PDFs]
        DIAN[DIAN\n- Validación fiscal\n- Aprobación de facturas\n- Generación de CUFE]
    end

    subgraph Capa_de_Datos
        Database[(Base de Datos\nPostgreSQL)]
        Cache[(Caché\nTokens de acceso)]
    end

    subgraph Configuracion
        Env[Variables de Entorno\n- Client ID/Secret\n- API URLs\n- Configuración DIAN]
    end

    %% Conexiones principales
    UI --> API
    API --> Builder
    API --> Factory
    API --> Adapter

    Builder --> InvoiceService
    Factory --> InvoiceService
    Adapter --> Builder

    InvoiceService --> AuthService
    AuthService --> FactusAPI
    InvoiceService --> FactusAPI

    FactusAPI --> DIAN

    AuthService --> Cache
    InvoiceService --> Database

    AuthService --> Env
    InvoiceService --> Env

    %% Estilos
    classDef presentacion fill:#e1f5fe
    classDef logica fill:#f3e5f5
    classDef integracion fill:#fff3e0
    classDef datos fill:#fce4ec
    classDef config fill:#f1f8e9

    class UI,API presentacion
    class Builder,Factory,Adapter,AuthService,InvoiceService logica
    class FactusAPI,DIAN integracion
    class Database,Cache datos
    class Env config

```

#### 5. Diagrama de Secuencia - Manejo de Errores en Facturación

```mermaid
sequenceDiagram
    participant Cliente
    participant Service
    participant Auth
    participant FactusAPI
    participant Logger
    
    Cliente->>Service: createInvoice(invoiceRequest)
    Service->>Service: validateInvoiceData(invoiceRequest)
    
    alt Datos inválidos
        Service->>Logger: logValidationError(errors)
        Service->>Cliente: ValidationError con detalles
    else Datos válidos
        Service->>Auth: getValidAccessToken()
        
        alt Error de autenticación
            Auth->>FactusAPI: POST /oauth/token
            FactusAPI->>Auth: Error 401/403
            Auth->>Logger: logAuthError(error)
            Auth->>Service: AuthError
            Service->>Cliente: Error de autenticación
        else Token obtenido
            Auth->>Service: access_token
            Service->>FactusAPI: POST /v1/bills/validate
            
            alt Error de API
                FactusAPI->>Service: Error 400/500
                Service->>Logger: logAPIError(error)
                Service->>Cliente: APIError con mensaje
            else Factura creada
                FactusAPI->>Service: FactusInvoiceResponse
                Service->>Logger: logSuccess(invoiceNumber)
                Service->>Cliente: Factura creada exitosamente
            end
        end
    end
    
    Note over Cliente, Logger: Todos los errores se registran para auditoría
```

#### 6. Diagrama de Clases - Validaciones y Tipos de Datos

```mermaid
classDiagram
    class ValidationResult {
        +isValid: boolean
        +errors: string[]
        +warnings: string[]
    }
    
    class FactusValidationResult {
        +isValid: boolean
        +errors: string[]
        +warnings: string[]
    }
    
    class RestauranteCliente {
        +id: string
        +nombre: string
        +apellido: string
        +email: string
        +telefono: string
        +direccion: string
        +tipoDocumento: 'cedula' | 'nit' | 'cedula_extranjeria' | 'pasaporte'
        +numeroDocumento: string
        +digitoVerificacion: string
        +esPersonaJuridica: boolean
        +razonSocial: string
        +nombreComercial: string
        +municipioId: number
    }
    
    class RestaurantePlatillo {
        +id: string
        +nombre: string
        +codigo: string
        +precio: number
        +cantidad: number
        +descuentoPorcentaje: number
        +impuestoPorcentaje: number
        +estaExcluidoIVA: boolean
        +unidadMedida: 'unidad' | 'kilogramo' | 'litro' | 'metro'
        +categoria: string
    }
    
    class RestaurantePedido {
        +id: string
        +cliente: RestauranteCliente
        +platillos: RestaurantePlatillo[]
        +propina: number
        +descuento: number
        +metodoPago: 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia' | 'cheque'
        +formaPago: 'contado' | 'credito'
        +fechaVencimiento: string
        +observaciones: string
        +numeroReferencia: string
    }
    
    class FactusIdentificationDocument {
        <<enumeration>>
        CEDULA_CIUDADANIA = 1
        NIT = 2
        CEDULA_EXTRANJERIA = 3
        PASAPORTE = 4
    }
    
    class FactusLegalOrganizationType {
        <<enumeration>>
        PERSONA_NATURAL = 1
        PERSONA_JURIDICA = 2
    }
    
    class FactusTributeType {
        <<enumeration>>
        IVA = 1
        NO_APLICA = 2
    }
    
    class FactusUnitMeasure {
        <<enumeration>>
        KILOGRAMO = 1
        LITRO = 2
        METRO = 3
        UNIDAD = 70
    }
    
    class FactusPaymentMethod {
        <<enumeration>>
        EFECTIVO = '10'
        TARJETA_CREDITO = '20'
        TARJETA_DEBITO = '21'
        TRANSFERENCIA = '31'
        CHEQUE = '32'
    }
    
    class FactusPaymentForm {
        <<enumeration>>
        CONTADO = '1'
        CREDITO = '2'
    }
    
    class FactusDocumentType {
        <<enumeration>>
        FACTURA_ELECTRONICA = '01'
        NOTA_CREDITO = '02'
        NOTA_DEBITO = '03'
    }
    
    RestauranteCliente --> FactusIdentificationDocument : maps to
    RestauranteCliente --> FactusLegalOrganizationType : maps to
    RestauranteCliente --> FactusTributeType : maps to
    
    RestaurantePlatillo --> FactusUnitMeasure : maps to
    RestaurantePlatillo --> FactusTributeType : maps to
    
    RestaurantePedido --> FactusPaymentMethod : maps to
    RestaurantePedido --> FactusPaymentForm : maps to
    
    ValidationResult <|-- FactusValidationResult
```

#### 7. Diagrama de Flujo - Proceso de Adaptación de Datos

```mermaid
flowchart TD
    A[Pedido del Restaurante] --> B{Validar Cliente}
    B -->|Válido| C[Adaptar Cliente]
    B -->|Inválido| E[Error: Datos cliente]
    
    C --> D{Validar Platillos}
    D -->|Válidos| F[Adaptar Platillos]
    D -->|Inválidos| G[Error: Datos platillos]
    
    F --> H{Validar Método Pago}
    H -->|Válido| I[Adaptar Método Pago]
    H -->|Inválido| J[Error: Método pago]
    
    I --> K{Calcular Totales}
    K --> L[Adaptar Descuentos]
    L --> M[Adaptar Propina]
    M --> N[Generar Código Referencia]
    N --> O[Crear FactusInvoiceRequest]
    
    O --> P{Validar Request Final}
    P -->|Válido| Q[Request Listo para Envío]
    P -->|Inválido| R[Error: Request inválido]
    
    E --> S[Mostrar Errores al Usuario]
    G --> S
    J --> S
    R --> S
    
    Q --> T[Enviar a Factus API]
    
    style A fill:#e1f5fe
    style Q fill:#c8e6c9
    style S fill:#ffcdd2
    style T fill:#fff3e0
```

#### 8. Diagrama de Arquitectura - Integración con Factus API

```mermaid
graph TB
    subgraph "Sistema del Restaurante"
        subgraph "Frontend"
            Dashboard[Dashboard]
            Facturacion[Facturación]
            Reportes[Reportes]
        end
        
        subgraph "Backend"
            APIRoutes[API Routes]
            Services[Servicios de Negocio]
            Patterns[Patrones de Diseño]
        end
        
        subgraph "Base de Datos"
            PostgreSQL[(PostgreSQL)]
        end
    end
    
    subgraph "Factus API Integration"
        subgraph "Servicios de Facturación"
            AuthService[FactusAuthService<br/>Singleton]
            InvoiceService[FactusInvoiceService]
            AdapterService[FactusAdapterService<br/>Adapter Pattern]
            InvoiceBuilder[FactusInvoiceBuilder<br/>Builder Pattern]
            ServiceFactory[FactusInvoiceServiceFactory<br/>Factory Pattern]
        end
        
        subgraph "Factus API Endpoints"
            OAuthEndpoint[OAuth2 Authentication]
            InvoiceEndpoint[Invoice Management]
            PDFEndpoint[PDF Generation]
            ValidationEndpoint[Data Validation]
        end
    end
    
    subgraph "Factus Cloud"
        FactusAPI[Factus API Server]
        DIANIntegration[DIAN Integration]
        CUFE[CUFE Generator]
        PDFGenerator[PDF Generator]
    end
    
    subgraph "External Systems"
        DIAN[DIAN<br/>Dirección de Impuestos]
        EmailService[Email Service]
        SMSService[SMS Service]
    end
    
    %% Conexiones principales
    Dashboard --> APIRoutes
    Facturacion --> APIRoutes
    Reportes --> APIRoutes
    
    APIRoutes --> Services
    Services --> Patterns
    
    Patterns --> AuthService
    Patterns --> InvoiceService
    Patterns --> AdapterService
    Patterns --> InvoiceBuilder
    Patterns --> ServiceFactory
    
    AuthService --> OAuthEndpoint
    InvoiceService --> InvoiceEndpoint
    InvoiceService --> PDFEndpoint
    AdapterService --> ValidationEndpoint
    
    OAuthEndpoint --> FactusAPI
    InvoiceEndpoint --> FactusAPI
    PDFEndpoint --> FactusAPI
    ValidationEndpoint --> FactusAPI
    
    FactusAPI --> DIANIntegration
    FactusAPI --> CUFE
    FactusAPI --> PDFGenerator
    
    DIANIntegration --> DIAN
    PDFGenerator --> EmailService
    PDFGenerator --> SMSService
    
    Services --> PostgreSQL
    
    %% Estilos
    classDef frontend fill:#e1f5fe
    classDef backend fill:#f3e5f5
    classDef factus fill:#fff3e0
    classDef external fill:#fce4ec
    classDef database fill:#f1f8e9
    
    class Dashboard,Facturacion,Reportes frontend
    class APIRoutes,Services,Patterns backend
    class AuthService,InvoiceService,AdapterService,InvoiceBuilder,ServiceFactory,OAuthEndpoint,InvoiceEndpoint,PDFEndpoint,ValidationEndpoint factus
    class DIAN,EmailService,SMSService external
    class PostgreSQL,FactusAPI,DIANIntegration,CUFE,PDFGenerator database
```

### 1. Singleton Pattern - Diagrama Detallado

```mermaid
classDiagram
    class DatabaseConnectionInterface {
        <<interface>>
        +connect() Promise~void~
        +disconnect() Promise~void~
        +isConnected() boolean
    }
    
    class DatabaseConnection {
        -static instance: DatabaseConnection
        -connected: boolean
        -connectionString: string
        -constructor()
        +static getInstance() DatabaseConnection
        +connect() Promise~void~
        +disconnect() Promise~void~
        +isConnected() boolean
        +getConnectionString() string
    }
    
    class ConfigurationManager {
        -static instance: ConfigurationManager
        -config: Map~string, any~
        -constructor()
        +static getInstance() ConfigurationManager
        +get(key) any
        +set(key, value) void
        +getAll() Record~string, any~
        +reset() void
        -loadDefaultConfig() void
    }
    
    class NotificationService {
        -static instance: NotificationService
        -notifications: Array~object~
        -constructor()
        +static getInstance() NotificationService
        +addNotification(message, type) string
        +getNotifications() Array~object~
        +removeNotification(id) void
        +clearAll() void
        +notifyNewOrder(orderId) void
        +notifyOrderReady(orderId) void
        +notifyLowStock(ingrediente) void
        +notifyError(message) void
    }
    
    DatabaseConnectionInterface <|.. DatabaseConnection
```

### 2. Factory Method Pattern - Diagrama Detallado

```mermaid
classDiagram
    class Platillo {
        <<interface>>
        +id: string
        +nombre: string
        +descripcion: string
        +precio: number
        +categoria: string
        +alergenos: string[]
        +tiempoPrep: number
        +obtenerPrecio() number
        +obtenerDescripcion() string
        +obtenerTiempoPrep() number
    }
    
    class PlatilloFactory {
        <<abstract>>
        +crearPlatillo()* Platillo
        +procesarPlatillo() Platillo
    }
    
    class EntradaFactory {
        +crearPlatillo() Platillo
    }
    
    class PlatoPrincipalFactory {
        +crearPlatillo() Platillo
    }
    
    class PostreFactory {
        +crearPlatillo() Platillo
    }
    
    class BebidaFactory {
        +crearPlatillo() Platillo
    }
    
    class Entrada {
        +id: string
        +nombre: string
        +descripcion: string
        +precio: number
        +categoria: string
        +alergenos: string[]
        +tiempoPrep: number
        +obtenerPrecio() number
        +obtenerDescripcion() string
        +obtenerTiempoPrep() number
    }
    
    class PlatoPrincipal {
        +id: string
        +nombre: string
        +descripcion: string
        +precio: number
        +categoria: string
        +alergenos: string[]
        +tiempoPrep: number
        +obtenerPrecio() number
        +obtenerDescripcion() string
        +obtenerTiempoPrep() number
    }
    
    class Postre {
        +id: string
        +nombre: string
        +descripcion: string
        +precio: number
        +categoria: string
        +alergenos: string[]
        +tiempoPrep: number
        +obtenerPrecio() number
        +obtenerDescripcion() string
        +obtenerTiempoPrep() number
    }
    
    class Bebida {
        +id: string
        +nombre: string
        +descripcion: string
        +precio: number
        +categoria: string
        +alergenos: string[]
        +tiempoPrep: number
        +obtenerPrecio() number
        +obtenerDescripcion() string
        +obtenerTiempoPrep() number
    }
    
    class Pedido {
        <<interface>>
        +id: string
        +tipo: string
        +estado: string
        +platillos: Platillo[]
        +total: number
        +obtenerTotal() number
        +agregarPlatillo(platillo) void
    }
    
    class PedidoFactory {
        <<abstract>>
        +crearPedido()* Pedido
    }
    
    class PedidoMesaFactory {
        +crearPedido() Pedido
    }
    
    class PedidoParaLlevarFactory {
        +crearPedido() Pedido
    }
    
    class PedidoDomicilioFactory {
        +crearPedido() Pedido
    }
    
    class PedidoMesa {
        +id: string
        +tipo: string
        +estado: string
        +platillos: Platillo[]
        +total: number
        +obtenerTotal() number
        +agregarPlatillo(platillo) void
    }
    
    class PedidoParaLlevar {
        +id: string
        +tipo: string
        +estado: string
        +platillos: Platillo[]
        +total: number
        +obtenerTotal() number
        +agregarPlatillo(platillo) void
    }
    
    class PedidoDomicilio {
        +id: string
        +tipo: string
        +estado: string
        +platillos: Platillo[]
        +total: number
        +costoDomicilio: number
        +obtenerTotal() number
        +agregarPlatillo(platillo) void
    }
    
    PlatilloFactory <|-- EntradaFactory
    PlatilloFactory <|-- PlatoPrincipalFactory
    PlatilloFactory <|-- PostreFactory
    PlatilloFactory <|-- BebidaFactory
    
    EntradaFactory --> Entrada : creates
    PlatoPrincipalFactory --> PlatoPrincipal : creates
    PostreFactory --> Postre : creates
    BebidaFactory --> Bebida : creates
    
    Platillo <|.. Entrada
    Platillo <|.. PlatoPrincipal
    Platillo <|.. Postre
    Platillo <|.. Bebida
    
    PedidoFactory <|-- PedidoMesaFactory
    PedidoFactory <|-- PedidoParaLlevarFactory
    PedidoFactory <|-- PedidoDomicilioFactory
    
    PedidoMesaFactory --> PedidoMesa : creates
    PedidoParaLlevarFactory --> PedidoParaLlevar : creates
    PedidoDomicilioFactory --> PedidoDomicilio : creates
    
    Pedido <|.. PedidoMesa
    Pedido <|.. PedidoParaLlevar
    Pedido <|.. PedidoDomicilio
```

### 3. Abstract Factory Pattern - Diagrama Detallado

```mermaid
classDiagram
    class RestauranteUIFactory {
        <<interface>>
        +crearBoton(texto, tipo) Boton
        +crearFormulario(campos) Formulario
        +crearTabla(columnas) Tabla
        +crearModal(titulo, contenido) Modal
    }
    
    class TemaClaroFactory {
        +crearBoton(texto, tipo) Boton
        +crearFormulario(campos) Formulario
        +crearTabla(columnas) Tabla
        +crearModal(titulo, contenido) Modal
    }
    
    class TemaOscuroFactory {
        +crearBoton(texto, tipo) Boton
        +crearFormulario(campos) Formulario
        +crearTabla(columnas) Tabla
        +crearModal(titulo, contenido) Modal
    }
    
    class Boton {
        <<interface>>
        +render() string
        +onClick() void
    }
    
    class Formulario {
        <<interface>>
        +render() string
        +validar() boolean
    }
    
    class Tabla {
        <<interface>>
        +render() string
        +agregarFila(datos) void
    }
    
    class Modal {
        <<interface>>
        +render() string
        +mostrar() void
        +ocultar() void
    }
    
    class BotonClaro {
        -texto: string
        -tipo: string
        +render() string
        +onClick() void
    }
    
    class BotonOscuro {
        -texto: string
        -tipo: string
        +render() string
        +onClick() void
    }
    
    class FormularioClaro {
        -campos: string[]
        +render() string
        +validar() boolean
    }
    
    class FormularioOscuro {
        -campos: string[]
        +render() string
        +validar() boolean
    }
    
    class TablaClara {
        -filas: any[][]
        -columnas: string[]
        +render() string
        +agregarFila(datos) void
    }
    
    class TablaOscura {
        -filas: any[][]
        -columnas: string[]
        +render() string
        +agregarFila(datos) void
    }
    
    class ModalClaro {
        -titulo: string
        -contenido: string
        +render() string
        +mostrar() void
        +ocultar() void
    }
    
    class ModalOscuro {
        -titulo: string
        -contenido: string
        +render() string
        +mostrar() void
        +ocultar() void
    }
    
    class ReporteFactory {
        <<interface>>
        +crearReporteVentas() Reporte
        +crearReporteInventario() Reporte
        +crearReporteClientes() Reporte
    }
    
    class ReportePDFFactory {
        +crearReporteVentas() Reporte
        +crearReporteInventario() Reporte
        +crearReporteClientes() Reporte
    }
    
    class ReporteExcelFactory {
        +crearReporteVentas() Reporte
        +crearReporteInventario() Reporte
        +crearReporteClientes() Reporte
    }
    
    class Reporte {
        <<interface>>
        +generar() string
        +exportar(formato) string
    }
    
    RestauranteUIFactory <|.. TemaClaroFactory
    RestauranteUIFactory <|.. TemaOscuroFactory
    
    TemaClaroFactory --> BotonClaro : creates
    TemaClaroFactory --> FormularioClaro : creates
    TemaClaroFactory --> TablaClara : creates
    TemaClaroFactory --> ModalClaro : creates
    
    TemaOscuroFactory --> BotonOscuro : creates
    TemaOscuroFactory --> FormularioOscuro : creates
    TemaOscuroFactory --> TablaOscura : creates
    TemaOscuroFactory --> ModalOscuro : creates
    
    Boton <|.. BotonClaro
    Boton <|.. BotonOscuro
    Formulario <|.. FormularioClaro
    Formulario <|.. FormularioOscuro
    Tabla <|.. TablaClara
    Tabla <|.. TablaOscura
    Modal <|.. ModalClaro
    Modal <|.. ModalOscuro
    
    ReporteFactory <|.. ReportePDFFactory
    ReporteFactory <|.. ReporteExcelFactory
    
    ReportePDFFactory --> Reporte : creates
    ReporteExcelFactory --> Reporte : creates
```

### 4. Prototype Pattern - Diagrama Detallado

```mermaid
classDiagram
    class Prototype {
        <<interface>>
        +clonar()* Prototype
    }
    
    class Platillo {
        +id: string
        +nombre: string
        +descripcion: string
        +precio: number
        +categoria: string
        +alergenos: string[]
        +ingredientes: string[]
        +tiempoPrep: number
        +imagen: string
        +clonar() Platillo
        +crearVariacion(nombreVariacion, modificaciones) Platillo
    }
    
    class MenuTemporada {
        +nombre: string
        +temporada: string
        +platillos: Platillo[]
        +fechaInicio: Date
        +fechaFin: Date
        +clonar() MenuTemporada
        +crearParaNuevaTemporada(nuevaTemporada) MenuTemporada
    }
    
    class PedidoRecurrente {
        +id: string
        +clienteId: string
        +platillos: Platillo[]
        +personalizaciones: string[]
        +frecuencia: string
        +nombre: string
        +clonar() PedidoRecurrente
        +crearPedido() PedidoRecurrente
    }
    
    class ClienteFrecuente {
        +id: string
        +nombre: string
        +email: string
        +telefono: string
        +alergias: string[]
        +preferencias: string[]
        +historialPedidos: PedidoRecurrente[]
        +puntos: number
        +clonar() ClienteFrecuente
        +crearPerfilSimilar(nuevoNombre, nuevoEmail) ClienteFrecuente
    }
    
    class PrototypeManager {
        -prototipos: Map~string, Prototype~
        +registrarPrototipo(clave, prototipo) void
        +obtenerPrototipo(clave) Prototype
        +listarPrototipos() string[]
    }
    
    class EjemplosPrototipo {
        <<static>>
        +crearPlatillosBase() Platillo[]
        +crearMenuTemporada() MenuTemporada
        +crearPedidoRecurrente() PedidoRecurrente
        +crearClienteFrecuente() ClienteFrecuente
    }
    
    Prototype <|.. Platillo
    Prototype <|.. MenuTemporada
    Prototype <|.. PedidoRecurrente
    Prototype <|.. ClienteFrecuente
    
    PrototypeManager --> Prototype : manages
    MenuTemporada --> Platillo : contains
    PedidoRecurrente --> Platillo : contains
    ClienteFrecuente --> PedidoRecurrente : contains
    
    EjemplosPrototipo --> Platillo : creates
    EjemplosPrototipo --> MenuTemporada : creates
    EjemplosPrototipo --> PedidoRecurrente : creates
    EjemplosPrototipo --> ClienteFrecuente : creates
```

### 5. Builder Pattern - Diagrama Detallado

```mermaid
classDiagram
    class PedidoCompleto {
        +id: string
        +clienteId: string
        +mesaId: string
        +tipo: string
        +platillos: PlatilloPedido[]
        +personalizaciones: string[]
        +descuentos: Descuento[]
        +total: number
        +notas: string
        +direccion: string
        +telefono: string
        +fechaCreacion: Date
    }
    
    class PlatilloPedido {
        +platilloId: string
        +nombre: string
        +cantidad: number
        +precioUnitario: number
        +personalizaciones: string[]
        +alergenos: string[]
        +tiempoPrep: number
    }
    
    class Descuento {
        +tipo: string
        +valor: number
        +descripcion: string
    }
    
    class PedidoBuilder {
        -pedido: Partial~PedidoCompleto~
        +configurarCliente(clienteId) PedidoBuilder
        +configurarMesa(mesaId) PedidoBuilder
        +configurarParaLlevar() PedidoBuilder
        +configurarDomicilio(direccion, telefono) PedidoBuilder
        +agregarPlatillo(platilloId, nombre, precio, cantidad) PedidoBuilder
        +personalizarPlatillo(platilloIndex, personalizacion) PedidoBuilder
        +agregarDescuentoPorcentaje(porcentaje, descripcion) PedidoBuilder
        +agregarDescuentoFijo(valor, descripcion) PedidoBuilder
        +agregarPlatoGratis(descripcion) PedidoBuilder
        +agregarNotas(notas) PedidoBuilder
        +agregarPersonalizacionGlobal(personalizacion) PedidoBuilder
        +build() PedidoCompleto
        +reset() PedidoBuilder
        -calcularTotal() void
    }
    
    class ReporteCompleto {
        +id: string
        +titulo: string
        +tipo: string
        +periodo: object
        +filtros: Record~string, any~
        +datos: any[]
        +graficos: Grafico[]
        +formato: string
        +fechaGeneracion: Date
    }
    
    class Grafico {
        +tipo: string
        +titulo: string
        +datos: any[]
        +configuracion: Record~string, any~
    }
    
    class ReporteBuilder {
        -reporte: Partial~ReporteCompleto~
        +configurarBasico(titulo, tipo) ReporteBuilder
        +configurarPeriodo(inicio, fin) ReporteBuilder
        +agregarFiltro(clave, valor) ReporteBuilder
        +agregarDatos(datos) ReporteBuilder
        +agregarGrafico(tipo, titulo, datos, configuracion) ReporteBuilder
        +configurarFormato(formato) ReporteBuilder
        +build() ReporteCompleto
    }
    
    class NotificacionCompleta {
        +id: string
        +tipo: string
        +destinatario: string
        +asunto: string
        +contenido: string
        +prioridad: string
        +programada: Date
        +adjuntos: string[]
        +metadata: Record~string, any~
    }
    
    class NotificacionBuilder {
        -notificacion: Partial~NotificacionCompleta~
        +configurarBasica(tipo, destinatario) NotificacionBuilder
        +configurarContenido(asunto, contenido) NotificacionBuilder
        +configurarPrioridad(prioridad) NotificacionBuilder
        +programar(fecha) NotificacionBuilder
        +agregarAdjunto(archivo) NotificacionBuilder
        +agregarMetadata(clave, valor) NotificacionBuilder
        +build() NotificacionCompleta
    }
    
    class PedidoDirector {
        -builder: PedidoBuilder
        +crearPedidoCompletoMesa(clienteId, mesaId) PedidoCompleto
        +crearPedidoDomicilio(clienteId, direccion, telefono) PedidoCompleto
    }
    
    PedidoBuilder --> PedidoCompleto : builds
    PedidoCompleto --> PlatilloPedido : contains
    PedidoCompleto --> Descuento : contains
    
    ReporteBuilder --> ReporteCompleto : builds
    ReporteCompleto --> Grafico : contains
    
    NotificacionBuilder --> NotificacionCompleta : builds
    
    PedidoDirector --> PedidoBuilder : uses
```

### 6. Decorator Pattern - Diagrama Detallado

```mermaid
classDiagram
    class PlatilloBase {
        <<interface>>
        +obtenerPrecio()* number
        +obtenerDescripcion()* string
        +obtenerTiempoPrep()* number
        +obtenerAlergenos()* string[]
    }
    
    class Platillo {
        +nombre: string
        +precio: number
        +descripcion: string
        +tiempoPrep: number
        +alergenos: string[]
        +obtenerPrecio() number
        +obtenerDescripcion() string
        +obtenerTiempoPrep() number
        +obtenerAlergenos() string[]
    }
    
    class PlatilloDecorador {
        <<abstract>>
        #platillo: PlatilloBase
        +obtenerPrecio() number
        +obtenerDescripcion() string
        +obtenerTiempoPrep() number
        +obtenerAlergenos() string[]
    }
    
    class PlatilloConExtraSalsa {
        -costoExtra: number
        +obtenerPrecio() number
        +obtenerDescripcion() string
        +obtenerTiempoPrep() number
    }
    
    class PlatilloSinGluten {
        -costoModificacion: number
        +obtenerPrecio() number
        +obtenerDescripcion() string
        +obtenerTiempoPrep() number
        +obtenerAlergenos() string[]
    }
    
    class PlatilloSinLacteos {
        -costoModificacion: number
        +obtenerPrecio() number
        +obtenerDescripcion() string
        +obtenerTiempoPrep() number
        +obtenerAlergenos() string[]
    }
    
    class PlatilloConExtraQueso {
        -costoExtra: number
        +obtenerPrecio() number
        +obtenerDescripcion() string
        +obtenerTiempoPrep() number
        +obtenerAlergenos() string[]
    }
    
    class PlatilloPicante {
        -costoExtra: number
        +obtenerPrecio() number
        +obtenerDescripcion() string
        +obtenerTiempoPrep() number
    }
    
    class PlatilloVegetariano {
        -costoModificacion: number
        +obtenerPrecio() number
        +obtenerDescripcion() string
        +obtenerTiempoPrep() number
    }
    
    class PedidoBase {
        <<interface>>
        +obtenerTotal()* number
        +obtenerDescripcion()* string
        +obtenerTiempoEntrega()* number
    }
    
    class Pedido {
        +platillos: PlatilloBase[]
        +tipo: string
        +obtenerTotal() number
        +obtenerDescripcion() string
        +obtenerTiempoEntrega() number
    }
    
    class PedidoDecorador {
        <<abstract>>
        #pedido: PedidoBase
        +obtenerTotal() number
        +obtenerDescripcion() string
        +obtenerTiempoEntrega() number
    }
    
    class PedidoConEnvio {
        -costoEnvio: number
        +obtenerTotal() number
        +obtenerDescripcion() string
        +obtenerTiempoEntrega() number
    }
    
    class PedidoConEmbalajeEspecial {
        -costoEmbalaje: number
        +obtenerTotal() number
        +obtenerDescripcion() string
        +obtenerTiempoEntrega() number
    }
    
    class PedidoConServicioVIP {
        -costoVIP: number
        +obtenerTotal() number
        +obtenerDescripcion() string
        +obtenerTiempoEntrega() number
    }
    
    class ClienteBase {
        <<interface>>
        +obtenerDescuento()* number
        +obtenerPuntos()* number
        +obtenerBeneficios()* string[]
    }
    
    class Cliente {
        +nombre: string
        +puntos: number
        +esFrecuente: boolean
        +obtenerDescuento() number
        +obtenerPuntos() number
        +obtenerBeneficios() string[]
    }
    
    class ClienteDecorador {
        <<abstract>>
        #cliente: ClienteBase
        +obtenerDescuento() number
        +obtenerPuntos() number
        +obtenerBeneficios() string[]
    }
    
    class ClienteVIP {
        +obtenerDescuento() number
        +obtenerPuntos() number
        +obtenerBeneficios() string[]
    }
    
    class ClientePremium {
        +obtenerDescuento() number
        +obtenerPuntos() number
        +obtenerBeneficios() string[]
    }
    
    class DecoradorFactory {
        <<static>>
        +crearPlatilloDecorado(platillo, modificadores) PlatilloBase
        +crearPedidoDecorado(pedido, servicios) PedidoBase
        +crearClienteDecorado(cliente, tipo) ClienteBase
    }
    
    PlatilloBase <|.. Platillo
    PlatilloBase <|.. PlatilloDecorador
    PlatilloDecorador <|-- PlatilloConExtraSalsa
    PlatilloDecorador <|-- PlatilloSinGluten
    PlatilloDecorador <|-- PlatilloSinLacteos
    PlatilloDecorador <|-- PlatilloConExtraQueso
    PlatilloDecorador <|-- PlatilloPicante
    PlatilloDecorador <|-- PlatilloVegetariano
    
    PedidoBase <|.. Pedido
    PedidoBase <|.. PedidoDecorador
    PedidoDecorador <|-- PedidoConEnvio
    PedidoDecorador <|-- PedidoConEmbalajeEspecial
    PedidoDecorador <|-- PedidoConServicioVIP
    
    ClienteBase <|.. Cliente
    ClienteBase <|.. ClienteDecorador
    ClienteDecorador <|-- ClienteVIP
    ClienteDecorador <|-- ClientePremium
    
    DecoradorFactory --> PlatilloDecorador : creates
    DecoradorFactory --> PedidoDecorador : creates
    DecoradorFactory --> ClienteDecorador : creates
```

### 7. Adapter Pattern - Diagrama Detallado

```mermaid
classDiagram
    class SistemaPagoInterno {
        <<interface>>
        +procesarPago(monto, metodo)* Promise~ResultadoPago~
        +obtenerMetodosDisponibles()* string[]
        +validarPago(datos)* boolean
    }
    
    class ResultadoPago {
        +exito: boolean
        +transaccionId: string
        +mensaje: string
        +codigoError: string
    }
    
    class ServicioCriptoExterno {
        +pagarConBitcoin(amount, walletAddress) Promise~object~
        +pagarConEthereum(amount, walletAddress) Promise~object~
    }
    
    class ServicioPayPalExterno {
        +procesarPagoPayPal(amount, email) Promise~object~
    }
    
    class ServicioStripeExterno {
        +procesarTarjeta(amount, cardToken) Promise~object~
    }
    
    class AdaptadorCripto {
        -servicioCripto: ServicioCriptoExterno
        +procesarPago(monto, metodo) Promise~ResultadoPago~
        +obtenerMetodosDisponibles() string[]
        +validarPago(datos) boolean
    }
    
    class AdaptadorPayPal {
        -servicioPayPal: ServicioPayPalExterno
        +procesarPago(monto, metodo) Promise~ResultadoPago~
        +obtenerMetodosDisponibles() string[]
        +validarPago(datos) boolean
    }
    
    class AdaptadorStripe {
        -servicioStripe: ServicioStripeExterno
        +procesarPago(monto, metodo) Promise~ResultadoPago~
        +obtenerMetodosDisponibles() string[]
        +validarPago(datos) boolean
    }
    
    class SistemaDeliveryInterno {
        <<interface>>
        +crearPedido(pedido)* Promise~ResultadoDelivery~
        +rastrearPedido(id)* Promise~EstadoDelivery~
        +cancelarPedido(id)* Promise~boolean~
    }
    
    class PedidoDelivery {
        +id: string
        +direccion: string
        +telefono: string
        +platillos: string[]
        +total: number
        +notas: string
    }
    
    class ResultadoDelivery {
        +exito: boolean
        +deliveryId: string
        +tiempoEstimado: number
        +mensaje: string
    }
    
    class EstadoDelivery {
        +estado: string
        +tiempoEstimado: number
        +ubicacion: string
    }
    
    class ServicioRappiExterno {
        +crearPedidoRappi(datos) Promise~object~
        +rastrearPedidoRappi(orderId) Promise~object~
    }
    
    class ServicioUberEatsExterno {
        +crearPedidoUberEats(datos) Promise~object~
        +rastrearPedidoUberEats(orderId) Promise~object~
    }
    
    class AdaptadorRappi {
        -servicioRappi: ServicioRappiExterno
        +crearPedido(pedido) Promise~ResultadoDelivery~
        +rastrearPedido(id) Promise~EstadoDelivery~
        +cancelarPedido(id) Promise~boolean~
    }
    
    class AdaptadorUberEats {
        -servicioUberEats: ServicioUberEatsExterno
        +crearPedido(pedido) Promise~ResultadoDelivery~
        +rastrearPedido(id) Promise~EstadoDelivery~
        +cancelarPedido(id) Promise~boolean~
    }
    
    class GeneradorReporteInterno {
        <<interface>>
        +generarReporte(datos, formato)* string
        +exportarReporte(datos, formato)* Buffer
    }
    
    class ServicioPDFExterno {
        +generarPDF(datos) Promise~Buffer~
    }
    
    class ServicioExcelExterno {
        +generarExcel(datos) Promise~Buffer~
    }
    
    class AdaptadorReportePDF {
        -servicioPDF: ServicioPDFExterno
        +generarReporte(datos, formato) string
        +exportarReporte(datos, formato) Promise~Buffer~
    }
    
    class AdaptadorReporteExcel {
        -servicioExcel: ServicioExcelExterno
        +generarReporte(datos, formato) string
        +exportarReporte(datos, formato) Promise~Buffer~
    }
    
    class AdaptadorFactory {
        <<static>>
        +crearAdaptadorPago(tipo) SistemaPagoInterno
        +crearAdaptadorDelivery(tipo) SistemaDeliveryInterno
        +crearAdaptadorReporte(tipo) GeneradorReporteInterno
    }
    
    SistemaPagoInterno <|.. AdaptadorCripto
    SistemaPagoInterno <|.. AdaptadorPayPal
    SistemaPagoInterno <|.. AdaptadorStripe
    
    AdaptadorCripto --> ServicioCriptoExterno : uses
    AdaptadorPayPal --> ServicioPayPalExterno : uses
    AdaptadorStripe --> ServicioStripeExterno : uses
    
    SistemaDeliveryInterno <|.. AdaptadorRappi
    SistemaDeliveryInterno <|.. AdaptadorUberEats
    
    AdaptadorRappi --> ServicioRappiExterno : uses
    AdaptadorUberEats --> ServicioUberEatsExterno : uses
    
    GeneradorReporteInterno <|.. AdaptadorReportePDF
    GeneradorReporteInterno <|.. AdaptadorReporteExcel
    
    AdaptadorReportePDF --> ServicioPDFExterno : uses
    AdaptadorReporteExcel --> ServicioExcelExterno : uses
    
    AdaptadorFactory --> SistemaPagoInterno : creates
    AdaptadorFactory --> SistemaDeliveryInterno : creates
    AdaptadorFactory --> GeneradorReporteInterno : creates
```

### 8. Bridge Pattern - Diagrama Detallado

```mermaid
classDiagram
    class FormatoReporte {
        <<interface>>
        +exportar(datos)* string
        +obtenerExtension()* string
        +obtenerMimeType()* string
    }
    
    class ReportePDF {
        +exportar(datos) string
        +obtenerExtension() string
        +obtenerMimeType() string
    }
    
    class ReporteExcel {
        +exportar(datos) string
        +obtenerExtension() string
        +obtenerMimeType() string
    }
    
    class ReporteJSON {
        +exportar(datos) string
        +obtenerExtension() string
        +obtenerMimeType() string
    }
    
    class ReporteCSV {
        +exportar(datos) string
        +obtenerExtension() string
        +obtenerMimeType() string
    }
    
    class Reporte {
        <<abstract>>
        #formato: FormatoReporte
        +generar()* string
        +obtenerDatos()* any[]
        +exportar() string
        +obtenerNombreArchivo() string
        +obtenerMimeType() string
    }
    
    class ReporteVentas {
        -fechaInicio: Date
        -fechaFin: Date
        -datosVentas: any[]
        +generar() string
        +obtenerDatos() any[]
        -cargarDatosVentas() void
    }
    
    class ReporteInventario {
        -datosInventario: any[]
        +generar() string
        +obtenerDatos() any[]
        -cargarDatosInventario() void
    }
    
    class ReporteClientes {
        -datosClientes: any[]
        +generar() string
        +obtenerDatos() any[]
        -cargarDatosClientes() void
    }
    
    class CanalNotificacion {
        <<interface>>
        +enviar(mensaje, destinatario)* Promise~boolean~
        +obtenerTipo()* string
    }
    
    class CanalEmail {
        +enviar(mensaje, destinatario) Promise~boolean~
        +obtenerTipo() string
    }
    
    class CanalSMS {
        +enviar(mensaje, destinatario) Promise~boolean~
        +obtenerTipo() string
    }
    
    class CanalPush {
        +enviar(mensaje, destinatario) Promise~boolean~
        +obtenerTipo() string
    }
    
    class Notificacion {
        <<abstract>>
        #canal: CanalNotificacion
        +generarMensaje()* string
        +obtenerDestinatario()* string
        +enviar() Promise~boolean~
        +obtenerTipoCanal() string
    }
    
    class NotificacionStockBajo {
        -ingrediente: string
        -stockActual: number
        -stockMinimo: number
        +generarMensaje() string
        +obtenerDestinatario() string
    }
    
    class NotificacionPedidoListo {
        -numeroPedido: string
        -clienteTelefono: string
        +generarMensaje() string
        +obtenerDestinatario() string
    }
    
    class ImplementacionPersistencia {
        <<interface>>
        +guardar(datos)* Promise~boolean~
        +cargar(id)* Promise~any~
        +eliminar(id)* Promise~boolean~
        +listar()* Promise~any[]~
    }
    
    class PersistenciaPostgreSQL {
        +guardar(datos) Promise~boolean~
        +cargar(id) Promise~any~
        +eliminar(id) Promise~boolean~
        +listar() Promise~any[]~
    }
    
    class PersistenciaMongoDB {
        +guardar(datos) Promise~boolean~
        +cargar(id) Promise~any~
        +eliminar(id) Promise~boolean~
        +listar() Promise~any[]~
    }
    
    class Repositorio {
        <<abstract>>
        #persistencia: ImplementacionPersistencia
        +guardar(entidad)* Promise~boolean~
        +cargar(id)* Promise~any~
        +eliminar(id)* Promise~boolean~
        +listar()* Promise~any[]~
    }
    
    class RepositorioPedidos {
        +guardar(pedido) Promise~boolean~
        +cargar(id) Promise~any~
        +eliminar(id) Promise~boolean~
        +listar() Promise~any[]~
    }
    
    class BridgeFactory {
        <<static>>
        +crearReporte(tipo, formato) Reporte
        +crearNotificacion(tipo, canal, datos) Notificacion
        +crearRepositorio(tipo) RepositorioPedidos
    }
    
    FormatoReporte <|.. ReportePDF
    FormatoReporte <|.. ReporteExcel
    FormatoReporte <|.. ReporteJSON
    FormatoReporte <|.. ReporteCSV
    
    Reporte <|-- ReporteVentas
    Reporte <|-- ReporteInventario
    Reporte <|-- ReporteClientes
    
    Reporte --> FormatoReporte : uses
    
    CanalNotificacion <|.. CanalEmail
    CanalNotificacion <|.. CanalSMS
    CanalNotificacion <|.. CanalPush
    
    Notificacion <|-- NotificacionStockBajo
    Notificacion <|-- NotificacionPedidoListo
    
    Notificacion --> CanalNotificacion : uses
    
    ImplementacionPersistencia <|.. PersistenciaPostgreSQL
    ImplementacionPersistencia <|.. PersistenciaMongoDB
    
    Repositorio <|-- RepositorioPedidos
    
    Repositorio --> ImplementacionPersistencia : uses
    
    BridgeFactory --> Reporte : creates
    BridgeFactory --> Notificacion : creates
    BridgeFactory --> RepositorioPedidos : creates
```

### 9. Proxy Pattern - Diagrama Detallado

```mermaid
classDiagram
    class Inventario {
        <<interface>>
        +obtenerIngredientes()* Promise~Ingrediente[]~
        +obtenerIngrediente(id)* Promise~Ingrediente~
        +actualizarStock(id, cantidad)* Promise~boolean~
        +agregarIngrediente(ingrediente)* Promise~boolean~
        +eliminarIngrediente(id)* Promise~boolean~
    }
    
    class Ingrediente {
        +id: string
        +nombre: string
        +stock: number
        +stockMinimo: number
        +costo: number
        +unidad: string
        +activo: boolean
    }
    
    class Usuario {
        +id: string
        +nombre: string
        +rol: string
        +permisos: string[]
    }
    
    class InventarioReal {
        -ingredientes: Ingrediente[]
        +obtenerIngredientes() Promise~Ingrediente[]~
        +obtenerIngrediente(id) Promise~Ingrediente~
        +actualizarStock(id, cantidad) Promise~boolean~
        +agregarIngrediente(ingrediente) Promise~boolean~
        +eliminarIngrediente(id) Promise~boolean~
        -cargarDatosIniciales() void
    }
    
    class ProxyInventario {
        -inventarioReal: InventarioReal
        -usuarioActual: Usuario
        -cache: Map~string, Ingrediente[]~
        -cacheTimestamp: Map~string, number~
        -CACHE_DURATION: number
        +establecerUsuario(usuario) void
        +obtenerIngredientes() Promise~Ingrediente[]~
        +obtenerIngrediente(id) Promise~Ingrediente~
        +actualizarStock(id, cantidad) Promise~boolean~
        +agregarIngrediente(ingrediente) Promise~boolean~
        +eliminarIngrediente(id) Promise~boolean~
        +limpiarCache() void
        -tienePermiso(permiso) boolean
        -esCacheValido(clave) boolean
        -invalidarCache(clave) void
    }
    
    class PedidoService {
        <<interface>>
        +obtenerPedido(id)* Promise~Pedido~
        +actualizarEstado(id, estado)* Promise~boolean~
        +agregarPlatillo(id, platillo)* Promise~boolean~
    }
    
    class Pedido {
        +id: string
        +estado: string
        +platillos: any[]
        +clienteId: string
        +mesaId: string
        +total: number
        +fechaCreacion: Date
    }
    
    class PedidoServiceReal {
        -pedidos: Pedido[]
        +obtenerPedido(id) Promise~Pedido~
        +actualizarEstado(id, estado) Promise~boolean~
        +agregarPlatillo(id, platillo) Promise~boolean~
        -cargarDatosIniciales() void
    }
    
    class ProxyPedidoService {
        -pedidoServiceReal: PedidoServiceReal
        -cache: Map~string, Pedido~
        -cacheTimestamp: Map~string, number~
        -CACHE_DURATION: number
        +obtenerPedido(id) Promise~Pedido~
        +actualizarEstado(id, estado) Promise~boolean~
        +agregarPlatillo(id, platillo) Promise~boolean~
        +limpiarCache() void
        -esTransicionValida(estadoActual, estadoNuevo) boolean
        -esCacheValido(clave) boolean
    }
    
    class ReporteService {
        <<interface>>
        +generarReporteVentas(fechaInicio, fechaFin)* Promise~string~
        +generarReporteInventario()* Promise~string~
        +generarReporteClientes()* Promise~string~
    }
    
    class ReporteServiceReal {
        +generarReporteVentas(fechaInicio, fechaFin) Promise~string~
        +generarReporteInventario() Promise~string~
        +generarReporteClientes() Promise~string~
    }
    
    class ProxyReporteService {
        -reporteServiceReal: ReporteServiceReal
        -cache: Map~string, string~
        -cacheTimestamp: Map~string, number~
        -CACHE_DURATION: number
        +generarReporteVentas(fechaInicio, fechaFin) Promise~string~
        +generarReporteInventario() Promise~string~
        +generarReporteClientes() Promise~string~
        +limpiarCache() void
        -esCacheValido(clave) boolean
    }
    
    class ProxyFactory {
        <<static>>
        +crearProxyInventario() ProxyInventario
        +crearProxyPedidoService() ProxyPedidoService
        +crearProxyReporteService() ProxyReporteService
    }
    
    Inventario <|.. InventarioReal
    Inventario <|.. ProxyInventario
    
    ProxyInventario --> InventarioReal : delegates to
    ProxyInventario --> Usuario : validates with
    ProxyInventario --> Ingrediente : manages
    
    PedidoService <|.. PedidoServiceReal
    PedidoService <|.. ProxyPedidoService
    
    ProxyPedidoService --> PedidoServiceReal : delegates to
    ProxyPedidoService --> Pedido : manages
    
    ReporteService <|.. ReporteServiceReal
    ReporteService <|.. ProxyReporteService
    
    ProxyReporteService --> ReporteServiceReal : delegates to
    
    ProxyFactory --> ProxyInventario : creates
    ProxyFactory --> ProxyPedidoService : creates
    ProxyFactory --> ProxyReporteService : creates
```

## Diagramas de Secuencia Detallados

### 1. Secuencia de Creación de Pedido Completo

```mermaid
sequenceDiagram
    participant Cliente
    participant PedidoBuilder
    participant PlatilloFactory
    participant DecoradorFactory
    participant NotificationService
    participant DatabaseConnection
    participant ProxyInventario
    
    Cliente->>PedidoBuilder: new PedidoBuilder()
    PedidoBuilder->>PedidoBuilder: inicializar pedido
    
    Cliente->>PedidoBuilder: configurarCliente("cliente123")
    PedidoBuilder->>PedidoBuilder: establecer clienteId
    
    Cliente->>PedidoBuilder: configurarMesa("mesa5")
    PedidoBuilder->>PedidoBuilder: establecer mesaId y tipo="MESA"
    
    Cliente->>PedidoBuilder: agregarPlatillo("1", "Hamburguesa", 25000, 1)
    PedidoBuilder->>PlatilloFactory: crearPlatillo()
    PlatilloFactory->>PedidoBuilder: platillo creado
    PedidoBuilder->>PedidoBuilder: agregar a platillos[]
    PedidoBuilder->>PedidoBuilder: calcularTotal()
    
    Cliente->>PedidoBuilder: personalizarPlatillo(0, "sin cebolla")
    PedidoBuilder->>DecoradorFactory: crearPlatilloDecorado(platillo, ["sin cebolla"])
    DecoradorFactory->>PedidoBuilder: platillo decorado
    PedidoBuilder->>PedidoBuilder: actualizar personalizaciones
    
    Cliente->>PedidoBuilder: agregarDescuentoPorcentaje(10, "Cliente frecuente")
    PedidoBuilder->>PedidoBuilder: agregar descuento
    PedidoBuilder->>PedidoBuilder: recalcularTotal()
    
    Cliente->>PedidoBuilder: build()
    PedidoBuilder->>PedidoBuilder: validar pedido
    alt Pedido válido
        PedidoBuilder->>DatabaseConnection: guardar pedido
        DatabaseConnection->>PedidoBuilder: pedido guardado exitosamente
        PedidoBuilder->>NotificationService: notifyNewOrder(orderId)
        NotificationService->>Cliente: notificación enviada
        PedidoBuilder->>Cliente: PedidoCompleto creado
    else Pedido inválido
        PedidoBuilder->>Cliente: Error: "Debe especificar el tipo de pedido"
    end
```

### 2. Secuencia de Decoración de Platillo

```mermaid
sequenceDiagram
    participant Cliente
    participant DecoradorFactory
    participant PlatilloConExtraSalsa
    participant PlatilloSinGluten
    participant PlatilloBase
    
    Cliente->>DecoradorFactory: crearPlatilloDecorado(platilloBase, ["extra salsa", "sin gluten"])
    
    DecoradorFactory->>PlatilloBase: obtenerPrecio()
    PlatilloBase->>DecoradorFactory: precio base: 25000
    
    DecoradorFactory->>PlatilloConExtraSalsa: new PlatilloConExtraSalsa(platilloBase)
    PlatilloConExtraSalsa->>PlatilloConExtraSalsa: costoExtra = 2000
    
    DecoradorFactory->>PlatilloConExtraSalsa: obtenerPrecio()
    PlatilloConExtraSalsa->>PlatilloConExtraSalsa: calcular precio + costoExtra
    PlatilloConExtraSalsa->>DecoradorFactory: precio: 27000
    
    DecoradorFactory->>PlatilloSinGluten: new PlatilloSinGluten(platilloConExtraSalsa)
    PlatilloSinGluten->>PlatilloSinGluten: costoModificacion = 3000
    
    DecoradorFactory->>PlatilloSinGluten: obtenerPrecio()
    PlatilloSinGluten->>PlatilloSinGluten: calcular precio + costoModificacion
    PlatilloSinGluten->>DecoradorFactory: precio final: 30000
    
    DecoradorFactory->>PlatilloSinGluten: obtenerDescripcion()
    PlatilloSinGluten->>PlatilloSinGluten: construir descripción con modificaciones
    PlatilloSinGluten->>DecoradorFactory: descripción: "Hamburguesa clásica + Extra salsa (Sin gluten)"
    
    DecoradorFactory->>Cliente: platillo decorado completo
```

### 3. Secuencia de Proxy con Validación y Caché

```mermaid
sequenceDiagram
    participant Cliente
    participant ProxyInventario
    participant InventarioReal
    participant Usuario
    participant Cache
    
    Cliente->>ProxyInventario: establecerUsuario(usuario)
    ProxyInventario->>ProxyInventario: usuarioActual = usuario
    
    Cliente->>ProxyInventario: obtenerIngredientes()
    ProxyInventario->>ProxyInventario: tienePermiso("INVENTARIO_READ")
    ProxyInventario->>Usuario: verificar permisos
    Usuario->>ProxyInventario: permisos válidos
    
    ProxyInventario->>Cache: verificar caché("ingredientes")
    Cache->>ProxyInventario: caché no existe o expirado
    
    ProxyInventario->>InventarioReal: obtenerIngredientes()
    InventarioReal->>InventarioReal: simular acceso a BD (1000ms)
    InventarioReal->>ProxyInventario: ingredientes[]
    
    ProxyInventario->>Cache: guardar en caché("ingredientes", ingredientes)
    ProxyInventario->>Cliente: ingredientes[]
    
    Note over Cliente, Cache: Segunda llamada (caché válido)
    
    Cliente->>ProxyInventario: obtenerIngredientes()
    ProxyInventario->>ProxyInventario: tienePermiso("INVENTARIO_READ")
    ProxyInventario->>Cache: verificar caché("ingredientes")
    Cache->>ProxyInventario: caché válido
    ProxyInventario->>Cliente: ingredientes[] (desde caché)
    
    Note over Cliente, Cache: Operación de escritura
    
    Cliente->>ProxyInventario: actualizarStock("1", 30)
    ProxyInventario->>ProxyInventario: tienePermiso("INVENTARIO_WRITE")
    ProxyInventario->>Usuario: verificar permisos
    Usuario->>ProxyInventario: permisos válidos
    
    ProxyInventario->>ProxyInventario: validar cantidad >= 0
    ProxyInventario->>InventarioReal: actualizarStock("1", 30)
    InventarioReal->>ProxyInventario: actualización exitosa
    
    ProxyInventario->>Cache: invalidarCache("ingrediente_1")
    ProxyInventario->>Cache: invalidarCache("ingredientes")
    ProxyInventario->>Cliente: true
```

### 4. Secuencia de Adaptador para Pagos Externos

```mermaid
sequenceDiagram
    participant Cliente
    participant AdaptadorCripto
    participant ServicioCriptoExterno
    participant SistemaInterno
    
    Cliente->>AdaptadorCripto: procesarPago(50000, "BITCOIN")
    AdaptadorCripto->>AdaptadorCripto: validarPago(datos)
    AdaptadorCripto->>AdaptadorCripto: datos válidos
    
    AdaptadorCripto->>AdaptadorCripto: walletAddress = "restaurant_wallet"
    
    alt Método BITCOIN
        AdaptadorCripto->>ServicioCriptoExterno: pagarConBitcoin(50000, walletAddress)
        ServicioCriptoExterno->>ServicioCriptoExterno: simular procesamiento (2000ms)
        ServicioCriptoExterno->>AdaptadorCripto: {success: true, txHash: "btc_abc123"}
    else Método ETHEREUM
        AdaptadorCripto->>ServicioCriptoExterno: pagarConEthereum(50000, walletAddress)
        ServicioCriptoExterno->>AdaptadorCripto: {success: true, txHash: "eth_def456"}
    else Método no soportado
        AdaptadorCripto->>Cliente: {exito: false, mensaje: "Método no soportado"}
    end
    
    AdaptadorCripto->>AdaptadorCripto: adaptar resultado a formato interno
    
    alt Pago exitoso
        AdaptadorCripto->>Cliente: {exito: true, transaccionId: "btc_abc123", mensaje: "Pago procesado exitosamente"}
    else Error en pago
        AdaptadorCripto->>Cliente: {exito: false, mensaje: "Error en pago", codigoError: "PAYMENT_FAILED"}
    end
    
    Note over Cliente, SistemaInterno: El sistema interno recibe el resultado en formato estándar
    Cliente->>SistemaInterno: procesar resultado del pago
```

### 5. Secuencia de Bridge para Reportes

```mermaid
sequenceDiagram
    participant Cliente
    participant ReporteVentas
    participant FormatoPDF
    participant FormatoExcel
    participant DatosVentas
    
    Cliente->>ReporteVentas: new ReporteVentas(formatoPDF, fechaInicio, fechaFin)
    ReporteVentas->>ReporteVentas: formato = formatoPDF
    ReporteVentas->>ReporteVentas: cargarDatosVentas()
    ReporteVentas->>DatosVentas: obtener datos de ventas
    DatosVentas->>ReporteVentas: datos de ventas[]
    
    Cliente->>ReporteVentas: generar()
    ReporteVentas->>ReporteVentas: obtenerDatos()
    ReporteVentas->>ReporteVentas: calcular totalVentas
    ReporteVentas->>Cliente: "Reporte de Ventas - Total: $150,000"
    
    Cliente->>ReporteVentas: exportar()
    ReporteVentas->>ReporteVentas: obtenerDatos()
    ReporteVentas->>FormatoPDF: exportar(datos)
    FormatoPDF->>FormatoPDF: generar PDF con datos
    FormatoPDF->>ReporteVentas: "PDF generado con 5 registros"
    ReporteVentas->>Cliente: contenido PDF
    
    Note over Cliente, DatosVentas: Cambio de formato sin modificar lógica de negocio
    
    Cliente->>ReporteVentas: cambiarFormato(formatoExcel)
    ReporteVentas->>ReporteVentas: formato = formatoExcel
    
    Cliente->>ReporteVentas: exportar()
    ReporteVentas->>ReporteVentas: obtenerDatos()
    ReporteVentas->>FormatoExcel: exportar(datos)
    FormatoExcel->>FormatoExcel: generar Excel con datos
    FormatoExcel->>ReporteVentas: "Excel generado con 5 registros"
    ReporteVentas->>Cliente: contenido Excel
```

---

## Diagrama de Despliegue - Railway

### Diagrama de Despliegue en Railway Platform

Este diagrama muestra la arquitectura de despliegue del sistema en uno de los servidores de Railway, incluyendo los servicios, bases de datos y conexiones externas.

```mermaid
graph TB
    subgraph "Railway Platform"
        subgraph "Proyecto: repository-global"
            subgraph "Environment: Production"
                subgraph "Service: ObraBlanca-POS"
                    NextJSApp["Next.js Application<br/>- Node.js 20.x<br/>- Next.js 18.0<br/>- Puerto: Dinámico<br/>- Build: npm run build<br/>- Start: npm start"]
                    
                    EnvVars["Variables de Entorno<br/>- DATABASE_URL<br/>- NEXTAUTH_SECRET<br/>- FACTUS_CLIENT_ID<br/>- FACTUS_CLIENT_SECRET<br/>- FACTUS_API_URL<br/>- PORT"]
                end
                
                subgraph "Service: PostgreSQL Database"
                    PostgreSQL["PostgreSQL 15<br/>- Database: restaurant_db<br/>- Usuario: postgres<br/>- Almacenamiento: Persistente<br/>- Backup: Automático"]
                    
                    PrismaClient["Prisma Client<br/>- ORM Layer<br/>- Migrations<br/>- Schema Management"]
                end
                
                subgraph "Service: Conecta2-Telecomunicaciones"
                    CommsService["Servicio de Comunicaciones<br/>- SMS/Email<br/>- Notificaciones<br/>- Webhooks"]
                end
                
                subgraph "Service: MiComercio360"
                    CommerceService["Servicio de Comercio<br/>- Integraciones<br/>- APIs Externas"]
                end
            end
        end
        
        subgraph "Railway Network"
            RailwayNet["Railway Private Network<br/>- DNS Interno<br/>- Service Discovery<br/>- Load Balancing"]
        end
        
        subgraph "Railway Resources"
            RailwayVolume["Persistent Volumes<br/>- Database Storage<br/>- Backup Storage"]
            RailwayLogs["Logs & Monitoring<br/>- Build Logs<br/>- Runtime Logs<br/>- Metrics"]
        end
    end
    
    subgraph "Internet"
        Users["Usuarios<br/>- Navegadores Web<br/>- Mobile Apps"]
        
        Domain["Dominio Custom<br/>- HTTPS/SSL<br/>- Railway Domain<br/>- Custom Domain"]
    end
    
    subgraph "External Services"
        FactusAPI["Factus API<br/>- OAuth2 Auth<br/>- Invoice Management<br/>- PDF Generation<br/>- DIAN Integration"]
        
        DIAN["DIAN<br/>- Validación Fiscal<br/>- CUFE Generation"]
    end
    
    subgraph "CI/CD Pipeline"
        GitHub["GitHub Repository<br/>- Source Code<br/>- Auto Deploy<br/>- Branch Protection"]
        
        RailwayBuild["Railway Build<br/>- Docker Build<br/>- npm install<br/>- npm run build<br/>- Prisma Generate"]
    end
    
    %% Conexiones Usuarios
    Users -->|HTTPS| Domain
    Domain -->|Proxy| NextJSApp
    
    %% Conexiones Internas Railway
    NextJSApp -->|DATABASE_URL| PostgreSQL
    NextJSApp -->|Internal Network| CommsService
    NextJSApp -->|Internal Network| CommerceService
    NextJSApp -->|Read/Write| RailwayVolume
    
    PostgreSQL -->|Storage| RailwayVolume
    PostgreSQL -->|ORM| PrismaClient
    PrismaClient -->|Connection| NextJSApp
    
    NextJSApp -->|Environment| EnvVars
    NextJSApp -->|Logs| RailwayLogs
    NextJSApp -->|Network| RailwayNet
    
    %% Conexiones Externas
    NextJSApp -->|HTTPS API| FactusAPI
    FactusAPI -->|API| DIAN
    
    CommsService -->|SMTP/SMS| ExternalServices[Servicios Externos]
    
    %% CI/CD
    GitHub -->|Webhook| RailwayBuild
    RailwayBuild -->|Deploy| NextJSApp
    RailwayBuild -->|Deploy| PostgreSQL
    
    %% Estilos
    classDef railwayService fill:#0f0f23,stroke:#6366f1,stroke-width:2px,color:#fff
    classDef database fill:#336791,stroke:#4a90e2,stroke-width:2px,color:#fff
    classDef external fill:#ff6b6b,stroke:#ee5a6f,stroke-width:2px,color:#fff
    classDef network fill:#4ecdc4,stroke:#45b7aa,stroke-width:2px,color:#fff
    classDef user fill:#95e1d3,stroke:#6bcfbf,stroke-width:2px
    
    class NextJSApp,CommsService,CommerceService railwayService
    class PostgreSQL,PrismaClient database
    class FactusAPI,DIAN,ExternalServices external
    class RailwayNet,RailwayVolume,RailwayLogs network
    class Users,Domain user
```

### Componentes del Despliegue

#### 1. **Next.js Application (ObraBlanca-POS)**
- **Tecnología**: Node.js 20.x, Next.js 18.0
- **Build**: `npm run build`
- **Start**: `npm start`
- **Puerto**: Dinámico (asignado por Railway)
- **Variables de Entorno**: 
  - `DATABASE_URL`: Conexión a PostgreSQL
  - `NEXTAUTH_SECRET`: Secret para autenticación
  - `FACTUS_CLIENT_ID` / `FACTUS_CLIENT_SECRET`: Credenciales Factus API
  - `FACTUS_API_URL`: URL de la API de Factus
  - `PORT`: Puerto de la aplicación

#### 2. **PostgreSQL Database**
- **Versión**: PostgreSQL 15
- **Base de Datos**: `restaurant_db`
- **Características**:
  - Almacenamiento persistente
  - Backups automáticos
  - Acceso mediante Prisma ORM
  - Migrations automáticas

#### 3. **Servicios Adicionales**
- **Conecta2-Telecomunicaciones**: Servicio de comunicaciones (SMS/Email)
- **MiComercio360**: Servicio de integraciones comerciales

#### 4. **Red y Recursos**
- **Railway Private Network**: Red interna para comunicación entre servicios
- **Persistent Volumes**: Almacenamiento para base de datos y backups
- **Logs & Monitoring**: Sistema de logs y métricas integrado

### Flujo de Despliegue

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GitHub as GitHub Repo
    participant RailwayCI as Railway CI/CD
    participant RailwayBuild as Railway Build
    participant RailwayDeploy as Railway Deploy
    participant NextJS as Next.js App
    participant PostgreSQL as PostgreSQL DB
    
    Dev->>GitHub: Push código
    GitHub->>RailwayCI: Webhook trigger
    RailwayCI->>RailwayBuild: Iniciar build
    
    RailwayBuild->>RailwayBuild: npm install
    RailwayBuild->>RailwayBuild: npm run build
    RailwayBuild->>RailwayBuild: prisma generate
    RailwayBuild->>RailwayBuild: Validar build
    
    RailwayBuild->>RailwayDeploy: Build exitoso
    RailwayDeploy->>NextJS: Desplegar aplicación
    RailwayDeploy->>PostgreSQL: Verificar conexión DB
    
    NextJS->>PostgreSQL: Conectar con DATABASE_URL
    PostgreSQL-->>NextJS: Conexión establecida
    
    NextJS->>NextJS: Verificar migrations
    NextJS->>PostgreSQL: Ejecutar migrations si es necesario
    
    NextJS-->>RailwayDeploy: Aplicación lista
    RailwayDeploy-->>Dev: Deploy completado
    
    Note over NextJS: Aplicación accesible en dominio Railway
```

### Configuración de Variables de Entorno

Las siguientes variables de entorno deben configurarse en Railway:

```env
# Base de Datos
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require

# Next.js
NEXTAUTH_SECRET=your-secret-key
NODE_ENV=production
PORT=3000

# Factus API
FACTUS_CLIENT_ID=your-client-id
FACTUS_CLIENT_SECRET=your-client-secret
FACTUS_API_URL=https://api.factus.com.co
FACTUS_REDIRECT_URI=https://your-app.railway.app/api/auth/callback

# Opcional
NEXT_PUBLIC_APP_URL=https://your-app.railway.app
```

### Características del Despliegue en Railway

#### ✅ **Ventajas**
- **Despliegue Automático**: CI/CD integrado con GitHub
- **Escalabilidad**: Escalado automático según carga
- **Monitoreo**: Logs y métricas integradas
- **Backups**: Backups automáticos de base de datos
- **SSL/HTTPS**: Certificados SSL automáticos
- **Red Privada**: Comunicación segura entre servicios
- **Variables de Entorno**: Gestión centralizada de configuración

#### 🔒 **Seguridad**
- Variables de entorno encriptadas
- Red privada entre servicios
- Conexiones SSL/TLS
- Autenticación OAuth2 para APIs externas

#### 📊 **Monitoreo**
- Logs de aplicación en tiempo real
- Métricas de rendimiento
- Alertas automáticas
- Historial de deployments

----
