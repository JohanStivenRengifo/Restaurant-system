/**
 * Rutas de la API para Categorías
 */

import { NextResponse } from 'next/server'
import PrismaDatabaseService from '@/app/services/PrismaDatabaseService'

const db = PrismaDatabaseService.getInstance()

export async function GET() {
    try {
        const categorias = await db.obtenerCategorias()
        return NextResponse.json({
            success: true,
            data: categorias
        })
    } catch (error) {
        console.error('Error obteniendo categorías:', error)
        return NextResponse.json({
            success: false,
            error: 'Error al obtener categorías'
        }, { status: 500 })
    }
}
