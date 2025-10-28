/**
 * Servicio de utilidades para convertir datos del restaurante a formato Factus
 * Implementa el patrón Adapter para adaptar nuestros datos a la API de Factus
 */

import {
    FactusCustomer,
    FactusItem,
    FactusAllowanceCharge,
    FactusEstablishment,
    FactusInvoiceRequest,
    FactusLegalOrganizationType,
    FactusTributeType,
    FactusIdentificationDocument,
    FactusUnitMeasure,
    FactusStandardCode,
    FactusPaymentMethod,
    FactusPaymentForm,
    FactusDocumentType
} from '../../types/factus';

// Tipos del sistema del restaurante
export interface RestauranteCliente {
    id: string;
    nombre: string;
    apellido?: string;
    email: string;
    telefono: string;
    direccion: string;
    tipoDocumento: 'cedula' | 'nit' | 'cedula_extranjeria' | 'pasaporte';
    numeroDocumento: string;
    digitoVerificacion?: string;
    esPersonaJuridica: boolean;
    razonSocial?: string;
    nombreComercial?: string;
    municipioId?: number;
}

export interface RestaurantePlatillo {
    id: string;
    nombre: string;
    codigo: string;
    precio: number;
    cantidad: number;
    descuentoPorcentaje?: number;
    impuestoPorcentaje: number;
    estaExcluidoIVA: boolean;
    unidadMedida: 'unidad' | 'kilogramo' | 'litro' | 'metro';
    categoria: string;
}

export interface RestaurantePedido {
    id: string;
    cliente: RestauranteCliente;
    platillos: RestaurantePlatillo[];
    propina?: number;
    descuento?: number;
    metodoPago: 'efectivo' | 'tarjeta_credito' | 'tarjeta_debito' | 'transferencia' | 'cheque';
    formaPago: 'contado' | 'credito';
    fechaVencimiento?: string;
    observaciones?: string;
    numeroReferencia: string;
}

export interface RestauranteEstablecimiento {
    nombre: string;
    direccion: string;
    telefono: string;
    email: string;
    municipioId: number;
}

export class FactusAdapterService {
    /**
     * Convierte un cliente del restaurante a formato Factus
     */
    public static adaptarCliente(cliente: RestauranteCliente): FactusCustomer {
        const tipoDocumentoMap: Record<string, number> = {
            'cedula': FactusIdentificationDocument.CEDULA_CIUDADANIA,
            'nit': FactusIdentificationDocument.NIT,
            'cedula_extranjeria': FactusIdentificationDocument.CEDULA_EXTRANJERIA,
            'pasaporte': FactusIdentificationDocument.PASAPORTE
        };

        return {
            identification_document_id: tipoDocumentoMap[cliente.tipoDocumento] || FactusIdentificationDocument.CEDULA_CIUDADANIA,
            identification: cliente.numeroDocumento,
            dv: cliente.digitoVerificacion,
            company: cliente.esPersonaJuridica ? cliente.razonSocial : undefined,
            trade_name: cliente.nombreComercial,
            names: cliente.esPersonaJuridica ? undefined : `${cliente.nombre} ${cliente.apellido || ''}`.trim(),
            address: cliente.direccion,
            email: cliente.email,
            phone: cliente.telefono,
            legal_organization_id: cliente.esPersonaJuridica
                ? FactusLegalOrganizationType.PERSONA_JURIDICA
                : FactusLegalOrganizationType.PERSONA_NATURAL,
            tribute_id: FactusTributeType.NO_APLICA,
            municipality_id: cliente.municipioId
        };
    }

    /**
     * Convierte un platillo del restaurante a formato Factus Item
     */
    public static adaptarPlatillo(platillo: RestaurantePlatillo): FactusItem {
        const unidadMedidaMap: Record<string, number> = {
            'unidad': 70, // FactusUnitMeasure.UNIDAD
            'kilogramo': 1, // FactusUnitMeasure.KILOGRAMO
            'litro': 2, // FactusUnitMeasure.LITRO
            'metro': 3 // FactusUnitMeasure.METRO
        };

        return {
            code_reference: platillo.codigo,
            name: platillo.nombre,
            quantity: platillo.cantidad,
            discount_rate: platillo.descuentoPorcentaje || 0,
            price: platillo.precio,
            tax_rate: platillo.impuestoPorcentaje.toString(),
            unit_measure_id: unidadMedidaMap[platillo.unidadMedida] || 70, // FactusUnitMeasure.UNIDAD
            standard_code_id: 1, // FactusStandardCode.ESTANDAR_CONTRIBUYENTE
            is_excluded: platillo.estaExcluidoIVA ? 1 : 0,
            tribute_id: 1 // FactusTributeType.IVA
        };
    }

    /**
     * Convierte múltiples platillos a formato Factus Items
     */
    public static adaptarPlatillos(platillos: RestaurantePlatillo[]): FactusItem[] {
        return platillos.map(platillo => this.adaptarPlatillo(platillo));
    }

    /**
     * Convierte propina a formato Factus AllowanceCharge
     */
    public static adaptarPropina(propina: number, baseAmount: number): FactusAllowanceCharge {
        return {
            concept_type: '03', // Propina
            is_surcharge: true,
            reason: 'Propina sugerida',
            base_amount: baseAmount.toString(),
            amount: propina.toString()
        };
    }

    /**
     * Convierte descuento a formato Factus AllowanceCharge
     */
    public static adaptarDescuento(descuento: number, baseAmount: number, razon: string = 'Descuento aplicado'): FactusAllowanceCharge {
        return {
            concept_type: '01', // Descuento
            is_surcharge: false,
            reason: razon,
            base_amount: baseAmount.toString(),
            amount: descuento.toString()
        };
    }

    /**
     * Convierte establecimiento del restaurante a formato Factus
     */
    public static adaptarEstablecimiento(establecimiento: RestauranteEstablecimiento): FactusEstablishment {
        return {
            name: establecimiento.nombre,
            address: establecimiento.direccion,
            phone_number: establecimiento.telefono,
            email: establecimiento.email,
            municipality_id: establecimiento.municipioId
        };
    }

    /**
     * Convierte método de pago del restaurante a código Factus
     */
    public static adaptarMetodoPago(metodoPago: string): string {
        const metodoPagoMap: Record<string, string> = {
            'efectivo': '10',
            'tarjeta_credito': '20',
            'tarjeta_debito': '21',
            'transferencia': '31',
            'cheque': '32'
        };

        return metodoPagoMap[metodoPago] || '10';
    }

    /**
     * Convierte forma de pago del restaurante a código Factus
     */
    public static adaptarFormaPago(formaPago: string): string {
        const formaPagoMap: Record<string, string> = {
            'contado': '1',
            'credito': '2'
        };

        return formaPagoMap[formaPago] || '1';
    }

    /**
     * Convierte un pedido completo del restaurante a formato Factus InvoiceRequest
     */
    public static adaptarPedidoCompleto(
        pedido: RestaurantePedido,
        establecimiento?: RestauranteEstablecimiento,
        numberingRangeId?: number
    ): FactusInvoiceRequest {
        const cliente = this.adaptarCliente(pedido.cliente);
        const items = this.adaptarPlatillos(pedido.platillos);
        const allowanceCharges: FactusAllowanceCharge[] = [];

        // Calcular total base para propinas y descuentos
        const totalBase = pedido.platillos.reduce((sum, platillo) => {
            const subtotal = platillo.precio * platillo.cantidad;
            const descuento = subtotal * (platillo.descuentoPorcentaje || 0) / 100;
            return sum + subtotal - descuento;
        }, 0);

        // Agregar propina si existe
        if (pedido.propina && pedido.propina > 0) {
            allowanceCharges.push(this.adaptarPropina(pedido.propina, totalBase));
        }

        // Agregar descuento general si existe
        if (pedido.descuento && pedido.descuento > 0) {
            allowanceCharges.push(this.adaptarDescuento(pedido.descuento, totalBase));
        }

        const invoiceRequest: FactusInvoiceRequest = {
            document: FactusDocumentType.FACTURA_ELECTRONICA,
            numbering_range_id: numberingRangeId,
            reference_code: pedido.numeroReferencia,
            observation: pedido.observaciones,
            payment_form: this.adaptarFormaPago(pedido.formaPago),
            payment_method_code: this.adaptarMetodoPago(pedido.metodoPago),
            payment_due_date: pedido.fechaVencimiento,
            operation_type: 10, // Estándar
            send_email: true,
            customer: cliente,
            items: items,
            allowance_charges: allowanceCharges.length > 0 ? allowanceCharges : undefined
        };

        // Agregar establecimiento si se proporciona
        if (establecimiento) {
            invoiceRequest.establishment = this.adaptarEstablecimiento(establecimiento);
        }

        return invoiceRequest;
    }

    /**
     * Valida que los datos del cliente sean válidos para Factus
     */
    public static validarCliente(cliente: RestauranteCliente): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!cliente.numeroDocumento) {
            errors.push('El número de documento es obligatorio');
        }

        if (!cliente.nombre) {
            errors.push('El nombre es obligatorio');
        }

        if (cliente.esPersonaJuridica && !cliente.razonSocial) {
            errors.push('La razón social es obligatoria para personas jurídicas');
        }

        if (cliente.tipoDocumento === 'nit' && !cliente.digitoVerificacion) {
            errors.push('El dígito de verificación es obligatorio para NIT');
        }

        if (!cliente.email) {
            errors.push('El email es obligatorio');
        }

        if (!cliente.telefono) {
            errors.push('El teléfono es obligatorio');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida que los datos del platillo sean válidos para Factus
     */
    public static validarPlatillo(platillo: RestaurantePlatillo): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        if (!platillo.codigo) {
            errors.push('El código del platillo es obligatorio');
        }

        if (!platillo.nombre) {
            errors.push('El nombre del platillo es obligatorio');
        }

        if (!platillo.precio || platillo.precio <= 0) {
            errors.push('El precio debe ser mayor a 0');
        }

        if (!platillo.cantidad || platillo.cantidad <= 0) {
            errors.push('La cantidad debe ser mayor a 0');
        }

        if (platillo.impuestoPorcentaje < 0 || platillo.impuestoPorcentaje > 100) {
            errors.push('El porcentaje de impuesto debe estar entre 0 y 100');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Valida que los datos del pedido sean válidos para Factus
     */
    public static validarPedido(pedido: RestaurantePedido): { isValid: boolean; errors: string[] } {
        const errors: string[] = [];

        // Validar cliente
        const clienteValidation = this.validarCliente(pedido.cliente);
        if (!clienteValidation.isValid) {
            errors.push(...clienteValidation.errors.map(error => `Cliente: ${error}`));
        }

        // Validar platillos
        if (!pedido.platillos || pedido.platillos.length === 0) {
            errors.push('El pedido debe tener al menos un platillo');
        } else {
            pedido.platillos.forEach((platillo, index) => {
                const platilloValidation = this.validarPlatillo(platillo);
                if (!platilloValidation.isValid) {
                    errors.push(...platilloValidation.errors.map(error => `Platillo ${index + 1}: ${error}`));
                }
            });
        }

        // Validar forma de pago
        if (pedido.formaPago === 'credito' && !pedido.fechaVencimiento) {
            errors.push('La fecha de vencimiento es obligatoria para pagos a crédito');
        }

        if (!pedido.numeroReferencia) {
            errors.push('El número de referencia es obligatorio');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Genera un código de referencia único basado en timestamp y datos del pedido
     */
    public static generarCodigoReferencia(pedidoId: string, timestamp?: Date): string {
        const now = timestamp || new Date();
        const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
        const timeStr = now.toTimeString().slice(0, 8).replace(/:/g, '');
        const pedidoShort = pedidoId.slice(-4);

        return `REF${dateStr}${timeStr}${pedidoShort}`;
    }

    /**
     * Calcula el total de la factura incluyendo impuestos, descuentos y propinas
     */
    public static calcularTotalFactura(pedido: RestaurantePedido): {
        subtotal: number;
        impuestos: number;
        descuentos: number;
        propina: number;
        total: number;
    } {
        let subtotal = 0;
        let impuestos = 0;
        let descuentos = 0;

        // Calcular subtotal, impuestos y descuentos por platillo
        pedido.platillos.forEach(platillo => {
            const subtotalPlatillo = platillo.precio * platillo.cantidad;
            const descuentoPlatillo = subtotalPlatillo * (platillo.descuentoPorcentaje || 0) / 100;
            const impuestoPlatillo = (subtotalPlatillo - descuentoPlatillo) * platillo.impuestoPorcentaje / 100;

            subtotal += subtotalPlatillo;
            descuentos += descuentoPlatillo;
            impuestos += impuestoPlatillo;
        });

        // Agregar descuento general
        if (pedido.descuento) {
            descuentos += pedido.descuento;
        }

        const propina = pedido.propina || 0;
        const total = subtotal - descuentos + impuestos + propina;

        return {
            subtotal,
            impuestos,
            descuentos,
            propina,
            total
        };
    }
}
