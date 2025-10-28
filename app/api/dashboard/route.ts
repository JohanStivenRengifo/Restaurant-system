/**
 * Rutas de la API para Dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { dashboardServiceWrapper } from '@/app/services'

export async function GET() {
    const result = await dashboardServiceWrapper.obtenerEstadisticas()
    return NextResponse.json(result)
}
