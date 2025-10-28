/**
 * Rutas de la API para Inventario
 */

import { NextRequest, NextResponse } from 'next/server'
import { InventarioService } from '@/app/services'

const inventarioService = new InventarioService()

export async function GET() {
    const result = await inventarioService.obtenerIngredientes()
    return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()

        const result = await inventarioService.crearIngrediente(body)
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
        const { searchParams } = new URL(request.url)
        const ingredienteId = searchParams.get('id')
        const body = await request.json()

        if (!ingredienteId) {
            return NextResponse.json({
                success: false,
                error: 'ID de ingrediente requerido'
            }, { status: 400 })
        }

        // Si solo se está actualizando la cantidad (reponer stock)
        if (body.cantidad !== undefined && Object.keys(body).length === 1) {
            const result = await inventarioService.actualizarStock(ingredienteId, body.cantidad)
            return NextResponse.json(result)
        }

        // Si se están actualizando otros campos del ingrediente
        const result = await inventarioService.actualizarIngrediente(ingredienteId, body)
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
        const ingredienteId = searchParams.get('id')

        if (!ingredienteId) {
            return NextResponse.json({
                success: false,
                error: 'ID de ingrediente requerido'
            }, { status: 400 })
        }

        const result = await inventarioService.eliminarIngrediente(ingredienteId)
        return NextResponse.json(result, { status: result.success ? 200 : 400 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 400 })
    }
}
