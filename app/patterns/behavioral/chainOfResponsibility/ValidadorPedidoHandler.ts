/**
 * Patrón Chain of Responsibility para validación de pedidos
 * Permite pasar solicitudes de validación a lo largo de una cadena de manejadores.
 * Cada manejador decide si procesa la solicitud o la pasa al siguiente.
 */

import { CrearPedidoRequest } from '@/app/types';

export interface ResultadoValidacion {
    valido: boolean;
    errores: string[];
}

export interface ContextoValidacion {
    pedido: CrearPedidoRequest;
    platillosConPrecio?: Array<{
        platilloId: string;
        cantidad: number;
        precioUnitario: number;
        precio: number;
        personalizacion: string[];
        notas?: string;
    }>;
    totalCalculado?: number;
    errores: string[];
}

export abstract class ValidadorPedidoHandler {
    protected siguiente?: ValidadorPedidoHandler;

    public setSiguiente(handler: ValidadorPedidoHandler): ValidadorPedidoHandler {
        this.siguiente = handler;
        return handler;
    }

    public async validar(contexto: ContextoValidacion): Promise<ResultadoValidacion> {
        const resultado = await this.procesar(contexto);

        if (!resultado.valido) {
            return resultado;
        }

        if (this.siguiente) {
            return await this.siguiente.validar(contexto);
        }

        return {
            valido: contexto.errores.length === 0,
            errores: contexto.errores
        };
    }

    protected abstract procesar(contexto: ContextoValidacion): Promise<ResultadoValidacion>;
}