/**
 * Rutas de la API para Mesas
 */

import { NextRequest, NextResponse } from 'next/server'
import { MesaService } from '@/app/services/MesaService'

const mesaService = new MesaService()

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const disponibles = searchParams.get('disponibles')

    if (disponibles === 'true') {
        const result = await mesaService.obtenerMesasDisponibles()
        return NextResponse.json(result)
    }

    const result = await mesaService.obtenerMesas()
    return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const result = await mesaService.crearMesa(body)
        return NextResponse.json(result, { status: result.success ? 201 : 400 })
    } catch (error: any) {
        console.error('Error en POST /api/mesas:', error)
        
        // Manejar errores específicos de Prisma
        if (error.code === 'P2002') {
            return NextResponse.json({
                success: false,
                error: 'Ya existe una mesa con ese número. Por favor, elige un número diferente.',
                code: 'DUPLICATE_NUMBER'
            }, { status: 409 })
        }
        
        return NextResponse.json({
            success: false,
            error: 'Error interno del servidor al crear mesa'
        }, { status: 500 })
    }
}

export async function PUT(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const mesaId = searchParams.get('id')
        const body = await request.json()

        if (!mesaId) {
            return NextResponse.json({
                success: false,
                error: 'ID de mesa requerido'
            }, { status: 400 })
        }

        if (body.estado) {
            const result = await mesaService.actualizarEstadoMesa(mesaId, body.estado)
            return NextResponse.json(result)
        }

        // Si no es solo cambio de estado, actualizar toda la mesa
        const result = await mesaService.actualizarMesa(mesaId, body)
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
        const mesaId = searchParams.get('id')

        if (!mesaId) {
            return NextResponse.json({
                success: false,
                error: 'ID de mesa requerido'
            }, { status: 400 })
        }

        const result = await mesaService.eliminarMesa(mesaId)
        return NextResponse.json(result, { status: result.success ? 200 : 400 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 400 })
    }
}
