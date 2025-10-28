/**
 * Rutas de la API para Reservas
 */

import { NextRequest, NextResponse } from 'next/server'
import { reservaServiceWrapper } from '@/app/services'

export async function GET() {
    const result = await reservaServiceWrapper.obtenerReservas()
    return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const result = await reservaServiceWrapper.crearReserva(body)
        return NextResponse.json(result, { status: result.success ? 201 : 400 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 400 })
    }
}
