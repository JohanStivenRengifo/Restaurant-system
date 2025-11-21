/**
 * Manejador para validar que el pedido tenga platillos válidos
 */

import { ValidadorPedidoHandler, ContextoValidacion, ResultadoValidacion } from './ValidadorPedidoHandler';
import PrismaDatabaseService from '@/app/services/PrismaDatabaseService';

export class ValidadorPlatillosHandler extends ValidadorPedidoHandler {
    private db: PrismaDatabaseService;

    constructor() {
        super();
        this.db = PrismaDatabaseService.getInstance();
    }

    protected async procesar(contexto: ContextoValidacion): Promise<ResultadoValidacion> {
        const { pedido } = contexto;

        if (!pedido.platillos || pedido.platillos.length === 0) {
            contexto.errores.push('El pedido debe tener al menos un platillo');
            return { valido: false, errores: contexto.errores };
        }

        const menu = await this.db.obtenerPlatillos();

        for (let i = 0; i < pedido.platillos.length; i++) {
            const platilloRequest = pedido.platillos[i];
            const platillo = menu.find((p: any) => p.id === platilloRequest.platilloId);

            if (!platillo) {
                contexto.errores.push(`El platillo con ID ${platilloRequest.platilloId} no existe`);
                continue;
            }

            if (!platillo.activo) {
                contexto.errores.push(`El platillo "${platillo.nombre}" no está disponible`);
                continue;
            }

            if (platilloRequest.cantidad <= 0) {
                contexto.errores.push(`La cantidad del platillo "${platillo.nombre}" debe ser mayor a 0`);
                continue;
            }

            if (platilloRequest.cantidad > 100) {
                contexto.errores.push(`La cantidad del platillo "${platillo.nombre}" no puede ser mayor a 100`);
                continue;
            }
        }

        if (contexto.errores.length > 0) {
            return { valido: false, errores: contexto.errores };
        }

        return { valido: true, errores: [] };
    }
}