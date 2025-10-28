/**
 * Página para Crear Nuevo Pedido
 * Formulario para registrar pedidos
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, LoadingSpinner } from '@/app/components/ui';

interface Platillo {
  id: string;
  nombre: string;
  descripcion?: string;
  precio: number;
  categoriaId: string;
  alergenos: string[];
  activo: boolean;
  imagen?: string;
  tiempoPrep: number;
  createdAt: string;
  updatedAt: string;
}

interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  estado: string;
  ubicacion?: string;
  createdAt: string;
  updatedAt: string;
}

interface Cliente {
  id: string;
  nombre: string;
  email?: string;
  telefono?: string;
  puntos: number;
  alergenos: string[];
  createdAt: string;
  updatedAt: string;
}

interface PedidoItem {
  platilloId: string;
  cantidad: number;
  personalizaciones: string[];
}

export default function NuevoPedidoPage() {
  const router = useRouter();
  const [platillos, setPlatillos] = useState<Platillo[]>([]);
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Estado del formulario
  const [formData, setFormData] = useState({
    tipo: 'MESA', // MESA, DOMICILIO, LLEVAR
    mesaId: '',
    clienteId: '',
    clienteNombre: '',
    clienteTelefono: '',
    clienteEmail: '',
    direccion: '',
    observaciones: '',
    items: [] as PedidoItem[],
  });

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const [platillosRes, mesasRes, clientesRes] = await Promise.all([
        fetch('/api/menu'),
        fetch('/api/mesas'),
        fetch('/api/clientes'),
      ]);

      const [platillosData, mesasData, clientesData] = await Promise.all([
        platillosRes.json(),
        mesasRes.json(),
        clientesRes.json(),
      ]);

      if (platillosData.success) setPlatillos(platillosData.data);
      if (mesasData.success) setMesas(mesasData.data);
      if (clientesData.success) setClientes(clientesData.data);
    } catch (err) {
      setError('Error al cargar los datos');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleClienteFrecuenteChange = (clienteId: string) => {
    if (clienteId) {
      const cliente = clientes.find((c) => c.id === clienteId);
      if (cliente) {
        setFormData((prev) => ({
          ...prev,
          clienteId,
          clienteNombre: cliente.nombre,
          clienteTelefono: cliente.telefono || '',
          clienteEmail: cliente.email || '',
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        clienteId: '',
        clienteNombre: '',
        clienteTelefono: '',
        clienteEmail: '',
      }));
    }
  };

  const agregarItem = (platilloId: string) => {
    const platillo = platillos.find((p) => p.id === platilloId);
    if (!platillo) return;

    const nuevoItem: PedidoItem = {
      platilloId,
      cantidad: 1,
      personalizaciones: [],
    };

    setFormData((prev) => ({
      ...prev,
      items: [...prev.items, nuevoItem],
    }));
  };

  const actualizarCantidad = (index: number, cantidad: number) => {
    if (cantidad < 1) return;

    setFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, cantidad } : item
      ),
    }));
  };

  const removerItem = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const calcularTotal = () => {
    return formData.items.reduce((total, item) => {
      const platillo = platillos.find((p) => p.id === item.platilloId);
      return total + (platillo ? platillo.precio * item.cantidad : 0);
    }, 0);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.items.length === 0) {
      alert('Debe agregar al menos un platillo al pedido');
      return;
    }

    if (formData.tipo === 'MESA' && !formData.mesaId) {
      alert('Debe seleccionar una mesa');
      return;
    }

    try {
      setSubmitting(true);

      const pedidoData = {
        tipo: formData.tipo,
        mesaId: formData.tipo === 'MESA' ? formData.mesaId : undefined,
        clienteId: formData.clienteId || undefined,
        notas: formData.observaciones || undefined,
        direccion:
          formData.tipo === 'DOMICILIO' ? formData.direccion : undefined,
        telefono:
          formData.tipo === 'DOMICILIO' ? formData.clienteTelefono : undefined,
        platillos: formData.items.map((item) => ({
          platilloId: item.platilloId,
          cantidad: item.cantidad,
        })),
      };

      const response = await fetch('/api/pedidos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(pedidoData),
      });

      const data = await response.json();

      if (data.success) {
        alert('Pedido creado exitosamente');
        router.push('/dashboard');
      } else {
        alert(
          'Error al crear el pedido: ' + (data.message || 'Error desconocido')
        );
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al crear el pedido');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando datos..." />
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
              Error al cargar los datos
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
                📝 Nuevo Pedido
              </h1>
              <p className="text-gray-600">
                Crear un nuevo pedido para mesa, domicilio o para llevar
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard')}
              >
                ← Volver al Dashboard
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Tipo de pedido */}
          <Card title="Tipo de Pedido">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value="MESA"
                  checked={formData.tipo === 'MESA'}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tipo: e.target.value }))
                  }
                  className="text-blue-600"
                />
                <span className="text-sm font-medium text-gray-900">
                  🪑 Mesa
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value="DOMICILIO"
                  checked={formData.tipo === 'DOMICILIO'}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tipo: e.target.value }))
                  }
                  className="text-blue-600"
                />
                <span className="text-sm font-medium text-gray-900">
                  🚚 Domicilio
                </span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="tipo"
                  value="LLEVAR"
                  checked={formData.tipo === 'LLEVAR'}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, tipo: e.target.value }))
                  }
                  className="text-blue-600"
                />
                <span className="text-sm font-medium text-gray-900">
                  📦 Para Llevar
                </span>
              </label>
            </div>
          </Card>

          {/* Selección de mesa (solo para pedidos de mesa) */}
          {formData.tipo === 'MESA' && (
            <Card title="Seleccionar Mesa">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mesas
                  .filter((m) => m.estado === 'DISPONIBLE')
                  .map((mesa) => (
                    <label
                      key={mesa.id}
                      className="flex items-center space-x-3 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="mesaId"
                        value={mesa.id}
                        checked={formData.mesaId === mesa.id}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            mesaId: e.target.value,
                          }))
                        }
                        className="text-blue-600"
                      />
                      <div>
                        <span className="text-sm font-medium text-gray-900">
                          Mesa {mesa.numero}
                        </span>
                        <span className="text-xs text-gray-500 ml-2">
                          ({mesa.capacidad} personas - {mesa.ubicacion})
                        </span>
                      </div>
                    </label>
                  ))}
              </div>
            </Card>
          )}

          {/* Información del cliente */}
          <Card title="Información del Cliente">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cliente Frecuente (Opcional)
                </label>
                <select
                  value={formData.clienteId}
                  onChange={(e) => handleClienteFrecuenteChange(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Seleccionar cliente...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.id} value={cliente.id}>
                      {cliente.nombre} ({cliente.puntos} puntos)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre del Cliente *
                  {formData.clienteId && (
                    <span className="text-xs text-green-600 ml-2">
                      ✓ Cliente frecuente seleccionado
                    </span>
                  )}
                </label>
                <input
                  type="text"
                  value={formData.clienteNombre}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clienteNombre: e.target.value,
                    }))
                  }
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formData.clienteId ? 'bg-green-50 border-green-200' : ''
                  }`}
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono
                </label>
                <input
                  type="tel"
                  value={formData.clienteTelefono}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clienteTelefono: e.target.value,
                    }))
                  }
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formData.clienteId ? 'bg-green-50 border-green-200' : ''
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.clienteEmail}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      clienteEmail: e.target.value,
                    }))
                  }
                  className={`w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    formData.clienteId ? 'bg-green-50 border-green-200' : ''
                  }`}
                />
              </div>

              {formData.tipo === 'DOMICILIO' && (
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección de Entrega *
                  </label>
                  <textarea
                    value={formData.direccion}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        direccion: e.target.value,
                      }))
                    }
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                    required={formData.tipo === 'DOMICILIO'}
                  />
                </div>
              )}
            </div>
          </Card>

          {/* Selección de platillos */}
          <Card title="Seleccionar Platillos">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {platillos
                .filter((p) => p.activo)
                .map((platillo) => (
                  <div
                    key={platillo.id}
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {platillo.nombre}
                      </h3>
                      <span className="text-lg font-bold text-green-600">
                        ${platillo.precio.toLocaleString()}
                      </span>
                    </div>

                    {platillo.descripcion && (
                      <p className="text-sm text-gray-600 mb-2">
                        {platillo.descripcion}
                      </p>
                    )}

                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs text-gray-500">
                        ⏱️ {platillo.tiempoPrep} min
                      </span>
                      {platillo.alergenos.length > 0 && (
                        <span className="text-xs text-red-600">
                          ⚠️ {platillo.alergenos.join(', ')}
                        </span>
                      )}
                    </div>

                    <Button
                      type="button"
                      size="sm"
                      onClick={() => agregarItem(platillo.id)}
                      className="w-full"
                    >
                      + Agregar
                    </Button>
                  </div>
                ))}
            </div>

            {/* Items del pedido */}
            {formData.items.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">
                  Items del Pedido
                </h3>
                {formData.items.map((item, index) => {
                  const platillo = platillos.find(
                    (p) => p.id === item.platilloId
                  );
                  if (!platillo) return null;

                  return (
                    <div
                      key={index}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">
                          {platillo.nombre}
                        </h4>
                        <p className="text-sm text-gray-600">
                          ${platillo.precio.toLocaleString()} c/u
                        </p>
                      </div>

                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              actualizarCantidad(index, item.cantidad - 1)
                            }
                            disabled={item.cantidad <= 1}
                          >
                            -
                          </Button>
                          <span className="w-8 text-center">
                            {item.cantidad}
                          </span>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() =>
                              actualizarCantidad(index, item.cantidad + 1)
                            }
                          >
                            +
                          </Button>
                        </div>

                        <span className="font-bold text-gray-900">
                          ${(platillo.precio * item.cantidad).toLocaleString()}
                        </span>

                        <Button
                          type="button"
                          size="sm"
                          variant="danger"
                          onClick={() => removerItem(index)}
                        >
                          🗑️
                        </Button>
                      </div>
                    </div>
                  );
                })}

                <div className="flex justify-between items-center pt-4 border-t">
                  <span className="text-lg font-semibold text-gray-900">
                    Total:
                  </span>
                  <span className="text-2xl font-bold text-green-600">
                    ${calcularTotal().toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </Card>

          {/* Observaciones */}
          <Card title="Observaciones">
            <textarea
              value={formData.observaciones}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  observaciones: e.target.value,
                }))
              }
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              rows={3}
              placeholder="Instrucciones especiales, alergias, etc."
            />
          </Card>

          {/* Botones de acción */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="secondary"
              onClick={() => router.push('/dashboard')}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={submitting || formData.items.length === 0}
            >
              {submitting ? 'Creando...' : 'Crear Pedido'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
