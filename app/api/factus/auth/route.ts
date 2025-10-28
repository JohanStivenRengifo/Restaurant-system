/**
 * API Route para gestionar autenticación con Factus
 */

import { NextRequest, NextResponse } from 'next/server';
import { FactusAuthService } from '../../../services/factus/FactusAuthService';

// Inicializar servicio de autenticación con configuración por defecto
let authService: FactusAuthService;

try {
    authService = FactusAuthService.getInstance();
} catch (error) {
    console.error('Error inicializando servicio de autenticación:', error);
    // Crear servicio con configuración por defecto
    authService = FactusAuthService.getInstance(FactusAuthService.getDefaultConfig());
}

/**
 * POST /api/factus/auth/login - Autenticar con Factus API
 */
export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action } = body;

        switch (action) {
            case 'authenticate':
                // Realizar autenticación
                const tokenResponse = await authService.authenticate();
                return NextResponse.json({
                    success: true,
                    message: 'Autenticación exitosa',
                    data: {
                        tokenType: tokenResponse.token_type,
                        expiresIn: tokenResponse.expires_in,
                        timeRemaining: authService.getTokenTimeRemaining()
                    }
                });

            case 'refresh':
                // Renovar token
                const refreshResponse = await authService.refreshAccessToken();
                return NextResponse.json({
                    success: true,
                    message: 'Token renovado exitosamente',
                    data: {
                        tokenType: refreshResponse.token_type,
                        expiresIn: refreshResponse.expires_in,
                        timeRemaining: authService.getTokenTimeRemaining()
                    }
                });

            case 'status':
                // Obtener estado de autenticación
                const status = authService.getAuthStatus();
                return NextResponse.json({
                    success: true,
                    data: status
                });

            case 'logout':
                // Limpiar tokens
                authService.clearTokens();
                return NextResponse.json({
                    success: true,
                    message: 'Sesión cerrada exitosamente'
                });

            default:
                return NextResponse.json(
                    { error: 'Acción no válida' },
                    { status: 400 }
                );
        }

    } catch (error) {
        console.error('Error en autenticación:', error);
        return NextResponse.json(
            {
                error: 'Error interno del servidor',
                message: error instanceof Error ? error.message : 'Error desconocido'
            },
            { status: 500 }
        );
    }
}

/**
 * GET /api/factus/auth/status - Obtener estado de autenticación
 */
export async function GET(request: NextRequest) {
    try {
        const status = authService.getAuthStatus();

        return NextResponse.json({
            success: true,
            data: status
        });

    } catch (error) {
        console.error('Error obteniendo estado de autenticación:', error);

        // Devolver estado por defecto en caso de error
        return NextResponse.json({
            success: true,
            data: {
                isAuthenticated: false,
                hasRefreshToken: false,
                timeRemaining: 0,
                tokenExpiry: null,
                message: 'Servicio no disponible'
            }
        });
    }
}
