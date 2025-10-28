/**
 * Rutas de la API para Facturas
 */

import { NextRequest, NextResponse } from 'next/server'
import { FacturaService } from '@/app/services/FacturaService'

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

export async function PUT(request: NextRequest) {
    try {
        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'ID de factura requerido'
            }, { status: 400 })
        }

        const result = await facturaService.actualizarFactura(id, updates)
        return NextResponse.json(result, { status: result.success ? 200 : 400 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 400 })
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'ID de factura requerido'
            }, { status: 400 })
        }

        const result = await facturaService.eliminarFactura(id)
        return NextResponse.json(result, { status: result.success ? 200 : 400 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 400 })
    }
}
