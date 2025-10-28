/**
 * Página principal del Dashboard
 * Muestra estadísticas generales y acceso rápido a módulos
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  EstadisticaCard,
  Card,
  Button,
  LoadingSpinner,
} from '@/app/components/ui';
import { formatCurrency, formatDateTime, createApiResponse } from '@/lib/utils';

interface EstadisticasDashboard {
  ventasHoy: number;
  pedidosHoy: number;
  mesasOcupadas: number;
  ingredientesStockBajo: number;
  clientesFrecuentes: number;
  promedioTiempoPrep: number;
}

interface PedidoReciente {
  id: string;
  tipo: string;
  estado: string;
  total: number;
  cliente?: { nombre: string };
  mesa?: { numero: number };
  createdAt: string;
}

interface MesaEstado {
  id: string;
  numero: number;
  estado: string;
  capacidad: number;
}

export default function DashboardPage() {
  const router = useRouter();
  const [estadisticas, setEstadisticas] =
    useState<EstadisticasDashboard | null>(null);
  const [pedidosRecientes, setPedidosRecientes] = useState<PedidoReciente[]>(
    []
  );
  const [mesas, setMesas] = useState<MesaEstado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFacturaModal, setShowFacturaModal] = useState(false);
  const [facturaGenerada, setFacturaGenerada] = useState<any>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);

      // Cargar estadísticas
      const statsResponse = await fetch('/api/dashboard');
      const statsData = await statsResponse.json();

      if (statsData.success) {
        setEstadisticas(statsData.data);
      }

      // Cargar pedidos recientes
      const pedidosResponse = await fetch('/api/pedidos?estado=PREPARANDO');
      const pedidosData = await pedidosResponse.json();

      if (pedidosData.success) {
        setPedidosRecientes(pedidosData.data.slice(0, 5));
      }

      // Cargar mesas
      const mesasResponse = await fetch('/api/mesas');
      const mesasData = await mesasResponse.json();

      if (mesasData.success) {
        setMesas(mesasData.data);
      }
    } catch (err) {
      setError('Error al cargar los datos del dashboard');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const generarFacturaAutomatica = async (pedidoId: string) => {
    try {
      const response = await fetch('/api/facturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pedidoId: pedidoId,
          metodoPago: 'EFECTIVO', // Método por defecto
          estado: 'PAGADA', // Marcar como pagada automáticamente
        }),
      });

      // Verificar si la respuesta es válida
      if (!response.ok) {
        console.error('Error HTTP:', response.status, response.statusText);
        return null;
      }

      // Verificar si hay contenido en la respuesta
      const text = await response.text();
      if (!text) {
        console.error('Respuesta vacía del servidor');
        return null;
      }

      const data = JSON.parse(text);

      if (data.success) {
        console.log('Factura generada automáticamente:', data.data.numero);
        setFacturaGenerada(data.data);
        setShowFacturaModal(true);
        return data.data;
      } else {
        console.error('Error al generar factura automática:', data.error);
        return null;
      }
    } catch (err) {
      console.error('Error al generar factura automática:', err);
      return null;
    }
  };

  const actualizarEstadoPedido = async (
    pedidoId: string,
    nuevoEstado: string
  ) => {
    try {
      // Si se está cambiando de LISTO a ENTREGADO, generar factura automáticamente
      if (nuevoEstado === 'ENTREGADO') {
        const pedido = pedidosRecientes.find((p) => p.id === pedidoId);
        if (pedido && pedido.estado === 'LISTO') {
          const factura = await generarFacturaAutomatica(pedidoId);
          if (!factura) {
            alert(
              'Error al generar la factura. No se puede marcar como entregado.'
            );
            return;
          }
          // El modal se muestra automáticamente desde generarFacturaAutomatica
        }
      }

      const response = await fetch(`/api/pedidos?id=${pedidoId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar la lista de pedidos
        setPedidosRecientes((prev) =>
          prev.map((pedido) =>
            pedido.id === pedidoId ? { ...pedido, estado: nuevoEstado } : pedido
          )
        );
      }
    } catch (err) {
      console.error('Error al actualizar estado del pedido:', err);
    }
  };

  const imprimirFactura = () => {
    if (!facturaGenerada) return;

    const ventanaImpresion = window.open('', '_blank');
    if (!ventanaImpresion) return;

    const contenidoImpresion = `
      <html>
        <head>
          <title>Factura ${facturaGenerada.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
            .info { margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 18px; }
            .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>FACTURA</h1>
            <h2>${facturaGenerada.numero}</h2>
          </div>
          
          <div class="info">
            <p><strong>Cliente:</strong> ${
              facturaGenerada.clienteNombre || 'Cliente'
            }</p>
            <p><strong>Mesa:</strong> ${facturaGenerada.mesaNumero || 'N/A'}</p>
            <p><strong>Fecha:</strong> ${new Date(
              facturaGenerada.fecha
            ).toLocaleString()}</p>
            <p><strong>Método de Pago:</strong> ${
              facturaGenerada.metodoPago
            }</p>
          </div>

          <table class="items">
            <thead>
              <tr>
                <th>Producto</th>
                <th>Cantidad</th>
                <th>Precio Unit.</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${
                (facturaGenerada.items || []).length > 0
                  ? (facturaGenerada.items || [])
                      .map(
                        (item) => `
                <tr>
                  <td>${item.nombre}</td>
                  <td>${item.cantidad}</td>
                  <td>$${item.precio.toLocaleString()}</td>
                  <td>$${(item.precio * item.cantidad).toLocaleString()}</td>
                </tr>
              `
                      )
                      .join('')
                  : '<tr><td colspan="4" style="text-align: center; font-style: italic; color: #666;">No hay productos registrados</td></tr>'
              }
            </tbody>
          </table>

          <div class="total">
            <p>Subtotal: $${facturaGenerada.subtotal.toLocaleString()}</p>
            <p>Descuento: $${facturaGenerada.descuento.toLocaleString()}</p>
            <p>IVA (19%): $${(
              facturaGenerada.iva ||
              facturaGenerada.impuestos ||
              0
            ).toLocaleString()}</p>
            <p>TOTAL: $${facturaGenerada.total.toLocaleString()}</p>
          </div>

          <div class="footer">
            <p>¡Gracias por su visita!</p>
            <p>Sistema de Gestión de Restaurante</p>
          </div>
        </body>
      </html>
    `;

    ventanaImpresion.document.write(contenidoImpresion);
    ventanaImpresion.document.close();
    ventanaImpresion.focus();
    ventanaImpresion.print();
    ventanaImpresion.close();
  };

  const cerrarModalFactura = () => {
    setShowFacturaModal(false);
    setFacturaGenerada(null);
  };

  const actualizarEstadoMesa = async (mesaId: string, nuevoEstado: string) => {
    try {
      const response = await fetch(`/api/mesas?id=${mesaId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      const data = await response.json();

      if (data.success) {
        // Actualizar la lista de mesas
        setMesas((prev) =>
          prev.map((mesa) =>
            mesa.id === mesaId ? { ...mesa, estado: nuevoEstado } : mesa
          )
        );
      }
    } catch (err) {
      console.error('Error al actualizar estado de mesa:', err);
    }
  };

  // Funciones de navegación para los botones de acceso rápido
  const navegarAMenu = () => {
    router.push('/menu');
  };

  const navegarAMesas = () => {
    router.push('/mesas');
  };

  const navegarACocina = () => {
    router.push('/cocina');
  };

  const navegarAInventario = () => {
    router.push('/inventario');
  };

  const navegarAFacturacion = () => {
    router.push('/facturacion');
  };

  const navegarAReportes = () => {
    router.push('/reportes');
  };

  const crearNuevoPedido = () => {
    router.push('/pedidos/nuevo');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando dashboard..." />
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
              Error al cargar el dashboard
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={cargarDatos}>Reintentar</Button>
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
                Dashboard del Restaurante
              </h1>
              <p className="text-gray-600">{formatDateTime(new Date())}</p>
            </div>
            <div className="flex space-x-3">
              <Button variant="secondary" onClick={cargarDatos}>
                Actualizar
              </Button>
              <Button onClick={crearNuevoPedido}>Nuevo Pedido</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Estadísticas principales */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
            <EstadisticaCard
              titulo="Ventas Hoy"
              valor={formatCurrency(estadisticas.ventasHoy)}
              color="green"
              icono={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              }
            />
            <EstadisticaCard
              titulo="Pedidos Hoy"
              valor={estadisticas.pedidosHoy}
              color="blue"
              icono={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                  />
                </svg>
              }
            />
            <EstadisticaCard
              titulo="Mesas Ocupadas"
              valor={estadisticas.mesasOcupadas}
              color="yellow"
              icono={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                  />
                </svg>
              }
            />
            <EstadisticaCard
              titulo="Stock Bajo"
              valor={estadisticas.ingredientesStockBajo}
              color="red"
              icono={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                  />
                </svg>
              }
            />
            <EstadisticaCard
              titulo="Clientes Frecuentes"
              valor={estadisticas.clientesFrecuentes}
              color="purple"
              icono={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
              }
            />
            <EstadisticaCard
              titulo="Tiempo Promedio"
              valor={`${estadisticas.promedioTiempoPrep} min`}
              color="blue"
              icono={
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              }
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Pedidos en preparación */}
          <Card title="Pedidos en Preparación">
            <div className="space-y-4">
              {pedidosRecientes.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  No hay pedidos en preparación
                </p>
              ) : (
                pedidosRecientes.map((pedido) => (
                  <div
                    key={pedido.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div>
                      <p className="font-medium text-gray-900">
                        Pedido #{pedido.id.slice(-6)}
                      </p>
                      <p className="text-sm text-gray-500">
                        {pedido.tipo} - {pedido.cliente?.nombre || 'Cliente'}
                        {pedido.mesa && ` - Mesa ${pedido.mesa.numero}`}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDateTime(new Date(pedido.createdAt))}
                      </p>
                    </div>
                    <div className="flex flex-col items-end space-y-2">
                      <span className="text-lg font-bold text-gray-900">
                        {formatCurrency(pedido.total)}
                      </span>
                      <select
                        value={pedido.estado}
                        onChange={(e) =>
                          actualizarEstadoPedido(pedido.id, e.target.value)
                        }
                        className="text-sm border border-gray-300 rounded px-2 py-1"
                      >
                        <option value="RECIBIDO">Recibido</option>
                        <option value="PREPARANDO">Preparando</option>
                        <option value="LISTO">Listo</option>
                        <option value="ENTREGADO">Entregado</option>
                        <option value="CANCELADO">Cancelado</option>
                      </select>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Estado de mesas */}
          <Card title="Estado de Mesas">
            <div className="grid grid-cols-2 gap-3">
              {mesas.map((mesa) => (
                <div key={mesa.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-gray-900">
                      Mesa {mesa.numero}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${
                        mesa.estado === 'DISPONIBLE'
                          ? 'bg-green-100 text-green-800'
                          : mesa.estado === 'OCUPADA'
                          ? 'bg-red-100 text-red-800'
                          : mesa.estado === 'RESERVADA'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {mesa.estado}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 mb-2">
                    Capacidad: {mesa.capacidad} personas
                  </p>
                  <select
                    value={mesa.estado}
                    onChange={(e) =>
                      actualizarEstadoMesa(mesa.id, e.target.value)
                    }
                    className="w-full text-xs border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="OCUPADA">Ocupada</option>
                    <option value="RESERVADA">Reservada</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                  </select>
                </div>
              ))}
            </div>
          </Card>
        </div>

        {/* Acceso rápido a módulos */}
        <Card title="Acceso Rápido" className="mt-8">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center"
              onClick={navegarAMenu}
            >
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
              <span className="text-sm">Menú</span>
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center"
              onClick={navegarAMesas}
            >
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4"
                />
              </svg>
              <span className="text-sm">Mesas</span>
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center"
              onClick={navegarACocina}
            >
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-sm">Cocina</span>
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center"
              onClick={navegarAInventario}
            >
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                />
              </svg>
              <span className="text-sm">Inventario</span>
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center"
              onClick={navegarAFacturacion}
            >
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <span className="text-sm">Facturación</span>
            </Button>
            <Button
              variant="secondary"
              className="h-20 flex flex-col items-center justify-center"
              onClick={navegarAReportes}
            >
              <svg
                className="h-8 w-8 mb-2"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <span className="text-sm">Reportes</span>
            </Button>
          </div>
        </Card>
      </div>

      {/* Modal de Factura Generada */}
      {showFacturaModal && facturaGenerada && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-semibold text-gray-900">
                Factura Generada Automáticamente
              </h3>
              <button
                onClick={cerrarModalFactura}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <div className="flex items-center">
                <svg
                  className="h-5 w-5 text-green-400 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className="text-green-800 font-medium">
                  Factura {facturaGenerada.numero} generada exitosamente
                </p>
              </div>
            </div>

            {/* Detalles de la Factura */}
            <div className="space-y-4 mb-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Número de Factura
                  </label>
                  <p className="text-lg font-semibold text-gray-900">
                    {facturaGenerada.numero}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Fecha
                  </label>
                  <p className="text-gray-900">
                    {new Date(facturaGenerada.fecha).toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Cliente
                  </label>
                  <p className="text-gray-900">
                    {facturaGenerada.clienteNombre || 'Cliente'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Mesa
                  </label>
                  <p className="text-gray-900">
                    {facturaGenerada.mesaNumero || 'N/A'}
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Método de Pago
                </label>
                <p className="text-gray-900">{facturaGenerada.metodoPago}</p>
              </div>
            </div>

            {/* Items de la Factura */}
            <div className="mb-6">
              <h4 className="text-lg font-medium text-gray-900 mb-3">
                Productos
              </h4>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Producto
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Cantidad
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Precio
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Total
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {(facturaGenerada.items || []).map((item, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.nombre}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {item.cantidad}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${item.precio.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          ${(item.precio * item.cantidad).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Totales */}
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal:</span>
                  <span className="font-medium">
                    ${facturaGenerada.subtotal.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Descuento:</span>
                  <span className="font-medium">
                    ${facturaGenerada.descuento.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IVA (19%):</span>
                  <span className="font-medium">
                    $
                    {(
                      facturaGenerada.iva ||
                      facturaGenerada.impuestos ||
                      0
                    ).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t pt-2">
                  <span>TOTAL:</span>
                  <span>${facturaGenerada.total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Botones de Acción */}
            <div className="flex space-x-3">
              <Button onClick={imprimirFactura} className="flex-1">
                🖨️ Imprimir Factura
              </Button>
              <Button
                variant="secondary"
                onClick={cerrarModalFactura}
                className="flex-1"
              >
                ✅ Cerrar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
