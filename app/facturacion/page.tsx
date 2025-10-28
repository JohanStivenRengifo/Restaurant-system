/**
 * Página del Módulo de Facturación
 * Gestión de facturas y pagos con integración de facturación electrónica Factus
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, LoadingSpinner } from '@/app/components/ui';
import {
  FactusAdapterService,
  RestaurantePedido,
  RestauranteEstablecimiento,
} from '../services/factus/FactusAdapterService';
import { FactusInvoiceSummary } from '../types/factus';

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
  // Campos para facturación electrónica
  facturaElectronica?: FactusInvoiceSummary;
  cufe?: string;
  qrUrl?: string;
  esElectronica?: boolean;
}

export default function FacturacionPage() {
  const router = useRouter();
  const [facturas, setFacturas] = useState<Factura[]>([]);
  const [pedidos, setPedidos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<
    'nueva' | 'manual' | 'ver' | 'imprimir' | 'electronica'
  >('nueva');
  const [facturaSeleccionada, setFacturaSeleccionada] =
    useState<Factura | null>(null);
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState<any>(null);

  // Estados para facturación electrónica
  const [authStatus, setAuthStatus] = useState<any>(null);
  const [numberingRanges, setNumberingRanges] = useState<any[]>([]);
  const [selectedRangeId, setSelectedRangeId] = useState<number | null>(null);
  const [creatingElectronicInvoice, setCreatingElectronicInvoice] =
    useState(false);

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    await Promise.all([
      cargarFacturas(),
      cargarPedidos(),
      cargarEstadoAutenticacion(),
      cargarRangosNumeracion(),
    ]);
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

  const cargarEstadoAutenticacion = async () => {
    try {
      const response = await fetch('/api/factus/auth');
      const data = await response.json();

      if (data.success) {
        setAuthStatus(data.data);
      } else {
        setAuthStatus({ isAuthenticated: false, message: data.message });
      }
    } catch (err) {
      console.error('Error cargando estado de autenticación:', err);
      setAuthStatus({ isAuthenticated: false, error: 'Error de conexión' });
    }
  };

  const cargarRangosNumeracion = async () => {
    try {
      const response = await fetch('/api/factus/numbering-ranges');
      const data = await response.json();

      if (data.success && data.data && Array.isArray(data.data.data)) {
        // La API devuelve data.data.data (array dentro de objeto)
        setNumberingRanges(data.data.data);
        // Seleccionar el primer rango activo por defecto
        try {
          const rangoActivo = data.data.data.find(
            (rango: any) => rango.is_active === 1
          );
          if (rangoActivo) {
            setSelectedRangeId(rangoActivo.id);
          }
        } catch (findError) {
          console.log('Error buscando rango activo:', findError);
        }
      } else if (data.success && Array.isArray(data.data)) {
        // Fallback: si data.data es directamente el array
        setNumberingRanges(data.data);
        try {
          const rangoActivo = data.data.find(
            (rango: any) => rango.is_active === 1
          );
          if (rangoActivo) {
            setSelectedRangeId(rangoActivo.id);
          }
        } catch (findError) {
          console.log('Error buscando rango activo:', findError);
        }
      } else {
        setNumberingRanges([]);
      }
    } catch (err) {
      console.error('Error cargando rangos de numeración:', err);
      setNumberingRanges([]);
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

  const handleFacturaElectronica = () => {
    if (!pedidoSeleccionado) {
      alert('Debe seleccionar un pedido primero');
      return;
    }
    setModalType('electronica');
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

  const crearFacturaElectronica = async () => {
    if (!pedidoSeleccionado) return;

    setCreatingElectronicInvoice(true);

    try {
      // Convertir pedido a formato del restaurante
      const pedidoRestaurante: RestaurantePedido = {
        id: pedidoSeleccionado.id,
        cliente: {
          id:
            pedidoSeleccionado.cliente?.id ||
            `cliente-${pedidoSeleccionado.id}`,
          nombre: pedidoSeleccionado.cliente?.nombre || 'Cliente',
          apellido: pedidoSeleccionado.cliente?.apellido || 'Apellido',
          email: pedidoSeleccionado.cliente?.email || 'cliente@restaurante.com',
          telefono: pedidoSeleccionado.cliente?.telefono || '3001234567',
          direccion:
            pedidoSeleccionado.cliente?.direccion || 'Calle 123 #45-67, Bogotá',
          tipoDocumento: 'cedula',
          numeroDocumento:
            pedidoSeleccionado.cliente?.numeroDocumento || '12345678',
          esPersonaJuridica: false,
          municipioId: 980, // Bogotá por defecto
        },
        platillos: (() => {
          // Intentar diferentes estructuras de datos para platillos
          let platillosData =
            pedidoSeleccionado.platillos || pedidoSeleccionado.items || [];

          // Si está vacío, crear un platillo por defecto
          if (!platillosData || platillosData.length === 0) {
            platillosData = [
              {
                id: 'platillo-default',
                nombre: 'Platillo del Pedido',
                codigo: 'PLAT001',
                precio: 15000,
                cantidad: 1,
              },
            ];
          }

          return platillosData.map((p: any, index: number) => ({
            id: p.platillo?.id || p.id || `platillo-${index}`,
            nombre: p.platillo?.nombre || p.nombre || 'Platillo',
            codigo:
              p.platillo?.codigo ||
              p.codigo ||
              `PLAT${String(index + 1).padStart(3, '0')}`,
            precio: p.precioUnitario || p.precio || p.precioUnitario || 10000,
            cantidad: p.cantidad || 1,
            impuestoPorcentaje: 19,
            estaExcluidoIVA: false,
            unidadMedida: 'unidad',
            categoria: 'general',
          }));
        })(),
        metodoPago: 'efectivo',
        formaPago: 'contado',
        numeroReferencia: `REF${Date.now()}${pedidoSeleccionado.id.slice(-4)}`,
        observaciones: pedidoSeleccionado.notas || '',
      };

      // Datos del establecimiento
      const establecimiento: RestauranteEstablecimiento = {
        nombre: 'Restaurante Delicias',
        direccion: 'Calle 123 #45-67, Bogotá',
        telefono: '601-234-5678',
        email: 'info@restaurantedelicias.com',
        municipioId: 980,
      };

      const response = await fetch('/api/factus/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pedido: pedidoRestaurante,
          establecimiento: establecimiento,
          numberingRangeId: selectedRangeId,
        }),
      });

      const data = await response.json();

      console.log('Respuesta completa de Factus:', data);
      console.log('data.data.factura:', data.data?.factura);
      console.log('data.data.factura.data:', data.data?.factura?.data);
      console.log('ID de factura desde Factus:', data.data?.factura?.id);

      if (data.success) {
        alert('Factura electrónica creada exitosamente');

        // Crear factura local con datos electrónicos
        // Calcular totales basándose en los datos del pedido si Factus no los proporciona
        console.log(
          '🔍 Debugging - pedidoRestaurante.platillos:',
          pedidoRestaurante.platillos
        );

        const subtotalCalculado = pedidoRestaurante.platillos.reduce(
          (sum, p) => sum + p.precio * p.cantidad,
          0
        );
        const impuestosCalculados = subtotalCalculado * 0.19; // 19% IVA
        const totalCalculado = subtotalCalculado + impuestosCalculados;

        console.log('💰 Cálculos de totales:');
        console.log('- Subtotal calculado:', subtotalCalculado);
        console.log('- Impuestos calculados:', impuestosCalculados);
        console.log('- Total calculado:', totalCalculado);

        console.log('🔍 Debugging - Valores de Factus:');
        console.log(
          '- data.data.factura?.data?.bill?.gross_value:',
          data.data.factura?.data?.bill?.gross_value
        );
        console.log(
          '- data.data.factura?.data?.bill?.tax_amount:',
          data.data.factura?.data?.bill?.tax_amount
        );
        console.log(
          '- data.data.factura?.data?.bill?.total:',
          data.data.factura?.data?.bill?.total
        );
        console.log(
          '- data.data.factura?.data?.bill?.id:',
          data.data.factura?.data?.bill?.id
        );
        console.log(
          '- data.data.factura?.data?.bill?.cufe:',
          data.data.factura?.data?.bill?.cufe
        );

        const facturaLocal: Factura = {
          id: `fact_${Date.now()}`,
          pedidoId: pedidoSeleccionado.id,
          clienteId: pedidoSeleccionado.cliente?.id || '',
          numero: data.data.factura?.data?.bill?.number || `FACT-${Date.now()}`,
          subtotal: parseFloat(
            data.data.factura?.data?.bill?.gross_value ||
              subtotalCalculado.toString()
          ),
          descuento: parseFloat(data.data.factura?.data?.bill?.discount || '0'),
          impuestos: parseFloat(
            data.data.factura?.data?.bill?.tax_amount ||
              impuestosCalculados.toString()
          ),
          total: parseFloat(
            data.data.factura?.data?.bill?.total || totalCalculado.toString()
          ),
          metodoPago: 'TARJETA',
          estado: 'PAGADA',
          fecha: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          clienteNombre: pedidoRestaurante.cliente.nombre,
          mesaNumero: pedidoSeleccionado.mesaNumero,
          items: pedidoRestaurante.platillos.map((p) => ({
            nombre: p.nombre,
            cantidad: p.cantidad,
            precio: p.precio,
            subtotal: p.precio * p.cantidad,
          })),
          esElectronica: true,
          facturaElectronica: {
            id:
              data.data.factura?.data?.bill?.id?.toString() ||
              data.data.factura?.data?.bill?.cufe ||
              `factus_${Date.now()}`,
            cufe: data.data.factura?.data?.bill?.cufe,
            qrUrl: data.data.factura?.data?.bill?.qr,
            pdfUrl: data.data.factura?.data?.bill?.qr_image,
            estado:
              data.data.factura?.data?.bill?.status === 1
                ? 'Validada'
                : 'Pendiente',
            fechaCreacion: new Date(),
          } as any,
        } as Factura;

        // Actualizar estado local
        setFacturas((prev) => [facturaLocal, ...prev]);

        // Guardar factura en el servicio (base de datos)
        try {
          console.log('💾 Guardando factura en base de datos...');
          console.log('📋 Datos de la factura:', facturaLocal);

          const response = await fetch('/api/facturas', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(facturaLocal),
          });

          const responseData = await response.json();
          console.log('📤 Respuesta del servidor:', responseData);

          if (!response.ok) {
            console.error(
              '❌ Error guardando factura en base de datos:',
              responseData
            );
            alert(
              `Error guardando factura: ${
                responseData.error || 'Error desconocido'
              }`
            );
            return;
          }

          console.log('✅ Factura guardada exitosamente en base de datos');
        } catch (error: any) {
          console.error('❌ Error guardando factura:', error);
          alert(
            `Error guardando factura: ${error?.message || 'Error desconocido'}`
          );
        }

        // Remover el pedido de la lista
        setPedidos((prev) =>
          prev.filter((p) => p.id !== pedidoSeleccionado.id)
        );

        setShowModal(false);
        setPedidoSeleccionado(null);
      } else {
        alert(`Error al crear factura electrónica: ${data.error}`);
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al crear la factura electrónica');
    } finally {
      setCreatingElectronicInvoice(false);
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

  const imprimirFactura = async () => {
    if (!facturaSeleccionada) return;

    // Si es factura electrónica, obtener PDF de Factus
    if (
      facturaSeleccionada?.esElectronica &&
      facturaSeleccionada?.facturaElectronica
    ) {
      try {
        await imprimirFacturaElectronica();
        return;
      } catch (error) {
        console.error('Error imprimiendo factura electrónica:', error);
        alert(
          'Error al obtener el PDF de la factura electrónica. Imprimiendo versión local...'
        );
        // Continuar con impresión local como fallback
      }
    }

    // Impresión local para facturas normales o como fallback
    imprimirFacturaLocal();
  };

  const imprimirFacturaElectronica = async () => {
    if (!facturaSeleccionada?.facturaElectronica) return;

    console.log('Factura seleccionada:', facturaSeleccionada);
    console.log(
      'Factura electrónica:',
      facturaSeleccionada?.facturaElectronica
    );
    console.log('Número de factura:', facturaSeleccionada?.numero);
    console.log(
      'ID de factura Factus:',
      facturaSeleccionada?.facturaElectronica?.id
    );

    try {
      // Usar el ID de la factura de Factus en lugar del número local
      const factusId = facturaSeleccionada?.facturaElectronica?.id;
      if (!factusId) {
        throw new Error('ID de factura de Factus no disponible');
      }

      // Obtener PDF de la factura electrónica desde Factus usando el ID de Factus
      const response = await fetch(`/api/factus/invoices/${factusId}/pdf`);

      if (!response.ok) {
        throw new Error('Error al obtener el PDF');
      }

      // Crear blob y descargar/imprimir
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      // Abrir en nueva ventana para imprimir
      const printWindow = window.open(url, '_blank');
      if (printWindow) {
        printWindow.onload = () => {
          printWindow.print();
        };
      }

      // Limpiar URL después de un tiempo
      setTimeout(() => {
        window.URL.revokeObjectURL(url);
      }, 1000);
    } catch (error) {
      console.error('Error obteniendo PDF de factura electrónica:', error);
      throw error;
    }
  };

  const imprimirFacturaLocal = () => {
    const contenidoImpresion = `
      <html>
        <head>
          <title>Factura ${facturaSeleccionada?.numero || 'N/A'}</title>
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
              <p><strong>Factura No:</strong> ${
                facturaSeleccionada?.numero || 'N/A'
              }</p>
              <p><strong>Fecha:</strong> ${
                facturaSeleccionada?.fecha
                  ? new Date(facturaSeleccionada.fecha).toLocaleDateString()
                  : 'N/A'
              }</p>
            </div>
            <div>
              <p><strong>Cliente:</strong> ${
                (facturaSeleccionada as any)?.clienteNombre || 'Cliente'
              }</p>
              <p><strong>Mesa:</strong> ${
                (facturaSeleccionada as any)?.mesaNumero || 'N/A'
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
                ((facturaSeleccionada as any)?.items || []).length > 0
                  ? ((facturaSeleccionada as any)?.items || [])
                      .map(
                        (item: any) => `
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
            <p>Subtotal: $${
              (facturaSeleccionada as any)?.subtotal?.toLocaleString() || '0'
            }</p>
            <p>IVA (19%): $${(
              (facturaSeleccionada as any)?.iva ||
              (facturaSeleccionada as any)?.impuestos ||
              0
            ).toLocaleString()}</p>
            <p>Descuento: $${
              (facturaSeleccionada as any)?.descuento?.toLocaleString() || '0'
            }</p>
            <p>TOTAL: $${
              (facturaSeleccionada as any)?.total?.toLocaleString() || '0'
            }</p>
          </div>
          
          <div style="margin-top: 30px; text-align: center;">
            <p><strong>Método de Pago:</strong> ${
              facturaSeleccionada?.metodoPago || 'N/A'
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

              {/* Estado de autenticación Factus */}
              {authStatus && (
                <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        authStatus.isAuthenticated
                          ? 'bg-green-500'
                          : 'bg-red-500'
                      }`}
                    ></span>
                    <span className="text-sm font-medium text-gray-700">
                      Factus API:{' '}
                      {authStatus.isAuthenticated
                        ? 'Conectado'
                        : 'Desconectado'}
                    </span>
                    {authStatus.isAuthenticated && (
                      <span className="text-xs text-gray-500">
                        (Token válido por{' '}
                        {Math.floor(authStatus.timeRemaining / 60)} min)
                      </span>
                    )}
                  </div>
                </div>
              )}
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
                <Button onClick={handleNuevaFacturaManual} variant="secondary">
                  + Factura Manual
                </Button>
                {authStatus?.isAuthenticated ? (
                  <Button
                    onClick={handleFacturaElectronica}
                    variant="secondary"
                    className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100"
                  >
                    ⚡ Factura Electrónica
                  </Button>
                ) : (
                  <Button
                    onClick={async () => {
                      try {
                        const response = await fetch('/api/factus/auth', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'authenticate' }),
                        });
                        const data = await response.json();
                        if (data.success) {
                          await cargarEstadoAutenticacion();
                          alert('✅ Conectado a Factus API exitosamente');
                        } else {
                          alert('❌ Error al conectar: ' + data.message);
                        }
                      } catch (error) {
                        alert('❌ Error de conexión');
                      }
                    }}
                    variant="secondary"
                    className="bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100"
                  >
                    🔌 Conectar a Factus
                  </Button>
                )}
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
                        {factura.esElectronica && (
                          <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                            ⚡ Electrónica
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                        <div>
                          <span className="font-medium">Cliente:</span>{' '}
                          {(factura as any).clienteNombre || 'Sin cliente'}
                        </div>
                        <div>
                          <span className="font-medium">Mesa:</span>{' '}
                          {(factura as any).mesaNumero || 'Para llevar'}
                        </div>
                        <div>
                          <span className="font-medium">Fecha:</span>{' '}
                          {new Date(factura.fecha).toLocaleDateString()}
                        </div>
                        <div>
                          <span className="font-medium">Método de Pago:</span>{' '}
                          {factura.metodoPago}
                        </div>
                        {factura.esElectronica && (
                          <>
                            <div>
                              <span className="font-medium">CUFE:</span>{' '}
                              <span className="text-xs font-mono bg-gray-100 px-1 rounded text-gray-800">
                                {factura.cufe?.slice(0, 8)}...
                              </span>
                            </div>
                            <div>
                              <span className="font-medium">Estado DIAN:</span>{' '}
                              <span className="text-green-600 font-medium">
                                Validada
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">
                        ${factura.total.toLocaleString()}
                      </p>
                      {factura.esElectronica && factura.qrUrl && (
                        <div className="mt-2">
                          <img
                            src={factura.qrUrl}
                            alt="QR Factura"
                            className="w-16 h-16 mx-auto"
                          />
                        </div>
                      )}
                      <div className="flex space-x-2 mt-3">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleVerFactura(factura)}
                          className="text-gray-700 border-gray-300 hover:bg-gray-50"
                        >
                          Ver
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleImprimirFactura(factura)}
                          className="text-gray-700 border-gray-300 hover:bg-gray-50"
                        >
                          Imprimir
                        </Button>
                        {factura.esElectronica && factura.qrUrl && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={() => window.open(factura.qrUrl, '_blank')}
                            className="text-green-600 border-green-200 hover:bg-green-50"
                          >
                            QR
                          </Button>
                        )}
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
                        <span className="font-medium text-gray-700">
                          Número:
                        </span>{' '}
                        <span className="text-gray-900">
                          {facturaSeleccionada?.numero || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Fecha:
                        </span>{' '}
                        <span className="text-gray-900">
                          {facturaSeleccionada?.fecha
                            ? new Date(
                                facturaSeleccionada.fecha
                              ).toLocaleDateString()
                            : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Cliente:
                        </span>{' '}
                        <span className="text-gray-900">
                          {(facturaSeleccionada as any)?.clienteNombre || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Mesa:</span>{' '}
                        <span className="text-gray-900">
                          {(facturaSeleccionada as any)?.mesaNumero ||
                            'Para llevar'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Método de Pago:
                        </span>{' '}
                        <span className="text-gray-900">
                          {(facturaSeleccionada as any)?.metodoPago || 'N/A'}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">
                          Estado:
                        </span>{' '}
                        <span className="text-gray-900">
                          {(facturaSeleccionada as any)?.estado || 'N/A'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-gray-700">
                        Productos:
                      </h4>
                      <div className="space-y-2">
                        {((facturaSeleccionada as any)?.items || []).map(
                          (item: any, index: number) => (
                            <div key={index} className="flex justify-between">
                              <span className="text-gray-900">
                                {item.nombre}
                              </span>
                              <span className="text-gray-900">
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
                        <span className="text-gray-700">Subtotal:</span>
                        <span className="text-gray-900">
                          $
                          {(
                            facturaSeleccionada as any
                          )?.subtotal?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">IVA (19%):</span>
                        <span className="text-gray-900">
                          $
                          {(
                            (facturaSeleccionada as any)?.iva ||
                            (facturaSeleccionada as any)?.impuestos ||
                            0
                          ).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-700">Descuento:</span>
                        <span className="text-gray-900">
                          $
                          {(
                            facturaSeleccionada as any
                          )?.descuento?.toLocaleString() || '0'}
                        </span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-gray-900">TOTAL:</span>
                        <span className="text-gray-900">
                          $
                          {(
                            facturaSeleccionada as any
                          )?.total?.toLocaleString() || '0'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
                <div className="flex justify-end mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    className="text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
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
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    className="text-gray-700 border-gray-300 hover:bg-gray-50"
                  >
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
                    variant="secondary"
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
                            variant="secondary"
                            onClick={() => {
                              setPedidoSeleccionado(null);
                              setShowModal(false);
                            }}
                            className="text-gray-700 border-gray-300 hover:bg-gray-50"
                          >
                            Cancelar
                          </Button>
                          <Button
                            type="button"
                            onClick={crearFacturaDesdePedido}
                          >
                            Crear Factura Normal
                          </Button>
                          {authStatus?.isAuthenticated ? (
                            <Button
                              type="button"
                              onClick={handleFacturaElectronica}
                              className="bg-green-600 hover:bg-green-700"
                            >
                              ⚡ Crear Factura Electrónica
                            </Button>
                          ) : (
                            <Button
                              type="button"
                              onClick={async () => {
                                try {
                                  const response = await fetch(
                                    '/api/factus/auth',
                                    {
                                      method: 'POST',
                                      headers: {
                                        'Content-Type': 'application/json',
                                      },
                                      body: JSON.stringify({
                                        action: 'authenticate',
                                      }),
                                    }
                                  );
                                  const data = await response.json();
                                  if (data.success) {
                                    await cargarEstadoAutenticacion();
                                    alert(
                                      '✅ Conectado a Factus API. Ahora puedes crear facturas electrónicas.'
                                    );
                                  } else {
                                    alert(
                                      '❌ Error al conectar: ' + data.message
                                    );
                                  }
                                } catch (error) {
                                  alert('❌ Error de conexión');
                                }
                              }}
                              className="bg-orange-600 hover:bg-orange-700"
                            >
                              🔌 Conectar a Factus
                            </Button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : modalType === 'electronica' ? (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Factura Electrónica - Pedido #{pedidoSeleccionado?.id}
                  </h3>
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setModalType('nueva')}
                  >
                    ← Volver
                  </Button>
                </div>

                {!authStatus?.isAuthenticated ? (
                  <div className="text-center py-8">
                    <div className="text-red-600 mb-4">
                      <svg
                        className="w-12 h-12 mx-auto mb-2"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
                        />
                      </svg>
                    </div>
                    <p className="text-gray-600 mb-4">
                      No hay conexión con la API de Factus
                    </p>
                    <p className="text-sm text-gray-500">
                      La facturación electrónica requiere autenticación con
                      Factus API
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Información del pedido */}
                    <div className="bg-gray-50 rounded-lg p-4">
                      <h4 className="font-medium text-gray-900 mb-3">
                        Información del Pedido
                      </h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium">Cliente:</span>{' '}
                          {pedidoSeleccionado?.cliente?.nombre || 'Sin cliente'}
                        </div>
                        <div>
                          <span className="font-medium">Mesa:</span>{' '}
                          {pedidoSeleccionado?.mesa?.numero || 'Para llevar'}
                        </div>
                        <div>
                          <span className="font-medium">Total:</span> $
                          {pedidoSeleccionado?.total?.toLocaleString()}
                        </div>
                        <div>
                          <span className="font-medium">Estado:</span>{' '}
                          {pedidoSeleccionado?.estado}
                        </div>
                      </div>
                    </div>

                    {/* Configuración de rango de numeración */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rango de Numeración
                      </label>
                      <select
                        value={selectedRangeId || ''}
                        onChange={(e) =>
                          setSelectedRangeId(parseInt(e.target.value))
                        }
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="">Seleccionar rango...</option>
                        {Array.isArray(numberingRanges) &&
                          numberingRanges.map((rango) => (
                            <option key={rango.id} value={rango.id}>
                              {rango.prefix} ({rango.from} - {rango.to}) -{' '}
                              {rango.is_active ? 'Activo' : 'Inactivo'}
                            </option>
                          ))}
                      </select>
                      {!selectedRangeId && (
                        <p className="text-sm text-red-600 mt-1">
                          Debe seleccionar un rango de numeración
                        </p>
                      )}
                    </div>

                    {/* Información adicional */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-900 mb-2">
                        Información de Facturación Electrónica
                      </h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>
                          • La factura será enviada a la DIAN automáticamente
                        </li>
                        <li>• Se generará un CUFE único para la factura</li>
                        <li>• Se creará un código QR para validación</li>
                        <li>• El cliente recibirá la factura por email</li>
                      </ul>
                    </div>

                    {/* Botones de acción */}
                    <div className="flex justify-end space-x-3">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={() => setShowModal(false)}
                        className="text-gray-700 border-gray-300 hover:bg-gray-50"
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="button"
                        onClick={crearFacturaElectronica}
                        disabled={!selectedRangeId || creatingElectronicInvoice}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        {creatingElectronicInvoice ? (
                          <>
                            <LoadingSpinner size="sm" />
                            Creando...
                          </>
                        ) : (
                          '⚡ Crear Factura Electrónica'
                        )}
                      </Button>
                    </div>
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
                    variant="secondary"
                    size="sm"
                    onClick={() => setModalType('nueva')}
                    className="text-gray-700 border-gray-300 hover:bg-gray-50"
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
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                          required
                        >
                          <option value="" className="text-gray-500">
                            Seleccionar...
                          </option>
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
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                            className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
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
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                        required
                      />
                    </div>
                  </div>
                  <div className="flex space-x-3 mt-6">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => setShowModal(false)}
                      className="flex-1 text-gray-700 border-gray-300 hover:bg-gray-50"
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
