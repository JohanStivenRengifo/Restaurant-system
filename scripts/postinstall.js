#!/usr/bin/env node

const { execSync } = require('child_process');

console.log('🔄 Ejecutando postinstall: prisma generate...');

try {
    // Establecer la variable de entorno antes de ejecutar prisma generate
    process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = '1';

    execSync('prisma generate', {
        stdio: 'inherit',
        env: {
            ...process.env,
            PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1'
        }
    });

    console.log('✅ Prisma Client generado exitosamente');
} catch (error) {
    console.error('⚠️  Error generando Prisma Client:', error.message);
    console.log('💡 Continuando con la instalación...');
    // No fallar el proceso de instalación
    process.exit(0);
}
