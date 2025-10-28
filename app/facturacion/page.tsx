/**
 * Página del Módulo de Facturación
 * Gestión de facturas y pagos
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, LoadingSpinner } from '@/app/components/ui';

interface Factura {
  id: string;
  pedidoId: string;
  clienteId: string;
  numero: string;
  subtotal: number;
  descuento: number;
  impuestos: number;
  total: number;
  metodoPago: string;
  estado: string;
  fecha: string;
  createdAt: string;
  updatedAt: string;
}

export default function FacturacionPage() {
  const router = useRouter();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<
    'nueva' | 'manual' | 'ver' | 'imprimir'
  >('nueva');
  const [facturaSeleccionada, setFacturaSeleccionada] =
    useState<Factura | null>(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any>(null);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await Promise.all([cargarFacturas(), cargarPedidos()]);
  };

  const cargarPedidos = async () => {
    try {
      const response = await fetch('/api/pedidos');
      const data = await response.json();

      if (data.success) {
        // Filtrar solo pedidos que pueden ser facturados (LISTO o ENTREGADO)
        const pedidosFacturables = data.data.filter(
          (pedido: any) =>
            pedido.estado === 'LISTO' || pedido.estado === 'ENTREGADO'
        );
        setPedidos(pedidosFacturables);
      } else {
        setError('Error al cargar pedidos');
      }
    } catch (err) {
      console.error('Error:', err);
      setError('Error al cargar pedidos');
    }
  };

  const cargarFacturas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/facturas');
      const data = await response.json();

      if (data.success) {
        setFacturas(data.data);
      } else {
        setError('Error al cargar las facturas');
      }
    } catch (err) {
      setError('Error al cargar las facturas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevaFactura = () => {
    setFacturaSeleccionada(null);
    setPedidoSeleccionado(null);
    setModalType('nueva');
    setShowModal(true);
  };

  const handleNuevaFacturaManual = () => {
    setFacturaSeleccionada(null);
    setPedidoSeleccionado(null);
    setModalType('manual');
    setShowModal(true);
  };

  const handleVerFactura = (factura: Factura) => {
    setFacturaSeleccionada(factura);
    setModalType('ver');
    setShowModal(true);
  };

  const handleImprimirFactura = (factura: Factura) => {
    setFacturaSeleccionada(factura);
    setModalType('imprimir');
    setShowModal(true);
  };

  const handleSeleccionarPedido = (pedido: any) => {
    setPedidoSeleccionado(pedido);
  };

  const crearFacturaDesdePedido = async () => {
    if (!pedidoSeleccionado) return;

    try {
      const response = await fetch('/api/facturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pedidoId: pedidoSeleccionado.id,
          metodoPago: 'EFECTIVO', // Método por defecto
          estado: 'PAGADA',
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('Factura creada exitosamente');

        // Actualizar estado local inmediatamente
        setFacturas((prev) => [data.data, ...prev]);

        // Remover el pedido de la lista de pedidos facturables
        setPedidos((prev) =>
          prev.filter((p) => p.id !== pedidoSeleccionado.id)
        );

        setShowModal(false);
        setPedidoSeleccionado(null);
      } else {
        alert('Error al crear la factura');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al crear la factura');
    }
  };

  const crearFactura = async (datosFactura: Partial<Factura>) => {
    try {
      const response = await fetch('/api/facturas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosFactura),
      });

      const data = await response.json();

      if (data.success) {
        alert('Factura creada exitosamente');

        // Actualizar estado local inmediatamente
        setFacturas((prev) => [data.data, ...prev]);

        setShowModal(false);
      } else {
        alert('Error al crear la factura');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al crear la factura');
    }
  };

  const imprimirFactura = () => {
    if (!facturaSeleccionada) return;

    // Crear contenido HTML para imprimir
    const contenidoImpresion = `
      <html>
        <head>
          <title>Factura ${facturaSeleccionada.numero}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 20px; margin-bottom: 20px; }
            .info { display: flex; justify-content: space-between; margin-bottom: 20px; }
            .items { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            .items th, .items td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items th { background-color: #f2f2f2; }
            .total { text-align: right; font-weight: bold; font-size: 18px; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>RESTAURANTE DELICIAS</h1>
            <h2>FACTURA DE VENTA</h2>
            <p>NIT: 900.123.456-7</p>
            <p>Dirección: Calle 123 #45-67, Bogotá</p>
          </div>
          
          <div class="info">
            <div>
              <p><strong>Factura No:</strong> ${facturaSeleccionada.numero}</p>
              <p><strong>Fecha:</strong> ${new Date(
                facturaSeleccionada.fecha
              ).toLocaleDateString()}</p>
            </div>
            <div>
              <p><strong>Cliente:</strong> ${
                facturaSeleccionada.clienteNombre || 'Cliente'
              }</p>
              <p><strong>Mesa:</strong> ${
                facturaSeleccionada.mesaNumero || 'N/A'
              }</p>
            </div>
          </div>
          
          <table class="items">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Cantidad</th>
                <th>Valor Unitario</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${
                (facturaSeleccionada.items || []).length > 0
                  ? (facturaSeleccionada.items || [])
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
            <p>Subtotal: $${facturaSeleccionada.subtotal.toLocaleString()}</p>
            <p>IVA (19%): $${(
              facturaSeleccionada.iva ||
              facturaSeleccionada.impuestos ||
              0
            ).toLocaleString()}</p>
            <p>Descuento: $${facturaSeleccionada.descuento.toLocaleString()}</p>
            <p>TOTAL: $${facturaSeleccionada.total.toLocaleString()}</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <p><strong>Método de Pago:</strong> ${
              facturaSeleccionada.metodoPago
            }</p>
            <p>¡Gracias por su visita!</p>
          </div>
        </body>
      </html>
    `;

    // Crear ventana de impresión
    const ventanaImpresion = window.open('', '_blank');
    if (ventanaImpresion) {
      ventanaImpresion.document.write(contenidoImpresion);
      ventanaImpresion.document.close();
      ventanaImpresion.focus();
      ventanaImpresion.print();
      ventanaImpresion.close();
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'PAGADA':
        return 'text-green-600 bg-green-100';
      case 'PENDIENTE':
        return 'text-yellow-600 bg-yellow-100';
      case 'CANCELADA':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'PAGADA':
        return '✅';
      case 'PENDIENTE':
        return '⏳';
      case 'CANCELADA':
        return '❌';
      default:
        return '📄';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Reintentar</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                Módulo de Facturación
              </h1>
              <p className="text-gray-600 mt-2">
                Gestión de facturas y pagos del restaurante
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard')}
              >
                ← Volver al Dashboard
              </Button>
              <div className="flex space-x-3">
                <Button onClick={handleNuevaFactura}>
                  + Nueva Factura (Desde Pedido)
                </Button>
                <Button onClick={handleNuevaFacturaManual} variant="outline">
                  + Factura Manual
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Lista de Facturas */}
        <div className="grid gap-6">
          {facturas.length === 0 ? (
            <Card>
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">
                  No hay facturas registradas
                </p>
                <p className="text-gray-400 mt-2">
                  Crea tu primera factura desde un pedido existente
                </p>
              </div>
            </Card>
          ) : (
            facturas.map((factura) => (
              <Card key={factura.id}>
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">
                          {factura.numero}
                        </h3>
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(
                            factura.estado
                          )}`}
                        >
                          {getEstadoIcon(factura.estado)} {factura.estado}
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Cliente:</span>{' '}
                          {factura.clienteNombre || 'Sin cliente'}
                        </div>
                        <div>
                          <span className="font-medium">Mesa:</span>{' '}
                          {factura.mesaNumero || 'Para llevar'}
                        </div>
                        <div>
                          <span className="font-medium">Fecha:</span>{' '}
                          {new Date(factura.fecha).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Método de Pago:</span>{' '}
                          {factura.metodoPago}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${factura.total.toLocaleString()}
                      </p>
                      <div className="flex space-x-2 mt-3">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleVerFactura(factura)}
                        >
                          Ver
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleImprimirFactura(factura)}
                        >
                          Imprimir
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            {modalType === 'ver' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detalles de la Factura
                </h3>
                {facturaSeleccionada && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="font-medium">Número:</span>{' '}
                        {facturaSeleccionada.numero}
                      </div>
                      <div>
                        <span className="font-medium">Fecha:</span>{' '}
                        {new Date(
                          facturaSeleccionada.fecha
                        ).toLocaleDateString()}
                      </div>
                      <div>
                        <span className="font-medium">Cliente:</span>{' '}
                        {facturaSeleccionada.clienteNombre}
                      </div>
                      <div>
                        <span className="font-medium">Mesa:</span>{' '}
                        {facturaSeleccionada.mesaNumero || 'Para llevar'}
                      </div>
                      <div>
                        <span className="font-medium">Método de Pago:</span>{' '}
                        {facturaSeleccionada.metodoPago}
                      </div>
                      <div>
                        <span className="font-medium">Estado:</span>{' '}
                        {facturaSeleccionada.estado}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Productos:</h4>
                      <div className="space-y-2">
                        {(facturaSeleccionada.items || []).map(
                          (item, index) => (
                            <div key={index} className="flex justify-between">
                              <span>{item.nombre}</span>
                              <span>
                                {item.cantidad} x $
                                {item.precio.toLocaleString()} = $
                                {(item.cantidad * item.precio).toLocaleString()}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                    <div className="border-t pt-4">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span>
                          ${facturaSeleccionada.subtotal.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>IVA (19%):</span>
                        <span>
                          $
                          {(
                            facturaSeleccionada.iva ||
                            facturaSeleccionada.impuestos ||
                            0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Descuento:</span>
                        <span>
                          ${facturaSeleccionada.descuento.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>TOTAL:</span>
                        <span>
                          ${facturaSeleccionada.total.toLocaleString()}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end mt-6">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cerrar
                  </Button>
                </div>
              </div>
            ) : modalType === 'imprimir' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Imprimir Factura
                </h3>
                <p className="text-gray-600 mb-4">
                  ¿Deseas imprimir la factura {facturaSeleccionada?.numero}?
                </p>
                <div className="flex justify-end space-x-3">
                  <Button variant="outline" onClick={() => setShowModal(false)}>
                    Cancelar
                  </Button>
                  <Button onClick={imprimirFactura}>Imprimir</Button>
                </div>
              </div>
            ) : modalType === 'nueva' ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Nueva Factura - Seleccionar Pedido
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModalType('manual')}
                  >
                    Crear Manual
                  </Button>
                </div>

                {pedidos.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 mb-4">
                      No hay pedidos disponibles para facturar
                    </p>
                    <p className="text-sm text-gray-400">
                      Los pedidos deben estar en estado "LISTO" o "ENTREGADO"
                      para poder facturarlos
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="max-h-96 overflow-y-auto">
                      {pedidos.map((pedido) => (
                        <div
                          key={pedido.id}
                          className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            pedidoSeleccionado?.id === pedido.id
                              ? 'border-blue-500 bg-blue-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                          onClick={() => handleSeleccionarPedido(pedido)}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium text-gray-900">
                                Pedido #{pedido.id}
                              </h4>
                              <p className="text-sm text-gray-600">
                                Cliente:{' '}
                                {pedido.cliente?.nombre || 'Sin cliente'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Mesa: {pedido.mesa?.numero || 'Para llevar'}
                              </p>
                              <p className="text-sm text-gray-600">
                                Estado:{' '}
                                <span
                                  className={`font-medium ${
                                    pedido.estado === 'LISTO'
                                      ? 'text-green-600'
                                      : 'text-blue-600'
                                  }`}
                                >
                                  {pedido.estado}
                                </span>
                              </p>
                              {pedido.platillos &&
                                pedido.platillos.length > 0 && (
                                  <div className="mt-2">
                                    <p className="text-sm font-medium text-gray-700">
                                      Productos:
                                    </p>
                                    <ul className="text-sm text-gray-600 ml-2">
                                      {pedido.platillos.map(
                                        (platillo: any, index: number) => (
                                          <li key={index}>
                                            •{' '}
                                            {platillo.platillo?.nombre ||
                                              'Platillo'}
                                            (x{platillo.cantidad}) - $
                                            {platillo.precioUnitario?.toLocaleString()}
                                          </li>
                                        )
                                      )}
                                    </ul>
                                  </div>
                                )}
                            </div>
                            <div className="text-right">
                              <p className="text-lg font-bold text-gray-900">
                                ${pedido.total?.toLocaleString()}
                              </p>
                              <p className="text-sm text-gray-500">
                                {new Date(
                                  pedido.createdAt
                                ).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {pedidoSeleccionado && (
                      <div className="border-t pt-4">
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <h4 className="font-medium text-gray-900 mb-2">
                            Pedido Seleccionado: #{pedidoSeleccionado.id}
                          </h4>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                              <span className="font-medium">Cliente:</span>{' '}
                              {pedidoSeleccionado.cliente?.nombre}
                            </div>
                            <div>
                              <span className="font-medium">Mesa:</span>{' '}
                              {pedidoSeleccionado.mesa?.numero || 'Para llevar'}
                            </div>
                            <div>
                              <span className="font-medium">Total:</span> $
                              {pedidoSeleccionado.total?.toLocaleString()}
                            </div>
                            <div>
                              <span className="font-medium">Estado:</span>{' '}
                              {pedidoSeleccionado.estado}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-3">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => {
                              setPedidoSeleccionado(null);
                              setShowModal(false);
                            }}
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            onClick={crearFacturaDesdePedido}
                          >
                            Crear Factura
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Nueva Factura Manual
                  </h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setModalType('nueva')}
                  >
                    Desde Pedido
                  </Button>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const datos = {
                      clienteNombre: formData.get('clienteNombre') as string,
                      mesaNumero: formData.get('mesaNumero')
                        ? Number(formData.get('mesaNumero'))
                        : null,
                      metodoPago: formData.get('metodoPago') as string,
                      subtotal: Number(formData.get('subtotal')),
                      descuento: Number(formData.get('descuento')),
                      items: [
                        {
                          nombre: formData.get('itemNombre') as string,
                          cantidad: Number(formData.get('itemCantidad')),
                          precio: Number(formData.get('itemPrecio')),
                        },
                      ],
                      fecha: new Date().toISOString(),
                      estado: 'PAGADA',
                    };
                    crearFactura(datos);
                  }}
                >
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cliente *
                        </label>
                        <input
                          type="text"
                          name="clienteNombre"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Mesa (Opcional)
                        </label>
                        <input
                          type="number"
                          name="mesaNumero"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Método de Pago *
                        </label>
                        <select
                          name="metodoPago"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="">Seleccionar...</option>
                          <option value="EFECTIVO">Efectivo</option>
                          <option value="TARJETA">Tarjeta</option>
                          <option value="TRANSFERENCIA">Transferencia</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Descuento
                        </label>
                        <input
                          type="number"
                          name="descuento"
                          defaultValue="0"
                          step="0.01"
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-700 mb-2">Item</h4>
                      <div className="grid grid-cols-3 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nombre *
                          </label>
                          <input
                            type="text"
                            name="itemNombre"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Cantidad *
                          </label>
                          <input
                            type="number"
                            name="itemCantidad"
                            defaultValue="1"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Precio *
                          </label>
                          <input
                            type="number"
                            name="itemPrecio"
                            step="0.01"
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Subtotal *
                      </label>
                      <input
                        type="number"
                        name="subtotal"
                        step="0.01"
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowModal(false)}
                      className="flex-1"
                    >
                      Cancelar
                    </Button>
                    <Button type="submit" className="flex-1">
                      Crear Factura
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
