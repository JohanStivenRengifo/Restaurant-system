/**
 * SINGLETON PATTERN - DatabaseConnection
 * Garantiza una única instancia de conexión a la base de datos
 * para evitar múltiples conexiones innecesarias y problemas de concurrencia
 * Versión simplificada sin Prisma para pruebas
 */

// Simulación de conexión a base de datos
interface DatabaseConnectionInterface {
    connect(): Promise<void>
    disconnect(): Promise<void>
    isConnected(): boolean
}

export class DatabaseConnection implements DatabaseConnectionInterface {
    private static instance: DatabaseConnection
    private connected: boolean = false
    private connectionString: string = 'mock://localhost:5432/restaurant'

    private constructor() {
        console.log('🔗 DatabaseConnection: Instancia creada')
    }

    public static getInstance(): DatabaseConnection {
        if (!DatabaseConnection.instance) {
            DatabaseConnection.instance = new DatabaseConnection()
        }
        return DatabaseConnection.instance
    }

    public async connect(): Promise<void> {
        if (!this.connected) {
            console.log('🔗 Conectando a la base de datos...')
            // Simular conexión
            await new Promise(resolve => setTimeout(resolve, 100))
            this.connected = true
            console.log('✅ Conexión establecida')
        }
    }

    public async disconnect(): Promise<void> {
        if (this.connected) {
            console.log('🔌 Desconectando de la base de datos...')
            this.connected = false
            console.log('✅ Desconexión completada')
        }
    }

    public isConnected(): boolean {
        return this.connected
    }

    public getConnectionString(): string {
        return this.connectionString
    }
}

// Singleton para configuración global del restaurante
export class ConfigurationManager {
    private static instance: ConfigurationManager
    private config: Map<string, any> = new Map()

    private constructor() {
        this.loadDefaultConfig()
    }

    public static getInstance(): ConfigurationManager {
        if (!ConfigurationManager.instance) {
            ConfigurationManager.instance = new ConfigurationManager()
        }
        return ConfigurationManager.instance
    }

    private loadDefaultConfig(): void {
        this.config.set('restaurant_name', 'Sistema de Gestión de Restaurante')
        this.config.set('currency', 'COP')
        this.config.set('tax_rate', 0.19) // IVA Colombia
        this.config.set('max_table_capacity', 8)
        this.config.set('low_stock_threshold', 20)
        this.config.set('timezone', 'America/Bogota')
        this.config.set('app_version', '1.0.0')
        this.config.set('environment', 'development')
    }

    public get(key: string): any {
        return this.config.get(key)
    }

    public set(key: string, value: any): void {
        this.config.set(key, value)
        console.log(`⚙️ Configuración actualizada: ${key} = ${value}`)
    }

    public getAll(): Record<string, any> {
        return Object.fromEntries(this.config)
    }

    public reset(): void {
        this.config.clear()
        this.loadDefaultConfig()
        console.log('⚙️ Configuración restablecida')
    }
}

// Singleton para servicio de notificaciones
export class NotificationService {
    private static instance: NotificationService
    private notifications: Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info'; timestamp: Date }> = []

    private constructor() {
        console.log('🔔 NotificationService: Instancia creada')
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService()
        }
        return NotificationService.instance
    }

    public addNotification(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info'): string {
        const id = Math.random().toString(36).substr(2, 9)
        this.notifications.push({
            id,
            message,
            type,
            timestamp: new Date()
        })
        console.log(`🔔 Notificación ${type}: ${message}`)
        return id
    }

    public getNotifications(): Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info'; timestamp: Date }> {
        return [...this.notifications]
    }

    public removeNotification(id: string): void {
        this.notifications = this.notifications.filter(n => n.id !== id)
    }

    public clearAll(): void {
        this.notifications = []
        console.log('🔔 Notificaciones limpiadas')
    }

    // Métodos específicos para el restaurante
    public notifyNewOrder(orderId: string): void {
        this.addNotification(`Nuevo pedido #${orderId} recibido`, 'info')
    }

    public notifyOrderReady(orderId: string): void {
        this.addNotification(`Pedido #${orderId} listo para entrega`, 'success')
    }

    public notifyLowStock(ingredient: string): void {
        this.addNotification(`Stock bajo: ${ingredient}`, 'warning')
    }

    public notifyError(message: string): void {
        this.addNotification(`Error: ${message}`, 'error')
    }
}