/**
 * Rutas de la API para Menú
 */

import { NextRequest, NextResponse } from 'next/server'
import { MenuService } from '@/app/services/MenuService'

const menuService = new MenuService()

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')
    const categorias = searchParams.get('categorias')

    if (id) {
        const result = await menuService.obtenerPlatilloPorId(id)
        return NextResponse.json(result)
    }

    if (categorias === 'true') {
        const result = await menuService.obtenerCategorias()
        return NextResponse.json(result)
    }

    const result = await menuService.obtenerPlatillos()
    return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        console.log('POST /api/menu - Body recibido:', JSON.stringify(body, null, 2))

        const result = await menuService.crearPlatillo(body)
        console.log('POST /api/menu - Resultado:', JSON.stringify(result, null, 2))

        return NextResponse.json(result, { status: result.success ? 201 : 400 })
    } catch (error) {
        console.error('POST /api/menu - Error:', error)
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error al procesar la solicitud'
        }, { status: 400 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')
        const body = await request.json()

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'ID de platillo requerido'
            }, { status: 400 })
        }

        const result = await menuService.actualizarPlatillo(id, body)
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
                error: 'ID de platillo requerido'
            }, { status: 400 })
        }

        const result = await menuService.eliminarPlatillo(id)
        return NextResponse.json(result, { status: result.success ? 200 : 400 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 400 })
    }
}
