const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Iniciando seeding de la base de datos...');

    // Crear categorías por defecto
    const categorias = [
        { nombre: 'Entradas', descripcion: 'Aperitivos y entradas' },
        { nombre: 'Platos Principales', descripcion: 'Platos principales del menú' },
        { nombre: 'Postres', descripcion: 'Postres y dulces' },
        { nombre: 'Bebidas', descripcion: 'Bebidas frías y calientes' },
        { nombre: 'Ensaladas', descripcion: 'Ensaladas frescas' },
        { nombre: 'Sopas', descripcion: 'Sopas y cremas' },
    ];

    console.log('📂 Creando categorías...');
    for (const categoria of categorias) {
        const existe = await prisma.categoria.findUnique({
            where: { nombre: categoria.nombre }
        });

        if (!existe) {
            await prisma.categoria.create({
                data: categoria
            });
            console.log(`  ✅ Categoría creada: ${categoria.nombre}`);
        } else {
            console.log(`  ⏭️  Categoría ya existe: ${categoria.nombre}`);
        }
    }

    // Crear mesas por defecto
    console.log('🪑 Creando mesas...');
    for (let i = 1; i <= 10; i++) {
        const existe = await prisma.mesa.findUnique({
            where: { numero: i }
        });

        if (!existe) {
            await prisma.mesa.create({
                data: {
                    numero: i,
                    capacidad: i <= 4 ? 2 : i <= 8 ? 4 : 6,
                    estado: 'DISPONIBLE',
                    ubicacion: i <= 5 ? 'Interior' : 'Terraza'
                }
            });
            console.log(`  ✅ Mesa ${i} creada`);
        } else {
            console.log(`  ⏭️  Mesa ${i} ya existe`);
        }
    }

    console.log('✅ Seeding completado exitosamente');
}

main()
    .catch((e) => {
        console.error('❌ Error durante el seeding:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
