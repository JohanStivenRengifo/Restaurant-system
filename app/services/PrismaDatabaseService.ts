/**
 * Servicio de Base de Datos con Prisma
 * Reemplaza el sistema de archivos JSON por PostgreSQL
 */

import { PrismaClient } from '@prisma/client';

class PrismaDatabaseService {
  private static instance: PrismaDatabaseService;
  private prisma: PrismaClient;

  private constructor() {
    this.prisma = new PrismaClient({
      log: ['error'], // Reducir logs para mejorar rendimiento
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }

  public static getInstance(): PrismaDatabaseService {
    if (!PrismaDatabaseService.instance) {
      PrismaDatabaseService.instance = new PrismaDatabaseService();
    }
    return PrismaDatabaseService.instance;
  }

  // Métodos para Clientes
  async obtenerClientes() {
    return await this.prisma.cliente.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async obtenerClientePorId(id: string) {
    return await this.prisma.cliente.findFirst({
      where: {
        id,
        activo: true
      }
    });
  }

  async crearCliente(datos: any) {
    return await this.prisma.cliente.create({
      data: {
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        alergias: datos.alergias || [],
        esFrecuente: datos.esFrecuente || false,
        puntos: datos.puntos || 0,
      }
    });
  }

  async actualizarCliente(id: string, datos: any) {
    return await this.prisma.cliente.update({
      where: { id },
      data: {
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        alergias: datos.alergias,
        esFrecuente: datos.esFrecuente,
        puntos: datos.puntos,
      }
    });
  }

  async eliminarCliente(id: string) {
    return await this.prisma.cliente.update({
      where: { id },
      data: { activo: false }
    });
  }

  // Métodos para Mesas
  async obtenerMesas() {
    return await this.prisma.mesa.findMany({
      where: { activo: true },
      orderBy: { numero: 'asc' }
    });
  }

  async obtenerMesaPorId(id: string) {
    return await this.prisma.mesa.findFirst({
      where: {
        id,
        activo: true
      }
    });
  }

  async crearMesa(datos: any) {
    return await this.prisma.mesa.create({
      data: {
        numero: datos.numero,
        capacidad: datos.capacidad,
        estado: datos.estado || 'DISPONIBLE',
        ubicacion: datos.ubicacion,
      }
    });
  }

  async actualizarMesa(id: string, datos: any) {
    return await this.prisma.mesa.update({
      where: { id },
      data: {
        numero: datos.numero,
        capacidad: datos.capacidad,
        estado: datos.estado,
        ubicacion: datos.ubicacion,
      }
    });
  }

  async eliminarMesa(id: string) {
    return await this.prisma.mesa.update({
      where: { id },
      data: { activo: false }
    });
  }

  // Métodos para Platillos
  async obtenerPlatillos() {
    return await this.prisma.platillo.findMany({
      where: { activo: true },
      include: {
        categoria: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async obtenerPlatilloPorId(id: string) {
    return await this.prisma.platillo.findFirst({
      where: {
        id,
        activo: true
      },
      include: {
        categoria: true
      }
    });
  }

  async crearPlatillo(datos: any) {
    return await this.prisma.platillo.create({
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio: datos.precio,
        categoriaId: datos.categoriaId,
        alergenos: datos.alergenos || [],
        activo: datos.activo !== undefined ? datos.activo : true,
        imagen: datos.imagen,
        tiempoPrep: datos.tiempoPrep || 15,
      },
      include: {
        categoria: true
      }
    });
  }

  async actualizarPlatillo(id: string, datos: any) {
    return await this.prisma.platillo.update({
      where: { id },
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio: datos.precio,
        categoriaId: datos.categoriaId,
        alergenos: datos.alergenos,
        activo: datos.activo,
        imagen: datos.imagen,
        tiempoPrep: datos.tiempoPrep,
      },
      include: {
        categoria: true
      }
    });
  }

  async eliminarPlatillo(id: string) {
    return await this.prisma.platillo.update({
      where: { id },
      data: { activo: false }
    });
  }

  // Métodos para Ingredientes
  async obtenerIngredientes() {
    return await this.prisma.ingrediente.findMany({
      where: { activo: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async obtenerIngredientePorId(id: string) {
    return await this.prisma.ingrediente.findFirst({
      where: {
        id,
        activo: true
      }
    });
  }

  async crearIngrediente(datos: any) {
    return await this.prisma.ingrediente.create({
      data: {
        nombre: datos.nombre,
        unidad: datos.unidad || 'kg',
        stock: datos.stock ?? 0,
        stockMinimo: datos.stockMinimo ?? 0,
        costo: datos.costo ?? 0,
        activo: datos.activo !== undefined ? datos.activo : true,
      }
    });
  }

  async actualizarIngrediente(id: string, datos: any) {
    return await this.prisma.ingrediente.update({
      where: { id },
      data: {
        nombre: datos.nombre,
        unidad: datos.unidad,
        stock: datos.stock,
        stockMinimo: datos.stockMinimo,
        costo: datos.costo,
        activo: datos.activo,
      }
    });
  }

  async eliminarIngrediente(id: string) {
    return await this.prisma.ingrediente.update({
      where: { id },
      data: { activo: false }
    });
  }

  // Métodos para Pedidos
  async obtenerPedidos() {
    return await this.prisma.pedido.findMany({
      include: {
        cliente: true,
        mesa: true,
        platillos: {
          include: {
            platillo: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async obtenerPedidoPorId(id: string) {
    return await this.prisma.pedido.findUnique({
      where: { id },
      include: {
        cliente: true,
        mesa: true,
        platillos: {
          include: {
            platillo: true
          }
        }
      }
    });
  }

  async crearPedido(datos: any) {
    return await this.prisma.pedido.create({
      data: {
        clienteId: datos.clienteId,
        mesaId: datos.mesaId,
        tipo: datos.tipo,
        estado: datos.estado || 'RECIBIDO',
        total: datos.total || 0,
        notas: datos.notas,
        direccion: datos.direccion,
        telefono: datos.telefono,
        platillos: {
          create: datos.platillos?.map((p: any) => ({
            platilloId: p.platilloId,
            cantidad: p.cantidad,
            precioUnitario: p.precioUnitario,
            precio: p.precio,
            personalizacion: p.personalizacion || [],
            notas: p.notas,
          })) || []
        }
      },
      include: {
        cliente: true,
        mesa: true,
        platillos: {
          include: {
            platillo: true
          }
        }
      }
    });
  }

  async actualizarPedido(id: string, datos: any) {
    return await this.prisma.pedido.update({
      where: { id },
      data: {
        clienteId: datos.clienteId,
        mesaId: datos.mesaId,
        tipo: datos.tipo,
        estado: datos.estado,
        total: datos.total,
        notas: datos.notas,
        direccion: datos.direccion,
        telefono: datos.telefono,
      },
      include: {
        cliente: true,
        mesa: true,
        platillos: {
          include: {
            platillo: true
          }
        }
      }
    });
  }

  async eliminarPedido(id: string) {
    return await this.prisma.pedido.update({
      where: { id },
      data: { estado: 'CANCELADO' }
    });
  }

  // Métodos para Facturas
  async obtenerFacturas() {
    return await this.prisma.factura.findMany({
      include: {
        cliente: true,
        pedido: true,
        items: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async obtenerFacturaPorId(id: string) {
    return await this.prisma.factura.findUnique({
      where: { id },
      include: {
        cliente: true,
        pedido: true,
        items: true
      }
    });
  }

  async crearFactura(datos: any) {
    // Validar y proporcionar valores por defecto
    const numero = datos.numero || `FACT-${Date.now()}`;
    const pedidoId = datos.pedidoId || null;
    const clienteId = datos.clienteId || null;
    const total = datos.total || (datos.subtotal + (datos.impuestos || 0) - (datos.descuento || 0));

    return await this.prisma.factura.create({
      data: {
        pedidoId: pedidoId,
        clienteId: clienteId,
        numero: numero,
        subtotal: datos.subtotal || 0,
        descuento: datos.descuento || 0,
        impuestos: datos.impuestos || 0,
        iva: datos.iva || 0,
        total: total,
        metodoPago: datos.metodoPago || 'EFECTIVO',
        estado: datos.estado || 'PENDIENTE',
        clienteNombre: datos.clienteNombre || 'Cliente',
        esElectronica: datos.esElectronica || false,
        items: {
          create: datos.items?.map((item: any) => ({
            nombre: item.nombre || 'Producto',
            cantidad: item.cantidad || 1,
            precio: item.precio || 0,
            subtotal: item.subtotal || (item.precio * item.cantidad) || 0,
          })) || []
        }
      },
      include: {
        cliente: true,
        pedido: true,
        items: true
      }
    });
  }

  async actualizarFactura(id: string, datos: any) {
    return await this.prisma.factura.update({
      where: { id },
      data: {
        pedidoId: datos.pedidoId,
        clienteId: datos.clienteId,
        numero: datos.numero,
        subtotal: datos.subtotal,
        descuento: datos.descuento,
        impuestos: datos.impuestos,
        iva: datos.iva,
        total: datos.total,
        metodoPago: datos.metodoPago,
        estado: datos.estado,
        clienteNombre: datos.clienteNombre,
        esElectronica: datos.esElectronica,
      },
      include: {
        cliente: true,
        pedido: true,
        items: true
      }
    });
  }

  async eliminarFactura(id: string) {
    return await this.prisma.factura.update({
      where: { id },
      data: { estado: 'CANCELADA' }
    });
  }

  // Métodos para Categorías
  async obtenerCategorias() {
    return await this.prisma.categoria.findMany({
      where: { activa: true },
      orderBy: { nombre: 'asc' }
    });
  }

  async crearCategoria(datos: any) {
    return await this.prisma.categoria.create({
      data: {
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        activa: datos.activa !== undefined ? datos.activa : true,
      }
    });
  }

  // Métodos para Reservas
  async obtenerReservas() {
    return await this.prisma.reserva.findMany({
      include: {
        cliente: true,
        mesa: true
      },
      orderBy: { fecha: 'desc' }
    });
  }

  async crearReserva(datos: any) {
    return await this.prisma.reserva.create({
      data: {
        clienteId: datos.clienteId,
        mesaId: datos.mesaId,
        fecha: new Date(datos.fecha),
        hora: datos.hora,
        personas: datos.personas,
        estado: datos.estado || 'PENDIENTE',
        notas: datos.notas,
      },
      include: {
        cliente: true,
        mesa: true
      }
    });
  }

  // Método optimizado para estadísticas del dashboard
  async obtenerEstadisticasDashboard() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const mañana = new Date(hoy);
    mañana.setDate(mañana.getDate() + 1);

    // Consultas optimizadas usando agregaciones de Prisma
    const [
      totalPedidos,
      pedidosHoy,
      totalFacturas,
      ingresosHoy,
      mesasDisponibles,
      totalMesas,
      mesasOcupadas,
      clientesFrecuentes,
      totalClientes,
      ingredientesStockBajo,
      promedioTiempoPrep
    ] = await Promise.all([
      // Total de pedidos
      this.prisma.pedido.count(),

      // Pedidos de hoy
      this.prisma.pedido.count({
        where: {
          createdAt: {
            gte: hoy,
            lt: mañana
          }
        }
      }),

      // Total de facturas
      this.prisma.factura.count(),

      // Ingresos de hoy usando agregación
      this.prisma.factura.aggregate({
        where: {
          createdAt: {
            gte: hoy,
            lt: mañana
          }
        },
        _sum: {
          total: true
        }
      }),

      // Mesas disponibles
      this.prisma.mesa.count({
        where: {
          estado: 'DISPONIBLE'
        }
      }),

      // Total de mesas
      this.prisma.mesa.count(),

      // Mesas ocupadas
      this.prisma.mesa.count({
        where: {
          estado: 'OCUPADA'
        }
      }),

      // Clientes frecuentes
      this.prisma.cliente.count({
        where: {
          esFrecuente: true
        }
      }),

      // Total de clientes
      this.prisma.cliente.count(),

      // Ingredientes con stock bajo (simplificado)
      this.prisma.ingrediente.count({
        where: {
          stock: {
            lt: 10 // Usar un valor fijo por ahora
          }
        }
      }),

      // Tiempo promedio de preparación (simulado)
      Promise.resolve(25) // Valor por defecto hasta implementar cálculo real
    ]);

    return {
      ventasHoy: ingresosHoy._sum.total || 0,
      pedidosHoy,
      mesasOcupadas,
      ingredientesStockBajo,
      clientesFrecuentes,
      promedioTiempoPrep
    };
  }

  // Método para cerrar la conexión
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

export default PrismaDatabaseService;
