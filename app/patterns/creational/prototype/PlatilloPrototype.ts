/**
 * PROTOTYPE PATTERN - PlatilloPrototype
 * Permite clonar objetos complejos eficientemente
 * Útil para crear menús por temporada, duplicar pedidos recurrentes, etc.
 */

export interface Prototype {
    clonar(): Prototype
}

export class Platillo implements Prototype {
    constructor(
        public id: string,
        public nombre: string,
        public descripcion: string,
        public precio: number,
        public categoria: string,
        public alergenos: string[],
        public ingredientes: string[],
        public tiempoPrep: number,
        public imagen?: string
    ) { }

    clonar(): Platillo {
        // Crear una copia profunda del objeto
        return Object.assign(Object.create(Object.getPrototypeOf(this)), {
            ...this,
            id: Math.random().toString(36).substr(2, 9), // Nuevo ID único
            alergenos: [...this.alergenos], // Copia del array
            ingredientes: [...this.ingredientes] // Copia del array
        })
    }

    // Método para crear variaciones del platillo
    crearVariacion(nombreVariacion: string, modificaciones: Partial<Platillo>): Platillo {
        const variacion = this.clonar()
        variacion.nombre = `${this.nombre} - ${nombreVariacion}`

        // Aplicar modificaciones
        Object.assign(variacion, modificaciones)

        return variacion
    }
}

export class MenuTemporada implements Prototype {
    constructor(
        public nombre: string,
        public temporada: string,
        public platillos: Platillo[],
        public fechaInicio: Date,
        public fechaFin: Date
    ) { }

    clonar(): MenuTemporada {
        return new MenuTemporada(
            this.nombre,
            this.temporada,
            this.platillos.map(platillo => platillo.clonar()),
            new Date(this.fechaInicio),
            new Date(this.fechaFin)
        )
    }

    // Crear menú para nueva temporada
    crearParaNuevaTemporada(nuevaTemporada: string): MenuTemporada {
        const nuevoMenu = this.clonar()
        nuevoMenu.temporada = nuevaTemporada
        nuevoMenu.nombre = `Menú ${nuevaTemporada}`

        // Ajustar fechas para nueva temporada
        const ahora = new Date()
        nuevoMenu.fechaInicio = new Date(ahora)
        nuevoMenu.fechaFin = new Date(ahora.getTime() + 90 * 24 * 60 * 60 * 1000) // +90 días

        return nuevoMenu
    }
}

export class PedidoRecurrente implements Prototype {
    constructor(
        public id: string,
        public clienteId: string,
        public platillos: Platillo[],
        public personalizaciones: string[],
        public frecuencia: 'diario' | 'semanal' | 'mensual',
        public nombre: string
    ) { }

    clonar(): PedidoRecurrente {
        return new PedidoRecurrente(
            Math.random().toString(36).substr(2, 9),
            this.clienteId,
            this.platillos.map(platillo => platillo.clonar()),
            [...this.personalizaciones],
            this.frecuencia,
            this.nombre
        )
    }

    // Crear pedido basado en el patrón recurrente
    crearPedido(): PedidoRecurrente {
        const nuevoPedido = this.clonar()
        nuevoPedido.nombre = `${this.nombre} - ${new Date().toLocaleDateString()}`
        return nuevoPedido
    }
}

export class ClienteFrecuente implements Prototype {
    constructor(
        public id: string,
        public nombre: string,
        public email: string,
        public telefono: string,
        public alergias: string[],
        public preferencias: string[],
        public historialPedidos: PedidoRecurrente[],
        public puntos: number
    ) { }

    clonar(): ClienteFrecuente {
        return new ClienteFrecuente(
            Math.random().toString(36).substr(2, 9),
            this.nombre,
            this.email,
            this.telefono,
            [...this.alergias],
            [...this.preferencias],
            this.historialPedidos.map(pedido => pedido.clonar()),
            this.puntos
        )
    }

    // Crear perfil de cliente basado en otro cliente similar
    crearPerfilSimilar(nuevoNombre: string, nuevoEmail: string): ClienteFrecuente {
        const nuevoCliente = this.clonar()
        nuevoCliente.nombre = nuevoNombre
        nuevoCliente.email = nuevoEmail
        nuevoCliente.puntos = 0
        nuevoCliente.historialPedidos = []

        return nuevoCliente
    }
}

// Manager para gestionar prototipos
export class PrototypeManager {
    private prototipos: Map<string, Prototype> = new Map()

    registrarPrototipo(clave: string, prototipo: Prototype): void {
        this.prototipos.set(clave, prototipo)
    }

    obtenerPrototipo(clave: string): Prototype | undefined {
        const prototipo = this.prototipos.get(clave)
        return prototipo ? prototipo.clonar() : undefined
    }

    listarPrototipos(): string[] {
        return Array.from(this.prototipos.keys())
    }
}

// Ejemplos de uso del patrón Prototipo
export class EjemplosPrototipo {
    static crearPlatillosBase(): Platillo[] {
        return [
            new Platillo(
                '1',
                'Hamburguesa Clásica',
                'Hamburguesa con carne, lechuga, tomate y queso',
                25000,
                'Plato Principal',
                ['gluten', 'lacteos'],
                ['pan', 'carne', 'lechuga', 'tomate', 'queso'],
                15,
                '/images/hamburguesa.jpg'
            ),
            new Platillo(
                '2',
                'Ensalada César',
                'Ensalada fresca con pollo y aderezo césar',
                18000,
                'Entrada',
                ['lacteos', 'huevos'],
                ['lechuga', 'pollo', 'queso parmesano', 'crutones'],
                10,
                '/images/ensalada.jpg'
            )
        ]
    }

    static crearMenuTemporada(): MenuTemporada {
        const platillos = this.crearPlatillosBase()
        return new MenuTemporada(
            'Menú Verano 2024',
            'Verano',
            platillos,
            new Date('2024-06-01'),
            new Date('2024-08-31')
        )
    }

    static crearPedidoRecurrente(): PedidoRecurrente {
        const platillos = this.crearPlatillosBase()
        return new PedidoRecurrente(
            '1',
            'cliente123',
            platillos,
            ['sin cebolla', 'extra queso'],
            'semanal',
            'Pedido Semanal Juan'
        )
    }

    static crearClienteFrecuente(): ClienteFrecuente {
        const pedidoRecurrente = this.crearPedidoRecurrente()
        return new ClienteFrecuente(
            '1',
            'Juan Pérez',
            'juan@email.com',
            '3001234567',
            ['gluten'],
            ['comida picante', 'vegetariano'],
            [pedidoRecurrente],
            150
        )
    }
}
