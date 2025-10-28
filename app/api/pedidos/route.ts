/**
 * Rutas de la API para Pedidos
 */

import { NextRequest, NextResponse } from 'next/server'
import { PedidoService } from '@/app/services'

const pedidoService = new PedidoService()

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    const tipo = searchParams.get('tipo')
    const clienteId = searchParams.get('clienteId')
    const mesaId = searchParams.get('mesaId')
    const fechaInicio = searchParams.get('fechaInicio')
    const fechaFin = searchParams.get('fechaFin')

    const filtros: any = {}

    if (estado) filtros.estado = estado
    if (tipo) filtros.tipo = tipo
    if (clienteId) filtros.clienteId = clienteId
    if (mesaId) filtros.mesaId = mesaId
    if (fechaInicio) filtros.fechaInicio = new Date(fechaInicio)
    if (fechaFin) filtros.fechaFin = new Date(fechaFin)

    const result = await pedidoService.obtenerPedidos(Object.keys(filtros).length > 0 ? filtros : undefined)
    return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const result = await pedidoService.crearPedido(body)
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
        const pedidoId = searchParams.get('id')
        const body = await request.json()

        if (!pedidoId) {
            return NextResponse.json({
                success: false,
                error: 'ID de pedido requerido'
            }, { status: 400 })
        }

        if (body.estado) {
            const result = await pedidoService.actualizarEstadoPedido(pedidoId, body.estado)
            return NextResponse.json(result)
        }

        return NextResponse.json({
            success: false,
            error: 'Estado requerido'
        }, { status: 400 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 400 })
    }
}
