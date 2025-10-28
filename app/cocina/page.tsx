/**
 * Página del Módulo de Cocina
 * Gestión de órdenes y estados de preparación
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, LoadingSpinner } from '@/app/components/ui';

interface Pedido {
  id: string;
  tipo: string;
  estado: string;
  total: number;
  cliente?: { nombre: string };
  mesa?: { numero: number };
  platillos: Array<{
    platillo: { nombre: string };
    cantidad: number;
    precioUnitario: number;
  }>;
  createdAt: string;
}

export default function CocinaPage() {
  const router = useRouter();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFacturaModal, setShowFacturaModal] = useState(false);
  const [facturaGenerada, setFacturaGenerada] = useState<any>(null);

  useEffect(() => {
    cargarPedidos();

    // Auto-refresh cada 30 segundos
    const interval = setInterval(() => {
      cargarPedidos();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  const cargarPedidos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/pedidos');
      const data = await response.json();

      console.log('Datos de pedidos cargados:', data); // Debug log

      if (data.success) {
        setPedidos(data.data);
        console.log('Pedidos establecidos:', data.data); // Debug log
      } else {
        setError(
          'Error al cargar los pedidos: ' +
            (data.message || 'Error desconocido')
        );
      }
    } catch (err) {
      setError('Error al cargar los pedidos');
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
        const pedido = pedidos.find((p) => p.id === pedidoId);
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
        setPedidos((prev) =>
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

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'RECIBIDO':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'PREPARANDO':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LISTO':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'ENTREGADO':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'CANCELADO':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'RECIBIDO':
        return '📥';
      case 'PREPARANDO':
        return '👨‍🍳';
      case 'LISTO':
        return '✅';
      case 'ENTREGADO':
        return '🚚';
      case 'CANCELADO':
        return '❌';
      default:
        return '❓';
    }
  };

  const getTiempoTranscurrido = (createdAt: string) => {
    const ahora = new Date();
    const creado = new Date(createdAt);
    const diffMs = ahora.getTime() - creado.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    return diffMins;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando órdenes de cocina..." />
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
              Error al cargar las órdenes
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={cargarPedidos}>Reintentar</Button>
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
              <h1 className="text-3xl font-bold text-gray-900">👨‍🍳 Cocina</h1>
              <p className="text-gray-600">Gestión de órdenes y preparación</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard')}
              >
                ← Volver al Dashboard
              </Button>
              <Button onClick={cargarPedidos}>🔄 Actualizar</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {pedidos.filter((p) => p.estado === 'RECIBIDO').length}
              </div>
              <div className="text-sm text-gray-600">Recibidos</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {pedidos.filter((p) => p.estado === 'PREPARANDO').length}
              </div>
              <div className="text-sm text-gray-600">Preparando</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {pedidos.filter((p) => p.estado === 'LISTO').length}
              </div>
              <div className="text-sm text-gray-600">Listos</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {pedidos.filter((p) => p.estado === 'ENTREGADO').length}
              </div>
              <div className="text-sm text-gray-600">Entregados</div>
            </div>
          </Card>
        </div>

        {/* Cola de órdenes */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Órdenes en preparación */}
          <Card title="Órdenes en Preparación">
            <div className="space-y-4">
              {pedidos.filter((p) =>
                ['RECIBIDO', 'PREPARANDO'].includes(p.estado)
              ).length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-gray-400 text-4xl mb-4">👨‍🍳</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No hay pedidos en preparación
                  </h3>
                  <p className="text-gray-600 mb-4">
                    Los nuevos pedidos aparecerán aquí automáticamente
                  </p>
                  <Button size="sm" onClick={cargarPedidos}>
                    🔄 Actualizar
                  </Button>
                </div>
              ) : (
                pedidos
                  .filter((p) => ['RECIBIDO', 'PREPARANDO'].includes(p.estado))
                  .map((pedido) => (
                    <div
                      key={pedido.id}
                      className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">
                            Pedido #{pedido.id.slice(-6)}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {pedido.cliente?.nombre || 'Cliente'}
                            {pedido.mesa && ` - Mesa ${pedido.mesa.numero}`}
                          </p>
                          <p className="text-xs text-gray-500">
                            ⏱️ {getTiempoTranscurrido(pedido.createdAt)} min
                          </p>
                        </div>
                        <span
                          className={`px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(
                            pedido.estado
                          )}`}
                        >
                          {getEstadoIcon(pedido.estado)} {pedido.estado}
                        </span>
                      </div>

                      <div className="space-y-2 mb-3">
                        <h4 className="text-sm font-medium text-gray-700">
                          Platillos:
                        </h4>
                        {pedido.platillos && pedido.platillos.length > 0 ? (
                          pedido.platillos.map((item, index) => (
                            <div
                              key={index}
                              className="flex justify-between text-sm"
                            >
                              <span>
                                {item.cantidad}x {item.platillo.nombre}
                              </span>
                              <span className="text-gray-600">
                                $
                                {(
                                  item.cantidad * item.precioUnitario
                                ).toLocaleString()}
                              </span>
                            </div>
                          ))
                        ) : (
                          <p className="text-sm text-gray-500 italic">
                            No hay platillos disponibles
                          </p>
                        )}
                      </div>

                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">
                          ${pedido.total.toLocaleString()}
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

          {/* Órdenes listas */}
          <Card title="Órdenes Listas">
            <div className="space-y-4">
              {pedidos
                .filter((p) => p.estado === 'LISTO')
                .map((pedido) => (
                  <div
                    key={pedido.id}
                    className="border rounded-lg p-4 bg-green-50 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">
                          Pedido #{pedido.id.slice(-6)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {pedido.cliente?.nombre || 'Cliente'}
                          {pedido.mesa && ` - Mesa ${pedido.mesa.numero}`}
                        </p>
                      </div>
                      <span className="px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800 border border-green-200">
                        ✅ LISTO
                      </span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-lg font-bold text-gray-900">
                        ${pedido.total.toLocaleString()}
                      </span>
                      <Button
                        size="sm"
                        onClick={() =>
                          actualizarEstadoPedido(pedido.id, 'ENTREGADO')
                        }
                      >
                        🚚 Marcar Entregado
                      </Button>
                    </div>
                  </div>
                ))}
            </div>
          </Card>
        </div>

        {pedidos.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">👨‍🍳</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay órdenes en cocina
              </h3>
              <p className="text-gray-600 mb-4">
                Las nuevas órdenes aparecerán aquí automáticamente
              </p>
              <Button onClick={cargarPedidos}>🔄 Actualizar</Button>
            </div>
          </Card>
        )}
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
