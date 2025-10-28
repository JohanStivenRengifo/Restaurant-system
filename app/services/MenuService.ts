/**
 * Servicio de Menú con Prisma y PostgreSQL
 */

import { Platillo, ApiResponse, CrearPlatilloRequest } from '@/app/types';
import PrismaDatabaseService from './PrismaDatabaseService';

export class MenuService {
    private db: PrismaDatabaseService;

    constructor() {
        this.db = PrismaDatabaseService.getInstance();
    }

    async obtenerPlatillos(): Promise<ApiResponse<Platillo[]>> {
        try {
            const platillos = await this.db.obtenerPlatillos();
            return {
                success: true,
                data: platillos as any
            };
        } catch (error) {
            console.error('Error obteniendo platillos:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener platillos'
            };
        }
    }

    async obtenerPlatilloPorId(id: string): Promise<ApiResponse<Platillo | null>> {
        try {
            const platillo = await this.db.obtenerPlatilloPorId(id);
            return {
                success: true,
                data: platillo as any
            };
        } catch (error) {
            console.error('Error obteniendo platillo:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener platillo'
            };
        }
    }

    async crearPlatillo(datos: CrearPlatilloRequest): Promise<ApiResponse<Platillo>> {
        try {
            const nuevoPlatillo = await this.db.crearPlatillo(datos);
            return {
                success: true,
                data: nuevoPlatillo as any,
                message: 'Platillo creado exitosamente'
            };
        } catch (error) {
            console.error('Error creando platillo:', error);
            return {
                success: false,
                error: 'Error interno del servidor al crear platillo'
            };
        }
    }

    async actualizarPlatillo(id: string, datos: Partial<Platillo>): Promise<ApiResponse<Platillo>> {
        try {
            const platilloActualizado = await this.db.actualizarPlatillo(id, datos);
            return {
                success: true,
                data: platilloActualizado as any,
                message: 'Platillo actualizado exitosamente'
            };
        } catch (error) {
            console.error('Error actualizando platillo:', error);
            return {
                success: false,
                error: 'Error interno del servidor al actualizar platillo'
            };
        }
    }

    async eliminarPlatillo(id: string): Promise<ApiResponse<boolean>> {
        try {
            await this.db.eliminarPlatillo(id);
            return {
                success: true,
                data: true,
                message: 'Platillo eliminado exitosamente'
            };
        } catch (error) {
            console.error('Error eliminando platillo:', error);
            return {
                success: false,
                error: 'Error interno del servidor al eliminar platillo'
            };
        }
    }

    async obtenerPlatillosPorCategoria(categoriaId: string): Promise<ApiResponse<Platillo[]>> {
        try {
            const platillos = await this.db.obtenerPlatillos();
            const platillosFiltrados = platillos.filter(p => p.categoriaId === categoriaId);
            return {
                success: true,
                data: platillosFiltrados as any
            };
        } catch (error) {
            console.error('Error obteniendo platillos por categoría:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener platillos por categoría'
            };
        }
    }

    async obtenerPlatillosActivos(): Promise<ApiResponse<Platillo[]>> {
        try {
            const platillos = await this.db.obtenerPlatillos();
            const platillosActivos = platillos.filter(p => p.activo);
            return {
                success: true,
                data: platillosActivos as any
            };
        } catch (error) {
            console.error('Error obteniendo platillos activos:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener platillos activos'
            };
        }
    }

    async obtenerCategorias(): Promise<ApiResponse<string[]>> {
        try {
            const categorias = await this.db.obtenerCategorias();
            return {
                success: true,
                data: categorias.map(c => c.nombre)
            };
        } catch (error) {
            console.error('Error obteniendo categorías:', error);
            return {
                success: false,
                error: 'Error interno del servidor al obtener categorías'
            };
        }
    }

    async buscarPlatillosPorNombre(nombre: string): Promise<ApiResponse<Platillo[]>> {
        try {
            const platillos = await this.db.obtenerPlatillos();
            const platillosFiltrados = platillos.filter(p =>
                p.nombre.toLowerCase().includes(nombre.toLowerCase())
            );
            return {
                success: true,
                data: platillosFiltrados as any
            };
        } catch (error) {
            console.error('Error buscando platillos:', error);
            return {
                success: false,
                error: 'Error interno del servidor al buscar platillos'
            };
        }
    }
}