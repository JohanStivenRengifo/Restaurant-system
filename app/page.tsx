'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoadingSpinner } from '@/app/components/ui';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Redirigir al dashboard después de un breve delay
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 1000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sistema de Gestión de Restaurante
          </h1>
          <p className="text-xl text-gray-600">
            Implementado con TypeScript, Next.js y 9 Patrones de Diseño
          </p>
          <p className="text-lg text-gray-500">
            Cargando dashboard...
          </p>
        </div>

        <LoadingSpinner size="lg" text="Cargando sistema..." />

        <div className="mt-8 text-sm text-gray-500">
          <p>Redirigiendo al dashboard...</p>
        </div>
      </div>
    </div>
  );
}
