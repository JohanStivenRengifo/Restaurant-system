#!/bin/bash

# Script wrapper para ejecutar prisma generate con las variables de entorno correctas
export PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1

echo "🔄 Generando Prisma Client con PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING=1..."

npx prisma generate

if [ $? -eq 0 ]; then
    echo "✅ Prisma Client generado exitosamente"
    exit 0
else
    echo "❌ Error generando Prisma Client"
    exit 1
fi
