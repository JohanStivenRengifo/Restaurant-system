/**
 * Rutas de la API para Reservas
 */

import { NextRequest, NextResponse } from 'next/server'
import { ReservaService } from '@/app/services'

const reservaService = new ReservaService()

export async function GET() {
    const result = await reservaService.obtenerReservas()
    return NextResponse.json(result)
}

export async function POST(request: NextRequest) {
    try {
        const body = await request.json()
        const result = await reservaService.crearReserva(body)
        return NextResponse.json(result, { status: result.success ? 201 : 400 })
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: 'Error al procesar la solicitud'
        }, { status: 400 })
    }
}
