/**
 * Servicio de Pedidos con Prisma y PostgreSQL
 */

import { Pedido, CrearPedidoRequest, ApiResponse, PedidoPlatillo, EstadoPedido, TipoPedido, Platillo } from '@/app/types';
import PrismaDatabaseService from './PrismaDatabaseService';
import { CadenaValidacionPedido } from '@/app/patterns/behavioral/chainOfResponsibility/CadenaValidacionPedido';

export class PedidoService {
    private db: PrismaDatabaseService;
    private cadenaValidacion: CadenaValidacionPedido;

    constructor() {
        this.db = PrismaDatabaseService.getInstance();
        this.cadenaValidacion = new CadenaValidacionPedido();
    }

    /**
     * Crear un nuevo pedido
     * Utiliza el patrón Chain of Responsibility para validar el pedido
     */
    async crearPedido(datos: CrearPedidoRequest): Promise<ApiResponse<Pedido>> {
        try {
            const resultadoValidacion = await this.cadenaValidacion.validar(datos);

            if (!resultadoValidacion.valido) {
                return {
                    success: false,
                    error: resultadoValidacion.errores.join('; ')
                };
            }

            const contexto = resultadoValidacion.contexto;
            
            if (!contexto) {
                return {
                    success: false,
                    error: 'Error en la validación del pedido'
                };
            }

            const pedidoData = {
                clienteId: datos.clienteId,
                mesaId: datos.mesaId,
                tipo: datos.tipo,
                estado: EstadoPedido.RECIBIDO,
                total: contexto.totalCalculado || 0,
                notas: datos.notas || '',
                direccion: datos.direccion,
                telefono: datos.telefono,
                platillos: contexto.platillosConPrecio || []
            };

            const pedidoGuardado = await this.db.crearPedido(pedidoData);

            return {
                success: true,
                data: pedidoGuardado as any,
                message: 'Pedido creado exitosamente'
            };
        } catch (error) {
            console.error('Error creando pedido:', error);
            return {
                success: false,
                error: 'Error interno del servidor al crear pedido'
            };
        }
    }

    /**
     * Obtener todos los pedidos
     */
    async obtenerPedidos(): Promise<ApiResponse<Pedido[]>> {
        try {
            const pedidos = await this.db.obtenerPedidos();

            return {
                success: true,
                data: pedidos as any
            };
        } catch (error) {
            console.error('Error obteniendo pedidos:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener pedidos'
            };
        }
    }

    /**
     * Obtener un pedido por ID
     */
    async obtenerPedidoPorId(id: string): Promise<ApiResponse<Pedido | null>> {
        try {
            const pedido = await this.db.obtenerPedidoPorId(id);

            return {
                success: true,
                data: pedido as any
            };
        } catch (error) {
            console.error('Error obteniendo pedido:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener pedido'
            };
        }
    }

    /**
     * Actualizar un pedido
     */
    async actualizarPedido(id: string, datos: Partial<Pedido>): Promise<ApiResponse<Pedido>> {
        try {
            const pedidoActualizado = await this.db.actualizarPedido(id, datos);

            return {
                success: true,
                data: pedidoActualizado as any,
                message: 'Pedido actualizado exitosamente'
            };
        } catch (error) {
            console.error('Error actualizando pedido:', error);
            return {
                success: false,
                error: 'Error interno del servidor al actualizar pedido'
            };
        }
    }

    /**
     * Eliminar un pedido
     */
    async eliminarPedido(id: string): Promise<ApiResponse<boolean>> {
        try {
            await this.db.eliminarPedido(id);

            return {
                success: true,
                data: true,
                message: 'Pedido eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error eliminando pedido:', error);
            return {
                success: false,
                error: 'Error interno del servidor al eliminar pedido'
            };
        }
    }

    /**
     * Obtener pedidos por estado
     */
    async obtenerPedidosPorEstado(estado: EstadoPedido): Promise<ApiResponse<Pedido[]>> {
        try {
            const pedidos = await this.db.obtenerPedidos();
            const pedidosFiltrados = pedidos.filter(p => p.estado === estado);

            return {
                success: true,
                data: pedidosFiltrados as any
            };
        } catch (error) {
            console.error('Error obteniendo pedidos por estado:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener pedidos por estado'
            };
        }
    }

    /**
     * Obtener pedidos por cliente
     */
    async obtenerPedidosPorCliente(clienteId: string): Promise<ApiResponse<Pedido[]>> {
        try {
            const pedidos = await this.db.obtenerPedidos();
            const pedidosFiltrados = pedidos.filter(p => p.clienteId === clienteId);

            return {
                success: true,
                data: pedidosFiltrados as any
            };
        } catch (error) {
            console.error('Error obteniendo pedidos por cliente:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener pedidos por cliente'
            };
        }
    }

    /**
     * Obtener pedidos por mesa
     */
    async obtenerPedidosPorMesa(mesaId: string): Promise<ApiResponse<Pedido[]>> {
        try {
            const pedidos = await this.db.obtenerPedidos();
            const pedidosFiltrados = pedidos.filter(p => p.mesaId === mesaId);

            return {
                success: true,
                data: pedidosFiltrados as any
            };
        } catch (error) {
            console.error('Error obteniendo pedidos por mesa:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener pedidos por mesa'
            };
        }
    }
}