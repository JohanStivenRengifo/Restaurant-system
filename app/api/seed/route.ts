/**
 * API endpoint para ejecutar el seed de la base de datos
 * Solo debe usarse en desarrollo o para inicialización
 */

import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function POST() {
    try {
        console.log('🌱 Iniciando seeding desde API...');

        // Crear categorías por defecto
        const categorias = [
            { nombre: 'Entradas', descripcion: 'Aperitivos y entradas' },
            { nombre: 'Platos Principales', descripcion: 'Platos principales del menú' },
            { nombre: 'Postres', descripcion: 'Postres y dulces' },
            { nombre: 'Bebidas', descripcion: 'Bebidas frías y calientes' },
            { nombre: 'Ensaladas', descripcion: 'Ensaladas frescas' },
            { nombre: 'Sopas', descripcion: 'Sopas y cremas' },
        ];

        const categoriasCreadas = [];
        console.log('📂 Creando categorías...');

        for (const categoria of categorias) {
            const existe = await prisma.categoria.findUnique({
                where: { nombre: categoria.nombre }
            });

            if (!existe) {
                const nuevaCategoria = await prisma.categoria.create({
                    data: categoria
                });
                categoriasCreadas.push(nuevaCategoria.nombre);
                console.log(`  ✅ Categoría creada: ${categoria.nombre}`);
            } else {
                console.log(`  ⏭️  Categoría ya existe: ${categoria.nombre}`);
            }
        }

        // Crear mesas por defecto
        const mesasCreadas = [];
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
                mesasCreadas.push(i);
                console.log(`  ✅ Mesa ${i} creada`);
            } else {
                console.log(`  ⏭️  Mesa ${i} ya existe`);
            }
        }

        console.log('✅ Seeding completado exitosamente');

        return NextResponse.json({
            success: true,
            message: 'Seed ejecutado exitosamente',
            data: {
                categoriasCreadas,
                mesasCreadas,
                totalCategorias: await prisma.categoria.count(),
                totalMesas: await prisma.mesa.count()
            }
        }, { status: 200 });

    } catch (error) {
        console.error('❌ Error durante el seeding:', error);
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error desconocido durante el seeding'
        }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}

// También permitir GET para verificar el estado
export async function GET() {
    try {
        const categorias = await prisma.categoria.count();
        const mesas = await prisma.mesa.count();

        return NextResponse.json({
            success: true,
            data: {
                categorias,
                mesas,
                needsSeed: categorias === 0 || mesas === 0
            }
        });
    } catch (error) {
        return NextResponse.json({
            success: false,
            error: error instanceof Error ? error.message : 'Error al verificar el estado'
        }, { status: 500 });
    }
}
