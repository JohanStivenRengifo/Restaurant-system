/**
 * Rutas de la API para el Sistema de Gestión de Restaurante
 * Implementa endpoints RESTful usando los servicios
 */

import { NextRequest, NextResponse } from 'next/server'
import { ClienteService } from '@/app/services/ClienteService'

// Instanciar servicios
const clienteService = new ClienteService()

// ===== RUTAS DE CLIENTES =====

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (id) {
        const result = await clienteService.obtenerClientePorId(id)
        return NextResponse.json(result)
    }

    const result = await clienteService.obtenerClientes()
    return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const result = await clienteService.crearCliente(body)
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
        const clienteId = searchParams.get('id')
        const body = await request.json()

        if (!clienteId) {
            return NextResponse.json({
                success: false,
                error: 'ID de cliente requerido'
            }, { status: 400 })
        }

        if (body.puntos !== undefined) {
            const result = await clienteService.actualizarCliente(clienteId, { puntos: body.puntos })
            return NextResponse.json(result)
        }

        return NextResponse.json({
            success: false,
            error: 'Operación no soportada'
        }, { status: 400 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 400 })
    }
}
