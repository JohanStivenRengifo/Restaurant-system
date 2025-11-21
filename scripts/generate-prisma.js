#!/usr/bin/env node

const { spawnSync } = require('child_process');

console.log('🔄 Generando Prisma Client...');

// Establecer la variable de entorno ANTES de ejecutar el comando
process.env.PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING = '1';

const result = spawnSync('npx', ['prisma', 'generate'], {
    stdio: 'inherit',
    shell: true,
    env: {
        ...process.env,
        PRISMA_ENGINES_CHECKSUM_IGNORE_MISSING: '1'
    }
});

if (result.status === 0) {
    console.log('✅ Prisma Client generado exitosamente');
    process.exit(0);
} else {
    console.error('❌ Error generando Prisma Client');
    process.exit(result.status || 1);
}
