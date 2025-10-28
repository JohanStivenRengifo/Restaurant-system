/**
 * Página del Módulo de Menú
 * Gestión de carta digital y platillos
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

interface Categoria {
  id: string;
  nombre: string;
  descripcion: string;
  orden: number;
  activa: boolean;
  platillos: Platillo[];
}

export default function MenuPage() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'nuevo' | 'editar' | 'eliminar'>(
    'nuevo'
  );
  const [platilloSeleccionado, setPlatilloSeleccionado] =
    useState<Platillo | null>(null);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/menu');
      const data = await response.json();

      if (data.success) {
        // Simular categorías con los platillos
        const categoriasSimuladas: Categoria[] = [
          {
            id: '1',
            nombre: 'Platos Principales',
            descripcion: 'Nuestros platos estrella',
            orden: 1,
            activa: true,
            platillos: data.data.filter((p: Platillo) => p.categoriaId === '1'),
          },
          {
            id: '2',
            nombre: 'Entradas',
            descripcion: 'Para comenzar tu comida',
            orden: 2,
            activa: true,
            platillos: data.data.filter((p: Platillo) => p.categoriaId === '2'),
          },
        ];
        setCategorias(categoriasSimuladas);
      }
    } catch (err) {
      setError('Error al cargar el menú');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleNuevoPlatillo = () => {
    setPlatilloSeleccionado(null);
    setModalType('nuevo');
    setShowModal(true);
  };

  const handleEditarPlatillo = (platillo: Platillo) => {
    setPlatilloSeleccionado(platillo);
    setModalType('editar');
    setShowModal(true);
  };

  const handleEliminarPlatillo = (platillo: Platillo) => {
    setPlatilloSeleccionado(platillo);
    setModalType('eliminar');
    setShowModal(true);
  };

  const confirmarEliminar = async () => {
    if (!platilloSeleccionado) return;

    try {
      const response = await fetch(`/api/menu?id=${platilloSeleccionado.id}`, {
        method: 'DELETE',
      });

      const data = await response.json();

      if (data.success) {
        alert('Platillo eliminado exitosamente');
        cargarCategorias();
        setShowModal(false);
      } else {
        alert('Error al eliminar el platillo');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al eliminar el platillo');
    }
  };

  const guardarPlatillo = async (datosPlatillo: Partial<Platillo>) => {
    try {
      const url =
        modalType === 'nuevo'
          ? '/api/menu'
          : `/api/menu?id=${platilloSeleccionado?.id}`;
      const method = modalType === 'nuevo' ? 'POST' : 'PUT';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(datosPlatillo),
      });

      const data = await response.json();

      if (data.success) {
        alert(
          modalType === 'nuevo'
            ? 'Platillo creado exitosamente'
            : 'Platillo actualizado exitosamente'
        );

        // Actualizar estado local inmediatamente
        if (modalType === 'nuevo') {
          // Para nuevo platillo, recargar todas las categorías
          cargarCategorias();
        } else {
          // Para actualización, actualizar solo el platillo específico
          setCategorias((prev) =>
            prev.map((categoria) => ({
              ...categoria,
              platillos: categoria.platillos.map((platillo) =>
                platillo.id === platilloSeleccionado?.id
                  ? { ...platillo, ...datosPlatillo }
                  : platillo
              ),
            }))
          );
        }

        setShowModal(false);
      } else {
        alert('Error al guardar el platillo');
      }
    } catch (err) {
      console.error('Error:', err);
      alert('Error al guardar el platillo');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" text="Cargando menú..." />
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
              Error al cargar el menú
            </h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={cargarCategorias}>Reintentar</Button>
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
                🍽️ Carta Digital
              </h1>
              <p className="text-gray-600">Gestión de platillos y categorías</p>
            </div>
            <div className="flex space-x-3">
              <Button
                variant="secondary"
                onClick={() => router.push('/dashboard')}
              >
                ← Volver al Dashboard
              </Button>
              <Button onClick={handleNuevoPlatillo}>+ Nuevo Platillo</Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {categorias.map((categoria) => (
          <Card
            key={categoria.id}
            title={categoria.nombre}
            subtitle={categoria.descripcion}
            className="mb-8"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categoria.platillos.map((platillo) => (
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

                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs text-gray-500">
                      ⏱️ {platillo.tiempoPrep} min
                    </span>
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${
                        platillo.activo
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {platillo.activo ? 'Disponible' : 'No disponible'}
                    </span>
                  </div>

                  {platillo.alergenos.length > 0 && (
                    <div className="mb-3">
                      <span className="text-xs text-red-600 font-medium">
                        ⚠️ Alérgenos: {platillo.alergenos.join(', ')}
                      </span>
                    </div>
                  )}

                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="flex-1"
                      onClick={() => handleEditarPlatillo(platillo)}
                    >
                      ✏️ Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      className="flex-1"
                      onClick={() => handleEliminarPlatillo(platillo)}
                    >
                      🗑️ Eliminar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        ))}

        {categorias.length === 0 && (
          <Card>
            <div className="text-center py-8">
              <div className="text-gray-400 text-6xl mb-4">🍽️</div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No hay platillos disponibles
              </h3>
              <p className="text-gray-600 mb-4">
                Comienza agregando platillos a tu carta digital
              </p>
              <Button onClick={handleNuevoPlatillo}>
                + Agregar Primer Platillo
              </Button>
            </div>
          </Card>
        )}
      </div>

      {/* Modal para gestionar platillos */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            {modalType === 'eliminar' ? (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  ¿Eliminar platillo?
                </h3>
                <p className="text-gray-600 mb-6">
                  ¿Estás seguro de que quieres eliminar "
                  {platilloSeleccionado?.nombre}"? Esta acción no se puede
                  deshacer.
                </p>
                <div className="flex space-x-3">
                  <Button
                    variant="secondary"
                    onClick={() => setShowModal(false)}
                    className="flex-1"
                  >
                    Cancelar
                  </Button>
                  <Button
                    variant="danger"
                    onClick={confirmarEliminar}
                    className="flex-1"
                  >
                    Eliminar
                  </Button>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {modalType === 'nuevo' ? 'Nuevo Platillo' : 'Editar Platillo'}
                </h3>
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    const formData = new FormData(e.currentTarget);
                    const categoriaId = formData.get('categoriaId') as string;
                    if (!categoriaId) {
                      alert('Por favor selecciona una categoría');
                      return;
                    }

                    const datos = {
                      nombre: formData.get('nombre') as string,
                      descripcion: formData.get('descripcion') as string,
                      precio: Number(formData.get('precio')),
                      categoriaId: categoriaId,
                      tiempoPreparacion: Number(formData.get('tiempoPrep')),
                      disponible: true,
                    };

                    guardarPlatillo(datos);
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
                        defaultValue={platilloSeleccionado?.nombre || ''}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Descripción
                      </label>
                      <textarea
                        name="descripcion"
                        defaultValue={platilloSeleccionado?.descripcion || ''}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Precio *
                        </label>
                        <input
                          type="number"
                          name="precio"
                          defaultValue={platilloSeleccionado?.precio || ''}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Tiempo Prep (min) *
                        </label>
                        <input
                          type="number"
                          name="tiempoPrep"
                          defaultValue={platilloSeleccionado?.tiempoPrep || ''}
                          className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                          required
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Categoría *
                      </label>
                      <select
                        name="categoriaId"
                        defaultValue={platilloSeleccionado?.categoriaId || ''}
                        className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Seleccionar categoría...</option>
                        <option value="1">Platos Principales</option>
                        <option value="2">Entradas</option>
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
