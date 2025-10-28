/**
 * FACTORY METHOD PATTERN - PlatilloFactory
 * Permite crear diferentes tipos de platillos sin especificar sus clases concretas
 * Facilita la extensión para nuevos tipos de platillos sin modificar código existente
 */

export interface Platillo {
    id: string
    nombre: string
    descripcion: string
    precio: number
    categoria: string
    alergenos: string[]
    tiempoPrep: number
    obtenerPrecio(): number
    obtenerDescripcion(): string
    obtenerTiempoPrep(): number
}

export abstract class PlatilloFactory {
    abstract crearPlatillo(): Platillo

    // Método template que define el proceso común
    public procesarPlatillo(): Platillo {
        const platillo = this.crearPlatillo()
        console.log(`Creando ${platillo.categoria}: ${platillo.nombre}`)
        return platillo
    }
}

// Implementaciones concretas para cada tipo de platillo
export class EntradaFactory extends PlatilloFactory {
    crearPlatillo(): Platillo {
        return new Entrada()
    }
}

export class PlatoPrincipalFactory extends PlatilloFactory {
    crearPlatillo(): Platillo {
        return new PlatoPrincipal()
    }
}

export class PostreFactory extends PlatilloFactory {
    crearPlatillo(): Platillo {
        return new Postre()
    }
}

export class BebidaFactory extends PlatilloFactory {
    crearPlatillo(): Platillo {
        return new Bebida()
    }
}

// Clases concretas de platillos
export class Entrada implements Platillo {
    id = Math.random().toString(36).substr(2, 9)
    nombre = 'Entrada del Chef'
    descripcion = 'Selección de entradas frescas'
    precio = 15000
    categoria = 'Entrada'
    alergenos: string[] = []
    tiempoPrep = 10

    obtenerPrecio(): number {
        return this.precio
    }

    obtenerDescripcion(): string {
        return this.descripcion
    }

    obtenerTiempoPrep(): number {
        return this.tiempoPrep
    }
}

export class PlatoPrincipal implements Platillo {
    id = Math.random().toString(36).substr(2, 9)
    nombre = 'Plato Principal'
    descripcion = 'Nuestro plato estrella'
    precio = 35000
    categoria = 'Plato Principal'
    alergenos: string[] = ['gluten', 'lacteos']
    tiempoPrep = 25

    obtenerPrecio(): number {
        return this.precio
    }

    obtenerDescripcion(): string {
        return this.descripcion
    }

    obtenerTiempoPrep(): number {
        return this.tiempoPrep
    }
}

export class Postre implements Platillo {
    id = Math.random().toString(36).substr(2, 9)
    nombre = 'Postre Especial'
    descripcion = 'Dulce final perfecto'
    precio = 12000
    categoria = 'Postre'
    alergenos: string[] = ['lacteos', 'huevos']
    tiempoPrep = 5

    obtenerPrecio(): number {
        return this.precio
    }

    obtenerDescripcion(): string {
        return this.descripcion
    }

    obtenerTiempoPrep(): number {
        return this.tiempoPrep
    }
}

export class Bebida implements Platillo {
    id = Math.random().toString(36).substr(2, 9)
    nombre = 'Bebida Refrescante'
    descripcion = 'Bebida para acompañar tu comida'
    precio = 8000
    categoria = 'Bebida'
    alergenos: string[] = []
    tiempoPrep = 2

    obtenerPrecio(): number {
        return this.precio
    }

    obtenerDescripcion(): string {
        return this.descripcion
    }

    obtenerTiempoPrep(): number {
        return this.tiempoPrep
    }
}

// Factory para crear pedidos
export interface Pedido {
    id: string
    tipo: 'MESA' | 'PARA_LLEVAR' | 'DOMICILIO'
    estado: 'RECIBIDO' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO'
    platillos: Platillo[]
    total: number
    obtenerTotal(): number
    agregarPlatillo(platillo: Platillo): void
}

export abstract class PedidoFactory {
    abstract crearPedido(): Pedido
}

export class PedidoMesaFactory extends PedidoFactory {
    crearPedido(): Pedido {
        return new PedidoMesa()
    }
}

export class PedidoParaLlevarFactory extends PedidoFactory {
    crearPedido(): Pedido {
        return new PedidoParaLlevar()
    }
}

export class PedidoDomicilioFactory extends PedidoFactory {
    crearPedido(): Pedido {
        return new PedidoDomicilio()
    }
}

export class PedidoMesa implements Pedido {
    id = Math.random().toString(36).substr(2, 9)
    tipo: 'MESA' = 'MESA'
    estado: 'RECIBIDO' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO' = 'RECIBIDO'
    platillos: Platillo[] = []
    total = 0

    obtenerTotal(): number {
        return this.platillos.reduce((sum, platillo) => sum + platillo.obtenerPrecio(), 0)
    }

    agregarPlatillo(platillo: Platillo): void {
        this.platillos.push(platillo)
        this.total = this.obtenerTotal()
    }
}

export class PedidoParaLlevar implements Pedido {
    id = Math.random().toString(36).substr(2, 9)
    tipo: 'PARA_LLEVAR' = 'PARA_LLEVAR'
    estado: 'RECIBIDO' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO' = 'RECIBIDO'
    platillos: Platillo[] = []
    total = 0

    obtenerTotal(): number {
        return this.platillos.reduce((sum, platillo) => sum + platillo.obtenerPrecio(), 0)
    }

    agregarPlatillo(platillo: Platillo): void {
        this.platillos.push(platillo)
        this.total = this.obtenerTotal()
    }
}

export class PedidoDomicilio implements Pedido {
    id = Math.random().toString(36).substr(2, 9)
    tipo: 'DOMICILIO' = 'DOMICILIO'
    estado: 'RECIBIDO' | 'PREPARANDO' | 'LISTO' | 'ENTREGADO' = 'RECIBIDO'
    platillos: Platillo[] = []
    total = 0
    costoDomicilio = 5000

    obtenerTotal(): number {
        const subtotal = this.platillos.reduce((sum, platillo) => sum + platillo.obtenerPrecio(), 0)
        return subtotal + this.costoDomicilio
    }

    agregarPlatillo(platillo: Platillo): void {
        this.platillos.push(platillo)
        this.total = this.obtenerTotal()
    }
}
