/**
 * Página del Módulo de Mesas
 * Gestión de mesas y estados
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, LoadingSpinner } from '@/app/components/ui';

interface Mesa {
  id: string;
  numero: number;
  capacidad: number;
  estado: string;
  ubicacion?: string;
  createdAt: string;
  updatedAt: string;
}

export default function MesasPage() {
  const router = useRouter();
  const [mesas, setMesas] = useState<Mesa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'nuevo' | 'editar' | 'detalles'>(
    'nuevo'
  );
  const [mesaSeleccionada, setMesaSeleccionada] = useState<Mesa | null>(null);

  useEffect(() => {
    cargarMesas();
  }, []);

  const cargarMesas = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/mesas');
      const data = await response.json();

      if (data.success) {
        setMesas(data.data);
      }
    } catch (err) {
      setError('Error al cargar las mesas');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
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

  const handleNuevaMesa = () => {
    setMesaSeleccionada(null);
    setModalType('nuevo');
    setShowModal(true);
  };

  const handleVerDetalles = (mesa: Mesa) => {
    setMesaSeleccionada(mesa);
    setModalType('detalles');
    setShowModal(true);
  };

  const handleEditarMesa = (mesa: Mesa) => {
    setMesaSeleccionada(mesa);
    setModalType('editar');
    setShowModal(true);
  };

  const guardarMesa = async (datosMesa: Partial<Mesa>) => {
    try {
      const url =
        modalType === 'nuevo'
          ? '/api/mesas'
          : `/api/mesas?id=${mesaSeleccionada?.id}`;
      const method = modalType === 'nuevo' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosMesa),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          modalType === 'nuevo'
            ? 'Mesa creada exitosamente'
            : 'Mesa actualizada exitosamente'
        );

        // Actualizar estado local inmediatamente
        if (modalType === 'nuevo') {
          // Para nueva mesa, recargar todas las mesas
          cargarMesas();
        } else {
          // Para actualización, actualizar solo la mesa específica
          setMesas((prev) =>
            prev.map((mesa) =>
              mesa.id === mesaSeleccionada?.id
                ? { ...mesa, ...datosMesa }
                : mesa
            )
          );
        }

        setShowModal(false);
      } else {
        alert('Error al guardar la mesa');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar la mesa');
    }
  };

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'DISPONIBLE':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'OCUPADA':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'RESERVADA':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'MANTENIMIENTO':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getEstadoIcon = (estado: string) => {
    switch (estado) {
      case 'DISPONIBLE':
        return '✅';
      case 'OCUPADA':
        return '🔴';
      case 'RESERVADA':
        return '🟡';
      case 'MANTENIMIENTO':
        return '🔧';
      default:
        return '❓';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando mesas..." />
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
              Error al cargar las mesas
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={cargarMesas}>Reintentar</Button>
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
                🪑 Gestión de Mesas
              </h1>
              <p className="text-gray-600">
                Control de mesas y estados en tiempo real
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard')}
              >
                ← Volver al Dashboard
              </Button>
              <Button onClick={handleNuevaMesa}>+ Nueva Mesa</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {mesas.filter((m) => m.estado === 'DISPONIBLE').length}
              </div>
              <div className="text-sm text-gray-600">Disponibles</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {mesas.filter((m) => m.estado === 'OCUPADA').length}
              </div>
              <div className="text-sm text-gray-600">Ocupadas</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {mesas.filter((m) => m.estado === 'RESERVADA').length}
              </div>
              <div className="text-sm text-gray-600">Reservadas</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-600">
                {mesas.filter((m) => m.estado === 'MANTENIMIENTO').length}
              </div>
              <div className="text-sm text-gray-600">Mantenimiento</div>
            </div>
          </Card>
        </div>

        {/* Mapa de mesas */}
        <Card title="Mapa de Mesas">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {mesas.map((mesa) => (
              <div
                key={mesa.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    Mesa {mesa.numero}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(
                      mesa.estado
                    )}`}
                  >
                    {getEstadoIcon(mesa.estado)} {mesa.estado}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Capacidad:</span>
                    <span className="font-medium">
                      {mesa.capacidad} personas
                    </span>
                  </div>
                  {mesa.ubicacion && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ubicación:</span>
                      <span className="font-medium">{mesa.ubicacion}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <select
                    value={mesa.estado}
                    onChange={(e) =>
                      actualizarEstadoMesa(mesa.id, e.target.value)
                    }
                    className="w-full text-sm border border-gray-300 rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="OCUPADA">Ocupada</option>
                    <option value="RESERVADA">Reservada</option>
                    <option value="MANTENIMIENTO">Mantenimiento</option>
                  </select>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleVerDetalles(mesa)}
                    >
                      📋 Ver Detalles
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleEditarMesa(mesa)}
                    >
                      ✏️ Editar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {mesas.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">🪑</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay mesas configuradas
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza agregando mesas a tu restaurante
              </p>
              <Button onClick={handleNuevaMesa}>+ Agregar Primera Mesa</Button>
            </div>
          </Card>
        )}
      </div>

      {/* Modal para gestionar mesas */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {modalType === 'detalles' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Detalles de Mesa {mesaSeleccionada?.numero}
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Número:</span>
                    <span className="font-medium">
                      {mesaSeleccionada?.numero}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Capacidad:</span>
                    <span className="font-medium">
                      {mesaSeleccionada?.capacidad} personas
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Estado:</span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full border ${getEstadoColor(
                        mesaSeleccionada?.estado || ''
                      )}`}
                    >
                      {getEstadoIcon(mesaSeleccionada?.estado || '')}{' '}
                      {mesaSeleccionada?.estado}
                    </span>
                  </div>
                  {mesaSeleccionada?.ubicacion && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Ubicación:</span>
                      <span className="font-medium">
                        {mesaSeleccionada.ubicacion}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-600">Creada:</span>
                    <span className="font-medium">
                      {new Date(
                        mesaSeleccionada?.createdAt || ''
                      ).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex space-x-3 mt-6">
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cerrar
                  </Button>
                  <Button
                    onClick={() => {
                      setModalType('editar');
                    }}
                    className="flex-1"
                  >
                    Editar Mesa
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {modalType === 'nuevo' ? 'Nueva Mesa' : 'Editar Mesa'}
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const datos = {
                      numero: Number(formData.get('numero')),
                      capacidad: Number(formData.get('capacidad')),
                      ubicacion: formData.get('ubicacion') as string,
                      estado: formData.get('estado') as string,
                    };
                    guardarMesa(datos);
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Número de Mesa *
                      </label>
                      <input
                        type="number"
                        name="numero"
                        defaultValue={mesaSeleccionada?.numero || ''}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Capacidad *
                      </label>
                      <input
                        type="number"
                        name="capacidad"
                        defaultValue={mesaSeleccionada?.capacidad || ''}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Ubicación
                      </label>
                      <input
                        type="text"
                        name="ubicacion"
                        defaultValue={mesaSeleccionada?.ubicacion || ''}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Terraza, Interior, Ventana"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado *
                      </label>
                      <select
                        name="estado"
                        defaultValue={mesaSeleccionada?.estado || 'DISPONIBLE'}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="DISPONIBLE">Disponible</option>
                        <option value="OCUPADA">Ocupada</option>
                        <option value="RESERVADA">Reservada</option>
                        <option value="MANTENIMIENTO">Mantenimiento</option>
                      </select>
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
                      {modalType === 'nuevo' ? 'Crear' : 'Actualizar'}
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
