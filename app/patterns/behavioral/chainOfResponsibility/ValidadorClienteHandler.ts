/**
 * Manejador para validar datos del cliente si se proporciona
 */

import { ValidadorPedidoHandler, ContextoValidacion, ResultadoValidacion } from './ValidadorPedidoHandler';
import PrismaDatabaseService from '@/app/services/PrismaDatabaseService';

export class ValidadorClienteHandler extends ValidadorPedidoHandler {
    private db: PrismaDatabaseService;

    constructor() {
        super();
        this.db = PrismaDatabaseService.getInstance();
    }

    protected async procesar(contexto: ContextoValidacion): Promise<ResultadoValidacion> {
        const { pedido } = contexto;

        if (!pedido.clienteId) {
            return { valido: true, errores: [] };
        }

        const cliente = await this.db.obtenerClientePorId(pedido.clienteId);

        if (!cliente) {
            contexto.errores.push(`El cliente con ID ${pedido.clienteId} no existe`);
            return { valido: false, errores: contexto.errores };
        }

        if (!cliente.activo) {
            contexto.errores.push(`El cliente "${cliente.nombre}" no está activo`);
            return { valido: false, errores: contexto.errores };
        }

        return { valido: true, errores: [] };
    }
}