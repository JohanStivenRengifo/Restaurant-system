/**
 * Ruta para obtener una factura específica por ID
 * GET /api/facturas/[id]
 */

import { NextRequest, NextResponse } from 'next/server'
import { FacturaService } from '@/app/services/FacturaService'

const facturaService = new FacturaService()

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'ID de factura requerido'
            }, { status: 400 })
        }

        const result = await facturaService.obtenerFacturaPorId(id)
        return NextResponse.json(result, { status: result.success ? 200 : 404 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 500 })
    }
}

export async function PUT(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params
        const body = await request.json()

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'ID de factura requerido'
            }, { status: 400 })
        }

        const result = await facturaService.actualizarFactura(id, body)
        return NextResponse.json(result, { status: result.success ? 200 : 404 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 500 })
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'ID de factura requerido'
            }, { status: 400 })
        }

        const result = await facturaService.eliminarFactura(id)
        return NextResponse.json(result, { status: result.success ? 200 : 404 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 500 })
    }
}
