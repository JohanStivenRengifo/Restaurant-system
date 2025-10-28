/**
 * Servicios principales del Sistema de Gestión de Restaurante
 * Implementa la lógica de negocio usando los patrones de diseño
 * Versión simplificada para pruebas sin base de datos
 */

import {
  Cliente,
  Mesa,
  Platillo,
  Pedido,
  Reserva,
  Factura,
  Ingrediente,
  EstadoPedido,
  TipoPedido,
  MetodoPago,
  CrearPedidoRequest,
  CrearClienteRequest,
  CrearReservaRequest,
  CrearFacturaRequest,
  ApiResponse,
  FiltroPedidos,
  EstadisticasDashboard
} from '@/app/types'

// Importar patrones de diseño
import { DatabaseConnection, ConfigurationManager, NotificationService } from '@/app/patterns/creational/singleton/DatabaseConnection'
import { PedidoBuilder, PedidoDirector } from '@/app/patterns/creational/builder/PedidoBuilder'
import { DecoradorFactory } from '@/app/patterns/structural/decorator/PlatilloDecorador'
import { AdaptadorFactory } from '@/app/patterns/structural/adapter/AdaptadorPagoCripto'
import { ProxyFactory } from '@/app/patterns/structural/proxy/ProxyInventario'

// Datos de prueba en memoria
const datosPrueba = {
  clientes: [
    { id: '1', nombre: 'Juan Pérez', email: 'juan@email.com', telefono: '3001234567', alergias: ['gluten'], esFrecuente: true, puntos: 150, createdAt: new Date(), updatedAt: new Date() },
    { id: '2', nombre: 'María García', email: 'maria@email.com', telefono: '3007654321', alergias: ['lacteos'], esFrecuente: false, puntos: 50, createdAt: new Date(), updatedAt: new Date() }
  ],
  mesas: [
    { id: '1', numero: 1, capacidad: 4, estado: 'DISPONIBLE', ubicacion: 'Interior', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', numero: 2, capacidad: 6, estado: 'OCUPADA', ubicacion: 'Exterior', createdAt: new Date(), updatedAt: new Date() },
    { id: '3', numero: 3, capacidad: 2, estado: 'DISPONIBLE', ubicacion: 'Ventana', createdAt: new Date(), updatedAt: new Date() },
    { id: '4', numero: 4, capacidad: 8, estado: 'RESERVADA', ubicacion: 'Interior', createdAt: new Date(), updatedAt: new Date() }
  ],
  platillos: [
    { id: '1', nombre: 'Hamburguesa Clásica', descripcion: 'Hamburguesa con carne, lechuga, tomate y queso', precio: 25000, categoriaId: '1', alergenos: ['gluten', 'lacteos'], activo: true, imagen: '/images/hamburguesa.jpg', tiempoPrep: 15, createdAt: new Date(), updatedAt: new Date() },
    { id: '2', nombre: 'Pizza Margherita', descripcion: 'Pizza con tomate, mozzarella y albahaca', precio: 30000, categoriaId: '1', alergenos: ['gluten', 'lacteos'], activo: true, imagen: '/images/pizza.jpg', tiempoPrep: 20, createdAt: new Date(), updatedAt: new Date() },
    { id: '3', nombre: 'Ensalada César', descripcion: 'Ensalada fresca con pollo y aderezo césar', precio: 18000, categoriaId: '2', alergenos: ['lacteos', 'huevos'], activo: true, imagen: '/images/ensalada.jpg', tiempoPrep: 10, createdAt: new Date(), updatedAt: new Date() }
  ],
  pedidos: [
    { id: '1', clienteId: '1', mesaId: '1', tipo: 'MESA', estado: 'PREPARANDO', total: 25000, notas: 'Sin cebolla', createdAt: new Date(), updatedAt: new Date() },
    { id: '2', clienteId: '2', mesaId: null, tipo: 'PARA_LLEVAR', estado: 'LISTO', total: 30000, notas: '', createdAt: new Date(), updatedAt: new Date() }
  ],
  ingredientes: [
    { id: '1', nombre: 'Tomate', unidad: 'kg', stock: 50, stockMinimo: 20, costo: 2000, activo: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '2', nombre: 'Cebolla', unidad: 'kg', stock: 15, stockMinimo: 20, costo: 1500, activo: true, createdAt: new Date(), updatedAt: new Date() },
    { id: '3', nombre: 'Carne', unidad: 'kg', stock: 30, stockMinimo: 15, costo: 25000, activo: true, createdAt: new Date(), updatedAt: new Date() }
  ],
  facturas: [
    {
      id: '1',
      pedidoId: '1',
      clienteId: '1',
      numero: 'FAC-001',
      subtotal: 25000,
      descuento: 0,
      impuestos: 4750,
      iva: 4750,
      total: 29750,
      metodoPago: 'TARJETA',
      estado: 'PAGADA',
      fecha: new Date(),
      clienteNombre: 'Juan Pérez',
      mesaNumero: 1,
      items: [
        { nombre: 'Hamburguesa Clásica', cantidad: 1, precio: 25000 }
      ],
      createdAt: new Date(),
      updatedAt: new Date()
    }
  ]
}

export class ClienteService {
  private config = ConfigurationManager.getInstance()

  async crearCliente(datos: CrearClienteRequest): Promise<ApiResponse<Cliente>> {
    try {
      const nuevoCliente: Cliente = {
        id: Math.random().toString(36).substr(2, 9),
        nombre: datos.nombre,
        email: datos.email,
        telefono: datos.telefono,
        alergias: datos.alergias || [],
        esFrecuente: false,
        puntos: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      datosPrueba.clientes.push(nuevoCliente)

      return {
        success: true,
        data: nuevoCliente,
        message: 'Cliente creado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear cliente',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  async obtenerClientes(): Promise<ApiResponse<Cliente[]>> {
    try {
      return {
        success: true,
        data: datosPrueba.clientes
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener clientes'
      }
    }
  }

  async obtenerCliente(id: string): Promise<ApiResponse<Cliente>> {
    try {
      const cliente = datosPrueba.clientes.find(c => c.id === id)

      if (!cliente) {
        return {
          success: false,
          error: 'Cliente no encontrado'
        }
      }

      return {
        success: true,
        data: cliente
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener cliente'
      }
    }
  }

  async actualizarPuntosCliente(clienteId: string, puntos: number): Promise<ApiResponse<Cliente>> {
    try {
      const cliente = datosPrueba.clientes.find(c => c.id === clienteId)

      if (!cliente) {
        return {
          success: false,
          error: 'Cliente no encontrado'
        }
      }

      cliente.puntos = puntos
      cliente.updatedAt = new Date()

      return {
        success: true,
        data: cliente,
        message: 'Puntos actualizados exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar puntos del cliente'
      }
    }
  }
}

export class MesaService {
  async obtenerMesas(): Promise<ApiResponse<Mesa[]>> {
    try {
      return {
        success: true,
        data: datosPrueba.mesas
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener mesas'
      }
    }
  }

  async actualizarEstadoMesa(mesaId: string, estado: string): Promise<ApiResponse<Mesa>> {
    try {
      const mesa = datosPrueba.mesas.find(m => m.id === mesaId)

      if (!mesa) {
        return {
          success: false,
          error: 'Mesa no encontrada'
        }
      }

      mesa.estado = estado as any
      mesa.updatedAt = new Date()

      return {
        success: true,
        data: mesa,
        message: 'Estado de mesa actualizado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar estado de mesa'
      }
    }
  }

  async obtenerMesasDisponibles(): Promise<ApiResponse<Mesa[]>> {
    try {
      const mesasDisponibles = datosPrueba.mesas.filter(m => m.estado === 'DISPONIBLE')

      return {
        success: true,
        data: mesasDisponibles
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener mesas disponibles'
      }
    }
  }

  async crearMesa(datos: any): Promise<ApiResponse<Mesa>> {
    try {
      const nuevaMesa: Mesa = {
        id: Math.random().toString(36).substr(2, 9),
        numero: datos.numero,
        capacidad: datos.capacidad,
        estado: datos.estado || 'DISPONIBLE',
        ubicacion: datos.ubicacion || '',
        activa: datos.activa !== false,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      datosPrueba.mesas.push(nuevaMesa)

      return {
        success: true,
        data: nuevaMesa
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear mesa'
      }
    }
  }

  async actualizarMesa(id: string, datos: any): Promise<ApiResponse<Mesa>> {
    try {
      const index = datosPrueba.mesas.findIndex(m => m.id === id)

      if (index === -1) {
        return {
          success: false,
          error: 'Mesa no encontrada'
        }
      }

      const mesaActualizada: Mesa = {
        ...datosPrueba.mesas[index],
        ...datos,
        id,
        updatedAt: new Date()
      }

      datosPrueba.mesas[index] = mesaActualizada

      return {
        success: true,
        data: mesaActualizada
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar mesa'
      }
    }
  }

  async eliminarMesa(id: string): Promise<ApiResponse<void>> {
    try {
      const index = datosPrueba.mesas.findIndex(m => m.id === id)

      if (index === -1) {
        return {
          success: false,
          error: 'Mesa no encontrada'
        }
      }

      datosPrueba.mesas.splice(index, 1)

      return {
        success: true,
        data: undefined
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al eliminar mesa'
      }
    }
  }
}

export class MenuService {
  async obtenerCategorias(): Promise<ApiResponse<any[]>> {
    try {
      const categorias = [
        {
          id: '1',
          nombre: 'Platos Principales',
          descripcion: 'Nuestros platos estrella',
          orden: 1,
          activa: true,
          platillos: datosPrueba.platillos.filter(p => p.categoriaId === '1')
        },
        {
          id: '2',
          nombre: 'Entradas',
          descripcion: 'Para comenzar tu comida',
          orden: 2,
          activa: true,
          platillos: datosPrueba.platillos.filter(p => p.categoriaId === '2')
        }
      ]

      return {
        success: true,
        data: categorias
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener categorías'
      }
    }
  }

  async obtenerPlatillos(): Promise<ApiResponse<Platillo[]>> {
    try {
      return {
        success: true,
        data: datosPrueba.platillos
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener platillos'
      }
    }
  }

  async obtenerPlatillo(id: string): Promise<ApiResponse<Platillo>> {
    try {
      const platillo = datosPrueba.platillos.find(p => p.id === id)

      if (!platillo) {
        return {
          success: false,
          error: 'Platillo no encontrado'
        }
      }

      return {
        success: true,
        data: platillo
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener platillo'
      }
    }
  }

  async crearPlatillo(datos: any): Promise<ApiResponse<Platillo>> {
    try {
      const nuevoPlatillo: Platillo = {
        id: Math.random().toString(36).substr(2, 9),
        nombre: datos.nombre,
        descripcion: datos.descripcion,
        precio: datos.precio,
        categoriaId: datos.categoriaId,
        disponible: datos.disponible !== false,
        alergenos: datos.alergenos || [],
        imagen: datos.imagen,
        tiempoPreparacion: datos.tiempoPreparacion || 15,
        calorias: datos.calorias,
        ingredientes: datos.ingredientes || [],
        createdAt: new Date(),
        updatedAt: new Date()
      }

      datosPrueba.platillos.push(nuevoPlatillo)

      return {
        success: true,
        data: nuevoPlatillo
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear platillo'
      }
    }
  }

  async actualizarPlatillo(id: string, datos: any): Promise<ApiResponse<Platillo>> {
    try {
      const index = datosPrueba.platillos.findIndex(p => p.id === id)

      if (index === -1) {
        return {
          success: false,
          error: 'Platillo no encontrado'
        }
      }

      const platilloActualizado: Platillo = {
        ...datosPrueba.platillos[index],
        ...datos,
        id,
        updatedAt: new Date()
      }

      datosPrueba.platillos[index] = platilloActualizado

      return {
        success: true,
        data: platilloActualizado
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar platillo'
      }
    }
  }

  async eliminarPlatillo(id: string): Promise<ApiResponse<void>> {
    try {
      const index = datosPrueba.platillos.findIndex(p => p.id === id)

      if (index === -1) {
        return {
          success: false,
          error: 'Platillo no encontrado'
        }
      }

      datosPrueba.platillos.splice(index, 1)

      return {
        success: true,
        data: undefined
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al eliminar platillo'
      }
    }
  }
}

export class PedidoService {
  private notificationService = NotificationService.getInstance()

  async crearPedido(datos: CrearPedidoRequest): Promise<ApiResponse<Pedido>> {
    try {
      // Usar Builder Pattern para construir el pedido
      const builder = new PedidoBuilder()

      // Configurar tipo de pedido
      if (datos.tipo === 'MESA' && datos.mesaId) {
        builder.configurarMesa(datos.mesaId)
      } else if (datos.tipo === 'PARA_LLEVAR') {
        builder.configurarParaLlevar()
      } else if (datos.tipo === 'DOMICILIO') {
        if (!datos.direccion || !datos.telefono) {
          return {
            success: false,
            error: 'Para pedidos a domicilio se requiere dirección y teléfono'
          }
        }
        builder.configurarDomicilio(datos.direccion, datos.telefono)
      } else {
        return {
          success: false,
          error: 'Debe especificar el tipo de pedido (MESA, PARA_LLEVAR, DOMICILIO)'
        }
      }

      // Configurar cliente si existe
      if (datos.clienteId) {
        builder.configurarCliente(datos.clienteId)
      }

      // Agregar platillos
      for (const platilloPedido of datos.platillos) {
        const platillo = datosPrueba.platillos.find(p => p.id === platilloPedido.platilloId)

        if (platillo) {
          builder.agregarPlatillo(
            platillo.id,
            platillo.nombre,
            platillo.precio,
            platilloPedido.cantidad,
            platillo.alergenos,
            platillo.tiempoPrep || 15
          )

          // Agregar personalizaciones
          if (platilloPedido.personalizacion) {
            platilloPedido.personalizacion.forEach(personalizacion => {
              builder.personalizarPlatillo(datos.platillos.indexOf(platilloPedido), personalizacion)
            })
          }
        }
      }

      // Agregar notas si existen
      if (datos.notas) {
        builder.agregarNotas(datos.notas)
      }

      const pedidoCompleto = builder.build()

      // Buscar información del cliente y mesa
      const cliente = datosPrueba.clientes.find(c => c.id === pedidoCompleto.clienteId)
      const mesa = datosPrueba.mesas.find(m => m.id === pedidoCompleto.mesaId)

      // Crear pedido en datos de prueba
      const nuevoPedido: Pedido = {
        id: pedidoCompleto.id,
        clienteId: pedidoCompleto.clienteId,
        mesaId: pedidoCompleto.mesaId,
        tipo: pedidoCompleto.tipo as any,
        estado: 'RECIBIDO',
        total: pedidoCompleto.total,
        notas: pedidoCompleto.notas,
        direccion: pedidoCompleto.direccion,
        telefono: pedidoCompleto.telefono,
        cliente: cliente ? { nombre: cliente.nombre } : undefined,
        mesa: mesa ? { numero: mesa.numero } : undefined,
        platillos: pedidoCompleto.platillos.map(platillo => ({
          platillo: {
            nombre: platillo.nombre
          },
          cantidad: platillo.cantidad,
          precioUnitario: platillo.precioUnitario
        })),
        createdAt: new Date(),
        updatedAt: new Date()
      }

      datosPrueba.pedidos.push(nuevoPedido)

      // Notificar a cocina
      this.notificationService.addNotification(
        `Nuevo pedido #${nuevoPedido.id} recibido`,
        'info'
      )

      return {
        success: true,
        data: nuevoPedido,
        message: 'Pedido creado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear pedido',
        message: error instanceof Error ? error.message : 'Error desconocido'
      }
    }
  }

  async obtenerPedidos(filtros?: FiltroPedidos): Promise<ApiResponse<Pedido[]>> {
    try {
      let pedidos = [...datosPrueba.pedidos]

      if (filtros?.estado) {
        pedidos = pedidos.filter(p => p.estado === filtros.estado)
      }

      if (filtros?.tipo) {
        pedidos = pedidos.filter(p => p.tipo === filtros.tipo)
      }

      if (filtros?.clienteId) {
        pedidos = pedidos.filter(p => p.clienteId === filtros.clienteId)
      }

      if (filtros?.mesaId) {
        pedidos = pedidos.filter(p => p.mesaId === filtros.mesaId)
      }

      return {
        success: true,
        data: pedidos
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener pedidos'
      }
    }
  }

  async actualizarEstadoPedido(pedidoId: string, estado: EstadoPedido): Promise<ApiResponse<Pedido>> {
    try {
      const pedido = datosPrueba.pedidos.find(p => p.id === pedidoId)

      if (!pedido) {
        return {
          success: false,
          error: 'Pedido no encontrado'
        }
      }

      pedido.estado = estado
      pedido.updatedAt = new Date()

      // Notificar cambio de estado
      this.notificationService.addNotification(
        `Pedido #${pedidoId} actualizado a ${estado}`,
        'info'
      )

      return {
        success: true,
        data: pedido,
        message: 'Estado del pedido actualizado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al actualizar estado del pedido'
      }
    }
  }
}

export class ReservaService {
  async crearReserva(datos: CrearReservaRequest): Promise<ApiResponse<Reserva>> {
    try {
      // Verificar disponibilidad de mesa
      const mesa = datosPrueba.mesas.find(m => m.id === datos.mesaId)

      if (!mesa) {
        return {
          success: false,
          error: 'Mesa no encontrada'
        }
      }

      if (mesa.estado !== 'DISPONIBLE') {
        return {
          success: false,
          error: 'La mesa no está disponible'
        }
      }

      // Verificar capacidad
      if (datos.personas > mesa.capacidad) {
        return {
          success: false,
          error: 'La cantidad de personas excede la capacidad de la mesa'
        }
      }

      const nuevaReserva: Reserva = {
        id: Math.random().toString(36).substr(2, 9),
        clienteId: datos.clienteId,
        mesaId: datos.mesaId,
        fecha: new Date(datos.fecha),
        hora: datos.hora,
        personas: datos.personas,
        estado: 'CONFIRMADA',
        notas: datos.notas,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Actualizar estado de mesa
      mesa.estado = 'RESERVADA'
      mesa.updatedAt = new Date()

      return {
        success: true,
        data: nuevaReserva,
        message: 'Reserva creada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear reserva'
      }
    }
  }

  async obtenerReservas(): Promise<ApiResponse<Reserva[]>> {
    try {
      // Simular reservas
      const reservas: Reserva[] = [
        {
          id: '1',
          clienteId: '1',
          mesaId: '4',
          fecha: new Date(),
          hora: '19:00',
          personas: 4,
          estado: 'CONFIRMADA',
          notas: 'Mesa cerca de la ventana',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ]

      return {
        success: true,
        data: reservas
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener reservas'
      }
    }
  }
}

export class FacturaService {
  async crearFactura(datos: any): Promise<ApiResponse<Factura>> {
    try {
      let subtotal = 0
      let items: any[] = []
      let clienteNombre = 'Cliente'
      let mesaNumero: number | undefined = undefined
      let pedidoId: string | undefined = undefined
      let clienteId: string | undefined = undefined

      // Si viene un pedidoId, buscar el pedido
      if (datos.pedidoId) {
        const pedido = datosPrueba.pedidos.find(p => p.id === datos.pedidoId)
        if (!pedido) {
          return {
            success: false,
            error: 'Pedido no encontrado'
          }
        }

        subtotal = pedido.total
        pedidoId = datos.pedidoId
        clienteId = pedido.clienteId

        // Buscar información del cliente y mesa
        const cliente = datosPrueba.clientes.find(c => c.id === pedido.clienteId)
        const mesa = datosPrueba.mesas.find(m => m.id === pedido.mesaId)

        clienteNombre = cliente?.nombre || 'Cliente'
        mesaNumero = mesa?.numero

        // Si el pedido no tiene platillos, crear algunos de ejemplo basados en el total
        if (!pedido.platillos || pedido.platillos.length === 0) {
          const platilloEjemplo = datosPrueba.platillos[0] // Tomar el primer platillo disponible
          if (platilloEjemplo) {
            const cantidadEjemplo = Math.ceil(subtotal / platilloEjemplo.precio)
            items = [{
              nombre: platilloEjemplo.nombre,
              cantidad: cantidadEjemplo,
              precio: platilloEjemplo.precio
            }]
            // Recalcular subtotal basado en los items de ejemplo
            subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
          } else {
            // Si no hay platillos disponibles, crear uno genérico
            items = [{
              nombre: 'Platillo del Menú',
              cantidad: 1,
              precio: subtotal
            }]
            // En este caso el subtotal ya está correcto
          }
        } else {
          items = pedido.platillos?.map(platillo => ({
            nombre: platillo.platillo.nombre,
            cantidad: platillo.cantidad,
            precio: platillo.precioUnitario
          })) || []

          // Recalcular subtotal basado en los items reales
          subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0)
        }
      } else {
        // Si vienen items directamente (desde formulario manual)
        subtotal = datos.subtotal || 0
        items = datos.items || []
        clienteNombre = datos.clienteNombre || 'Cliente'
        mesaNumero = datos.mesaNumero
      }

      const descuento = datos.descuento || 0
      const tasaImpuesto = 0.19 // IVA Colombia
      const impuestos = (subtotal - descuento) * tasaImpuesto
      const total = subtotal - descuento + impuestos

      // Generar número de factura
      const numeroFactura = `FAC-${Date.now()}`

      const nuevaFactura: Factura = {
        id: Math.random().toString(36).substr(2, 9),
        pedidoId: pedidoId,
        clienteId: clienteId,
        numero: numeroFactura,
        subtotal,
        descuento,
        impuestos,
        iva: impuestos, // Alias para compatibilidad
        total,
        metodoPago: datos.metodoPago,
        estado: datos.estado || 'PENDIENTE',
        fecha: datos.fecha ? new Date(datos.fecha) : new Date(),
        clienteNombre,
        mesaNumero,
        items,
        createdAt: new Date(),
        updatedAt: new Date()
      }

      // Guardar la factura en datosPrueba
      datosPrueba.facturas.push(nuevaFactura)

      return {
        success: true,
        data: nuevaFactura,
        message: 'Factura creada exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al crear factura'
      }
    }
  }

  async obtenerFacturas(): Promise<ApiResponse<Factura[]>> {
    try {
      return {
        success: true,
        data: datosPrueba.facturas
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener facturas'
      }
    }
  }
}

export class InventarioService {
  private proxyInventario = ProxyFactory.crearProxyInventario()

  async obtenerIngredientes(): Promise<ApiResponse<Ingrediente[]>> {
    try {
      // Establecer usuario para el proxy (en producción sería dinámico)
      const usuario = {
        id: '1',
        nombre: 'Admin',
        rol: 'ADMIN' as any,
        permisos: ['INVENTARIO_READ', 'INVENTARIO_WRITE', 'INVENTARIO_CREATE', 'INVENTARIO_DELETE']
      }

      this.proxyInventario.establecerUsuario(usuario)

      const ingredientes = await this.proxyInventario.obtenerIngredientes()

      return {
        success: true,
        data: ingredientes
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al obtener ingredientes'
      }
    }
  }

  async actualizarStock(ingredienteId: string, cantidad: number): Promise<ApiResponse<Ingrediente>> {
    try {
      const usuario = {
        id: '1',
        nombre: 'Admin',
        rol: 'ADMIN' as any,
        permisos: ['INVENTARIO_WRITE']
      }

      this.proxyInventario.establecerUsuario(usuario)

      // Buscar el ingrediente en datos de prueba
      const index = datosPrueba.ingredientes.findIndex(i => i.id === ingredienteId)

      if (index === -1) {
        return {
          success: false,
          error: 'Ingrediente no encontrado'
        }
      }

      // Actualizar el stock directamente en datos de prueba
      datosPrueba.ingredientes[index].stock = cantidad
      datosPrueba.ingredientes[index].updatedAt = new Date()

      return {
        success: true,
        data: datosPrueba.ingredientes[index],
        message: 'Stock actualizado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar stock'
      }
    }
  }

  async crearIngrediente(datos: any): Promise<ApiResponse<Ingrediente>> {
    try {
      const usuario = {
        id: '1',
        nombre: 'Admin',
        rol: 'ADMIN' as any,
        permisos: ['INVENTARIO_CREATE']
      }

      this.proxyInventario.establecerUsuario(usuario)

      // Generar ID único
      const nuevoId = Math.random().toString(36).substr(2, 9)
      const ahora = new Date()

      // Crear nuevo ingrediente
      const nuevoIngrediente: Ingrediente = {
        id: nuevoId,
        nombre: datos.nombre,
        unidad: datos.unidad || 'unidad',
        stock: datos.cantidad || 0,
        stockMinimo: datos.stockMinimo || 0,
        costo: datos.costoUnitario || 0,
        activo: datos.activo !== undefined ? datos.activo : true,
        createdAt: ahora,
        updatedAt: ahora
      }

      // Agregar a datos de prueba
      datosPrueba.ingredientes.push(nuevoIngrediente)

      return {
        success: true,
        data: nuevoIngrediente,
        message: 'Ingrediente creado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al crear ingrediente'
      }
    }
  }

  async actualizarIngrediente(ingredienteId: string, datos: any): Promise<ApiResponse<Ingrediente>> {
    try {
      const usuario = {
        id: '1',
        nombre: 'Admin',
        rol: 'ADMIN' as any,
        permisos: ['INVENTARIO_WRITE']
      }

      this.proxyInventario.establecerUsuario(usuario)

      // Buscar el ingrediente en datos de prueba
      const index = datosPrueba.ingredientes.findIndex(i => i.id === ingredienteId)

      if (index === -1) {
        return {
          success: false,
          error: 'Ingrediente no encontrado'
        }
      }

      // Actualizar el ingrediente
      const ingredienteActualizado: Ingrediente = {
        ...datosPrueba.ingredientes[index],
        ...datos,
        id: ingredienteId,
        updatedAt: new Date()
      }

      datosPrueba.ingredientes[index] = ingredienteActualizado

      return {
        success: true,
        data: ingredienteActualizado,
        message: 'Ingrediente actualizado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al actualizar ingrediente'
      }
    }
  }

  async eliminarIngrediente(ingredienteId: string): Promise<ApiResponse<boolean>> {
    try {
      const usuario = {
        id: '1',
        nombre: 'Admin',
        rol: 'ADMIN' as any,
        permisos: ['INVENTARIO_DELETE']
      }

      this.proxyInventario.establecerUsuario(usuario)

      // Buscar el ingrediente en datos de prueba
      const index = datosPrueba.ingredientes.findIndex(i => i.id === ingredienteId)

      if (index === -1) {
        return {
          success: false,
          error: 'Ingrediente no encontrado'
        }
      }

      // Eliminar el ingrediente
      datosPrueba.ingredientes.splice(index, 1)

      return {
        success: true,
        data: true,
        message: 'Ingrediente eliminado exitosamente'
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Error al eliminar ingrediente'
      }
    }
  }
}

export class DashboardService {
  async obtenerEstadisticas(): Promise<ApiResponse<EstadisticasDashboard>> {
    try {
      const hoy = new Date()
      hoy.setHours(0, 0, 0, 0)

      // Calcular estadísticas basadas en datos de prueba
      const ventasHoy = datosPrueba.pedidos
        .filter(p => p.createdAt >= hoy)
        .reduce((sum, p) => sum + p.total, 0)

      const pedidosHoy = datosPrueba.pedidos
        .filter(p => p.createdAt >= hoy).length

      const mesasOcupadas = datosPrueba.mesas
        .filter(m => m.estado === 'OCUPADA').length

      const ingredientesStockBajo = datosPrueba.ingredientes
        .filter(i => i.stock < i.stockMinimo).length

      const clientesFrecuentes = datosPrueba.clientes
        .filter(c => c.esFrecuente).length

      const promedioTiempoPrep = datosPrueba.platillos
        .reduce((sum, p) => sum + (p.tiempoPrep || 15), 0) / datosPrueba.platillos.length

      const estadisticas: EstadisticasDashboard = {
        ventasHoy,
        pedidosHoy,
        mesasOcupadas,
        ingredientesStockBajo,
        clientesFrecuentes,
        promedioTiempoPrep: Math.round(promedioTiempoPrep)
      }

      return {
        success: true,
        data: estadisticas
      }
    } catch (error) {
      return {
        success: false,
        error: 'Error al obtener estadísticas'
      }
    }
  }
}