/**
 * Script de migración para transferir datos de localStorage a base de datos
 * Se ejecuta automáticamente al iniciar la aplicación
 */

import PrismaDatabaseService from './PrismaDatabaseService';
import { Factura, Pedido, Cliente } from '@/app/types';

export class MigrationService {
    private static db = PrismaDatabaseService.getInstance();

    /**
     * Migrar datos existentes de localStorage a base de datos
     */
    static async migrateFromLocalStorage(): Promise<void> {
        try {
            console.log('🔄 Iniciando migración de datos...');

            // Migrar facturas
            await this.migrateFacturas();

            // Migrar pedidos
            await this.migratePedidos();

            // Migrar clientes
            await this.migrateClientes();

            console.log('✅ Migración completada exitosamente');
        } catch (error) {
            console.error('❌ Error durante la migración:', error);
        }
    }

    /**
     * Migrar facturas desde localStorage
     */
    private static async migrateFacturas(): Promise<void> {
        try {
            const facturasData = localStorage.getItem('facturas');
            if (!facturasData) return;

            const facturas: Factura[] = JSON.parse(facturasData);
            console.log(`📄 Migrando ${facturas.length} facturas...`);

            for (const factura of facturas) {
                try {
                    await this.db.crearFactura({
                        pedidoId: factura.pedidoId,
                        numero: factura.numero,
                        subtotal: factura.subtotal,
                        impuestos: factura.impuestos,
                        descuento: factura.descuento,
                        total: factura.total,
                        metodoPago: factura.metodoPago,
                        estado: factura.estado
                    });
                } catch (error) {
                    console.warn(`⚠️ Error migrando factura ${factura.id}:`, error);
                }
            }

            // Limpiar localStorage después de migrar
            localStorage.removeItem('facturas');
            console.log('✅ Facturas migradas');
        } catch (error) {
            console.error('❌ Error migrando facturas:', error);
        }
    }

    /**
     * Migrar pedidos desde localStorage
     */
    private static async migratePedidos(): Promise<void> {
        try {
            const pedidosData = localStorage.getItem('pedidos');
            if (!pedidosData) return;

            const pedidos: Pedido[] = JSON.parse(pedidosData);
            console.log(`🍽️ Migrando ${pedidos.length} pedidos...`);

            for (const pedido of pedidos) {
                try {
                    await this.db.crearPedido({
                        clienteId: pedido.clienteId,
                        mesaId: pedido.mesaId,
                        tipo: pedido.tipo,
                        estado: pedido.estado,
                        total: pedido.total,
                        notas: pedido.notas,
                        direccion: pedido.direccion,
                        telefono: pedido.telefono,
                        platillos: pedido.platillos || []
                    });
                } catch (error) {
                    console.warn(`⚠️ Error migrando pedido ${pedido.id}:`, error);
                }
            }

            // Limpiar localStorage después de migrar
            localStorage.removeItem('pedidos');
            console.log('✅ Pedidos migrados');
        } catch (error) {
            console.error('❌ Error migrando pedidos:', error);
        }
    }

    /**
     * Migrar clientes desde localStorage
     */
    private static async migrateClientes(): Promise<void> {
        try {
            const clientesData = localStorage.getItem('clientes');
            if (!clientesData) return;

            const clientes: Cliente[] = JSON.parse(clientesData);
            console.log(`👥 Migrando ${clientes.length} clientes...`);

            for (const cliente of clientes) {
                try {
                    await this.db.crearCliente({
                        nombre: cliente.nombre,
                        email: cliente.email,
                        telefono: cliente.telefono,
                        alergias: cliente.alergias,
                        esFrecuente: cliente.esFrecuente,
                        puntos: cliente.puntos
                    });
                } catch (error) {
                    console.warn(`⚠️ Error migrando cliente ${cliente.id}:`, error);
                }
            }

            // Limpiar localStorage después de migrar
            localStorage.removeItem('clientes');
            console.log('✅ Clientas migrados');
        } catch (error) {
            console.error('❌ Error migrando clientes:', error);
        }
    }

    /**
     * Verificar si hay datos en localStorage que necesiten migración
     */
    static hasDataToMigrate(): boolean {
        const keys = ['facturas', 'pedidos', 'clientes', 'mesas', 'menu', 'ingredientes'];
        return keys.some(key => localStorage.getItem(key) !== null);
    }

    /**
     * Limpiar todos los datos de localStorage
     */
    static clearLocalStorage(): void {
        const keys = ['facturas', 'pedidos', 'clientes', 'mesas', 'menu', 'ingredientes'];
        keys.forEach(key => localStorage.removeItem(key));
        console.log('🧹 LocalStorage limpiado');
    }
}

