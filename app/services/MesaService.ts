/**
 * Servicio de Mesas con Prisma y PostgreSQL
 */

import { Mesa, ApiResponse, CrearMesaRequest, EstadoMesa } from '@/app/types';
import PrismaDatabaseService from './PrismaDatabaseService';

export class MesaService {
    private db: PrismaDatabaseService;

    constructor() {
        this.db = PrismaDatabaseService.getInstance();
    }

    async obtenerMesas(): Promise<ApiResponse<Mesa[]>> {
        try {
            const mesas = await this.db.obtenerMesas();
            return {
                success: true,
                data: mesas as any
            };
        } catch (error) {
            console.error('Error obteniendo mesas:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener mesas'
            };
        }
    }

    async obtenerMesaPorId(id: string): Promise<ApiResponse<Mesa | null>> {
        try {
            const mesa = await this.db.obtenerMesaPorId(id);
            return {
                success: true,
                data: mesa as any
            };
        } catch (error) {
            console.error('Error obteniendo mesa:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener mesa'
            };
        }
    }

    async crearMesa(datos: CrearMesaRequest): Promise<ApiResponse<Mesa>> {
        try {
            const nuevaMesa = await this.db.crearMesa(datos);
            return {
                success: true,
                data: nuevaMesa as any,
                message: 'Mesa creada exitosamente'
            };
        } catch (error) {
            console.error('Error creando mesa:', error);
            return {
                success: false,
                error: 'Error interno del servidor al crear mesa'
            };
        }
    }

    async actualizarMesa(id: string, datos: Partial<Mesa>): Promise<ApiResponse<Mesa>> {
        try {
            const mesaActualizada = await this.db.actualizarMesa(id, datos);
            return {
                success: true,
                data: mesaActualizada as any,
                message: 'Mesa actualizada exitosamente'
            };
        } catch (error) {
            console.error('Error actualizando mesa:', error);
            return {
                success: false,
                error: 'Error interno del servidor al actualizar mesa'
            };
        }
    }

    async eliminarMesa(id: string): Promise<ApiResponse<boolean>> {
        try {
            await this.db.eliminarMesa(id);
            return {
                success: true,
                data: true,
                message: 'Mesa eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error eliminando mesa:', error);
            return {
                success: false,
                error: 'Error interno del servidor al eliminar mesa'
            };
        }
    }

    async actualizarEstadoMesa(id: string, estado: EstadoMesa): Promise<ApiResponse<Mesa>> {
        try {
            const mesaActualizada = await this.db.actualizarMesa(id, { estado });
            return {
                success: true,
                data: mesaActualizada as any,
                message: 'Estado de mesa actualizado exitosamente'
            };
        } catch (error) {
            console.error('Error actualizando estado de mesa:', error);
            return {
                success: false,
                error: 'Error interno del servidor al actualizar estado de mesa'
            };
        }
    }

    async obtenerMesasDisponibles(): Promise<ApiResponse<Mesa[]>> {
        try {
            const mesas = await this.db.obtenerMesas();
            const mesasDisponibles = mesas.filter(m => m.estado === EstadoMesa.DISPONIBLE);
            return {
                success: true,
                data: mesasDisponibles as any
            };
        } catch (error) {
            console.error('Error obteniendo mesas disponibles:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener mesas disponibles'
            };
        }
    }

    async obtenerMesasOcupadas(): Promise<ApiResponse<Mesa[]>> {
        try {
            const mesas = await this.db.obtenerMesas();
            const mesasOcupadas = mesas.filter(m => m.estado === EstadoMesa.OCUPADA);
            return {
                success: true,
                data: mesasOcupadas as any
            };
        } catch (error) {
            console.error('Error obteniendo mesas ocupadas:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener mesas ocupadas'
            };
        }
    }
}