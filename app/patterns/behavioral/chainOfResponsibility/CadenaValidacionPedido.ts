/**
 * Coordinador que construye y ejecuta la cadena de validación de pedidos
 * Implementa el patrón Chain of Responsibility
 */

import { CrearPedidoRequest } from '@/app/types';
import { ValidadorPedidoHandler, ContextoValidacion, ResultadoValidacion } from './ValidadorPedidoHandler';
import { ValidadorPlatillosHandler } from './ValidadorPlatillosHandler';
import { ValidadorTotalHandler } from './ValidadorTotalHandler';
import { ValidadorMesaHandler } from './ValidadorMesaHandler';
import { ValidadorClienteHandler } from './ValidadorClienteHandler';
import { ValidadorDomicilioHandler } from './ValidadorDomicilioHandler';

export interface ResultadoValidacionCompleto extends ResultadoValidacion {
    contexto?: ContextoValidacion;
}

export class CadenaValidacionPedido {
    private cadena: ValidadorPedidoHandler;

    constructor() {
        const validadorPlatillos = new ValidadorPlatillosHandler();
        const validadorTotal = new ValidadorTotalHandler();
        const validadorMesa = new ValidadorMesaHandler();
        const validadorCliente = new ValidadorClienteHandler();
        const validadorDomicilio = new ValidadorDomicilioHandler();

        this.cadena = validadorPlatillos;
        validadorPlatillos.setSiguiente(validadorTotal);
        validadorTotal.setSiguiente(validadorMesa);
        validadorMesa.setSiguiente(validadorCliente);
        validadorCliente.setSiguiente(validadorDomicilio);
    }

    public async validar(pedido: CrearPedidoRequest): Promise<ResultadoValidacionCompleto> {
        const contexto: ContextoValidacion = {
            pedido,
            errores: []
        };

        const resultado = await this.cadena.validar(contexto);

        return {
            ...resultado,
            contexto
        };
    }
}