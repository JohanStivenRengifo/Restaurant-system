/**
 * BUILDER PATTERN - PedidoBuilder
 * Construye objetos complejos paso a paso
 * Permite crear pedidos con múltiples platos, personalizaciones y configuraciones
 */

export interface PedidoCompleto {
    id: string
    clienteId?: string
    mesaId?: string
    tipo: 'MESA' | 'PARA_LLEVAR' | 'DOMICILIO'
    platillos: PlatilloPedido[]
    personalizaciones: string[]
    descuentos: Descuento[]
    total: number
    notas?: string
    direccion?: string
    telefono?: string
    fechaCreacion: Date
}

export interface PlatilloPedido {
    platilloId: string
    nombre: string
    cantidad: number
    precioUnitario: number
    personalizaciones: string[]
    alergenos: string[]
    tiempoPrep: number
}

export interface Descuento {
    tipo: 'PORCENTAJE' | 'FIJO' | 'PLATO_GRATIS'
    valor: number
    descripcion: string
}

export class PedidoBuilder {
    private pedido: Partial<PedidoCompleto> = {
        id: Math.random().toString(36).substr(2, 9),
        platillos: [],
        personalizaciones: [],
        descuentos: [],
        total: 0,
        fechaCreacion: new Date()
    }

    // Métodos para configurar el pedido básico
    public configurarCliente(clienteId: string): PedidoBuilder {
        this.pedido.clienteId = clienteId
        return this
    }

    public configurarMesa(mesaId: string): PedidoBuilder {
        this.pedido.mesaId = mesaId
        this.pedido.tipo = 'MESA'
        return this
    }

    public configurarParaLlevar(): PedidoBuilder {
        this.pedido.tipo = 'PARA_LLEVAR'
        return this
    }

    public configurarDomicilio(direccion: string, telefono: string): PedidoBuilder {
        this.pedido.tipo = 'DOMICILIO'
        this.pedido.direccion = direccion
        this.pedido.telefono = telefono
        return this
    }

    // Métodos para agregar platillos
    public agregarPlatillo(
        platilloId: string,
        nombre: string,
        precio: number,
        cantidad: number = 1,
        alergenos: string[] = [],
        tiempoPrep: number = 15
    ): PedidoBuilder {
        const platilloPedido: PlatilloPedido = {
            platilloId,
            nombre,
            cantidad,
            precioUnitario: precio,
            personalizaciones: [],
            alergenos,
            tiempoPrep
        }

        this.pedido.platillos!.push(platilloPedido)
        this.calcularTotal()
        return this
    }

    public personalizarPlatillo(platilloIndex: number, personalizacion: string): PedidoBuilder {
        if (this.pedido.platillos![platilloIndex]) {
            this.pedido.platillos![platilloIndex].personalizaciones.push(personalizacion)
        }
        return this
    }

    // Métodos para agregar descuentos
    public agregarDescuentoPorcentaje(porcentaje: number, descripcion: string): PedidoBuilder {
        const descuento: Descuento = {
            tipo: 'PORCENTAJE',
            valor: porcentaje,
            descripcion
        }
        this.pedido.descuentos!.push(descuento)
        this.calcularTotal()
        return this
    }

    public agregarDescuentoFijo(valor: number, descripcion: string): PedidoBuilder {
        const descuento: Descuento = {
            tipo: 'FIJO',
            valor,
            descripcion
        }
        this.pedido.descuentos!.push(descuento)
        this.calcularTotal()
        return this
    }

    public agregarPlatoGratis(descripcion: string): PedidoBuilder {
        const descuento: Descuento = {
            tipo: 'PLATO_GRATIS',
            valor: 0,
            descripcion
        }
        this.pedido.descuentos!.push(descuento)
        this.calcularTotal()
        return this
    }

    // Métodos para configuraciones adicionales
    public agregarNotas(notas: string): PedidoBuilder {
        this.pedido.notas = notas
        return this
    }

    public agregarPersonalizacionGlobal(personalizacion: string): PedidoBuilder {
        this.pedido.personalizaciones!.push(personalizacion)
        return this
    }

    // Método para calcular el total
    private calcularTotal(): void {
        let subtotal = this.pedido.platillos!.reduce((sum, platillo) =>
            sum + (platillo.precioUnitario * platillo.cantidad), 0
        )

        // Aplicar descuentos
        let totalDescuentos = 0
        this.pedido.descuentos!.forEach(descuento => {
            switch (descuento.tipo) {
                case 'PORCENTAJE':
                    totalDescuentos += subtotal * (descuento.valor / 100)
                    break
                case 'FIJO':
                    totalDescuentos += descuento.valor
                    break
                case 'PLATO_GRATIS':
                    // En este caso, el valor ya está incluido en el subtotal
                    break
            }
        })

        this.pedido.total = Math.max(0, subtotal - totalDescuentos)
    }

    // Método para construir el pedido final
    public build(): PedidoCompleto {
        if (!this.pedido.tipo) {
            throw new Error('Debe especificar el tipo de pedido (MESA, PARA_LLEVAR, DOMICILIO)')
        }

        if (!this.pedido.platillos || this.pedido.platillos.length === 0) {
            throw new Error('El pedido debe tener al menos un platillo')
        }

        return this.pedido as PedidoCompleto
    }

    // Método para resetear el builder
    public reset(): PedidoBuilder {
        this.pedido = {
            id: Math.random().toString(36).substr(2, 9),
            platillos: [],
            personalizaciones: [],
            descuentos: [],
            total: 0,
            fechaCreacion: new Date()
        }
        return this
    }
}

// Builder para reportes complejos
export interface ReporteCompleto {
    id: string
    titulo: string
    tipo: 'VENTAS' | 'INVENTARIO' | 'CLIENTES' | 'COCINA'
    periodo: {
        inicio: Date
        fin: Date
    }
    filtros: Record<string, any>
    datos: any[]
    graficos: Grafico[]
    formato: 'PDF' | 'Excel' | 'JSON'
    fechaGeneracion: Date
}

export interface Grafico {
    tipo: 'BARRAS' | 'LINEAS' | 'PASTEL' | 'TABLA'
    titulo: string
    datos: any[]
    configuracion: Record<string, any>
}

export class ReporteBuilder {
    private reporte: Partial<ReporteCompleto> = {
        id: Math.random().toString(36).substr(2, 9),
        filtros: {},
        datos: [],
        graficos: [],
        fechaGeneracion: new Date()
    }

    public configurarBasico(titulo: string, tipo: 'VENTAS' | 'INVENTARIO' | 'CLIENTES' | 'COCINA'): ReporteBuilder {
        this.reporte.titulo = titulo
        this.reporte.tipo = tipo
        return this
    }

    public configurarPeriodo(inicio: Date, fin: Date): ReporteBuilder {
        this.reporte.periodo = { inicio, fin }
        return this
    }

    public agregarFiltro(clave: string, valor: any): ReporteBuilder {
        this.reporte.filtros![clave] = valor
        return this
    }

    public agregarDatos(datos: any[]): ReporteBuilder {
        this.reporte.datos = datos
        return this
    }

    public agregarGrafico(tipo: 'BARRAS' | 'LINEAS' | 'PASTEL' | 'TABLA', titulo: string, datos: any[], configuracion: Record<string, any> = {}): ReporteBuilder {
        const grafico: Grafico = {
            tipo,
            titulo,
            datos,
            configuracion
        }
        this.reporte.graficos!.push(grafico)
        return this
    }

    public configurarFormato(formato: 'PDF' | 'Excel' | 'JSON'): ReporteBuilder {
        this.reporte.formato = formato
        return this
    }

    public build(): ReporteCompleto {
        if (!this.reporte.titulo || !this.reporte.tipo) {
            throw new Error('Debe configurar título y tipo del reporte')
        }

        if (!this.reporte.periodo) {
            throw new Error('Debe configurar el período del reporte')
        }

        return this.reporte as ReporteCompleto
    }
}

// Builder para notificaciones complejas
export interface NotificacionCompleta {
    id: string
    tipo: 'EMAIL' | 'SMS' | 'PUSH' | 'SISTEMA'
    destinatario: string
    asunto: string
    contenido: string
    prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'
    programada?: Date
    adjuntos: string[]
    metadata: Record<string, any>
}

export class NotificacionBuilder {
    private notificacion: Partial<NotificacionCompleta> = {
        id: Math.random().toString(36).substr(2, 9),
        adjuntos: [],
        metadata: {}
    }

    public configurarBasica(tipo: 'EMAIL' | 'SMS' | 'PUSH' | 'SISTEMA', destinatario: string): NotificacionBuilder {
        this.notificacion.tipo = tipo
        this.notificacion.destinatario = destinatario
        return this
    }

    public configurarContenido(asunto: string, contenido: string): NotificacionBuilder {
        this.notificacion.asunto = asunto
        this.notificacion.contenido = contenido
        return this
    }

    public configurarPrioridad(prioridad: 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA'): NotificacionBuilder {
        this.notificacion.prioridad = prioridad
        return this
    }

    public programar(fecha: Date): NotificacionBuilder {
        this.notificacion.programada = fecha
        return this
    }

    public agregarAdjunto(archivo: string): NotificacionBuilder {
        this.notificacion.adjuntos!.push(archivo)
        return this
    }

    public agregarMetadata(clave: string, valor: any): NotificacionBuilder {
        this.notificacion.metadata![clave] = valor
        return this
    }

    public build(): NotificacionCompleta {
        if (!this.notificacion.tipo || !this.notificacion.destinatario) {
            throw new Error('Debe configurar tipo y destinatario de la notificación')
        }

        if (!this.notificacion.asunto || !this.notificacion.contenido) {
            throw new Error('Debe configurar asunto y contenido de la notificación')
        }

        return this.notificacion as NotificacionCompleta
    }
}

// Director para facilitar la construcción de objetos comunes
export class PedidoDirector {
    constructor(private builder: PedidoBuilder) { }

    public crearPedidoCompletoMesa(clienteId: string, mesaId: string): PedidoCompleto {
        return this.builder
            .configurarCliente(clienteId)
            .configurarMesa(mesaId)
            .agregarPlatillo('1', 'Hamburguesa Clásica', 25000, 1, ['gluten', 'lacteos'], 15)
            .personalizarPlatillo(0, 'sin cebolla')
            .personalizarPlatillo(0, 'extra queso')
            .agregarPlatillo('2', 'Papas Fritas', 8000, 1, [], 5)
            .agregarDescuentoPorcentaje(10, 'Descuento cliente frecuente')
            .agregarNotas('Pedido para mesa 5')
            .build()
    }

    public crearPedidoDomicilio(clienteId: string, direccion: string, telefono: string): PedidoCompleto {
        return this.builder
            .configurarCliente(clienteId)
            .configurarDomicilio(direccion, telefono)
            .agregarPlatillo('3', 'Pizza Margherita', 30000, 1, ['gluten', 'lacteos'], 20)
            .agregarPlatillo('4', 'Refresco', 5000, 2, [], 2)
            .agregarDescuentoFijo(5000, 'Descuento por pedido a domicilio')
            .agregarNotas('Entregar en la puerta principal')
            .build()
    }
}
