/**
 * DECORATOR PATTERN - PlatilloDecorador
 * Añade responsabilidades a objetos dinámicamente
 * Permite personalizar platillos con modificadores sin alterar la clase base
 */

export interface PlatilloBase {
    obtenerPrecio(): number
    obtenerDescripcion(): string
    obtenerTiempoPrep(): number
    obtenerAlergenos(): string[]
}

export class Platillo implements PlatilloBase {
    constructor(
        public nombre: string,
        public precio: number,
        public descripcion: string,
        public tiempoPrep: number,
        public alergenos: string[]
    ) { }

    obtenerPrecio(): number {
        return this.precio
    }

    obtenerDescripcion(): string {
        return this.descripcion
    }

    obtenerTiempoPrep(): number {
        return this.tiempoPrep
    }

    obtenerAlergenos(): string[] {
        return this.alergenos
    }
}

// Decorador abstracto
export abstract class PlatilloDecorador implements PlatilloBase {
    constructor(protected platillo: PlatilloBase) { }

    obtenerPrecio(): number {
        return this.platillo.obtenerPrecio()
    }

    obtenerDescripcion(): string {
        return this.platillo.obtenerDescripcion()
    }

    obtenerTiempoPrep(): number {
        return this.platillo.obtenerTiempoPrep()
    }

    obtenerAlergenos(): string[] {
        return this.platillo.obtenerAlergenos()
    }
}

// Decoradores concretos para modificadores de platillos
export class PlatilloConExtraSalsa extends PlatilloDecorador {
    private costoExtra = 2000

    obtenerPrecio(): number {
        return this.platillo.obtenerPrecio() + this.costoExtra
    }

    obtenerDescripcion(): string {
        return this.platillo.obtenerDescripcion() + " + Extra salsa"
    }

    obtenerTiempoPrep(): number {
        return this.platillo.obtenerTiempoPrep() + 2
    }
}

export class PlatilloSinGluten extends PlatilloDecorador {
    private costoModificacion = 3000

    obtenerPrecio(): number {
        return this.platillo.obtenerPrecio() + this.costoModificacion
    }

    obtenerDescripcion(): string {
        return this.platillo.obtenerDescripcion() + " (Sin gluten)"
    }

    obtenerTiempoPrep(): number {
        return this.platillo.obtenerTiempoPrep() + 5
    }

    obtenerAlergenos(): string[] {
        return this.platillo.obtenerAlergenos().filter(alergeno => alergeno !== 'gluten')
    }
}

export class PlatilloSinLacteos extends PlatilloDecorador {
    private costoModificacion = 2500

    obtenerPrecio(): number {
        return this.platillo.obtenerPrecio() + this.costoModificacion
    }

    obtenerDescripcion(): string {
        return this.platillo.obtenerDescripcion() + " (Sin lácteos)"
    }

    obtenerTiempoPrep(): number {
        return this.platillo.obtenerTiempoPrep() + 3
    }

    obtenerAlergenos(): string[] {
        return this.platillo.obtenerAlergenos().filter(alergeno => alergeno !== 'lacteos')
    }
}

export class PlatilloConExtraQueso extends PlatilloDecorador {
    private costoExtra = 4000

    obtenerPrecio(): number {
        return this.platillo.obtenerPrecio() + this.costoExtra
    }

    obtenerDescripcion(): string {
        return this.platillo.obtenerDescripcion() + " + Extra queso"
    }

    obtenerTiempoPrep(): number {
        return this.platillo.obtenerTiempoPrep() + 2
    }

    obtenerAlergenos(): string[] {
        const alergenos = [...this.platillo.obtenerAlergenos()]
        if (!alergenos.includes('lacteos')) {
            alergenos.push('lacteos')
        }
        return alergenos
    }
}

export class PlatilloPicante extends PlatilloDecorador {
    private costoExtra = 1500

    obtenerPrecio(): number {
        return this.platillo.obtenerPrecio() + this.costoExtra
    }

    obtenerDescripcion(): string {
        return this.platillo.obtenerDescripcion() + " (Picante)"
    }

    obtenerTiempoPrep(): number {
        return this.platillo.obtenerTiempoPrep() + 1
    }
}

export class PlatilloVegetariano extends PlatilloDecorador {
    private costoModificacion = 2000

    obtenerPrecio(): number {
        return this.platillo.obtenerPrecio() + this.costoModificacion
    }

    obtenerDescripcion(): string {
        return this.platillo.obtenerDescripcion() + " (Versión vegetariana)"
    }

    obtenerTiempoPrep(): number {
        return this.platillo.obtenerTiempoPrep() + 3
    }
}

// Decorador para servicios adicionales del pedido
export interface PedidoBase {
    obtenerTotal(): number
    obtenerDescripcion(): string
    obtenerTiempoEntrega(): number
}

export class Pedido implements PedidoBase {
    constructor(
        public platillos: PlatilloBase[],
        public tipo: 'MESA' | 'PARA_LLEVAR' | 'DOMICILIO'
    ) { }

    obtenerTotal(): number {
        return this.platillos.reduce((total, platillo) => total + platillo.obtenerPrecio(), 0)
    }

    obtenerDescripcion(): string {
        return this.platillos.map(p => p.obtenerDescripcion()).join(', ')
    }

    obtenerTiempoEntrega(): number {
        return Math.max(...this.platillos.map(p => p.obtenerTiempoPrep()))
    }
}

export abstract class PedidoDecorador implements PedidoBase {
    constructor(protected pedido: PedidoBase) { }

    obtenerTotal(): number {
        return this.pedido.obtenerTotal()
    }

    obtenerDescripcion(): string {
        return this.pedido.obtenerDescripcion()
    }

    obtenerTiempoEntrega(): number {
        return this.pedido.obtenerTiempoEntrega()
    }
}

export class PedidoConEnvio extends PedidoDecorador {
    private costoEnvio = 5000

    obtenerTotal(): number {
        return this.pedido.obtenerTotal() + this.costoEnvio
    }

    obtenerDescripcion(): string {
        return this.pedido.obtenerDescripcion() + " + Envío a domicilio"
    }

    obtenerTiempoEntrega(): number {
        return this.pedido.obtenerTiempoEntrega() + 30 // +30 minutos para envío
    }
}

export class PedidoConEmbalajeEspecial extends PedidoDecorador {
    private costoEmbalaje = 3000

    obtenerTotal(): number {
        return this.pedido.obtenerTotal() + this.costoEmbalaje
    }

    obtenerDescripcion(): string {
        return this.pedido.obtenerDescripcion() + " + Embalaje especial"
    }

    obtenerTiempoEntrega(): number {
        return this.pedido.obtenerTiempoEntrega() + 5 // +5 minutos para embalaje
    }
}

export class PedidoConServicioVIP extends PedidoDecorador {
    private costoVIP = 10000

    obtenerTotal(): number {
        return this.pedido.obtenerTotal() + this.costoVIP
    }

    obtenerDescripcion(): string {
        return this.pedido.obtenerDescripcion() + " + Servicio VIP"
    }

    obtenerTiempoEntrega(): number {
        return Math.max(15, this.pedido.obtenerTiempoEntrega() - 10) // Máximo 10 minutos menos
    }
}

// Decorador para clientes con beneficios
export interface ClienteBase {
    obtenerDescuento(): number
    obtenerPuntos(): number
    obtenerBeneficios(): string[]
}

export class Cliente implements ClienteBase {
    constructor(
        public nombre: string,
        public puntos: number = 0,
        public esFrecuente: boolean = false
    ) { }

    obtenerDescuento(): number {
        return this.esFrecuente ? 5 : 0 // 5% descuento para clientes frecuentes
    }

    obtenerPuntos(): number {
        return this.puntos
    }

    obtenerBeneficios(): string[] {
        return this.esFrecuente ? ['Descuento 5%'] : []
    }
}

export abstract class ClienteDecorador implements ClienteBase {
    constructor(protected cliente: ClienteBase) { }

    obtenerDescuento(): number {
        return this.cliente.obtenerDescuento()
    }

    obtenerPuntos(): number {
        return this.cliente.obtenerPuntos()
    }

    obtenerBeneficios(): string[] {
        return this.cliente.obtenerBeneficios()
    }
}

export class ClienteVIP extends ClienteDecorador {
    obtenerDescuento(): number {
        return this.cliente.obtenerDescuento() + 10 // +10% adicional
    }

    obtenerPuntos(): number {
        return Math.floor(this.cliente.obtenerPuntos() * 1.5) // 50% más puntos
    }

    obtenerBeneficios(): string[] {
        return [...this.cliente.obtenerBeneficios(), 'Descuento VIP 10%', 'Puntos dobles', 'Servicio prioritario']
    }
}

export class ClientePremium extends ClienteDecorador {
    obtenerDescuento(): number {
        return this.cliente.obtenerDescuento() + 15 // +15% adicional
    }

    obtenerPuntos(): number {
        return this.cliente.obtenerPuntos() * 2 // Puntos dobles
    }

    obtenerBeneficios(): string[] {
        return [...this.cliente.obtenerBeneficios(), 'Descuento Premium 15%', 'Puntos triples', 'Mesa reservada', 'Chef personal']
    }
}

// Factory para crear decoradores
export class DecoradorFactory {
    static crearPlatilloDecorado(platillo: PlatilloBase, modificadores: string[]): PlatilloBase {
        let platilloDecorado = platillo

        modificadores.forEach(modificador => {
            switch (modificador.toLowerCase()) {
                case 'extra salsa':
                    platilloDecorado = new PlatilloConExtraSalsa(platilloDecorado)
                    break
                case 'sin gluten':
                    platilloDecorado = new PlatilloSinGluten(platilloDecorado)
                    break
                case 'sin lacteos':
                    platilloDecorado = new PlatilloSinLacteos(platilloDecorado)
                    break
                case 'extra queso':
                    platilloDecorado = new PlatilloConExtraQueso(platilloDecorado)
                    break
                case 'picante':
                    platilloDecorado = new PlatilloPicante(platilloDecorado)
                    break
                case 'vegetariano':
                    platilloDecorado = new PlatilloVegetariano(platilloDecorado)
                    break
            }
        })

        return platilloDecorado
    }

    static crearPedidoDecorado(pedido: PedidoBase, servicios: string[]): PedidoBase {
        let pedidoDecorado = pedido

        servicios.forEach(servicio => {
            switch (servicio.toLowerCase()) {
                case 'envio':
                    pedidoDecorado = new PedidoConEnvio(pedidoDecorado)
                    break
                case 'embalaje especial':
                    pedidoDecorado = new PedidoConEmbalajeEspecial(pedidoDecorado)
                    break
                case 'servicio vip':
                    pedidoDecorado = new PedidoConServicioVIP(pedidoDecorado)
                    break
            }
        })

        return pedidoDecorado
    }

    static crearClienteDecorado(cliente: ClienteBase, tipo: 'VIP' | 'PREMIUM'): ClienteBase {
        switch (tipo) {
            case 'VIP':
                return new ClienteVIP(cliente)
            case 'PREMIUM':
                return new ClientePremium(cliente)
            default:
                return cliente
        }
    }
}
