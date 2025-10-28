/**
 * Servicio de Clientes con Prisma y PostgreSQL
 */

import { Cliente, ApiResponse, CrearClienteRequest } from '@/app/types';
import PrismaDatabaseService from './PrismaDatabaseService';

export class ClienteService {
    private db: PrismaDatabaseService;

    constructor() {
        this.db = PrismaDatabaseService.getInstance();
    }

    async obtenerClientes(): Promise<ApiResponse<Cliente[]>> {
        try {
            const clientes = await this.db.obtenerClientes();
            return {
                success: true,
                data: clientes as any
            };
        } catch (error) {
            console.error('Error obteniendo clientes:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener clientes'
            };
        }
    }

    async obtenerClientePorId(id: string): Promise<ApiResponse<Cliente | null>> {
        try {
            const cliente = await this.db.obtenerClientePorId(id);
            return {
                success: true,
                data: cliente as any
            };
        } catch (error) {
            console.error('Error obteniendo cliente:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener cliente'
            };
        }
    }

    async crearCliente(datos: CrearClienteRequest): Promise<ApiResponse<Cliente>> {
        try {
            const nuevoCliente = await this.db.crearCliente(datos);
            return {
                success: true,
                data: nuevoCliente as any,
                message: 'Cliente creado exitosamente'
            };
        } catch (error) {
            console.error('Error creando cliente:', error);
            return {
                success: false,
                error: 'Error interno del servidor al crear cliente'
            };
        }
    }

    async actualizarCliente(id: string, datos: Partial<Cliente>): Promise<ApiResponse<Cliente>> {
        try {
            const clienteActualizado = await this.db.actualizarCliente(id, datos);
            return {
                success: true,
                data: clienteActualizado as any,
                message: 'Cliente actualizado exitosamente'
            };
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            return {
                success: false,
                error: 'Error interno del servidor al actualizar cliente'
            };
        }
    }

    async eliminarCliente(id: string): Promise<ApiResponse<boolean>> {
        try {
            await this.db.eliminarCliente(id);
            return {
                success: true,
                data: true,
                message: 'Cliente eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            return {
                success: false,
                error: 'Error interno del servidor al eliminar cliente'
            };
        }
    }

    async buscarClientesPorNombre(nombre: string): Promise<ApiResponse<Cliente[]>> {
        try {
            const clientes = await this.db.obtenerClientes();
            const clientesFiltrados = clientes.filter(c =>
                c.nombre.toLowerCase().includes(nombre.toLowerCase())
            );
            return {
                success: true,
                data: clientesFiltrados as any
            };
        } catch (error) {
            console.error('Error buscando clientes:', error);
            return {
                success: false,
                error: 'Error interno del servidor al buscar clientes'
            };
        }
    }

    async obtenerClientesFrecuentes(): Promise<ApiResponse<Cliente[]>> {
        try {
            const clientes = await this.db.obtenerClientes();
            const clientesFrecuentes = clientes.filter(c => c.esFrecuente);
            return {
                success: true,
                data: clientesFrecuentes as any
            };
        } catch (error) {
            console.error('Error obteniendo clientes frecuentes:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener clientes frecuentes'
            };
        }
    }
}