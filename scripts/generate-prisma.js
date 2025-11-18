#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Generando Prisma Client...');

try {
    // Establecer la variable de entorno antes de ejecutar prisma generate
    execSync('prisma generate', {
        stdio: 'inherit',
        env: {
            ...process.env,
            PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1'
        }
    });

    console.log('✅ Prisma Client generado exitosamente');
} catch (error) {
    console.error('❌ Error generando Prisma Client:', error.message);
    process.exit(1);
}
