/**
 * API Route para obtener PDF de facturas electrónicas
 * GET /api/factus/invoices/[id]/pdf
 */

import { NextRequest, NextResponse } from 'next/server';
import { FactusInvoiceService } from '../../../../../services/factus/FactusInvoiceService';
import { FactusAuthService } from '../../../../../services/factus/FactusAuthService';

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

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: invoiceNumber } = await params;

        if (!invoiceNumber) {
            return NextResponse.json(
                { error: 'Número de factura requerido' },
                { status: 400 }
            );
        }

        // Obtener PDF de la factura desde Factus usando el número de factura
        const pdfBuffer = await invoiceService.getInvoicePDF(invoiceNumber);

        if (!pdfBuffer) {
            return NextResponse.json(
                { error: 'PDF no disponible' },
                { status: 404 }
            );
        }

        // Devolver el PDF como respuesta
        return new NextResponse(pdfBuffer as any, {
            headers: {
                'Content-Type': 'application/pdf',
                'Content-Disposition': `inline; filename="factura-${invoiceNumber}.pdf"`,
                'Cache-Control': 'public, max-age=3600'
            }
        });

    } catch (error) {
        console.error('Error obteniendo PDF de factura:', error);
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                message: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
}
