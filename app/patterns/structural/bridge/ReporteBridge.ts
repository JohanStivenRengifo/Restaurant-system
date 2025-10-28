/**
 * BRIDGE PATTERN - ReporteBridge
 * Desacopla la abstracción de la implementación
 * Permite cambiar el formato de reportes sin modificar la lógica de negocio
 */

// Implementación (formato de reporte)
export interface FormatoReporte {
    exportar(datos: any[]): string
    obtenerExtension(): string
    obtenerMimeType(): string
}

export class ReportePDF implements FormatoReporte {
    exportar(datos: any[]): string {
        console.log(`Generando PDF con ${datos.length} registros`)
        return `PDF generado con ${datos.length} registros`
    }

    obtenerExtension(): string {
        return '.pdf'
    }

    obtenerMimeType(): string {
        return 'application/pdf'
    }
}

export class ReporteExcel implements FormatoReporte {
    exportar(datos: any[]): string {
        console.log(`Generando Excel con ${datos.length} registros`)
        return `Excel generado con ${datos.length} registros`
    }

    obtenerExtension(): string {
        return '.xlsx'
    }

    obtenerMimeType(): string {
        return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    }
}

export class ReporteJSON implements FormatoReporte {
    exportar(datos: any[]): string {
        console.log(`Generando JSON con ${datos.length} registros`)
        return JSON.stringify(datos, null, 2)
    }

    obtenerExtension(): string {
        return '.json'
    }

    obtenerMimeType(): string {
        return 'application/json'
    }
}

export class ReporteCSV implements FormatoReporte {
    exportar(datos: any[]): string {
        console.log(`Generando CSV con ${datos.length} registros`)
        if (datos.length === 0) return ''

        const headers = Object.keys(datos[0]).join(',')
        const rows = datos.map(row => Object.values(row).join(','))
        return [headers, ...rows].join('\n')
    }

    obtenerExtension(): string {
        return '.csv'
    }

    obtenerMimeType(): string {
        return 'text/csv'
    }
}

// Abstracción (tipo de reporte)
export abstract class Reporte {
    protected formato: FormatoReporte

    constructor(formato: FormatoReporte) {
        this.formato = formato
    }

    abstract generar(): string
    abstract obtenerDatos(): any[]

    public exportar(): string {
        const datos = this.obtenerDatos()
        return this.formato.exportar(datos)
    }

    public obtenerNombreArchivo(): string {
        const timestamp = new Date().toISOString().split('T')[0]
        return `${this.constructor.name.toLowerCase()}_${timestamp}${this.formato.obtenerExtension()}`
    }

    public obtenerMimeType(): string {
        return this.formato.obtenerMimeType()
    }
}

// Implementaciones concretas de reportes
export class ReporteVentas extends Reporte {
    private fechaInicio: Date
    private fechaFin: Date
    private datosVentas: any[] = []

    constructor(formato: FormatoReporte, fechaInicio: Date, fechaFin: Date) {
        super(formato)
        this.fechaInicio = fechaInicio
        this.fechaFin = fechaFin
        this.cargarDatosVentas()
    }

    generar(): string {
        const datos = this.obtenerDatos()
        const totalVentas = datos.reduce((sum, venta) => sum + venta.total, 0)
        const cantidadPedidos = datos.length

        return `Reporte de Ventas
Período: ${this.fechaInicio.toLocaleDateString()} - ${this.fechaFin.toLocaleDateString()}
Total de ventas: $${totalVentas.toLocaleString()}
Cantidad de pedidos: ${cantidadPedidos}
Formato: ${this.formato.constructor.name}`
    }

    obtenerDatos(): any[] {
        return this.datosVentas
    }

    private cargarDatosVentas(): void {
        // Simulación de datos de ventas
        this.datosVentas = [
            { id: '1', fecha: '2024-01-15', cliente: 'Juan Pérez', total: 45000, metodoPago: 'TARJETA' },
            { id: '2', fecha: '2024-01-15', cliente: 'María García', total: 32000, metodoPago: 'EFECTIVO' },
            { id: '3', fecha: '2024-01-16', cliente: 'Carlos López', total: 28000, metodoPago: 'TRANSFERENCIA' },
            { id: '4', fecha: '2024-01-16', cliente: 'Ana Martínez', total: 55000, metodoPago: 'TARJETA' },
            { id: '5', fecha: '2024-01-17', cliente: 'Pedro Rodríguez', total: 41000, metodoPago: 'EFECTIVO' }
        ]
    }
}

export class ReporteInventario extends Reporte {
    private datosInventario: any[] = []

    constructor(formato: FormatoReporte) {
        super(formato)
        this.cargarDatosInventario()
    }

    generar(): string {
        const datos = this.obtenerDatos()
        const ingredientesBajos = datos.filter(item => item.stock < item.stockMinimo).length
        const valorTotal = datos.reduce((sum, item) => sum + (item.stock * item.costo), 0)

        return `Reporte de Inventario
Total de ingredientes: ${datos.length}
Ingredientes con stock bajo: ${ingredientesBajos}
Valor total del inventario: $${valorTotal.toLocaleString()}
Formato: ${this.formato.constructor.name}`
    }

    obtenerDatos(): any[] {
        return this.datosInventario
    }

    private cargarDatosInventario(): void {
        // Simulación de datos de inventario
        this.datosInventario = [
            { id: '1', nombre: 'Tomate', stock: 50, stockMinimo: 20, costo: 2000, unidad: 'kg' },
            { id: '2', nombre: 'Cebolla', stock: 15, stockMinimo: 20, costo: 1500, unidad: 'kg' },
            { id: '3', nombre: 'Carne', stock: 30, stockMinimo: 15, costo: 25000, unidad: 'kg' },
            { id: '4', nombre: 'Queso', stock: 25, stockMinimo: 10, costo: 18000, unidad: 'kg' },
            { id: '5', nombre: 'Pan', stock: 100, stockMinimo: 50, costo: 3000, unidad: 'unidades' }
        ]
    }
}

export class ReporteClientes extends Reporte {
    private datosClientes: any[] = []

    constructor(formato: FormatoReporte) {
        super(formato)
        this.cargarDatosClientes()
    }

    generar(): string {
        const datos = this.obtenerDatos()
        const clientesFrecuentes = datos.filter(cliente => cliente.esFrecuente).length
        const totalPuntos = datos.reduce((sum, cliente) => sum + cliente.puntos, 0)

        return `Reporte de Clientes
Total de clientes: ${datos.length}
Clientes frecuentes: ${clientesFrecuentes}
Total de puntos acumulados: ${totalPuntos}
Formato: ${this.formato.constructor.name}`
    }

    obtenerDatos(): any[] {
        return this.datosClientes
    }

    private cargarDatosClientes(): void {
        // Simulación de datos de clientes
        this.datosClientes = [
            { id: '1', nombre: 'Juan Pérez', email: 'juan@email.com', esFrecuente: true, puntos: 150, ultimaVisita: '2024-01-15' },
            { id: '2', nombre: 'María García', email: 'maria@email.com', esFrecuente: false, puntos: 50, ultimaVisita: '2024-01-10' },
            { id: '3', nombre: 'Carlos López', email: 'carlos@email.com', esFrecuente: true, puntos: 200, ultimaVisita: '2024-01-16' },
            { id: '4', nombre: 'Ana Martínez', email: 'ana@email.com', esFrecuente: false, puntos: 75, ultimaVisita: '2024-01-12' },
            { id: '5', nombre: 'Pedro Rodríguez', email: 'pedro@email.com', esFrecuente: true, puntos: 300, ultimaVisita: '2024-01-17' }
        ]
    }
}

// Bridge para notificaciones
export interface CanalNotificacion {
    enviar(mensaje: string, destinatario: string): Promise<boolean>
    obtenerTipo(): string
}

export class CanalEmail implements CanalNotificacion {
    async enviar(mensaje: string, destinatario: string): Promise<boolean> {
        console.log(`Enviando email a ${destinatario}: ${mensaje}`)
        // Simulación de envío de email
        await new Promise(resolve => setTimeout(resolve, 1000))
        return true
    }

    obtenerTipo(): string {
        return 'EMAIL'
    }
}

export class CanalSMS implements CanalNotificacion {
    async enviar(mensaje: string, destinatario: string): Promise<boolean> {
        console.log(`Enviando SMS a ${destinatario}: ${mensaje}`)
        // Simulación de envío de SMS
        await new Promise(resolve => setTimeout(resolve, 500))
        return true
    }

    obtenerTipo(): string {
        return 'SMS'
    }
}

export class CanalPush implements CanalNotificacion {
    async enviar(mensaje: string, destinatario: string): Promise<boolean> {
        console.log(`Enviando notificación push a ${destinatario}: ${mensaje}`)
        // Simulación de envío de push notification
        await new Promise(resolve => setTimeout(resolve, 300))
        return true
    }

    obtenerTipo(): string {
        return 'PUSH'
    }
}

export abstract class Notificacion {
    protected canal: CanalNotificacion

    constructor(canal: CanalNotificacion) {
        this.canal = canal
    }

    abstract generarMensaje(): string
    abstract obtenerDestinatario(): string

    public async enviar(): Promise<boolean> {
        const mensaje = this.generarMensaje()
        const destinatario = this.obtenerDestinatario()
        return await this.canal.enviar(mensaje, destinatario)
    }

    public obtenerTipoCanal(): string {
        return this.canal.obtenerTipo()
    }
}

export class NotificacionStockBajo extends Notificacion {
    private ingrediente: string
    private stockActual: number
    private stockMinimo: number

    constructor(canal: CanalNotificacion, ingrediente: string, stockActual: number, stockMinimo: number) {
        super(canal)
        this.ingrediente = ingrediente
        this.stockActual = stockActual
        this.stockMinimo = stockMinimo
    }

    generarMensaje(): string {
        return `ALERTA: Stock bajo de ${this.ingrediente}. Stock actual: ${this.stockActual}, Stock mínimo: ${this.stockMinimo}`
    }

    obtenerDestinatario(): string {
        return 'gerente@restaurante.com'
    }
}

export class NotificacionPedidoListo extends Notificacion {
    private numeroPedido: string
    private clienteTelefono: string

    constructor(canal: CanalNotificacion, numeroPedido: string, clienteTelefono: string) {
        super(canal)
        this.numeroPedido = numeroPedido
        this.clienteTelefono = clienteTelefono
    }

    generarMensaje(): string {
        return `Su pedido #${this.numeroPedido} está listo para recoger. ¡Gracias por elegirnos!`
    }

    obtenerDestinatario(): string {
        return this.clienteTelefono
    }
}

// Bridge para persistencia de datos
export interface ImplementacionPersistencia {
    guardar(datos: any): Promise<boolean>
    cargar(id: string): Promise<any>
    eliminar(id: string): Promise<boolean>
    listar(): Promise<any[]>
}

export class PersistenciaPostgreSQL implements ImplementacionPersistencia {
    async guardar(datos: any): Promise<boolean> {
        console.log('Guardando en PostgreSQL:', datos)
        // Simulación de guardado en PostgreSQL
        await new Promise(resolve => setTimeout(resolve, 200))
        return true
    }

    async cargar(id: string): Promise<any> {
        console.log('Cargando desde PostgreSQL:', id)
        // Simulación de carga desde PostgreSQL
        await new Promise(resolve => setTimeout(resolve, 100))
        return { id, datos: 'simulados' }
    }

    async eliminar(id: string): Promise<boolean> {
        console.log('Eliminando desde PostgreSQL:', id)
        // Simulación de eliminación desde PostgreSQL
        await new Promise(resolve => setTimeout(resolve, 150))
        return true
    }

    async listar(): Promise<any[]> {
        console.log('Listando desde PostgreSQL')
        // Simulación de listado desde PostgreSQL
        await new Promise(resolve => setTimeout(resolve, 300))
        return [{ id: '1' }, { id: '2' }, { id: '3' }]
    }
}

export class PersistenciaMongoDB implements ImplementacionPersistencia {
    async guardar(datos: any): Promise<boolean> {
        console.log('Guardando en MongoDB:', datos)
        // Simulación de guardado en MongoDB
        await new Promise(resolve => setTimeout(resolve, 180))
        return true
    }

    async cargar(id: string): Promise<any> {
        console.log('Cargando desde MongoDB:', id)
        // Simulación de carga desde MongoDB
        await new Promise(resolve => setTimeout(resolve, 120))
        return { id, datos: 'simulados' }
    }

    async eliminar(id: string): Promise<boolean> {
        console.log('Eliminando desde MongoDB:', id)
        // Simulación de eliminación desde MongoDB
        await new Promise(resolve => setTimeout(resolve, 160))
        return true
    }

    async listar(): Promise<any[]> {
        console.log('Listando desde MongoDB')
        // Simulación de listado desde MongoDB
        await new Promise(resolve => setTimeout(resolve, 250))
        return [{ id: '1' }, { id: '2' }, { id: '3' }]
    }
}

export abstract class Repositorio {
    protected persistencia: ImplementacionPersistencia

    constructor(persistencia: ImplementacionPersistencia) {
        this.persistencia = persistencia
    }

    abstract guardar(entidad: any): Promise<boolean>
    abstract cargar(id: string): Promise<any>
    abstract eliminar(id: string): Promise<boolean>
    abstract listar(): Promise<any[]>
}

export class RepositorioPedidos extends Repositorio {
    async guardar(pedido: any): Promise<boolean> {
        return await this.persistencia.guardar(pedido)
    }

    async cargar(id: string): Promise<any> {
        return await this.persistencia.cargar(id)
    }

    async eliminar(id: string): Promise<boolean> {
        return await this.persistencia.eliminar(id)
    }

    async listar(): Promise<any[]> {
        return await this.persistencia.listar()
    }
}

// Factory para crear bridges
export class BridgeFactory {
    static crearReporte(tipo: 'VENTAS' | 'INVENTARIO' | 'CLIENTES', formato: 'PDF' | 'Excel' | 'JSON' | 'CSV'): Reporte {
        let formatoReporte: FormatoReporte

        switch (formato) {
            case 'PDF':
                formatoReporte = new ReportePDF()
                break
            case 'Excel':
                formatoReporte = new ReporteExcel()
                break
            case 'JSON':
                formatoReporte = new ReporteJSON()
                break
            case 'CSV':
                formatoReporte = new ReporteCSV()
                break
            default:
                throw new Error('Formato de reporte no soportado')
        }

        switch (tipo) {
            case 'VENTAS':
                return new ReporteVentas(formatoReporte, new Date('2024-01-01'), new Date('2024-01-31'))
            case 'INVENTARIO':
                return new ReporteInventario(formatoReporte)
            case 'CLIENTES':
                return new ReporteClientes(formatoReporte)
            default:
                throw new Error('Tipo de reporte no soportado')
        }
    }

    static crearNotificacion(tipo: 'STOCK_BAJO' | 'PEDIDO_LISTO', canal: 'EMAIL' | 'SMS' | 'PUSH', datos: any): Notificacion {
        let canalNotificacion: CanalNotificacion

        switch (canal) {
            case 'EMAIL':
                canalNotificacion = new CanalEmail()
                break
            case 'SMS':
                canalNotificacion = new CanalSMS()
                break
            case 'PUSH':
                canalNotificacion = new CanalPush()
                break
            default:
                throw new Error('Canal de notificación no soportado')
        }

        switch (tipo) {
            case 'STOCK_BAJO':
                return new NotificacionStockBajo(canalNotificacion, datos.ingrediente, datos.stockActual, datos.stockMinimo)
            case 'PEDIDO_LISTO':
                return new NotificacionPedidoListo(canalNotificacion, datos.numeroPedido, datos.clienteTelefono)
            default:
                throw new Error('Tipo de notificación no soportado')
        }
    }

    static crearRepositorio(tipo: 'POSTGRESQL' | 'MONGODB'): RepositorioPedidos {
        let persistencia: ImplementacionPersistencia

        switch (tipo) {
            case 'POSTGRESQL':
                persistencia = new PersistenciaPostgreSQL()
                break
            case 'MONGODB':
                persistencia = new PersistenciaMongoDB()
                break
            default:
                throw new Error('Tipo de persistencia no soportado')
        }

        return new RepositorioPedidos(persistencia)
    }
}
