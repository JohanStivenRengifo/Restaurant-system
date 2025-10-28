/**
 * API Route para gestionar rangos de numeración de Factus
 */

import { NextRequest, NextResponse } from 'next/server';
import { FactusInvoiceService } from '../../../services/factus/FactusInvoiceService';
import { FactusAuthService } from '../../../services/factus/FactusAuthService';

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
 * GET /api/factus/numbering-ranges - Obtener todos los rangos de numeración
 */
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        const rangeId = searchParams.get('id');

        // Si se especifica un ID, obtener ese rango específico
        if (rangeId) {
            const rango = await invoiceService.getNumberingRange(parseInt(rangeId));
            return NextResponse.json({
                success: true,
                data: rango
            });
        }

        // Obtener todos los rangos
        const rangos = await invoiceService.getNumberingRanges();

        return NextResponse.json({
            success: true,
            data: rangos
        });

    } catch (error) {
        console.error('Error obteniendo rangos de numeración:', error);

        // Devolver datos mock en caso de error para desarrollo
        const mockRanges = [
            {
                id: 1,
                document: 'FV',
                prefix: 'FV',
                from: 1,
                to: 1000,
                current: 1,
                resolution_number: 'RES001',
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                technical_key: 'mock-key-001',
                is_active: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            },
            {
                id: 2,
                document: 'NC',
                prefix: 'NC',
                from: 1,
                to: 100,
                current: 1,
                resolution_number: 'RES002',
                start_date: '2024-01-01',
                end_date: '2024-12-31',
                technical_key: 'mock-key-002',
                is_active: 1,
                created_at: '2024-01-01T00:00:00Z',
                updated_at: '2024-01-01T00:00:00Z'
            }
        ];

        return NextResponse.json({
            success: true,
            data: mockRanges,
            message: 'Usando datos mock para desarrollo'
        });
    }
}
