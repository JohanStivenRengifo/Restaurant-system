/**
 * Rutas de la API para Pedidos
 */

import { NextRequest, NextResponse } from 'next/server'
import { PedidoService } from '@/app/services/PedidoService'

const pedidoService = new PedidoService()

export async function GET(request: NextRequest) {
    const { searchParams } = new URL(request.url)
    const estado = searchParams.get('estado')
    
    const result = await pedidoService.obtenerPedidos()
    
    if (estado && result.success && result.data) {
        const pedidosFiltrados = result.data.filter(pedido => pedido.estado === estado)
        return NextResponse.json({
            ...result,
            data: pedidosFiltrados
        })
    }
    
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
        const body = await request.json()
        const { id, ...updates } = body

        if (!id) {
            return NextResponse.json({
                success: false,
                error: 'ID de pedido requerido'
            }, { status: 400 })
        }

        const result = await pedidoService.actualizarPedido(id, updates)
        return NextResponse.json(result, { status: result.success ? 200 : 400 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 400 })
    }
}
