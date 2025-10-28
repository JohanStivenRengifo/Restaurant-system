/**
 * Página del Módulo de Inventario
 * Control de ingredientes y stock
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, Button, LoadingSpinner } from '@/app/components/ui';

interface Ingrediente {
  id: string;
  nombre: string;
  unidad: string;
  stock: number;
  stockMinimo: number;
  costo: number;
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function InventarioPage() {
  const router = useRouter();
  const [ingredientes, setIngredientes] = useState<Ingrediente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<
    'nuevo' | 'editar' | 'reponer' | 'eliminar'
  >('nuevo');
  const [ingredienteSeleccionado, setIngredienteSeleccionado] =
    useState<Ingrediente | null>(null);

  useEffect(() => {
    cargarIngredientes();
  }, []);

  const cargarIngredientes = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/inventario');
      const data = await response.json();

      if (data.success) {
        setIngredientes(data.data);
      }
    } catch (err) {
      setError('Error al cargar el inventario');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoIngrediente = () => {
    setIngredienteSeleccionado(null);
    setModalType('nuevo');
    setShowModal(true);
  };

  const handleEditarIngrediente = (ingrediente: Ingrediente) => {
    setIngredienteSeleccionado(ingrediente);
    setModalType('editar');
    setShowModal(true);
  };

  const handleReponerIngrediente = (ingrediente: Ingrediente) => {
    setIngredienteSeleccionado(ingrediente);
    setModalType('reponer');
    setShowModal(true);
  };

  const handleEliminarIngrediente = (ingrediente: Ingrediente) => {
    setIngredienteSeleccionado(ingrediente);
    setModalType('eliminar');
    setShowModal(true);
  };

  const guardarIngrediente = async (datosIngrediente: Partial<Ingrediente>) => {
    try {
      const url =
        modalType === 'nuevo'
          ? '/api/inventario'
          : `/api/inventario?id=${ingredienteSeleccionado?.id}`;
      const method = modalType === 'nuevo' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosIngrediente),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          modalType === 'nuevo'
            ? 'Ingrediente creado exitosamente'
            : 'Ingrediente actualizado exitosamente'
        );

        // Actualizar estado local inmediatamente
        if (modalType === 'nuevo') {
          // Para nuevo ingrediente, agregar al estado local usando datos del servidor
          setIngredientes((prev) => [...prev, data.data]);
        } else {
          // Para actualización, usar los datos completos del servidor
          setIngredientes((prev) =>
            prev.map((ingrediente) =>
              ingrediente.id === ingredienteSeleccionado?.id
                ? { ...ingrediente, ...data.data } // Usar data.data del servidor
                : ingrediente
            )
          );
        }

        setShowModal(false);
      } else {
        alert('Error al guardar el ingrediente');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar el ingrediente');
    }
  };

  const reponerStock = async (cantidad: number) => {
    if (!ingredienteSeleccionado) return;

    try {
      const response = await fetch(
        `/api/inventario?id=${ingredienteSeleccionado.id}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            cantidad: ingredienteSeleccionado.stock + cantidad,
          }),
        }
      );

      const data = await response.json();

      if (data.success) {
        alert(
          `Stock repuesto exitosamente. Nueva cantidad: ${data.data.stock}`
        );

        // Actualizar estado local inmediatamente usando datos del servidor
        setIngredientes((prev) =>
          prev.map((ingrediente) =>
            ingrediente.id === ingredienteSeleccionado.id
              ? { ...ingrediente, ...data.data } // Usar data.data del servidor
              : ingrediente
          )
        );

        setShowModal(false);
      } else {
        alert('Error al reponer el stock');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al reponer el stock');
    }
  };

  const eliminarIngrediente = async () => {
    if (!ingredienteSeleccionado) return;

    try {
      const response = await fetch(
        `/api/inventario?id=${ingredienteSeleccionado.id}`,
        {
          method: 'DELETE',
        }
      );

      const data = await response.json();

      if (data.success) {
        alert('Ingrediente eliminado exitosamente');

        // Actualizar estado local inmediatamente
        setIngredientes((prev) =>
          prev.filter(
            (ingrediente) => ingrediente.id !== ingredienteSeleccionado.id
          )
        );

        setShowModal(false);
      } else {
        alert('Error al eliminar el ingrediente');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al eliminar el ingrediente');
    }
  };

  const getStockStatus = (stock: number, stockMinimo: number) => {
    if (stock <= 0)
      return {
        status: 'agotado',
        color: 'bg-red-100 text-red-800',
        icon: '❌',
      };
    if (stock < stockMinimo)
      return {
        status: 'bajo',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '⚠️',
      };
    if (stock < stockMinimo * 1.5)
      return {
        status: 'medio',
        color: 'bg-blue-100 text-blue-800',
        icon: '📦',
      };
    return {
      status: 'bueno',
      color: 'bg-green-100 text-green-800',
      icon: '✅',
    };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando inventario..." />
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
              Error al cargar el inventario
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={cargarIngredientes}>Reintentar</Button>
          </div>
        </Card>
      </div>
    );
  }

  const ingredientesStockBajo = ingredientes.filter(
    (i) => i.stock < i.stockMinimo
  );
  const ingredientesAgotados = ingredientes.filter((i) => i.stock <= 0);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                📦 Inventario
              </h1>
              <p className="text-gray-600">
                Control de ingredientes y niveles de stock
              </p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard')}
              >
                ← Volver al Dashboard
              </Button>
              <Button onClick={handleNuevoIngrediente}>
                + Nuevo Ingrediente
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Alertas de stock */}
        {(ingredientesAgotados.length > 0 ||
          ingredientesStockBajo.length > 0) && (
          <Card title="⚠️ Alertas de Stock" className="mb-8">
            <div className="space-y-4">
              {ingredientesAgotados.length > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-red-800 mb-2">
                    🚨 Ingredientes Agotados ({ingredientesAgotados.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {ingredientesAgotados.map((ingrediente) => (
                      <div
                        key={ingrediente.id}
                        className="text-sm text-red-700"
                      >
                        • {ingrediente.nombre}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {ingredientesStockBajo.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-2">
                    ⚠️ Stock Bajo ({ingredientesStockBajo.length})
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {ingredientesStockBajo.map((ingrediente) => (
                      <div
                        key={ingrediente.id}
                        className="text-sm text-yellow-700"
                      >
                        • {ingrediente.nombre} ({ingrediente.stock}{' '}
                        {ingrediente.unidad})
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Estadísticas rápidas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {ingredientes.length}
              </div>
              <div className="text-sm text-gray-600">Total Ingredientes</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {ingredientes.filter((i) => i.stock >= i.stockMinimo).length}
              </div>
              <div className="text-sm text-gray-600">Stock Normal</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {ingredientesStockBajo.length}
              </div>
              <div className="text-sm text-gray-600">Stock Bajo</div>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {ingredientesAgotados.length}
              </div>
              <div className="text-sm text-gray-600">Agotados</div>
            </div>
          </Card>
        </div>

        {/* Lista de ingredientes */}
        <Card title="Ingredientes">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {ingredientes.map((ingrediente) => {
              const stockStatus = getStockStatus(
                ingrediente.stock,
                ingrediente.stockMinimo
              );

              return (
                <div
                  key={ingrediente.id}
                  className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {ingrediente.nombre}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.color}`}
                    >
                      {stockStatus.icon} {stockStatus.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stock actual:</span>
                      <span className="font-medium">
                        {ingrediente.stock} {ingrediente.unidad}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Stock mínimo:</span>
                      <span className="font-medium">
                        {ingrediente.stockMinimo} {ingrediente.unidad}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Costo unitario:</span>
                      <span className="font-medium">
                        ${ingrediente.costo.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Valor total:</span>
                      <span className="font-medium">
                        $
                        {(
                          ingrediente.stock * ingrediente.costo
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Barra de progreso del stock */}
                  <div className="mb-4">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Stock</span>
                      <span>
                        {Math.round(
                          (ingrediente.stock / (ingrediente.stockMinimo * 2)) *
                            100
                        )}
                        %
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          stockStatus.status === 'agotado'
                            ? 'bg-red-500'
                            : stockStatus.status === 'bajo'
                            ? 'bg-yellow-500'
                            : stockStatus.status === 'medio'
                            ? 'bg-blue-500'
                            : 'bg-green-500'
                        }`}
                        style={{
                          width: `${Math.min(
                            (ingrediente.stock /
                              (ingrediente.stockMinimo * 2)) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleEditarIngrediente(ingrediente)}
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="success"
                      className="flex-1"
                      onClick={() => handleReponerIngrediente(ingrediente)}
                    >
                      📦 Reponer
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="flex-1"
                      onClick={() => handleEliminarIngrediente(ingrediente)}
                    >
                      🗑️ Eliminar
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {ingredientes.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">📦</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay ingredientes registrados
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza agregando ingredientes a tu inventario
              </p>
              <Button onClick={handleNuevoIngrediente}>
                + Agregar Primer Ingrediente
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Modal para gestionar ingredientes */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {modalType === 'reponer' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Reponer Stock - {ingredienteSeleccionado?.nombre}
                </h3>
                <div className="mb-4 p-3 bg-gray-50 rounded-md">
                  <p className="text-sm text-gray-600">
                    Stock actual:{' '}
                    <span className="font-semibold">
                      {ingredienteSeleccionado?.stock}{' '}
                      {ingredienteSeleccionado?.unidad}
                    </span>
                  </p>
                  <p className="text-sm text-gray-600">
                    Stock mínimo:{' '}
                    <span className="font-semibold">
                      {ingredienteSeleccionado?.stockMinimo}{' '}
                      {ingredienteSeleccionado?.unidad}
                    </span>
                  </p>
                </div>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const cantidad = Number(formData.get('cantidad'));
                    reponerStock(cantidad);
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cantidad a Reponer *
                      </label>
                      <input
                        type="number"
                        name="cantidad"
                        min="1"
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
                      Reponer Stock
                    </Button>
                  </div>
                </form>
              </div>
            ) : modalType === 'eliminar' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  Eliminar Ingrediente
                </h3>
                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                  <p className="text-sm text-red-800">
                    ¿Estás seguro de que deseas eliminar el ingrediente{' '}
                    <span className="font-semibold">
                      {ingredienteSeleccionado?.nombre}
                    </span>
                    ?
                  </p>
                  <p className="text-xs text-red-600 mt-2">
                    Esta acción no se puede deshacer.
                  </p>
                </div>
                <div className="flex space-x-3">
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    onClick={eliminarIngrediente}
                    className="flex-1"
                  >
                    🗑️ Eliminar
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {modalType === 'nuevo'
                    ? 'Nuevo Ingrediente'
                    : 'Editar Ingrediente'}
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const datos = {
                      nombre: formData.get('nombre') as string,
                      descripcion: formData.get('descripcion') as string,
                      cantidad: Number(formData.get('cantidad')),
                      unidad: formData.get('unidad') as string,
                      stockMinimo: Number(formData.get('stockMinimo')),
                      costoUnitario: Number(formData.get('costoUnitario')),
                      categoria: formData.get('categoria') as string,
                      activo: true,
                    };
                    guardarIngrediente(datos);
                  }}
                >
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre *
                      </label>
                      <input
                        type="text"
                        name="nombre"
                        defaultValue={ingredienteSeleccionado?.nombre || ''}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Cantidad *
                        </label>
                        <input
                          type="number"
                          name="stock"
                          defaultValue={ingredienteSeleccionado?.stock || ''}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Unidad *
                        </label>
                        <select
                          name="unidad"
                          defaultValue={ingredienteSeleccionado?.unidad || 'kg'}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        >
                          <option value="kg">Kilogramos (kg)</option>
                          <option value="g">Gramos (g)</option>
                          <option value="l">Litros (l)</option>
                          <option value="ml">Mililitros (ml)</option>
                          <option value="unidad">Unidad</option>
                          <option value="docena">Docena</option>
                        </select>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Stock Mínimo *
                        </label>
                        <input
                          type="number"
                          name="stockMinimo"
                          defaultValue={
                            ingredienteSeleccionado?.stockMinimo || ''
                          }
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Costo Unitario *
                        </label>
                        <input
                          type="number"
                          name="costo"
                          step="0.01"
                          defaultValue={ingredienteSeleccionado?.costo || ''}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
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
