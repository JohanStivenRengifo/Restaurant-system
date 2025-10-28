/**
 * ABSTRACT FACTORY PATTERN - RestauranteUIFactory
 * Crea familias de componentes UI coherentes (tema oscuro/claro)
 * Garantiza que todos los componentes sigan el mismo estilo visual
 */

// Interfaces para los productos UI
export interface Boton {
    render(): string
    onClick(): void
}

export interface Formulario {
    render(): string
    validar(): boolean
}

export interface Tabla {
    render(): string
    agregarFila(datos: any[]): void
}

export interface Modal {
    render(): string
    mostrar(): void
    ocultar(): void
}

// Fábrica abstracta
export interface RestauranteUIFactory {
    crearBoton(texto: string, tipo: 'primary' | 'secondary' | 'danger'): Boton
    crearFormulario(campos: string[]): Formulario
    crearTabla(columnas: string[]): Tabla
    crearModal(titulo: string, contenido: string): Modal
}

// Implementación para tema claro
export class TemaClaroFactory implements RestauranteUIFactory {
    crearBoton(texto: string, tipo: 'primary' | 'secondary' | 'danger'): Boton {
        return new BotonClaro(texto, tipo)
    }

    crearFormulario(campos: string[]): Formulario {
        return new FormularioClaro(campos)
    }

    crearTabla(columnas: string[]): Tabla {
        return new TablaClara(columnas)
    }

    crearModal(titulo: string, contenido: string): Modal {
        return new ModalClaro(titulo, contenido)
    }
}

// Implementación para tema oscuro
export class TemaOscuroFactory implements RestauranteUIFactory {
    crearBoton(texto: string, tipo: 'primary' | 'secondary' | 'danger'): Boton {
        return new BotonOscuro(texto, tipo)
    }

    crearFormulario(campos: string[]): Formulario {
        return new FormularioOscuro(campos)
    }

    crearTabla(columnas: string[]): Tabla {
        return new TablaOscura(columnas)
    }

    crearModal(titulo: string, contenido: string): Modal {
        return new ModalOscuro(titulo, contenido)
    }
}

// Componentes para tema claro
export class BotonClaro implements Boton {
    constructor(private texto: string, private tipo: 'primary' | 'secondary' | 'danger') { }

    render(): string {
        const estilos = {
            primary: 'bg-blue-500 text-white hover:bg-blue-600',
            secondary: 'bg-gray-200 text-gray-800 hover:bg-gray-300',
            danger: 'bg-red-500 text-white hover:bg-red-600'
        }
        return `<button class="px-4 py-2 rounded ${estilos[this.tipo]}">${this.texto}</button>`
    }

    onClick(): void {
        console.log(`Boton claro ${this.tipo} clickeado: ${this.texto}`)
    }
}

export class FormularioClaro implements Formulario {
    constructor(private campos: string[]) { }

    render(): string {
        const camposHtml = this.campos.map(campo =>
            `<div class="mb-4">
        <label class="block text-gray-700 text-sm font-bold mb-2">${campo}</label>
        <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" type="text" />
      </div>`
        ).join('')

        return `<form class="bg-white p-6 rounded shadow">${camposHtml}</form>`
    }

    validar(): boolean {
        console.log('Validando formulario claro')
        return true
    }
}

export class TablaClara implements Tabla {
    private filas: any[][] = []

    constructor(private columnas: string[]) { }

    render(): string {
        const headers = this.columnas.map(col => `<th class="px-4 py-2 bg-gray-100 text-gray-800">${col}</th>`).join('')
        const filasHtml = this.filas.map(fila =>
            `<tr>${fila.map(celda => `<td class="px-4 py-2 border-b">${celda}</td>`).join('')}</tr>`
        ).join('')

        return `<table class="min-w-full bg-white border border-gray-200">
      <thead><tr>${headers}</tr></thead>
      <tbody>${filasHtml}</tbody>
    </table>`
    }

    agregarFila(datos: any[]): void {
        this.filas.push(datos)
    }
}

export class ModalClaro implements Modal {
    constructor(private titulo: string, private contenido: string) { }

    render(): string {
        return `<div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div class="bg-white rounded-lg p-6 max-w-md w-full">
        <h2 class="text-xl font-bold mb-4 text-gray-800">${this.titulo}</h2>
        <p class="text-gray-600">${this.contenido}</p>
      </div>
    </div>`
    }

    mostrar(): void {
        console.log('Mostrando modal claro')
    }

    ocultar(): void {
        console.log('Ocultando modal claro')
    }
}

// Componentes para tema oscuro
export class BotonOscuro implements Boton {
    constructor(private texto: string, private tipo: 'primary' | 'secondary' | 'danger') { }

    render(): string {
        const estilos = {
            primary: 'bg-blue-600 text-white hover:bg-blue-700',
            secondary: 'bg-gray-700 text-gray-200 hover:bg-gray-600',
            danger: 'bg-red-600 text-white hover:bg-red-700'
        }
        return `<button class="px-4 py-2 rounded ${estilos[this.tipo]}">${this.texto}</button>`
    }

    onClick(): void {
        console.log(`Boton oscuro ${this.tipo} clickeado: ${this.texto}`)
    }
}

export class FormularioOscuro implements Formulario {
    constructor(private campos: string[]) { }

    render(): string {
        const camposHtml = this.campos.map(campo =>
            `<div class="mb-4">
        <label class="block text-gray-300 text-sm font-bold mb-2">${campo}</label>
        <input class="shadow appearance-none border rounded w-full py-2 px-3 bg-gray-800 text-gray-300 border-gray-600" type="text" />
      </div>`
        ).join('')

        return `<form class="bg-gray-900 p-6 rounded shadow">${camposHtml}</form>`
    }

    validar(): boolean {
        console.log('Validando formulario oscuro')
        return true
    }
}

export class TablaOscura implements Tabla {
    private filas: any[][] = []

    constructor(private columnas: string[]) { }

    render(): string {
        const headers = this.columnas.map(col => `<th class="px-4 py-2 bg-gray-800 text-gray-200">${col}</th>`).join('')
        const filasHtml = this.filas.map(fila =>
            `<tr>${fila.map(celda => `<td class="px-4 py-2 border-b border-gray-700 text-gray-300">${celda}</td>`).join('')}</tr>`
        ).join('')

        return `<table class="min-w-full bg-gray-900 border border-gray-700">
      <thead><tr>${headers}</tr></thead>
      <tbody>${filasHtml}</tbody>
    </table>`
    }

    agregarFila(datos: any[]): void {
        this.filas.push(datos)
    }
}

export class ModalOscuro implements Modal {
    constructor(private titulo: string, private contenido: string) { }

    render(): string {
        return `<div class="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center">
      <div class="bg-gray-900 rounded-lg p-6 max-w-md w-full">
        <h2 class="text-xl font-bold mb-4 text-gray-200">${this.titulo}</h2>
        <p class="text-gray-400">${this.contenido}</p>
      </div>
    </div>`
    }

    mostrar(): void {
        console.log('Mostrando modal oscuro')
    }

    ocultar(): void {
        console.log('Ocultando modal oscuro')
    }
}

// Factory para crear diferentes tipos de reportes
export interface Reporte {
    generar(): string
    exportar(formato: 'PDF' | 'Excel' | 'JSON'): string
}

export interface ReporteFactory {
    crearReporteVentas(): Reporte
    crearReporteInventario(): Reporte
    crearReporteClientes(): Reporte
}

export class ReportePDFFactory implements ReporteFactory {
    crearReporteVentas(): Reporte {
        return new ReporteVentasPDF()
    }

    crearReporteInventario(): Reporte {
        return new ReporteInventarioPDF()
    }

    crearReporteClientes(): Reporte {
        return new ReporteClientesPDF()
    }
}

export class ReporteExcelFactory implements ReporteFactory {
    crearReporteVentas(): Reporte {
        return new ReporteVentasExcel()
    }

    crearReporteInventario(): Reporte {
        return new ReporteInventarioExcel()
    }

    crearReporteClientes(): Reporte {
        return new ReporteClientesExcel()
    }
}

export class ReporteVentasPDF implements Reporte {
    generar(): string {
        return 'Generando reporte de ventas en PDF...'
    }

    exportar(formato: 'PDF' | 'Excel' | 'JSON'): string {
        return `Exportando reporte de ventas a ${formato}`
    }
}

export class ReporteVentasExcel implements Reporte {
    generar(): string {
        return 'Generando reporte de ventas en Excel...'
    }

    exportar(formato: 'PDF' | 'Excel' | 'JSON'): string {
        return `Exportando reporte de ventas a ${formato}`
    }
}

export class ReporteInventarioPDF implements Reporte {
    generar(): string {
        return 'Generando reporte de inventario en PDF...'
    }

    exportar(formato: 'PDF' | 'Excel' | 'JSON'): string {
        return `Exportando reporte de inventario a ${formato}`
    }
}

export class ReporteInventarioExcel implements Reporte {
    generar(): string {
        return 'Generando reporte de inventario en Excel...'
    }

    exportar(formato: 'PDF' | 'Excel' | 'JSON'): string {
        return `Exportando reporte de inventario a ${formato}`
    }
}

export class ReporteClientesPDF implements Reporte {
    generar(): string {
        return 'Generando reporte de clientes en PDF...'
    }

    exportar(formato: 'PDF' | 'Excel' | 'JSON'): string {
        return `Exportando reporte de clientes a ${formato}`
    }
}

export class ReporteClientesExcel implements Reporte {
    generar(): string {
        return 'Generando reporte de clientes en Excel...'
    }

    exportar(formato: 'PDF' | 'Excel' | 'JSON'): string {
        return `Exportando reporte de clientes a ${formato}`
    }
}
