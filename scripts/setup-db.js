const { spawn } = require('child_process');

console.log('🔄 Iniciando setup de base de datos en segundo plano...');

// Ejecutar prisma db push en segundo plano sin bloquear el inicio
const dbSetup = spawn('npx', ['prisma', 'db', 'push', '--skip-generate'], {
  stdio: 'inherit',
  env: process.env,
  detached: true,
  shell: true
});

dbSetup.on('error', (error) => {
  console.error('❌ Error ejecutando setup de base de datos:', error.message);
});

dbSetup.on('exit', (code) => {
  if (code === 0) {
    console.log('✅ Base de datos configurada correctamente');

    // Ejecutar seed después de configurar la base de datos
    console.log('🌱 Ejecutando seed...');
    const seed = spawn('node', ['scripts/seed.js'], {
      stdio: 'inherit',
      env: process.env,
      shell: true
    });

    seed.on('error', (error) => {
      console.error('❌ Error ejecutando seed:', error.message);
    });

    seed.on('exit', (seedCode) => {
      if (seedCode === 0) {
        console.log('✅ Seed completado correctamente');
      } else {
        console.log('⚠️  Seed falló, pero la aplicación continuará');
      }
    });
  } else {
    console.log('⚠️  Setup de base de datos falló, pero la aplicación continuará');
    console.log('   Ejecuta manualmente: npx prisma db push');
  }
});

// No esperar por el proceso, dejar que Next.js inicie inmediatamente
dbSetup.unref();

