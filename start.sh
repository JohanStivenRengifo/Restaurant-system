#!/bin/bash

# Script de inicio para Railway
echo "🚀 Iniciando aplicación en Railway..."

# Verificar variables de entorno requeridas
if [ -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    echo "❌ ERROR: NEXT_PUBLIC_SUPABASE_URL no está configurada"
    exit 1
fi

if [ -z "$NEXT_PUBLIC_SUPABASE_ANON_KEY" ]; then
    echo "❌ ERROR: NEXT_PUBLIC_SUPABASE_ANON_KEY no está configurada"
    exit 1
fi

if [ -z "$SECRET_KEY" ]; then
    echo "❌ ERROR: SECRET_KEY no está configurada"
    exit 1
fi

# Configurar variables por defecto si no están definidas
export PORT=${PORT:-8000}
export HOST=${HOST:-0.0.0.0}
export PYTHONUNBUFFERED=${PYTHONUNBUFFERED:-1}
export DEBUG=${DEBUG:-false}

echo "✅ Variables de entorno configuradas"
echo "🌐 Puerto: $PORT"
echo "🏠 Host: $HOST"
echo "🐍 Python unbuffered: $PYTHONUNBUFFERED"
echo "🔧 Debug: $DEBUG"

# Iniciar la aplicación
echo "🍽️ Iniciando Sistema de Restaurante..."
python -m uvicorn main:app --host $HOST --port $PORT
