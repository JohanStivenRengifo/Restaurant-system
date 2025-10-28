/**
 * Rutas de la API para Facturas
 */

import { NextRequest, NextResponse } from 'next/server'
import { FacturaService } from '@/app/services'

const facturaService = new FacturaService()

export async function GET() {
    const result = await facturaService.obtenerFacturas()
    return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const result = await facturaService.crearFactura(body)
        return NextResponse.json(result, { status: result.success ? 201 : 400 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 400 })
    }
}
