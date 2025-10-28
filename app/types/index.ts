/**
 * Tipos TypeScript para el Sistema de Gestión de Restaurante
 * Define todas las interfaces y tipos utilizados en el sistema
 */

// ===== TIPOS BASE =====

export interface BaseEntity {
    id: string
    createdAt: Date
    updatedAt: Date
}

// ===== ENUMS =====

export enum EstadoMesa {
    DISPONIBLE = 'DISPONIBLE',
    OCUPADA = 'OCUPADA',
    RESERVADA = 'RESERVADA',
    MANTENIMIENTO = 'MANTENIMIENTO'
}

export enum EstadoReserva {
    CONFIRMADA = 'CONFIRMADA',
    CANCELADA = 'CANCELADA',
    COMPLETADA = 'COMPLETADA',
    NO_SHOW = 'NO_SHOW'
}

export enum TipoPedido {
    MESA = 'MESA',
    PARA_LLEVAR = 'PARA_LLEVAR',
    DOMICILIO = 'DOMICILIO'
}

export enum EstadoPedido {
    RECIBIDO = 'RECIBIDO',
    PREPARANDO = 'PREPARANDO',
    LISTO = 'LISTO',
    ENTREGADO = 'ENTREGADO',
    CANCELADO = 'CANCELADO'
}

export enum MetodoPago {
    EFECTIVO = 'EFECTIVO',
    TARJETA = 'TARJETA',
    TRANSFERENCIA = 'TRANSFERENCIA',
    CRIPTOMONEDA = 'CRIPTOMONEDA'
}

export enum EstadoFactura {
    PENDIENTE = 'PENDIENTE',
    PAGADA = 'PAGADA',
    CANCELADA = 'CANCELADA',
    REEMBOLSADA = 'REEMBOLSADA'
}

export enum TipoMovimiento {
    ENTRADA = 'ENTRADA',
    SALIDA = 'SALIDA',
    AJUSTE = 'AJUSTE'
}

export enum TipoPromocion {
    DESCUENTO_PORCENTAJE = 'DESCUENTO_PORCENTAJE',
    DESCUENTO_FIJO = 'DESCUENTO_FIJO',
    PLATO_GRATIS = 'PLATO_GRATIS',
    COMBO_ESPECIAL = 'COMBO_ESPECIAL'
}

export enum TipoUsuario {
    ADMIN = 'ADMIN',
    GERENTE = 'GERENTE',
    EMPLEADO = 'EMPLEADO',
    COCINERO = 'COCINERO',
    MESERO = 'MESERO'
}

// ===== ENTIDADES PRINCIPALES =====

export interface Cliente extends BaseEntity {
    nombre: string
    email?: string
    telefono?: string
    alergias: string[]
    esFrecuente: boolean
    puntos: number
}

export interface Mesa extends BaseEntity {
    numero: number
    capacidad: number
    estado: EstadoMesa
    ubicacion?: string
}

export interface Categoria extends BaseEntity {
    nombre: string
    descripcion?: string
    orden: number
    activa: boolean
}

export interface Platillo extends BaseEntity {
    nombre: string
    descripcion?: string
    precio: number
    categoriaId: string
    alergenos: string[]
    activo: boolean
    imagen?: string
    tiempoPrep?: number
    categoria?: Categoria
}

export interface Ingrediente extends BaseEntity {
    nombre: string
    unidad: string
    stock: number
    stockMinimo: number
    costo: number
    activo: boolean
}

export interface IngredientePlatillo extends BaseEntity {
    platilloId: string
    ingredienteId: string
    cantidad: number
    platillo?: Platillo
    ingrediente?: Ingrediente
}

export interface Reserva extends BaseEntity {
    clienteId: string
    mesaId: string
    fecha: Date
    hora: string
    personas: number
    estado: EstadoReserva
    notas?: string
    cliente?: Cliente
    mesa?: Mesa
}

export interface Pedido extends BaseEntity {
    clienteId?: string
    mesaId?: string
    tipo: TipoPedido
    estado: EstadoPedido
    total: number
    notas?: string
    direccion?: string
    telefono?: string
    cliente?: Cliente
    mesa?: Mesa
    platillos?: PedidoPlatillo[]
    factura?: Factura
}

export interface PedidoPlatillo extends BaseEntity {
    pedidoId: string
    platilloId: string
    cantidad: number
    precioUnitario: number
    personalizacion: string[]
    notas?: string
    pedido?: Pedido
    platillo?: Platillo
}

export interface Factura extends BaseEntity {
    pedidoId: string
    clienteId?: string
    numero: string
    subtotal: number
    descuento: number
    impuestos: number
    iva?: number // Alias para compatibilidad
    total: number
    metodoPago: MetodoPago
    estado: EstadoFactura
    fecha: Date
    pedido?: Pedido
    cliente?: Cliente
    // Propiedades adicionales para la UI
    clienteNombre?: string
    mesaNumero?: number
    items?: Array<{
        nombre: string
        cantidad: number
        precio: number
    }>
}

export interface MovimientoInventario extends BaseEntity {
    ingredienteId: string
    tipo: TipoMovimiento
    cantidad: number
    motivo?: string
    referencia?: string
    ingrediente?: Ingrediente
}

export interface Promocion extends BaseEntity {
    nombre: string
    descripcion?: string
    tipo: TipoPromocion
    valor: number
    fechaInicio: Date
    fechaFin: Date
    activa: boolean
    condiciones?: string
}

export interface Usuario extends BaseEntity {
    nombre: string
    email: string
    rol: TipoUsuario
    activo: boolean
    ultimoAcceso?: Date
}

// ===== TIPOS PARA FORMULARIOS =====

export interface CrearClienteRequest {
    nombre: string
    email?: string
    telefono?: string
    alergias?: string[]
}

export interface CrearMesaRequest {
    numero: number
    capacidad: number
    ubicacion?: string
}

export interface CrearPlatilloRequest {
    nombre: string
    descripcion?: string
    precio: number
    categoriaId: string
    alergenos?: string[]
    imagen?: string
    tiempoPrep?: number
}

export interface CrearPedidoRequest {
    clienteId?: string
    mesaId?: string
    tipo: TipoPedido
    platillos: CrearPedidoPlatilloRequest[]
    notas?: string
    direccion?: string
    telefono?: string
}

export interface CrearPedidoPlatilloRequest {
    platilloId: string
    cantidad: number
    personalizacion?: string[]
    notas?: string
}

export interface CrearReservaRequest {
    clienteId: string
    mesaId: string
    fecha: string
    hora: string
    personas: number
    notas?: string
}

export interface CrearFacturaRequest {
    pedidoId: string
    metodoPago: MetodoPago
    descuento?: number
}

// ===== TIPOS PARA RESPONSES =====

export interface ApiResponse<T = any> {
    success: boolean
    data?: T
    message?: string
    error?: string
}

export interface PaginatedResponse<T = any> {
    data: T[]
    total: number
    page: number
    limit: number
    totalPages: number
}

// ===== TIPOS PARA FILTROS Y BÚSQUEDAS =====

export interface FiltroPedidos {
    estado?: EstadoPedido
    tipo?: TipoPedido
    fechaInicio?: Date
    fechaFin?: Date
    clienteId?: string
    mesaId?: string
}

export interface FiltroInventario {
    stockBajo?: boolean
    activo?: boolean
    ingredienteId?: string
}

export interface FiltroReportes {
    fechaInicio: Date
    fechaFin: Date
    tipo?: 'VENTAS' | 'INVENTARIO' | 'CLIENTES'
}

// ===== TIPOS PARA DASHBOARD =====

export interface EstadisticasDashboard {
    ventasHoy: number
    pedidosHoy: number
    mesasOcupadas: number
    ingredientesStockBajo: number
    clientesFrecuentes: number
    promedioTiempoPrep: number
}

export interface GraficoVentas {
    fecha: string
    ventas: number
    pedidos: number
}

export interface TopPlatillo {
    platilloId: string
    nombre: string
    cantidad: number
    ingresos: number
}

// ===== TIPOS PARA NOTIFICACIONES =====

export interface Notificacion {
    id: string
    tipo: 'SUCCESS' | 'ERROR' | 'WARNING' | 'INFO'
    titulo: string
    mensaje: string
    timestamp: Date
    leida: boolean
}

export interface NotificacionStockBajo {
    ingredienteId: string
    nombre: string
    stockActual: number
    stockMinimo: number
}

// ===== TIPOS PARA CONFIGURACIÓN =====

export interface ConfiguracionRestaurante {
    nombre: string
    direccion: string
    telefono: string
    email: string
    moneda: string
    tasaImpuesto: number
    capacidadMaxima: number
    horarioApertura: string
    horarioCierre: string
}

export interface ConfiguracionNotificaciones {
    emailActivo: boolean
    smsActivo: boolean
    pushActivo: boolean
    stockBajoActivo: boolean
    pedidoListoActivo: boolean
}

// ===== TIPOS PARA INTEGRACIONES =====

export interface IntegracionPago {
    tipo: 'STRIPE' | 'PAYPAL' | 'CRIPTO'
    activa: boolean
    configuracion: Record<string, any>
}

export interface IntegracionDelivery {
    tipo: 'RAPPI' | 'UBER_EATS' | 'DIDI_FOOD'
    activa: boolean
    configuracion: Record<string, any>
}

// ===== TIPOS PARA AUDITORÍA =====

export interface Auditoria extends BaseEntity {
    usuarioId: string
    accion: string
    entidad: string
    entidadId: string
    datosAnteriores?: any
    datosNuevos?: any
    ip?: string
    userAgent?: string
}

// ===== TIPOS PARA EXPORTACIÓN =====

export interface ExportarDatosRequest {
    tipo: 'PEDIDOS' | 'CLIENTES' | 'INVENTARIO' | 'VENTAS'
    formato: 'PDF' | 'EXCEL' | 'CSV' | 'JSON'
    filtros?: any
    fechaInicio?: Date
    fechaFin?: Date
}

// ===== TIPOS PARA BACKUP =====

export interface BackupRequest {
    incluirDatos: boolean
    incluirConfiguracion: boolean
    incluirImagenes: boolean
    comprimir: boolean
}

export interface BackupInfo {
    id: string
    fecha: Date
    tamaño: number
    tipo: 'COMPLETO' | 'INCREMENTAL'
    estado: 'PROCESANDO' | 'COMPLETADO' | 'ERROR'
}

// ===== TIPOS PARA REPORTES =====

export interface ReporteVentas {
    periodo: {
        inicio: Date
        fin: Date
    }
    totalVentas: number
    cantidadPedidos: number
    promedioPedido: number
    ventasPorDia: GraficoVentas[]
    topPlatillos: TopPlatillo[]
    ventasPorMetodoPago: Array<{
        metodo: MetodoPago
        cantidad: number
        total: number
    }>
}

export interface ReporteInventario {
    ingredientes: Array<{
        id: string
        nombre: string
        stock: number
        stockMinimo: number
        costo: number
        valorTotal: number
        estado: 'NORMAL' | 'BAJO' | 'CRITICO'
    }>
    valorTotalInventario: number
    ingredientesStockBajo: number
    movimientosRecientes: MovimientoInventario[]
}

export interface ReporteClientes {
    totalClientes: number
    clientesFrecuentes: number
    nuevosClientes: number
    clientesActivos: number
    promedioPuntos: number
    clientesPorMes: Array<{
        mes: string
        cantidad: number
    }>
    topClientes: Array<{
        clienteId: string
        nombre: string
        totalPedidos: number
        totalGastado: number
        puntos: number
    }>
}

// ===== TIPOS PARA WEBSOCKET =====

export interface WebSocketMessage {
    tipo: 'PEDIDO_ACTUALIZADO' | 'MESA_ACTUALIZADA' | 'STOCK_BAJO' | 'NOTIFICACION'
    data: any
    timestamp: Date
}

export interface PedidoActualizadoMessage {
    pedidoId: string
    estado: EstadoPedido
    tiempoEstimado?: number
}

export interface MesaActualizadaMessage {
    mesaId: string
    estado: EstadoMesa
    clienteId?: string
}

// ===== TIPOS PARA VALIDACIÓN =====

export interface ValidationError {
    campo: string
    mensaje: string
    valor?: any
}

export interface ValidationResult {
    valido: boolean
    errores: ValidationError[]
}

// ===== TIPOS PARA CACHE =====

export interface CacheConfig {
    ttl: number // Time to live en segundos
    maxSize: number
    estrategia: 'LRU' | 'FIFO' | 'LFU'
}

export interface CacheEntry<T = any> {
    key: string
    value: T
    timestamp: number
    ttl: number
}

// ===== TIPOS PARA LOGGING =====

export interface LogEntry {
    nivel: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR'
    mensaje: string
    contexto?: Record<string, any>
    timestamp: Date
    usuarioId?: string
    ip?: string
}

// ===== TIPOS PARA MÉTRICAS =====

export interface Metricas {
    nombre: string
    valor: number
    unidad: string
    timestamp: Date
    etiquetas?: Record<string, string>
}

export interface MetricasSistema {
    cpu: number
    memoria: number
    disco: number
    conexionesDB: number
    tiempoRespuestaPromedio: number
    timestamp: Date
}
