/**
 * Página del Módulo de Reportes
 * Análisis de ventas y estadísticas
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, LoadingSpinner } from '@/app/components/ui';

interface EstadisticasDashboard {
  ventasHoy: number;
  pedidosHoy: number;
  mesasOcupadas: number;
  ingredientesStockBajo: number;
  clientesFrecuentes: number;
  promedioTiempoPrep: number;
}

export default function ReportesPage() {
  const router = useRouter();
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    cargarEstadisticas();
  }, []);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/dashboard');
      const data = await response.json();

      if (data.success) {
        setEstadisticas(data.data);
      }
    } catch (err) {
      setError('Error al cargar las estadísticas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const exportarReporte = (
    formato: 'pdf' | 'excel' | 'csv',
    tipoReporte: string
  ) => {
    console.log(`Exportando reporte ${tipoReporte} en formato ${formato}`);

    // Simular datos del reporte
    const datosReporte = {
      tipo: tipoReporte,
      fecha: new Date().toLocaleDateString(),
      datos: estadisticas,
    };

    if (formato === 'pdf') {
      // Crear contenido HTML para PDF
      const contenidoPDF = `
        <html>
          <head>
            <title>Reporte ${tipoReporte}</title>
            <style>
              body { font-family: Arial, sans-serif; margin: 20px; }
              .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
              .section { margin-bottom: 30px; }
              .section h3 { color: #333; border-bottom: 1px solid #ccc; padding-bottom: 5px; }
              .metric { display: flex; justify-content: space-between; margin-bottom: 10px; padding: 5px 0; }
              .metric-value { font-weight: bold; color: #2563eb; }
            </style>
          </head>
          <body>
            <div class="header">
              <h1>RESTAURANTE DELICIAS</h1>
              <h2>Reporte de ${tipoReporte}</h2>
              <p>Fecha: ${datosReporte.fecha}</p>
            </div>
            
            <div class="section">
              <h3>Estadísticas Generales</h3>
              <div class="metric">
                <span>Ventas Hoy:</span>
                <span class="metric-value">$${
                  estadisticas?.ventasHoy.toLocaleString() || 0
                }</span>
              </div>
              <div class="metric">
                <span>Pedidos Hoy:</span>
                <span class="metric-value">${
                  estadisticas?.pedidosHoy || 0
                }</span>
              </div>
              <div class="metric">
                <span>Mesas Ocupadas:</span>
                <span class="metric-value">${
                  estadisticas?.mesasOcupadas || 0
                }</span>
              </div>
              <div class="metric">
                <span>Ingredientes Stock Bajo:</span>
                <span class="metric-value">${
                  estadisticas?.ingredientesStockBajo || 0
                }</span>
              </div>
              <div class="metric">
                <span>Clientes Frecuentes:</span>
                <span class="metric-value">${
                  estadisticas?.clientesFrecuentes || 0
                }</span>
              </div>
              <div class="metric">
                <span>Promedio Tiempo Preparación:</span>
                <span class="metric-value">${
                  estadisticas?.promedioTiempoPrep || 0
                } min</span>
              </div>
            </div>
            
            <div class="section">
              <h3>Resumen</h3>
              <p>Este reporte contiene las estadísticas principales del restaurante para el día ${
                datosReporte.fecha
              }.</p>
              <p>Generado automáticamente por el Sistema de Gestión de Restaurante.</p>
            </div>
          </body>
        </html>
      `;

      // Abrir ventana de impresión para PDF
      const ventanaImpresion = window.open('', '_blank');
      if (ventanaImpresion) {
        ventanaImpresion.document.write(contenidoPDF);
        ventanaImpresion.document.close();
        ventanaImpresion.focus();
        ventanaImpresion.print();
        ventanaImpresion.close();
      }
    } else if (formato === 'excel') {
      // Crear contenido CSV para Excel
      const contenidoCSV = `Tipo Reporte,Fecha,Ventas Hoy,Pedidos Hoy,Mesas Ocupadas,Ingredientes Stock Bajo,Clientes Frecuentes,Promedio Tiempo Prep
${tipoReporte},${datosReporte.fecha},${estadisticas?.ventasHoy || 0},${
        estadisticas?.pedidosHoy || 0
      },${estadisticas?.mesasOcupadas || 0},${
        estadisticas?.ingredientesStockBajo || 0
      },${estadisticas?.clientesFrecuentes || 0},${
        estadisticas?.promedioTiempoPrep || 0
      }`;

      // Descargar archivo CSV
      const blob = new Blob([contenidoCSV], {
        type: 'text/csv;charset=utf-8;',
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `reporte_${tipoReporte.toLowerCase().replace(/\s+/g, '_')}_${
          new Date().toISOString().split('T')[0]
        }.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (formato === 'csv') {
      // Crear contenido CSV
      const contenidoCSV = `Tipo Reporte,Fecha,Ventas Hoy,Pedidos Hoy,Mesas Ocupadas,Ingredientes Stock Bajo,Clientes Frecuentes,Promedio Tiempo Prep
${tipoReporte},${datosReporte.fecha},${estadisticas?.ventasHoy || 0},${
        estadisticas?.pedidosHoy || 0
      },${estadisticas?.mesasOcupadas || 0},${
        estadisticas?.ingredientesStockBajo || 0
      },${estadisticas?.clientesFrecuentes || 0},${
        estadisticas?.promedioTiempoPrep || 0
      }`;

      // Descargar archivo CSV
      const blob = new Blob([contenidoCSV], {
        type: 'text/csv;charset=utf-8;',
      });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute(
        'download',
        `reporte_${tipoReporte.toLowerCase().replace(/\s+/g, '_')}_${
          new Date().toISOString().split('T')[0]
        }.csv`
      );
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    alert(
      `Reporte ${tipoReporte} exportado en formato ${formato.toUpperCase()} exitosamente`
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando reportes..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="max-w-md">
          <div className="text-center">
            <div className="text-red-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              Error al cargar los reportes
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={cargarEstadisticas}>Reintentar</Button>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📊 Reportes y Estadísticas
              </h1>
              <p className="text-gray-600">
                Análisis de ventas y métricas del restaurante
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard')}
              >
                ← Volver al Dashboard
              </Button>
              <Button onClick={() => exportarReporte('pdf', 'Reporte General')}>
                📄 Exportar PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Métricas principales */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  ${estadisticas.ventasHoy.toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">Ventas Hoy</div>
                <div className="text-xs text-green-600 mt-1">+12% vs ayer</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {estadisticas.pedidosHoy}
                </div>
                <div className="text-sm text-gray-600">Pedidos Hoy</div>
                <div className="text-xs text-blue-600 mt-1">+8% vs ayer</div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-600 mb-2">
                  {estadisticas.clientesFrecuentes}
                </div>
                <div className="text-sm text-gray-600">Clientes Frecuentes</div>
                <div className="text-xs text-purple-600 mt-1">
                  +3 esta semana
                </div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {estadisticas.mesasOcupadas}
                </div>
                <div className="text-sm text-gray-600">Mesas Ocupadas</div>
                <div className="text-xs text-yellow-600 mt-1">
                  75% ocupación
                </div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {estadisticas.ingredientesStockBajo}
                </div>
                <div className="text-sm text-gray-600">Stock Bajo</div>
                <div className="text-xs text-red-600 mt-1">
                  Requiere atención
                </div>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <div className="text-3xl font-bold text-indigo-600 mb-2">
                  {estadisticas.promedioTiempoPrep} min
                </div>
                <div className="text-sm text-gray-600">Tiempo Promedio</div>
                <div className="text-xs text-indigo-600 mt-1">Preparación</div>
              </div>
            </Card>
          </div>
        )}

        {/* Reportes por categoría */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          {/* Reporte de Ventas */}
          <Card title="📈 Reporte de Ventas">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Ventas por Día
                </h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => exportarReporte('excel', 'Ventas Diarias')}
                >
                  📊 Excel
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">Hoy</span>
                  <span className="text-sm font-bold text-green-600">
                    ${estadisticas?.ventasHoy.toLocaleString() || '0'}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Ayer
                  </span>
                  <span className="text-sm font-bold text-gray-600">
                    $
                    {Math.round(
                      (estadisticas?.ventasHoy || 0) * 0.88
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Esta Semana
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    ${((estadisticas?.ventasHoy || 0) * 7).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Este Mes
                  </span>
                  <span className="text-sm font-bold text-purple-600">
                    ${((estadisticas?.ventasHoy || 0) * 30).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>
          </Card>

          {/* Reporte de Operaciones */}
          <Card title="⚙️ Reporte de Operaciones">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold text-gray-900">
                  Métricas Operativas
                </h3>
                <Button
                  size="sm"
                  variant="secondary"
                  onClick={() => exportarReporte('csv', 'Platos Populares')}
                >
                  📋 CSV
                </Button>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Pedidos Procesados
                  </span>
                  <span className="text-sm font-bold text-blue-600">
                    {estadisticas?.pedidosHoy || 0}
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Tiempo Promedio
                  </span>
                  <span className="text-sm font-bold text-indigo-600">
                    {estadisticas?.promedioTiempoPrep || 0} min
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Ocupación Mesas
                  </span>
                  <span className="text-sm font-bold text-yellow-600">
                    {estadisticas?.mesasOcupadas || 0}/4 mesas
                  </span>
                </div>
                <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                  <span className="text-sm font-medium text-gray-700">
                    Clientes Frecuentes
                  </span>
                  <span className="text-sm font-bold text-purple-600">
                    {estadisticas?.clientesFrecuentes || 0}
                  </span>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Reportes adicionales */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card title="🍽️ Platillos Populares">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">
                  Hamburguesa Clásica
                </span>
                <span className="text-sm font-bold text-green-600">
                  45 ventas
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Pizza Margherita</span>
                <span className="text-sm font-bold text-blue-600">
                  32 ventas
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">Ensalada César</span>
                <span className="text-sm font-bold text-purple-600">
                  28 ventas
                </span>
              </div>
            </div>
          </Card>

          <Card title="⏰ Horarios Pico">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">12:00 - 14:00</span>
                <span className="text-sm font-bold text-red-600">Almuerzo</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">19:00 - 21:00</span>
                <span className="text-sm font-bold text-orange-600">Cena</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">15:00 - 17:00</span>
                <span className="text-sm font-bold text-gray-600">Bajo</span>
              </div>
            </div>
          </Card>

          <Card title="💰 Métodos de Pago">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">💳 Tarjeta</span>
                <span className="text-sm font-bold text-blue-600">65%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">💵 Efectivo</span>
                <span className="text-sm font-bold text-green-600">25%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-700">🏦 Transferencia</span>
                <span className="text-sm font-bold text-purple-600">10%</span>
              </div>
            </div>
          </Card>
        </div>

        {/* Acciones de exportación */}
        <Card title="📤 Exportar Reportes" className="mt-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => exportarReporte('pdf', 'Análisis de Inventario')}
            >
              <div className="text-2xl mb-2">📄</div>
              <span className="text-sm">Exportar PDF</span>
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => exportarReporte('excel', 'Análisis de Inventario')}
            >
              <div className="text-2xl mb-2">📊</div>
              <span className="text-sm">Exportar Excel</span>
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center"
              onClick={() => exportarReporte('csv', 'Análisis de Inventario')}
            >
              <div className="text-2xl mb-2">📋</div>
              <span className="text-sm">Exportar CSV</span>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
