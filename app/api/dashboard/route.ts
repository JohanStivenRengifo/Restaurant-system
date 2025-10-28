/**
 * Rutas de la API para Dashboard
 */

import { NextRequest, NextResponse } from 'next/server'
import { DashboardService } from '@/app/services'

const dashboardService = new DashboardService()

export async function GET() {
    const result = await dashboardService.obtenerEstadisticas()
    return NextResponse.json(result)
}
