/**
 * Servicio de autenticación OAuth2 para la API de Factus
 * Implementa el patrón Singleton para gestionar tokens de acceso únicos
 */

import {
    FactusAuthCredentials,
    FactusTokenResponse,
    FactusRefreshTokenRequest,
    FactusConfig
} from '@/app/types/factus';

export class FactusAuthService {
    private static instance: FactusAuthService;
    private accessToken: string | null = null;
    private refreshToken: string | null = null;
    private tokenExpiry: number | null = null;
    private config: FactusConfig;

    private constructor(config: FactusConfig) {
        this.config = config;
    }

    /**
     * Obtiene la instancia única del servicio de autenticación (Singleton)
     */
    public static getInstance(config?: FactusConfig): FactusAuthService {
        if (!FactusAuthService.instance) {
            if (!config) {
                // Usar configuración por defecto desde variables de entorno
                config = FactusAuthService.getDefaultConfig();
            }
            FactusAuthService.instance = new FactusAuthService(config);
        }
        return FactusAuthService.instance;
    }

    /**
     * Obtiene la configuración por defecto desde variables de entorno
     */
    public static getDefaultConfig(): FactusConfig {
        return {
            apiUrl: process.env.FACTUS_API_URL_SANDBOX || 'https://api-sandbox.factus.com.co',
            credentials: {
                client_id: process.env.FACTUS_CLIENT_ID_SANDBOX || '9f685692-0bae-4730-b345-e517041a606e',
                client_secret: process.env.FACTUS_CLIENT_SECRET_SANDBOX || 'OOXEOnbq7MuXpNImP75hEDQUy5OTeIeo31pOfIZk',
                username: process.env.FACTUS_USERNAME_SANDBOX || 'johanstivenrengifo@outlook.com',
                password: process.env.FACTUS_PASSWORD_SANDBOX || '1048067754'
            },
            defaultPaymentMethod: process.env.FACTUS_DEFAULT_PAYMENT_METHOD || '10',
            defaultPaymentForm: process.env.FACTUS_DEFAULT_PAYMENT_FORM || '1',
            defaultOperationType: parseInt(process.env.FACTUS_DEFAULT_OPERATION_TYPE || '10'),
            sendEmailByDefault: process.env.FACTUS_SEND_EMAIL_DEFAULT === 'true'
        };
    }

    /**
     * Autentica con la API de Factus y obtiene tokens de acceso
     */
    public async authenticate(): Promise<FactusTokenResponse> {
        try {
            const credentials: FactusAuthCredentials = {
                grant_type: 'password',
                client_id: this.config.credentials.client_id,
                client_secret: this.config.credentials.client_secret,
                username: this.config.credentials.username,
                password: this.config.credentials.password
            };

            const formData = new URLSearchParams();
            Object.entries(credentials).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const response = await fetch(`${this.config.apiUrl}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Error de autenticación: ${response.status} - ${errorData.message || 'Error desconocido'}`);
            }

            const tokenData: FactusTokenResponse = await response.json();

            // Almacenar tokens y calcular expiración
            this.accessToken = tokenData.access_token;
            this.refreshToken = tokenData.refresh_token;
            this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);

            console.log('✅ Autenticación exitosa con Factus API');
            return tokenData;

        } catch (error) {
            console.error('❌ Error en autenticación con Factus API:', error);
            throw new Error(`Error de autenticación: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * Renueva el token de acceso usando el refresh token
     */
    public async refreshAccessToken(): Promise<FactusTokenResponse> {
        if (!this.refreshToken) {
            throw new Error('No hay refresh token disponible. Debe autenticarse primero.');
        }

        try {
            const refreshRequest: FactusRefreshTokenRequest = {
                grant_type: 'refresh_token',
                client_id: this.config.credentials.client_id,
                client_secret: this.config.credentials.client_secret,
                refresh_token: this.refreshToken
            };

            const formData = new URLSearchParams();
            Object.entries(refreshRequest).forEach(([key, value]) => {
                formData.append(key, value);
            });

            const response = await fetch(`${this.config.apiUrl}/oauth/token`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: formData
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Error renovando token: ${response.status} - ${errorData.message || 'Error desconocido'}`);
            }

            const tokenData: FactusTokenResponse = await response.json();

            // Actualizar tokens
            this.accessToken = tokenData.access_token;
            this.refreshToken = tokenData.refresh_token;
            this.tokenExpiry = Date.now() + (tokenData.expires_in * 1000);

            console.log('✅ Token renovado exitosamente');
            return tokenData;

        } catch (error) {
            console.error('❌ Error renovando token:', error);
            // Si falla la renovación, limpiar tokens y requerir nueva autenticación
            this.clearTokens();
            throw new Error(`Error renovando token: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * Obtiene el token de acceso válido, renovándolo si es necesario
     */
    public async getValidAccessToken(): Promise<string> {
        // Si no hay token o está expirado
        if (!this.accessToken || !this.tokenExpiry || Date.now() >= this.tokenExpiry) {
            // Intentar renovar si hay refresh token
            if (this.refreshToken) {
                try {
                    await this.refreshAccessToken();
                } catch (error) {
                    // Si falla la renovación, hacer nueva autenticación
                    console.log('🔄 Renovación fallida, realizando nueva autenticación...');
                    await this.authenticate();
                }
            } else {
                // Si no hay refresh token, hacer nueva autenticación
                await this.authenticate();
            }
        }

        if (!this.accessToken) {
            throw new Error('No se pudo obtener un token de acceso válido');
        }

        return this.accessToken;
    }

    /**
     * Verifica si el token actual es válido
     */
    public isTokenValid(): boolean {
        return !!(this.accessToken && this.tokenExpiry && Date.now() < this.tokenExpiry);
    }

    /**
     * Obtiene el tiempo restante del token en segundos
     */
    public getTokenTimeRemaining(): number {
        if (!this.tokenExpiry) return 0;
        return Math.max(0, Math.floor((this.tokenExpiry - Date.now()) / 1000));
    }

    /**
     * Limpia todos los tokens almacenados
     */
    public clearTokens(): void {
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        console.log('🧹 Tokens limpiados');
    }

    /**
     * Obtiene información del estado de autenticación
     */
    public getAuthStatus() {
        return {
            isAuthenticated: this.isTokenValid(),
            hasRefreshToken: !!this.refreshToken,
            timeRemaining: this.getTokenTimeRemaining(),
            tokenExpiry: this.tokenExpiry ? new Date(this.tokenExpiry).toISOString() : null
        };
    }

    /**
     * Obtiene la configuración actual
     */
    public getConfig(): FactusConfig {
        return this.config;
    }

    /**
     * Configuración por defecto para el entorno de pruebas
     */

    /**
     * Configuración para producción
     */
    public static getProductionConfig(): FactusConfig {
        return {
            apiUrl: 'https://api.factus.com.co',
            credentials: {
                client_id: process.env.FACTUS_CLIENT_ID || '',
                client_secret: process.env.FACTUS_CLIENT_SECRET || '',
                username: process.env.FACTUS_USERNAME || '',
                password: process.env.FACTUS_PASSWORD || ''
            },
            defaultPaymentMethod: '10',
            defaultPaymentForm: '1',
            defaultOperationType: 10,
            sendEmailByDefault: true
        };
    }
}

/**
 * Factory para crear instancias del servicio de autenticación
 * Implementa el patrón Factory Method
 */
export class FactusAuthServiceFactory {
    /**
     * Crea una instancia del servicio de autenticación para pruebas
     */
    public static createForTesting(): FactusAuthService {
        const config = FactusAuthService.getDefaultConfig();
        return FactusAuthService.getInstance(config);
    }

    /**
     * Crea una instancia del servicio de autenticación para producción
     */
    public static createForProduction(): FactusAuthService {
        const config = FactusAuthService.getProductionConfig();
        return FactusAuthService.getInstance(config);
    }

    /**
     * Crea una instancia del servicio de autenticación con configuración personalizada
     */
    public static createWithConfig(config: FactusConfig): FactusAuthService {
        return FactusAuthService.getInstance(config);
    }
}
