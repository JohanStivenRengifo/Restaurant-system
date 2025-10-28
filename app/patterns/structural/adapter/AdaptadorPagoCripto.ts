/**
 * ADAPTER PATTERN - AdaptadorPagoCripto
 * Permite interfaces incompatibles que trabajen juntas
 * Integra sistemas de pago externos con el sistema interno del restaurante
 */

// Interfaces del sistema interno
export interface SistemaPagoInterno {
    procesarPago(monto: number, metodo: string): Promise<ResultadoPago>
    obtenerMetodosDisponibles(): string[]
    validarPago(datos: any): boolean
}

export interface ResultadoPago {
    exito: boolean
    transaccionId?: string
    mensaje: string
    codigoError?: string
}

// Servicios externos (simulados)
export class ServicioCriptoExterno {
    async pagarConBitcoin(amount: number, walletAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
        // Simulación de pago con Bitcoin
        console.log(`Procesando pago de ${amount} BTC a ${walletAddress}`)

        if (amount <= 0) {
            return { success: false, error: 'Monto inválido' }
        }

        // Simular procesamiento
        await new Promise(resolve => setTimeout(resolve, 2000))

        return {
            success: true,
            txHash: `btc_${Math.random().toString(36).substr(2, 9)}`
        }
    }

    async pagarConEthereum(amount: number, walletAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
        console.log(`Procesando pago de ${amount} ETH a ${walletAddress}`)

        if (amount <= 0) {
            return { success: false, error: 'Monto inválido' }
        }

        await new Promise(resolve => setTimeout(resolve, 1500))

        return {
            success: true,
            txHash: `eth_${Math.random().toString(36).substr(2, 9)}`
        }
    }
}

export class ServicioPayPalExterno {
    async procesarPagoPayPal(amount: number, email: string): Promise<{ success: boolean; transactionId?: string; error?: string }> {
        console.log(`Procesando pago PayPal de $${amount} para ${email}`)

        if (amount <= 0) {
            return { success: false, error: 'Monto inválido' }
        }

        await new Promise(resolve => setTimeout(resolve, 1000))

        return {
            success: true,
            transactionId: `pp_${Math.random().toString(36).substr(2, 9)}`
        }
    }
}

export class ServicioStripeExterno {
    async procesarTarjeta(amount: number, cardToken: string): Promise<{ success: boolean; chargeId?: string; error?: string }> {
        console.log(`Procesando tarjeta por $${amount} con token ${cardToken}`)

        if (amount <= 0) {
            return { success: false, error: 'Monto inválido' }
        }

        await new Promise(resolve => setTimeout(resolve, 800))

        return {
            success: true,
            chargeId: `stripe_${Math.random().toString(36).substr(2, 9)}`
        }
    }
}

// Adaptadores para integrar servicios externos
export class AdaptadorCripto implements SistemaPagoInterno {
    constructor(private servicioCripto: ServicioCriptoExterno) { }

    async procesarPago(monto: number, metodo: string): Promise<ResultadoPago> {
        try {
            const walletAddress = 'restaurant_wallet_address' // En producción sería configurable

            let resultado
            if (metodo === 'BITCOIN') {
                resultado = await this.servicioCripto.pagarConBitcoin(monto, walletAddress)
            } else if (metodo === 'ETHEREUM') {
                resultado = await this.servicioCripto.pagarConEthereum(monto, walletAddress)
            } else {
                return {
                    exito: false,
                    mensaje: 'Método de criptomoneda no soportado',
                    codigoError: 'UNSUPPORTED_METHOD'
                }
            }

            return {
                exito: resultado.success,
                transaccionId: resultado.txHash,
                mensaje: resultado.success ? 'Pago con criptomoneda procesado exitosamente' : 'Error en pago con criptomoneda',
                codigoError: resultado.error
            }
        } catch (error) {
            return {
                exito: false,
                mensaje: 'Error interno procesando pago con criptomoneda',
                codigoError: 'INTERNAL_ERROR'
            }
        }
    }

    obtenerMetodosDisponibles(): string[] {
        return ['BITCOIN', 'ETHEREUM']
    }

    validarPago(datos: any): boolean {
        return datos && datos.monto > 0 && datos.metodo && this.obtenerMetodosDisponibles().includes(datos.metodo)
    }
}

export class AdaptadorPayPal implements SistemaPagoInterno {
    constructor(private servicioPayPal: ServicioPayPalExterno) { }

    async procesarPago(monto: number, metodo: string): Promise<ResultadoPago> {
        try {
            const email = 'restaurant@paypal.com' // En producción sería dinámico

            const resultado = await this.servicioPayPal.procesarPagoPayPal(monto, email)

            return {
                exito: resultado.success,
                transaccionId: resultado.transactionId,
                mensaje: resultado.success ? 'Pago con PayPal procesado exitosamente' : 'Error en pago con PayPal',
                codigoError: resultado.error
            }
        } catch (error) {
            return {
                exito: false,
                mensaje: 'Error interno procesando pago con PayPal',
                codigoError: 'INTERNAL_ERROR'
            }
        }
    }

    obtenerMetodosDisponibles(): string[] {
        return ['PAYPAL']
    }

    validarPago(datos: any): boolean {
        return datos && datos.monto > 0 && datos.email && datos.email.includes('@')
    }
}

export class AdaptadorStripe implements SistemaPagoInterno {
    constructor(private servicioStripe: ServicioStripeExterno) { }

    async procesarPago(monto: number, metodo: string): Promise<ResultadoPago> {
        try {
            const cardToken = 'tok_' + Math.random().toString(36).substr(2, 9) // En producción sería real

            const resultado = await this.servicioStripe.procesarTarjeta(monto, cardToken)

            return {
                exito: resultado.success,
                transaccionId: resultado.chargeId,
                mensaje: resultado.success ? 'Pago con tarjeta procesado exitosamente' : 'Error en pago con tarjeta',
                codigoError: resultado.error
            }
        } catch (error) {
            return {
                exito: false,
                mensaje: 'Error interno procesando pago con tarjeta',
                codigoError: 'INTERNAL_ERROR'
            }
        }
    }

    obtenerMetodosDisponibles(): string[] {
        return ['TARJETA_CREDITO', 'TARJETA_DEBITO']
    }

    validarPago(datos: any): boolean {
        return datos && datos.monto > 0 && datos.cardToken && datos.cardToken.startsWith('tok_')
    }
}

// Adaptador para proveedores de delivery externos
export interface SistemaDeliveryInterno {
    crearPedido(pedido: PedidoDelivery): Promise<ResultadoDelivery>
    rastrearPedido(id: string): Promise<EstadoDelivery>
    cancelarPedido(id: string): Promise<boolean>
}

export interface PedidoDelivery {
    id: string
    direccion: string
    telefono: string
    platillos: string[]
    total: number
    notas?: string
}

export interface ResultadoDelivery {
    exito: boolean
    deliveryId?: string
    tiempoEstimado?: number
    mensaje: string
}

export interface EstadoDelivery {
    estado: 'PENDIENTE' | 'CONFIRMADO' | 'PREPARANDO' | 'EN_CAMINO' | 'ENTREGADO' | 'CANCELADO'
    tiempoEstimado?: number
    ubicacion?: string
}

export class ServicioRappiExterno {
    async crearPedidoRappi(datos: any): Promise<{ success: boolean; orderId?: string; eta?: number; error?: string }> {
        console.log('Creando pedido en Rappi:', datos)

        await new Promise(resolve => setTimeout(resolve, 1000))

        return {
            success: true,
            orderId: `rappi_${Math.random().toString(36).substr(2, 9)}`,
            eta: 30
        }
    }

    async rastrearPedidoRappi(orderId: string): Promise<{ status: string; eta?: number; location?: string }> {
        console.log('Rastreando pedido Rappi:', orderId)

        await new Promise(resolve => setTimeout(resolve, 500))

        return {
            status: 'EN_CAMINO',
            eta: 15,
            location: 'Calle 123 #45-67'
        }
    }
}

export class ServicioUberEatsExterno {
    async crearPedidoUberEats(datos: any): Promise<{ success: boolean; orderId?: string; eta?: number; error?: string }> {
        console.log('Creando pedido en Uber Eats:', datos)

        await new Promise(resolve => setTimeout(resolve, 1200))

        return {
            success: true,
            orderId: `uber_${Math.random().toString(36).substr(2, 9)}`,
            eta: 25
        }
    }

    async rastrearPedidoUberEats(orderId: string): Promise<{ status: string; eta?: number; location?: string }> {
        console.log('Rastreando pedido Uber Eats:', orderId)

        await new Promise(resolve => setTimeout(resolve, 600))

        return {
            status: 'PREPARANDO',
            eta: 20,
            location: 'Restaurante'
        }
    }
}

export class AdaptadorRappi implements SistemaDeliveryInterno {
    constructor(private servicioRappi: ServicioRappiExterno) { }

    async crearPedido(pedido: PedidoDelivery): Promise<ResultadoDelivery> {
        try {
            const datosRappi = {
                address: pedido.direccion,
                phone: pedido.telefono,
                items: pedido.platillos,
                total: pedido.total,
                notes: pedido.notas
            }

            const resultado = await this.servicioRappi.crearPedidoRappi(datosRappi)

            return {
                exito: resultado.success,
                deliveryId: resultado.orderId,
                tiempoEstimado: resultado.eta,
                mensaje: resultado.success ? 'Pedido creado en Rappi exitosamente' : 'Error creando pedido en Rappi'
            }
        } catch (error) {
            return {
                exito: false,
                mensaje: 'Error interno creando pedido en Rappi'
            }
        }
    }

    async rastrearPedido(id: string): Promise<EstadoDelivery> {
        try {
            const resultado = await this.servicioRappi.rastrearPedidoRappi(id)

            return {
                estado: resultado.status as any,
                tiempoEstimado: resultado.eta,
                ubicacion: resultado.location
            }
        } catch (error) {
            return {
                estado: 'CANCELADO'
            }
        }
    }

    async cancelarPedido(id: string): Promise<boolean> {
        console.log(`Cancelando pedido Rappi: ${id}`)
        return true
    }
}

export class AdaptadorUberEats implements SistemaDeliveryInterno {
    constructor(private servicioUberEats: ServicioUberEatsExterno) { }

    async crearPedido(pedido: PedidoDelivery): Promise<ResultadoDelivery> {
        try {
            const datosUberEats = {
                delivery_address: pedido.direccion,
                contact_phone: pedido.telefono,
                order_items: pedido.platillos,
                order_total: pedido.total,
                special_instructions: pedido.notas
            }

            const resultado = await this.servicioUberEats.crearPedidoUberEats(datosUberEats)

            return {
                exito: resultado.success,
                deliveryId: resultado.orderId,
                tiempoEstimado: resultado.eta,
                mensaje: resultado.success ? 'Pedido creado en Uber Eats exitosamente' : 'Error creando pedido en Uber Eats'
            }
        } catch (error) {
            return {
                exito: false,
                mensaje: 'Error interno creando pedido en Uber Eats'
            }
        }
    }

    async rastrearPedido(id: string): Promise<EstadoDelivery> {
        try {
            const resultado = await this.servicioUberEats.rastrearPedidoUberEats(id)

            return {
                estado: resultado.status as any,
                tiempoEstimado: resultado.eta,
                ubicacion: resultado.location
            }
        } catch (error) {
            return {
                estado: 'CANCELADO'
            }
        }
    }

    async cancelarPedido(id: string): Promise<boolean> {
        console.log(`Cancelando pedido Uber Eats: ${id}`)
        return true
    }
}

// Adaptador para generación de reportes en diferentes formatos
export interface GeneradorReporteInterno {
    generarReporte(datos: any[], formato: string): string
    exportarReporte(datos: any[], formato: string): Buffer
}

export class ServicioPDFExterno {
    async generarPDF(datos: any[]): Promise<Buffer> {
        console.log('Generando PDF con datos:', datos.length, 'registros')
        // Simulación de generación de PDF
        return Buffer.from('PDF_CONTENT_SIMULATION')
    }
}

export class ServicioExcelExterno {
    async generarExcel(datos: any[]): Promise<Buffer> {
        console.log('Generando Excel con datos:', datos.length, 'registros')
        // Simulación de generación de Excel
        return Buffer.from('EXCEL_CONTENT_SIMULATION')
    }
}

export class AdaptadorReportePDF implements GeneradorReporteInterno {
    constructor(private servicioPDF: ServicioPDFExterno) { }

    generarReporte(datos: any[], formato: string): string {
        console.log(`Generando reporte PDF con ${datos.length} registros`)
        return `Reporte PDF generado con ${datos.length} registros`
    }

    async exportarReporte(datos: any[], formato: string): Promise<Buffer> {
        return await this.servicioPDF.generarPDF(datos)
    }
}

export class AdaptadorReporteExcel implements GeneradorReporteInterno {
    constructor(private servicioExcel: ServicioExcelExterno) { }

    generarReporte(datos: any[], formato: string): string {
        console.log(`Generando reporte Excel con ${datos.length} registros`)
        return `Reporte Excel generado con ${datos.length} registros`
    }

    async exportarReporte(datos: any[], formato: string): Promise<Buffer> {
        return await this.servicioExcel.generarExcel(datos)
    }
}

// Factory para crear adaptadores
export class AdaptadorFactory {
    static crearAdaptadorPago(tipo: 'CRIPTO' | 'PAYPAL' | 'STRIPE'): SistemaPagoInterno {
        switch (tipo) {
            case 'CRIPTO':
                return new AdaptadorCripto(new ServicioCriptoExterno())
            case 'PAYPAL':
                return new AdaptadorPayPal(new ServicioPayPalExterno())
            case 'STRIPE':
                return new AdaptadorStripe(new ServicioStripeExterno())
            default:
                throw new Error('Tipo de adaptador de pago no soportado')
        }
    }

    static crearAdaptadorDelivery(tipo: 'RAPPI' | 'UBER_EATS'): SistemaDeliveryInterno {
        switch (tipo) {
            case 'RAPPI':
                return new AdaptadorRappi(new ServicioRappiExterno())
            case 'UBER_EATS':
                return new AdaptadorUberEats(new ServicioUberEatsExterno())
            default:
                throw new Error('Tipo de adaptador de delivery no soportado')
        }
    }

    static crearAdaptadorReporte(tipo: 'PDF' | 'EXCEL'): GeneradorReporteInterno {
        switch (tipo) {
            case 'PDF':
                return new AdaptadorReportePDF(new ServicioPDFExterno())
            case 'EXCEL':
                return new AdaptadorReporteExcel(new ServicioExcelExterno())
            default:
                throw new Error('Tipo de adaptador de reporte no soportado')
        }
    }
}
