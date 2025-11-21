/**
 * API Route para manejar facturas electrónicas con Factus
 * Implementa endpoints RESTful para crear, consultar y gestionar facturas
 */

import { NextRequest, NextResponse } from 'next/server';
import { FactusInvoiceService } from '../../../services/factus/FactusInvoiceService';
import { FactusAuthService } from '../../../services/factus/FactusAuthService';
import { FactusAdapterService, RestaurantePedido, RestauranteEstablecimiento } from '../../../services/factus/FactusAdapterService';
import { FactusInvoiceRequest, FactusInvoiceResponse } from '../../../types/factus';

// Inicializar servicios
let authService: FactusAuthService;
let invoiceService: FactusInvoiceService;

try {
    authService = FactusAuthService.getInstance();
    invoiceService = new FactusInvoiceService(authService, authService.getConfig().apiUrl);
} catch (error) {
    console.error('Error inicializando servicios:', error);
    authService = FactusAuthService.getInstance(FactusAuthService.getDefaultConfig());
    invoiceService = new FactusInvoiceService(authService, authService.getConfig().apiUrl);
}

/**
 * POST /api/factus/invoices - Crear nueva factura electrónica
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();

        // Validar que se envíen los datos requeridos
        if (!body.pedido) {
            return NextResponse.json(
                { error: 'Los datos del pedido son obligatorios' },
                { status: 400 }
            );
        }

        const pedido: RestaurantePedido = body.pedido;
        const establecimiento: RestauranteEstablecimiento = body.establecimiento;
        const numberingRangeId: number = body.numberingRangeId;

        // Validar datos del pedido
        const validacion = FactusAdapterService.validarPedido(pedido);
        if (!validacion.isValid) {
            return NextResponse.json(
                {
                    error: 'Datos del pedido inválidos',
                    details: validacion.errors,
                    pedido: pedido
                },
                { status: 400 }
            );
        }

        // Generar código de referencia si no se proporciona
        if (!pedido.numeroReferencia) {
            pedido.numeroReferencia = FactusAdapterService.generarCodigoReferencia(pedido.id);
        }

        // Convertir pedido a formato Factus
        const invoiceRequest = FactusAdapterService.adaptarPedidoCompleto(
            pedido,
            establecimiento,
            numberingRangeId
        );

        // Validar datos de la factura
        const validacionFactura = invoiceService.validateInvoiceData(invoiceRequest);
        if (!validacionFactura.isValid) {
            return NextResponse.json(
                {
                    error: 'Datos de la factura inválidos',
                    details: validacionFactura.errors,
                    warnings: validacionFactura.warnings
                },
                { status: 400 }
            );
        }

        // Crear la factura
        const facturaResponse = await invoiceService.createInvoice(invoiceRequest);

        // Calcular totales
        const totales = FactusAdapterService.calcularTotalFactura(pedido);

        return NextResponse.json({
            success: true,
            message: 'Factura creada exitosamente',
            data: {
                factura: facturaResponse,
                resumen: invoiceService.generateInvoiceSummary(facturaResponse),
                totales: totales
            }
        });

    } catch (error) {
        console.error('Error creando factura:', error);
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                message: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/factus/invoices - Listar facturas con paginación
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get('page') || '1');
        const limit = parseInt(searchParams.get('limit') || '20');
        const invoiceNumber = searchParams.get('number');

        // Si se especifica un número de factura, obtener esa factura específica
        if (invoiceNumber) {
            const factura = await invoiceService.getInvoiceByNumber(invoiceNumber);
            return NextResponse.json({
                success: true,
                data: {
                    factura: factura,
                    resumen: invoiceService.generateInvoiceSummary(factura)
                }
            });
        }

        // Listar facturas con paginación
        const resultado = await invoiceService.listInvoices(page, limit);

        return NextResponse.json({
            success: true,
            data: resultado
        });

    } catch (error) {
        console.error('Error obteniendo facturas:', error);
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                message: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
}

/**
 * PUT /api/factus/invoices/validate - Validar factura sin crearla
 */
export async function PUT(request: NextRequest) {
    try {
        const body = await request.json();

        if (!body.pedido) {
            return NextResponse.json(
                { error: 'Los datos del pedido son obligatorios' },
                { status: 400 }
            );
        }

        const pedido: RestaurantePedido = body.pedido;
        const establecimiento: RestauranteEstablecimiento = body.establecimiento;
        const numberingRangeId: number = body.numberingRangeId;

        // Validar datos del pedido
        const validacionPedido = FactusAdapterService.validarPedido(pedido);
        if (!validacionPedido.isValid) {
            return NextResponse.json({
                success: false,
                isValid: false,
                errors: validacionPedido.errors,
                warnings: []
            });
        }

        // Generar código de referencia si no se proporciona
        if (!pedido.numeroReferencia) {
            pedido.numeroReferencia = FactusAdapterService.generarCodigoReferencia(pedido.id);
        }

        // Convertir pedido a formato Factus
        const invoiceRequest = FactusAdapterService.adaptarPedidoCompleto(
            pedido,
            establecimiento,
            numberingRangeId
        );

        // Validar con la API de Factus
        const validacionFactura = await invoiceService.validateInvoice(invoiceRequest);

        // Calcular totales
        const totales = FactusAdapterService.calcularTotalFactura(pedido);

        return NextResponse.json({
            success: true,
            isValid: validacionFactura.isValid,
            errors: validacionFactura.errors,
            warnings: validacionFactura.warnings,
            totales: totales,
            invoiceRequest: invoiceRequest
        });

    } catch (error) {
        console.error('Error validando factura:', error);
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                message: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
}
