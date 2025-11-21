/**
 * PROXY PATTERN - ProxyInventario
 * Controla el acceso a objetos o aplaza costosas operaciones
 * Implementa validación de permisos, caché y lazy loading
 */

// Interfaces para el sistema de inventario
export interface Inventario {
    obtenerIngredientes(): Promise<Ingrediente[]>
    obtenerIngrediente(id: string): Promise<Ingrediente | null>
    actualizarStock(id: string, cantidad: number): Promise<boolean>
    agregarIngrediente(ingrediente: Ingrediente): Promise<boolean>
    eliminarIngrediente(id: string): Promise<boolean>
}

export interface Ingrediente {
    id: string
    nombre: string
    stock: number
    stockMinimo: number
    costo: number
    unidad: string
    activo: boolean
}

export interface Usuario {
    id: string
    nombre: string
    rol: 'ADMIN' | 'GERENTE' | 'EMPLEADO' | 'COCINERO'
    permisos: string[]
}

// Implementación real del inventario
export class InventarioReal implements Inventario {
    private ingredientes: Ingrediente[] = []

    constructor() {
        this.cargarDatosIniciales()
    }

    async obtenerIngredientes(): Promise<Ingrediente[]> {
        console.log('Accediendo a la base de datos real para obtener ingredientes...')
        // Simulación de acceso a base de datos
        await new Promise(resolve => setTimeout(resolve, 1000))
        return [...this.ingredientes]
    }

    async obtenerIngrediente(id: string): Promise<Ingrediente | null> {
        console.log(`Accediendo a la base de datos real para obtener ingrediente ${id}...`)
        await new Promise(resolve => setTimeout(resolve, 500))
        return this.ingredientes.find(ing => ing.id === id) || null
    }

    async actualizarStock(id: string, cantidad: number): Promise<boolean> {
        console.log(`Actualizando stock del ingrediente ${id} a ${cantidad}...`)
        await new Promise(resolve => setTimeout(resolve, 800))

        const ingrediente = this.ingredientes.find(ing => ing.id === id)
        if (ingrediente) {
            ingrediente.stock = cantidad
            return true
        }
        return false
    }

    async agregarIngrediente(ingrediente: Ingrediente): Promise<boolean> {
        console.log(`Agregando nuevo ingrediente: ${ingrediente.nombre}...`)
        await new Promise(resolve => setTimeout(resolve, 600))

        this.ingredientes.push(ingrediente)
        return true
    }

    async eliminarIngrediente(id: string): Promise<boolean> {
        console.log(`Eliminando ingrediente ${id}...`)
        await new Promise(resolve => setTimeout(resolve, 400))

        const index = this.ingredientes.findIndex(ing => ing.id === id)
        if (index !== -1) {
            this.ingredientes.splice(index, 1)
            return true
        }
        return false
    }

    private cargarDatosIniciales(): void {
        this.ingredientes = [
            { id: '1', nombre: 'Tomate', stock: 50, stockMinimo: 20, costo: 2000, unidad: 'kg', activo: true },
            { id: '2', nombre: 'Cebolla', stock: 15, stockMinimo: 20, costo: 1500, unidad: 'kg', activo: true },
            { id: '3', nombre: 'Carne', stock: 30, stockMinimo: 15, costo: 25000, unidad: 'kg', activo: true },
            { id: '4', nombre: 'Queso', stock: 25, stockMinimo: 10, costo: 18000, unidad: 'kg', activo: true },
            { id: '5', nombre: 'Pan', stock: 100, stockMinimo: 50, costo: 3000, unidad: 'unidades', activo: true }
        ]
    }
}

// Proxy con validación de permisos
export class ProxyInventario implements Inventario {
    private inventarioReal: InventarioReal
    private usuarioActual: Usuario | null = null
    private cache: Map<string, Ingrediente[]> = new Map()
    private cacheTimestamp: Map<string, number> = new Map()
    private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutos

    constructor(inventarioReal: InventarioReal) {
        this.inventarioReal = inventarioReal
    }

    public establecerUsuario(usuario: Usuario): void {
        this.usuarioActual = usuario
    }

    async obtenerIngredientes(): Promise<Ingrediente[]> {
        if (!this.tienePermiso('INVENTARIO_READ')) {
            throw new Error('Acceso denegado: No tiene permisos para leer el inventario')
        }

        // Verificar caché
        const cacheKey = 'ingredientes'
        if (this.cache.has(cacheKey) && this.esCacheValido(cacheKey)) {
            console.log('Retornando datos desde caché...')
            return this.cache.get(cacheKey)!
        }

        // Obtener datos reales y actualizar caché
        const ingredientes = await this.inventarioReal.obtenerIngredientes()
        this.cache.set(cacheKey, ingredientes)
        this.cacheTimestamp.set(cacheKey, Date.now())

        return ingredientes
    }

    async obtenerIngrediente(id: string): Promise<Ingrediente | null> {
        if (!this.tienePermiso('INVENTARIO_READ')) {
            throw new Error('Acceso denegado: No tiene permisos para leer el inventario')
        }

        // Verificar caché individual
        const cacheKey = `ingrediente_${id}`
        if (this.cache.has(cacheKey) && this.esCacheValido(cacheKey)) {
            console.log(`Retornando ingrediente ${id} desde caché...`)
            return this.cache.get(cacheKey)![0] || null
        }

        const ingrediente = await this.inventarioReal.obtenerIngrediente(id)
        if (ingrediente) {
            this.cache.set(cacheKey, [ingrediente])
            this.cacheTimestamp.set(cacheKey, Date.now())
        }

        return ingrediente
    }

    async actualizarStock(id: string, cantidad: number): Promise<boolean> {
        if (!this.tienePermiso('INVENTARIO_WRITE')) {
            throw new Error('Acceso denegado: No tiene permisos para modificar el inventario')
        }

        // Validación adicional
        if (cantidad < 0) {
            throw new Error('La cantidad no puede ser negativa')
        }

        const resultado = await this.inventarioReal.actualizarStock(id, cantidad)

        // Invalidar caché relacionado
        this.invalidarCache(`ingrediente_${id}`)
        this.invalidarCache('ingredientes')

        return resultado
    }

    async agregarIngrediente(ingrediente: Ingrediente): Promise<boolean> {
        if (!this.tienePermiso('INVENTARIO_CREATE')) {
            throw new Error('Acceso denegado: No tiene permisos para crear ingredientes')
        }

        // Validaciones adicionales
        if (!ingrediente.nombre || ingrediente.nombre.trim() === '') {
            throw new Error('El nombre del ingrediente es requerido')
        }

        if (ingrediente.stock < 0 || ingrediente.stockMinimo < 0) {
            throw new Error('Los valores de stock no pueden ser negativos')
        }

        const resultado = await this.inventarioReal.agregarIngrediente(ingrediente)

        // Invalidar caché
        this.invalidarCache('ingredientes')

        return resultado
    }

    async eliminarIngrediente(id: string): Promise<boolean> {
        if (!this.tienePermiso('INVENTARIO_DELETE')) {
            throw new Error('Acceso denegado: No tiene permisos para eliminar ingredientes')
        }

        const resultado = await this.inventarioReal.eliminarIngrediente(id)

        // Invalidar caché relacionado
        this.invalidarCache(`ingrediente_${id}`)
        this.invalidarCache('ingredientes')

        return resultado
    }

    private tienePermiso(permiso: string): boolean {
        if (!this.usuarioActual) {
            return false
        }
        return this.usuarioActual.permisos.includes(permiso) || this.usuarioActual.rol === 'ADMIN'
    }

    private esCacheValido(clave: string): boolean {
        const timestamp = this.cacheTimestamp.get(clave)
        if (!timestamp) return false

        return (Date.now() - timestamp) < this.CACHE_DURATION
    }

    private invalidarCache(clave: string): void {
        this.cache.delete(clave)
        this.cacheTimestamp.delete(clave)
    }

    public limpiarCache(): void {
        this.cache.clear()
        this.cacheTimestamp.clear()
    }
}

// Proxy para pedidos con validación de estado
export interface PedidoService {
    obtenerPedido(id: string): Promise<Pedido | null>
    actualizarEstado(id: string, estado: string): Promise<boolean>
    agregarPlatillo(id: string, platillo: any): Promise<boolean>
}

export interface Pedido {
    id: string
    estado: 'RECIBIDO' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO' | 'CANCELADO'
    platillos: any[]
    clienteId?: string
    mesaId?: string
    total: number
    fechaCreacion: Date
}

export class PedidoServiceReal implements PedidoService {
    private pedidos: Pedido[] = []

    constructor() {
        this.cargarDatosIniciales()
    }

    async obtenerPedido(id: string): Promise<Pedido | null> {
        console.log(`Obteniendo pedido ${id} desde base de datos...`)
        await new Promise(resolve => setTimeout(resolve, 300))
        return this.pedidos.find(p => p.id === id) || null
    }

    async actualizarEstado(id: string, estado: string): Promise<boolean> {
        console.log(`Actualizando estado del pedido ${id} a ${estado}...`)
        await new Promise(resolve => setTimeout(resolve, 200))

        const pedido = this.pedidos.find(p => p.id === id)
        if (pedido) {
            pedido.estado = estado as any
            return true
        }
        return false
    }

    async agregarPlatillo(id: string, platillo: any): Promise<boolean> {
        console.log(`Agregando platillo al pedido ${id}...`)
        await new Promise(resolve => setTimeout(resolve, 150))

        const pedido = this.pedidos.find(p => p.id === id)
        if (pedido) {
            pedido.platillos.push(platillo)
            return true
        }
        return false
    }

    private cargarDatosIniciales(): void {
        this.pedidos = [
            {
                id: '1',
                estado: 'PREPARANDO',
                platillos: [{ nombre: 'Hamburguesa', precio: 25000 }],
                clienteId: 'cliente1',
                mesaId: 'mesa5',
                total: 25000,
                fechaCreacion: new Date()
            },
            {
                id: '2',
                estado: 'LISTO',
                platillos: [{ nombre: 'Pizza', precio: 30000 }],
                clienteId: 'cliente2',
                total: 30000,
                fechaCreacion: new Date()
            }
        ]
    }
}

export class ProxyPedidoService implements PedidoService {
    private pedidoServiceReal: PedidoServiceReal
    private cache: Map<string, Pedido> = new Map()
    private cacheTimestamp: Map<string, number> = new Map()
    private readonly CACHE_DURATION = 2 * 60 * 1000 // 2 minutos

    constructor(pedidoServiceReal: PedidoServiceReal) {
        this.pedidoServiceReal = pedidoServiceReal
    }

    async obtenerPedido(id: string): Promise<Pedido | null> {
        // Verificar caché
        if (this.cache.has(id) && this.esCacheValido(id)) {
            console.log(`Retornando pedido ${id} desde caché...`)
            return this.cache.get(id)!
        }

        const pedido = await this.pedidoServiceReal.obtenerPedido(id)
        if (pedido) {
            this.cache.set(id, pedido)
            this.cacheTimestamp.set(id, Date.now())
        }

        return pedido
    }

    async actualizarEstado(id: string, estado: string): Promise<boolean> {
        // Validar transiciones de estado válidas
        const pedido = await this.obtenerPedido(id)
        if (!pedido) {
            throw new Error('Pedido no encontrado')
        }

        if (!this.esTransicionValida(pedido.estado, estado)) {
            throw new Error(`Transición de estado inválida: ${pedido.estado} -> ${estado}`)
        }

        const resultado = await this.pedidoServiceReal.actualizarEstado(id, estado)

        // Actualizar caché
        if (resultado && pedido) {
            pedido.estado = estado as any
            this.cache.set(id, pedido)
            this.cacheTimestamp.set(id, Date.now())
        }

        return resultado
    }

    async agregarPlatillo(id: string, platillo: any): Promise<boolean> {
        const pedido = await this.obtenerPedido(id)
        if (!pedido) {
            throw new Error('Pedido no encontrado')
        }

        // Solo se pueden agregar platillos si el pedido no está entregado o cancelado
        if (pedido.estado === 'ENTREGADO' || pedido.estado === 'CANCELADO') {
            throw new Error('No se pueden agregar platillos a un pedido entregado o cancelado')
        }

        const resultado = await this.pedidoServiceReal.agregarPlatillo(id, platillo)

        // Actualizar caché
        if (resultado && pedido) {
            pedido.platillos.push(platillo)
            this.cache.set(id, pedido)
            this.cacheTimestamp.set(id, Date.now())
        }

        return resultado
    }

    private esTransicionValida(estadoActual: string, estadoNuevo: string): boolean {
        const transicionesValidas: Record<string, string[]> = {
            'RECIBIDO': ['PREPARANDO', 'CANCELADO'],
            'PREPARANDO': ['LISTO', 'CANCELADO'],
            'LISTO': ['ENTREGADO'],
            'ENTREGADO': [], // Estado final
            'CANCELADO': [] // Estado final
        }

        return transicionesValidas[estadoActual]?.includes(estadoNuevo) || false
    }

    private esCacheValido(clave: string): boolean {
        const timestamp = this.cacheTimestamp.get(clave)
        if (!timestamp) return false

        return (Date.now() - timestamp) < this.CACHE_DURATION
    }

    public limpiarCache(): void {
        this.cache.clear()
        this.cacheTimestamp.clear()
    }
}

// Proxy para reportes con lazy loading
export interface ReporteService {
    generarReporteVentas(fechaInicio: Date, fechaFin: Date): Promise<string>
    generarReporteInventario(): Promise<string>
    generarReporteClientes(): Promise<string>
}

export class ReporteServiceReal implements ReporteService {
    async generarReporteVentas(fechaInicio: Date, fechaFin: Date): Promise<string> {
        console.log(`Generando reporte de ventas desde ${fechaInicio} hasta ${fechaFin}...`)
        // Simulación de operación costosa
        await new Promise(resolve => setTimeout(resolve, 3000))
        return `Reporte de ventas generado para el período ${fechaInicio.toLocaleDateString()} - ${fechaFin.toLocaleDateString()}`
    }

    async generarReporteInventario(): Promise<string> {
        console.log('Generando reporte de inventario...')
        await new Promise(resolve => setTimeout(resolve, 2000))
        return 'Reporte de inventario generado'
    }

    async generarReporteClientes(): Promise<string> {
        console.log('Generando reporte de clientes...')
        await new Promise(resolve => setTimeout(resolve, 2500))
        return 'Reporte de clientes generado'
    }
}

export class ProxyReporteService implements ReporteService {
    private reporteServiceReal: ReporteServiceReal
    private cache: Map<string, string> = new Map()
    private cacheTimestamp: Map<string, number> = new Map()
    private readonly CACHE_DURATION = 10 * 60 * 1000 // 10 minutos

    constructor(reporteServiceReal: ReporteServiceReal) {
        this.reporteServiceReal = reporteServiceReal
    }

    async generarReporteVentas(fechaInicio: Date, fechaFin: Date): Promise<string> {
        const cacheKey = `ventas_${fechaInicio.getTime()}_${fechaFin.getTime()}`

        if (this.cache.has(cacheKey) && this.esCacheValido(cacheKey)) {
            console.log('Retornando reporte de ventas desde caché...')
            return this.cache.get(cacheKey)!
        }

        const reporte = await this.reporteServiceReal.generarReporteVentas(fechaInicio, fechaFin)
        this.cache.set(cacheKey, reporte)
        this.cacheTimestamp.set(cacheKey, Date.now())

        return reporte
    }

    async generarReporteInventario(): Promise<string> {
        const cacheKey = 'inventario'

        if (this.cache.has(cacheKey) && this.esCacheValido(cacheKey)) {
            console.log('Retornando reporte de inventario desde caché...')
            return this.cache.get(cacheKey)!
        }

        const reporte = await this.reporteServiceReal.generarReporteInventario()
        this.cache.set(cacheKey, reporte)
        this.cacheTimestamp.set(cacheKey, Date.now())

        return reporte
    }

    async generarReporteClientes(): Promise<string> {
        const cacheKey = 'clientes'

        if (this.cache.has(cacheKey) && this.esCacheValido(cacheKey)) {
            console.log('Retornando reporte de clientes desde caché...')
            return this.cache.get(cacheKey)!
        }

        const reporte = await this.reporteServiceReal.generarReporteClientes()
        this.cache.set(cacheKey, reporte)
        this.cacheTimestamp.set(cacheKey, Date.now())

        return reporte
    }

    private esCacheValido(clave: string): boolean {
        const timestamp = this.cacheTimestamp.get(clave)
        if (!timestamp) return false

        return (Date.now() - timestamp) < this.CACHE_DURATION
    }

    public limpiarCache(): void {
        this.cache.clear()
        this.cacheTimestamp.clear()
    }
}

// Factory para crear proxies
export class ProxyFactory {
    static crearProxyInventario(): ProxyInventario {
        return new ProxyInventario(new InventarioReal())
    }

    static crearProxyPedidoService(): ProxyPedidoService {
        return new ProxyPedidoService(new PedidoServiceReal())
    }

    static crearProxyReporteService(): ProxyReporteService {
        return new ProxyReporteService(new ReporteServiceReal())
    }
}
