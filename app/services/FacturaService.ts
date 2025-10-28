/**
 * Servicio de Facturas con Prisma y PostgreSQL
 */

import { Factura, ApiResponse, CrearFacturaRequest, EstadoFactura } from '@/app/types';
import PrismaDatabaseService from './PrismaDatabaseService';

export class FacturaService {
    private db: PrismaDatabaseService;

    constructor() {
        this.db = PrismaDatabaseService.getInstance();
    }

    async obtenerFacturas(): Promise<ApiResponse<Factura[]>> {
        try {
            const facturas = await this.db.obtenerFacturas();
            return {
                success: true,
                data: facturas as any
            };
        } catch (error) {
            console.error('Error obteniendo facturas:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener facturas'
            };
        }
    }

    async obtenerFacturaPorId(id: string): Promise<ApiResponse<Factura | null>> {
        try {
            const factura = await this.db.obtenerFacturaPorId(id);
            return {
                success: true,
                data: factura as any
            };
        } catch (error) {
            console.error('Error obteniendo factura:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener factura'
            };
        }
    }

    async crearFactura(datos: CrearFacturaRequest): Promise<ApiResponse<Factura>> {
        try {
            const nuevaFactura = await this.db.crearFactura(datos);
            return {
                success: true,
                data: nuevaFactura as any,
                message: 'Factura creada exitosamente'
            };
        } catch (error) {
            console.error('Error creando factura:', error);
            return {
                success: false,
                error: 'Error interno del servidor al crear factura'
            };
        }
    }

    async actualizarFactura(id: string, datos: Partial<Factura>): Promise<ApiResponse<Factura>> {
        try {
            const facturaActualizada = await this.db.actualizarFactura(id, datos);
            return {
                success: true,
                data: facturaActualizada as any,
                message: 'Factura actualizada exitosamente'
            };
        } catch (error) {
            console.error('Error actualizando factura:', error);
            return {
                success: false,
                error: 'Error interno del servidor al actualizar factura'
            };
        }
    }

    async eliminarFactura(id: string): Promise<ApiResponse<boolean>> {
        try {
            await this.db.eliminarFactura(id);
            return {
                success: true,
                data: true,
                message: 'Factura eliminada exitosamente'
            };
        } catch (error) {
            console.error('Error eliminando factura:', error);
            return {
                success: false,
                error: 'Error interno del servidor al eliminar factura'
            };
        }
    }

    async obtenerFacturasPorEstado(estado: EstadoFactura): Promise<ApiResponse<Factura[]>> {
        try {
            const facturas = await this.db.obtenerFacturas();
            const facturasFiltradas = facturas.filter(f => f.estado === estado);
            return {
                success: true,
                data: facturasFiltradas as any
            };
        } catch (error) {
            console.error('Error obteniendo facturas por estado:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener facturas por estado'
            };
        }
    }

    async obtenerFacturasPorCliente(clienteId: string): Promise<ApiResponse<Factura[]>> {
        try {
            const facturas = await this.db.obtenerFacturas();
            const facturasFiltradas = facturas.filter(f => f.clienteId === clienteId);
            return {
                success: true,
                data: facturasFiltradas as any
            };
        } catch (error) {
            console.error('Error obteniendo facturas por cliente:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener facturas por cliente'
            };
        }
    }

    async obtenerFacturasPorFecha(fechaInicio: Date, fechaFin: Date): Promise<ApiResponse<Factura[]>> {
        try {
            const facturas = await this.db.obtenerFacturas();
            const facturasFiltradas = facturas.filter(f => {
                const fechaFactura = new Date(f.createdAt);
                return fechaFactura >= fechaInicio && fechaFactura <= fechaFin;
            });
            return {
                success: true,
                data: facturasFiltradas as any
            };
        } catch (error) {
            console.error('Error obteniendo facturas por fecha:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener facturas por fecha'
            };
        }
    }

    async calcularTotalVentas(fechaInicio?: Date, fechaFin?: Date): Promise<ApiResponse<number>> {
        try {
            const facturas = await this.db.obtenerFacturas();
            let facturasFiltradas = facturas;

            if (fechaInicio && fechaFin) {
                facturasFiltradas = facturas.filter(f => {
                    const fechaFactura = new Date(f.createdAt);
                    return fechaFactura >= fechaInicio && fechaFactura <= fechaFin;
                });
            }

            const total = facturasFiltradas.reduce((sum, f) => sum + f.total, 0);
            return {
                success: true,
                data: total
            };
        } catch (error) {
            console.error('Error calculando total de ventas:', error);
            return {
                success: false,
                error: 'Error interno del servidor al calcular total de ventas'
            };
        }
    }
}