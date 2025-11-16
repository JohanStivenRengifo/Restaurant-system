/**
 * Manejador para validar que la mesa esté disponible si es un pedido de mesa
 */

import { ValidadorPedidoHandler, ContextoValidacion, ResultadoValidacion } from './ValidadorPedidoHandler';
import { TipoPedido } from '@/app/types';
import PrismaDatabaseService from '@/app/services/PrismaDatabaseService';

export class ValidadorMesaHandler extends ValidadorPedidoHandler {
    private db: PrismaDatabaseService;

    constructor() {
        super();
        this.db = PrismaDatabaseService.getInstance();
    }

    protected async procesar(contexto: ContextoValidacion): Promise<ResultadoValidacion> {
        const { pedido } = contexto;

        if (pedido.tipo !== TipoPedido.MESA) {
            return { valido: true, errores: [] };
        }

        if (!pedido.mesaId) {
            contexto.errores.push('Los pedidos de mesa requieren una mesa asignada');
            return { valido: false, errores: contexto.errores };
        }

        const mesa = await this.db.obtenerMesaPorId(pedido.mesaId);

        if (!mesa) {
            contexto.errores.push(`La mesa con ID ${pedido.mesaId} no existe`);
            return { valido: false, errores: contexto.errores };
        }

        if (mesa.estado === 'OCUPADA' || mesa.estado === 'RESERVADA') {
            contexto.errores.push(`La mesa ${mesa.numero} no está disponible (estado: ${mesa.estado})`);
            return { valido: false, errores: contexto.errores };
        }

        if (mesa.estado === 'MANTENIMIENTO') {
            contexto.errores.push(`La mesa ${mesa.numero} está en mantenimiento`);
            return { valido: false, errores: contexto.errores };
        }

        return { valido: true, errores: [] };
    }
}