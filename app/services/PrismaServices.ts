/**
 * Servicios del Sistema de Restaurante
 * Ahora usando PostgreSQL con Prisma en lugar de archivos JSON
 */

import { ApiResponse } from '@/app/types';
import PrismaDatabaseService from './PrismaDatabaseService';

// Instancia singleton del servicio de base de datos
const dbService = PrismaDatabaseService.getInstance();

// Wrapper para Clientes
export class ClienteServiceWrapper {
  async obtenerClientes(): Promise<ApiResponse<any[]>> {
    try {
      const clientes = await dbService.obtenerClientes();
      return {
        success: true,
        data: clientes
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener clientes'
      };
    }
  }

  async obtenerClientePorId(id: string): Promise<ApiResponse<any | null>> {
    try {
      const cliente = await dbService.obtenerClientePorId(id);
      return {
        success: true,
        data: cliente
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener cliente'
      };
    }
  }

  async crearCliente(datos: any): Promise<ApiResponse<any>> {
    try {
      const cliente = await dbService.crearCliente(datos);
      return {
        success: true,
        data: cliente,
        message: 'Cliente creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear cliente'
      };
    }
  }

  async actualizarCliente(id: string, datos: any): Promise<ApiResponse<any>> {
    try {
      const cliente = await dbService.actualizarCliente(id, datos);
      return {
        success: true,
        data: cliente,
        message: 'Cliente actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar cliente'
      };
    }
  }

  async eliminarCliente(id: string): Promise<ApiResponse<boolean>> {
    try {
      await dbService.eliminarCliente(id);
      return {
        success: true,
        data: true,
        message: 'Cliente eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al eliminar cliente'
      };
    }
  }
}

// Wrapper para Mesas
export class MesaServiceWrapper {
  async obtenerMesas(): Promise<ApiResponse<any[]>> {
    try {
      const mesas = await dbService.obtenerMesas();
      return {
        success: true,
        data: mesas
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener mesas'
      };
    }
  }

  async obtenerMesaPorId(id: string): Promise<ApiResponse<any | null>> {
    try {
      const mesa = await dbService.obtenerMesaPorId(id);
      return {
        success: true,
        data: mesa
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener mesa'
      };
    }
  }

  async crearMesa(datos: any): Promise<ApiResponse<any>> {
    try {
      const mesa = await dbService.crearMesa(datos);
      return {
        success: true,
        data: mesa,
        message: 'Mesa creada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear mesa'
      };
    }
  }

  async actualizarMesa(id: string, datos: any): Promise<ApiResponse<any>> {
    try {
      const mesa = await dbService.actualizarMesa(id, datos);
      return {
        success: true,
        data: mesa,
        message: 'Mesa actualizada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar mesa'
      };
    }
  }

  async eliminarMesa(id: string): Promise<ApiResponse<boolean>> {
    try {
      await dbService.eliminarMesa(id);
      return {
        success: true,
        data: true,
        message: 'Mesa eliminada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al eliminar mesa'
      };
    }
  }
}

// Wrapper para Menú/Platillos
export class MenuServiceWrapper {
  async obtenerPlatillos(): Promise<ApiResponse<any[]>> {
    try {
      const platillos = await dbService.obtenerPlatillos();
      return {
        success: true,
        data: platillos
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener platillos'
      };
    }
  }

  async obtenerPlatilloPorId(id: string): Promise<ApiResponse<any | null>> {
    try {
      const platillo = await dbService.obtenerPlatilloPorId(id);
      return {
        success: true,
        data: platillo
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener platillo'
      };
    }
  }

  async crearPlatillo(datos: any): Promise<ApiResponse<any>> {
    try {
      const platillo = await dbService.crearPlatillo(datos);
      return {
        success: true,
        data: platillo,
        message: 'Platillo creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear platillo'
      };
    }
  }

  async actualizarPlatillo(id: string, datos: any): Promise<ApiResponse<any>> {
    try {
      const platillo = await dbService.actualizarPlatillo(id, datos);
      return {
        success: true,
        data: platillo,
        message: 'Platillo actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar platillo'
      };
    }
  }

  async eliminarPlatillo(id: string): Promise<ApiResponse<boolean>> {
    try {
      await dbService.eliminarPlatillo(id);
      return {
        success: true,
        data: true,
        message: 'Platillo eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al eliminar platillo'
      };
    }
  }

  async obtenerCategorias(): Promise<ApiResponse<string[]>> {
    try {
      const categorias = await dbService.obtenerCategorias();
      return {
        success: true,
        data: categorias.map(c => c.nombre)
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener categorías'
      };
    }
  }
}

// Wrapper para Inventario
export class InventarioServiceWrapper {
  async obtenerIngredientes(): Promise<ApiResponse<any[]>> {
    try {
      const ingredientes = await dbService.obtenerIngredientes();
      return {
        success: true,
        data: ingredientes
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener ingredientes'
      };
    }
  }

  async obtenerIngredientePorId(id: string): Promise<ApiResponse<any | null>> {
    try {
      const ingrediente = await dbService.obtenerIngredientePorId(id);
      return {
        success: true,
        data: ingrediente
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener ingrediente'
      };
    }
  }

  async crearIngrediente(datos: any): Promise<ApiResponse<any>> {
    try {
      const ingrediente = await dbService.crearIngrediente(datos);
      return {
        success: true,
        data: ingrediente,
        message: 'Ingrediente creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear ingrediente'
      };
    }
  }

  async actualizarIngrediente(id: string, datos: any): Promise<ApiResponse<any>> {
    try {
      const ingrediente = await dbService.actualizarIngrediente(id, datos);
      return {
        success: true,
        data: ingrediente,
        message: 'Ingrediente actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar ingrediente'
      };
    }
  }

  async eliminarIngrediente(id: string): Promise<ApiResponse<boolean>> {
    try {
      await dbService.eliminarIngrediente(id);
      return {
        success: true,
        data: true,
        message: 'Ingrediente eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al eliminar ingrediente'
      };
    }
  }

  async actualizarStockIngrediente(id: string, cantidad: number): Promise<ApiResponse<any>> {
    try {
      const ingrediente = await dbService.actualizarIngrediente(id, { stock: cantidad });
      return {
        success: true,
        data: ingrediente,
        message: 'Stock actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar stock'
      };
    }
  }
}

// Wrapper para Pedidos
export class PedidoServiceWrapper {
  async obtenerPedidos(): Promise<ApiResponse<any[]>> {
    try {
      const pedidos = await dbService.obtenerPedidos();
      return {
        success: true,
        data: pedidos
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener pedidos'
      };
    }
  }

  async obtenerPedidoPorId(id: string): Promise<ApiResponse<any | null>> {
    try {
      const pedido = await dbService.obtenerPedidoPorId(id);
      return {
        success: true,
        data: pedido
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener pedido'
      };
    }
  }

  async crearPedido(datos: any): Promise<ApiResponse<any>> {
    try {
      const pedido = await dbService.crearPedido(datos);
      return {
        success: true,
        data: pedido,
        message: 'Pedido creado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear pedido'
      };
    }
  }

  async actualizarPedido(id: string, datos: any): Promise<ApiResponse<any>> {
    try {
      const pedido = await dbService.actualizarPedido(id, datos);
      return {
        success: true,
        data: pedido,
        message: 'Pedido actualizado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar pedido'
      };
    }
  }

  async eliminarPedido(id: string): Promise<ApiResponse<boolean>> {
    try {
      await dbService.eliminarPedido(id);
      return {
        success: true,
        data: true,
        message: 'Pedido eliminado exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al eliminar pedido'
      };
    }
  }
}

// Wrapper para Facturas
export class FacturaServiceWrapper {
  async obtenerFacturas(): Promise<ApiResponse<any[]>> {
    try {
      const facturas = await dbService.obtenerFacturas();
      return {
        success: true,
        data: facturas
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener facturas'
      };
    }
  }

  async obtenerFacturaPorId(id: string): Promise<ApiResponse<any | null>> {
    try {
      const factura = await dbService.obtenerFacturaPorId(id);
      return {
        success: true,
        data: factura
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener factura'
      };
    }
  }

  async crearFactura(datos: any): Promise<ApiResponse<any>> {
    try {
      const factura = await dbService.crearFactura(datos);
      return {
        success: true,
        data: factura,
        message: 'Factura creada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear factura'
      };
    }
  }

  async actualizarFactura(id: string, datos: any): Promise<ApiResponse<any>> {
    try {
      const factura = await dbService.actualizarFactura(id, datos);
      return {
        success: true,
        data: factura,
        message: 'Factura actualizada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar factura'
      };
    }
  }

  async eliminarFactura(id: string): Promise<ApiResponse<boolean>> {
    try {
      await dbService.eliminarFactura(id);
      return {
        success: true,
        data: true,
        message: 'Factura eliminada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al eliminar factura'
      };
    }
  }
}

// Wrapper para Reservas
export class ReservaServiceWrapper {
  async obtenerReservas(): Promise<ApiResponse<any[]>> {
    try {
      const reservas = await dbService.obtenerReservas();
      return {
        success: true,
        data: reservas
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener reservas'
      };
    }
  }

  async crearReserva(datos: any): Promise<ApiResponse<any>> {
    try {
      const reserva = await dbService.crearReserva(datos);
      return {
        success: true,
        data: reserva,
        message: 'Reserva creada exitosamente'
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear reserva'
      };
    }
  }
}

// Wrapper para Dashboard
export class DashboardServiceWrapper {
  async obtenerEstadisticas(): Promise<ApiResponse<any>> {
    try {
      const [pedidos, facturas, mesas, clientes] = await Promise.all([
        dbService.obtenerPedidos(),
        dbService.obtenerFacturas(),
        dbService.obtenerMesas(),
        dbService.obtenerClientes()
      ]);

      const estadisticas = {
        totalPedidos: pedidos.length,
        pedidosHoy: pedidos.filter(p => {
          const hoy = new Date();
          const fechaPedido = new Date(p.createdAt);
          return fechaPedido.toDateString() === hoy.toDateString();
        }).length,
        totalFacturas: facturas.length,
        ingresosHoy: facturas
          .filter(f => {
            const hoy = new Date();
            const fechaFactura = new Date(f.createdAt);
            return fechaFactura.toDateString() === hoy.toDateString();
          })
          .reduce((sum, f) => sum + f.total, 0),
        mesasDisponibles: mesas.filter(m => m.estado === 'DISPONIBLE').length,
        totalMesas: mesas.length,
        clientesFrecuentes: clientes.filter(c => c.esFrecuente).length,
        totalClientes: clientes.length
      };

      return {
        success: true,
        data: estadisticas
      };
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener estadísticas'
      };
    }
  }
}

// Instancias de los servicios
export const clienteServiceWrapper = new ClienteServiceWrapper();
export const mesaServiceWrapper = new MesaServiceWrapper();
export const menuServiceWrapper = new MenuServiceWrapper();
export const inventarioServiceWrapper = new InventarioServiceWrapper();
export const pedidoServiceWrapper = new PedidoServiceWrapper();
export const facturaServiceWrapper = new FacturaServiceWrapper();
export const reservaServiceWrapper = new ReservaServiceWrapper();
export const dashboardServiceWrapper = new DashboardServiceWrapper();
