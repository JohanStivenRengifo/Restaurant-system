/**
 * Manejador para validar que el total del pedido sea correcto
 */

import { ValidadorPedidoHandler, ContextoValidacion, ResultadoValidacion } from './ValidadorPedidoHandler';
import PrismaDatabaseService from '@/app/services/PrismaDatabaseService';

export class ValidadorTotalHandler extends ValidadorPedidoHandler {
    private db: PrismaDatabaseService;

    constructor() {
        super();
        this.db = PrismaDatabaseService.getInstance();
    }

    protected async procesar(contexto: ContextoValidacion): Promise<ResultadoValidacion> {
        const { pedido } = contexto;

        if (!pedido.platillos || pedido.platillos.length === 0) {
            return { valido: true, errores: [] };
        }

        const menu = await this.db.obtenerPlatillos();
        let totalCalculado = 0;
        const platillosConPrecio: any[] = [];

        for (const platilloRequest of pedido.platillos) {
            const platillo = menu.find((p: any) => p.id === platilloRequest.platilloId);
            if (!platillo) continue;

            const precio = platillo.precio || 0;
            const subtotal = precio * platilloRequest.cantidad;
            totalCalculado += subtotal;

            platillosConPrecio.push({
                platilloId: platilloRequest.platilloId,
                cantidad: platilloRequest.cantidad,
                precioUnitario: precio,
                precio: precio,
                personalizacion: platilloRequest.personalizacion || [],
                notas: platilloRequest.notas || ''
            });
        }

        if (totalCalculado <= 0) {
            contexto.errores.push('El total del pedido debe ser mayor a 0');
            return { valido: false, errores: contexto.errores };
        }

        contexto.totalCalculado = totalCalculado;
        contexto.platillosConPrecio = platillosConPrecio;

        return { valido: true, errores: [] };
    }
}