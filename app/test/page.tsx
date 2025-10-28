/**
 * Página de prueba para verificar funcionalidad
 */

'use client';

import React, { useState, useEffect } from 'react';
import { Button, Card, LoadingSpinner } from '@/app/components/ui';

export default function TestPage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const testAPI = async (endpoint: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(endpoint);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const testPatterns = () => {
    try {
      // Test Singleton
      const { DatabaseConnection, ConfigurationManager, NotificationService } = require('@/app/patterns/creational/singleton/DatabaseConnection');
      
      const config = ConfigurationManager.getInstance();
      const notification = NotificationService.getInstance();
      
      notification.addNotification('Test de patrones exitoso', 'success');
      
      setResult({
        success: true,
        message: 'Patrones de diseño funcionando correctamente',
        config: config.getAll(),
        notifications: notification.getNotifications()
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error en patrones');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Página de Pruebas - Sistema de Restaurante
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card title="Pruebas de API">
            <div className="space-y-4">
              <Button 
                onClick={() => testAPI('/api/dashboard')}
                disabled={loading}
                className="w-full"
              >
                Probar Dashboard API
              </Button>
              
              <Button 
                onClick={() => testAPI('/api/mesas')}
                disabled={loading}
                variant="secondary"
                className="w-full"
              >
                Probar Mesas API
              </Button>
              
              <Button 
                onClick={() => testAPI('/api/menu')}
                disabled={loading}
                variant="secondary"
                className="w-full"
              >
                Probar Menú API
              </Button>
              
              <Button 
                onClick={() => testAPI('/api/pedidos')}
                disabled={loading}
                variant="secondary"
                className="w-full"
              >
                Probar Pedidos API
              </Button>
            </div>
          </Card>

          <Card title="Pruebas de Patrones">
            <div className="space-y-4">
              <Button 
                onClick={testPatterns}
                disabled={loading}
                variant="success"
                className="w-full"
              >
                Probar Patrones de Diseño
              </Button>
              
              <div className="text-sm text-gray-600">
                <p>• Singleton: Configuración y notificaciones</p>
                <p>• Factory: Creación de objetos</p>
                <p>• Builder: Construcción de pedidos</p>
                <p>• Decorator: Personalización de platillos</p>
                <p>• Adapter: Integraciones externas</p>
                <p>• Bridge: Reportes en diferentes formatos</p>
                <p>• Proxy: Control de acceso con caché</p>
              </div>
            </div>
          </Card>
        </div>

        {loading && (
          <Card>
            <LoadingSpinner size="lg" text="Ejecutando pruebas..." />
          </Card>
        )}

        {error && (
          <Card>
            <div className="text-center">
              <div className="text-red-500 text-4xl mb-4">❌</div>
              <h3 className="text-lg font-semibold text-red-600 mb-2">
                Error en la prueba
              </h3>
              <p className="text-gray-600">{error}</p>
            </div>
          </Card>
        )}

        {result && (
          <Card>
            <div className="text-center">
              <div className="text-green-500 text-4xl mb-4">✅</div>
              <h3 className="text-lg font-semibold text-green-600 mb-2">
                Prueba exitosa
              </h3>
              <pre className="text-left bg-gray-100 p-4 rounded text-sm overflow-auto">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </Card>
        )}

        <Card title="Información del Sistema" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Tecnologías:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Next.js 14 con App Router</li>
                <li>• TypeScript 5+</li>
                <li>• Tailwind CSS</li>
                <li>• Prisma ORM</li>
                <li>• PostgreSQL</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Patrones Implementados:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>• Singleton (3 implementaciones)</li>
                <li>• Factory Method (2 implementaciones)</li>
                <li>• Abstract Factory (2 implementaciones)</li>
                <li>• Prototype (3 implementaciones)</li>
                <li>• Builder (3 implementaciones)</li>
                <li>• Decorator (6 implementaciones)</li>
                <li>• Adapter (3 implementaciones)</li>
                <li>• Bridge (3 implementaciones)</li>
                <li>• Proxy (3 implementaciones)</li>
              </ul>
            </div>
          </div>
        </Card>

        <div className="mt-8 text-center">
          <Button 
            onClick={() => window.location.href = '/dashboard'}
            className="mr-4"
          >
            Ir al Dashboard
          </Button>
          <Button 
            onClick={() => window.location.reload()}
            variant="secondary"
          >
            Recargar Página
          </Button>
        </div>
      </div>
    </div>
  );
}
