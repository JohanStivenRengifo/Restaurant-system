/**
 * Manejador para validar datos de domicilio si es un pedido a domicilio
 */

import { ValidadorPedidoHandler, ContextoValidacion, ResultadoValidacion } from './ValidadorPedidoHandler';
import { TipoPedido } from '@/app/types';

export class ValidadorDomicilioHandler extends ValidadorPedidoHandler {
    protected async procesar(contexto: ContextoValidacion): Promise<ResultadoValidacion> {
        const { pedido } = contexto;

        if (pedido.tipo !== TipoPedido.DOMICILIO) {
            return { valido: true, errores: [] };
        }

        if (!pedido.direccion || pedido.direccion.trim() === '') {
            contexto.errores.push('Los pedidos a domicilio requieren una dirección');
            return { valido: false, errores: contexto.errores };
        }

        if (!pedido.telefono || pedido.telefono.trim() === '') {
            contexto.errores.push('Los pedidos a domicilio requieren un número de teléfono');
            return { valido: false, errores: contexto.errores };
        }

        const telefonoRegex = /^[0-9+\-\s()]+$/;
        if (!telefonoRegex.test(pedido.telefono)) {
            contexto.errores.push('El número de teléfono no es válido');
            return { valido: false, errores: contexto.errores };
        }

        return { valido: true, errores: [] };
    }
}