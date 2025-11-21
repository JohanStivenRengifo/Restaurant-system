/**
 * Componentes UI reutilizables con Tailwind CSS
 * Implementa componentes usando los patrones de diseño
 */

import React from 'react';
import { cn } from '@/lib/utils';

// ===== COMPONENTES BASE =====

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  className,
  disabled,
  ...props
}) => {
  const baseClasses =
    'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none';

  const variantClasses = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
    secondary:
      'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-green-600 text-white hover:bg-green-700 focus:ring-green-500',
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };

  return (
    <button
      className={cn(
        baseClasses,
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-2 h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}
      {children}
    </button>
  );
};

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  className,
  ...props
}) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <input
        className={cn(
          'block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm',
          error && 'border-red-300 focus:border-red-500 focus:ring-red-500',
          className
        )}
        {...props}
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      {helperText && !error && (
        <p className="text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  className,
  ...props
}) => {
  return (
    <div
      className={cn('bg-white overflow-hidden shadow rounded-lg', className)}
      {...props}
    >
      {(title || subtitle) && (
        <div className="px-4 py-5 sm:p-6">
          {title && (
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              {title}
            </h3>
          )}
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
      )}
      <div className="px-4 py-5 sm:p-6">{children}</div>
    </div>
  );
};

// ===== COMPONENTES ESPECÍFICOS DEL SISTEMA =====

interface MesaCardProps {
  mesa: {
    id: string;
    numero: number;
    capacidad: number;
    estado: string;
    ubicacion?: string;
  };
  onEstadoChange?: (mesaId: string, nuevoEstado: string) => void;
}

export const MesaCard: React.FC<MesaCardProps> = ({ mesa, onEstadoChange }) => {
  const estadoColors = {
    DISPONIBLE: 'bg-green-100 text-green-800',
    OCUPADA: 'bg-red-100 text-red-800',
    RESERVADA: 'bg-yellow-100 text-yellow-800',
    MANTENIMIENTO: 'bg-gray-100 text-gray-800',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
            Mesa {mesa.numero}
          </h4>
          <p className="text-sm text-gray-500">
            Capacidad: {mesa.capacidad} personas
          </p>
          {mesa.ubicacion && (
            <p className="text-xs text-gray-400">{mesa.ubicacion}</p>
          )}
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span
            className={cn(
              'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
              estadoColors[mesa.estado as keyof typeof estadoColors]
            )}
          >
            {mesa.estado}
          </span>
          {onEstadoChange && (
            <select
              value={mesa.estado}
              onChange={(e) => onEstadoChange(mesa.id, e.target.value)}
              className="text-xs border border-gray-300 rounded px-2 py-1"
            >
              <option value="DISPONIBLE">Disponible</option>
              <option value="OCUPADA">Ocupada</option>
              <option value="RESERVADA">Reservada</option>
              <option value="MANTENIMIENTO">Mantenimiento</option>
            </select>
          )}
        </div>
      </div>
    </Card>
  );
};

interface PedidoCardProps {
  pedido: {
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
  };
  onEstadoChange?: (pedidoId: string, nuevoEstado: string) => void;
}

export const PedidoCard: React.FC<PedidoCardProps> = ({
  pedido,
  onEstadoChange,
}) => {
  const estadoColors = {
    RECIBIDO: 'bg-blue-100 text-blue-800',
    PREPARANDO: 'bg-yellow-100 text-yellow-800',
    LISTO: 'bg-green-100 text-green-800',
    ENTREGADO: 'bg-gray-100 text-gray-800',
    CANCELADO: 'bg-red-100 text-red-800',
  };

  const tipoLabels = {
    MESA: 'Mesa',
    PARA_LLEVAR: 'Para Llevar',
    DOMICILIO: 'Domicilio',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h4 className="text-lg font-semibold text-gray-900">
            Pedido #{pedido.id.slice(-6)}
          </h4>
          <p className="text-sm text-gray-500">
            {tipoLabels[pedido.tipo as keyof typeof tipoLabels]}
            {pedido.cliente && ` - ${pedido.cliente.nombre}`}
            {pedido.mesa && ` - Mesa ${pedido.mesa.numero}`}
          </p>
          <p className="text-xs text-gray-400">
            {new Date(pedido.createdAt).toLocaleString()}
          </p>
        </div>
        <div className="flex flex-col items-end space-y-2">
          <span
            className={cn(
              'inline-flex px-2 py-1 text-xs font-semibold rounded-full',
              estadoColors[pedido.estado as keyof typeof estadoColors]
            )}
          >
            {pedido.estado}
          </span>
          <span className="text-lg font-bold text-gray-900">
            ${pedido.total.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h5 className="text-sm font-medium text-gray-700">Platillos:</h5>
        {pedido.platillos.map((item, index) => (
          <div key={index} className="flex justify-between text-sm">
            <span>
              {item.cantidad}x {item.platillo.nombre}
            </span>
            <span className="text-gray-600">
              ${(item.cantidad * item.precioUnitario).toLocaleString()}
            </span>
          </div>
        ))}
      </div>

      {onEstadoChange && (
        <div className="mt-4 pt-3 border-t border-gray-200">
          <select
            value={pedido.estado}
            onChange={(e) => onEstadoChange(pedido.id, e.target.value)}
            className="w-full text-sm border border-gray-300 rounded px-3 py-2"
          >
            <option value="RECIBIDO">Recibido</option>
            <option value="PREPARANDO">Preparando</option>
            <option value="LISTO">Listo</option>
            <option value="ENTREGADO">Entregado</option>
            <option value="CANCELADO">Cancelado</option>
          </select>
        </div>
      )}
    </Card>
  );
};

interface PlatilloCardProps {
  platillo: {
    id: string;
    nombre: string;
    descripcion?: string;
    precio: number;
    imagen?: string;
    alergenos: string[];
    categoria: { nombre: string };
  };
  onAgregar?: (platilloId: string) => void;
  cantidad?: number;
}

export const PlatilloCard: React.FC<PlatilloCardProps> = ({
  platillo,
  onAgregar,
  cantidad = 0,
}) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex space-x-4">
        {platillo.imagen && (
          <div className="flex-shrink-0">
            <img
              className="h-20 w-20 rounded-lg object-cover"
              src={platillo.imagen}
              alt={platillo.nombre}
            />
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div>
              <h4 className="text-lg font-semibold text-gray-900">
                {platillo.nombre}
              </h4>
              <p className="text-sm text-gray-500">
                {platillo.categoria.nombre}
              </p>
              {platillo.descripcion && (
                <p className="text-sm text-gray-600 mt-1">
                  {platillo.descripcion}
                </p>
              )}
              {platillo.alergenos.length > 0 && (
                <div className="mt-2">
                  <span className="text-xs text-red-600 font-medium">
                    Alérgenos: {platillo.alergenos.join(', ')}
                  </span>
                </div>
              )}
            </div>
            <div className="flex flex-col items-end space-y-2">
              <span className="text-lg font-bold text-gray-900">
                ${platillo.precio.toLocaleString()}
              </span>
              {onAgregar && (
                <Button size="sm" onClick={() => onAgregar(platillo.id)}>
                  Agregar
                </Button>
              )}
              {cantidad > 0 && (
                <span className="text-sm text-blue-600 font-medium">
                  {cantidad} en pedido
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

interface EstadisticaCardProps {
  titulo: string;
  valor: string | number;
  icono?: React.ReactNode;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple';
  tendencia?: {
    valor: number;
    tipo: 'up' | 'down';
  };
}

export const EstadisticaCard: React.FC<EstadisticaCardProps> = ({
  titulo,
  valor,
  icono,
  color = 'blue',
  tendencia,
}) => {
  const colorClasses = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    red: 'bg-red-500',
    purple: 'bg-purple-500',
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <div className="flex items-center">
        <div
          className={cn('flex-shrink-0 p-3 rounded-md', colorClasses[color])}
        >
          {icono || (
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
                d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
              />
            </svg>
          )}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm font-medium text-gray-500 truncate">{titulo}</p>
          <div className="flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">
              {typeof valor === 'number' ? valor.toLocaleString() : valor}
            </p>
            {tendencia && (
              <p
                className={cn(
                  'ml-2 text-sm font-medium',
                  tendencia.tipo === 'up' ? 'text-green-600' : 'text-red-600'
                )}
              >
                {tendencia.tipo === 'up' ? '↗' : '↘'}{' '}
                {Math.abs(tendencia.valor)}%
              </p>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" onClick={onClose}>
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen">
          &#8203;
        </span>

        <div
          className={cn(
            'inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle w-full',
            sizeClasses[size]
          )}
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">{title}</h3>
              <button
                onClick={onClose}
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
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 'md',
  text,
}) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12',
  };

  return (
    <div className="flex flex-col items-center justify-center space-y-2">
      <svg
        className={cn('animate-spin text-blue-600', sizeClasses[size])}
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      {text && <p className="text-sm text-gray-600">{text}</p>}
    </div>
  );
};
