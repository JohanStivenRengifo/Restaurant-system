/**
 * Servicio principal para generar facturas electrónicas con Factus API
 * Implementa el patrón Builder para construir facturas complejas
 */

import {
    FactusInvoiceRequest,
    FactusInvoiceResponse,
    FactusCustomer,
    FactusItem,
    FactusAllowanceCharge,
    FactusEstablishment,
    FactusOrderReference,
    FactusBillingPeriod,
    FactusInvoiceSummary,
    FactusValidationResult,
    FactusNumberingRangeResponse,
    FactusError,
    FactusDocumentType,
    FactusPaymentForm,
    FactusPaymentMethod,
    FactusOperationType,
    FactusLegalOrganizationType,
    FactusTributeType,
    FactusIdentificationDocument,
    FactusUnitMeasure,
    FactusStandardCode
} from '../../types/factus';
import { FactusAuthService } from './FactusAuthService';

export class FactusInvoiceService {
    private authService: FactusAuthService;
    private apiUrl: string;

    constructor(authService: FactusAuthService, apiUrl: string) {
        this.authService = authService;
        this.apiUrl = apiUrl;
    }

    /**
     * Crea una nueva factura electrónica
     */
    public async createInvoice(invoiceRequest: FactusInvoiceRequest): Promise<FactusInvoiceResponse> {
        try {
            const accessToken = await this.authService.getValidAccessToken();

            const response = await fetch(`${this.apiUrl}/v1/bills/validate`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(invoiceRequest)
            });

            const responseData = await response.json();

            if (!response.ok) {
                const error: FactusError = responseData;
                throw new Error(`Error creando factura: ${error.message}`);
            }

            console.log('✅ Factura creada exitosamente:', responseData.data?.bill?.number);
            return responseData as FactusInvoiceResponse;

        } catch (error) {
            console.error('❌ Error creando factura:', error);
            throw new Error(`Error creando factura: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * Valida una factura sin crearla
     */
    public async validateInvoice(invoiceRequest: FactusInvoiceRequest): Promise<FactusValidationResult> {
        try {
            const accessToken = await this.authService.getValidAccessToken();

            const response = await fetch(`${this.apiUrl}/v1/bills/validate`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
                body: JSON.stringify(invoiceRequest)
            });

            const responseData = await response.json();

            if (response.ok) {
                return {
                    isValid: true,
                    errors: [],
                    warnings: []
                };
            } else {
                const error: FactusError = responseData;
                return {
                    isValid: false,
                    errors: [error.message],
                    warnings: []
                };
            }

        } catch (error) {
            return {
                isValid: false,
                errors: [error instanceof Error ? error.message : 'Error desconocido'],
                warnings: []
            };
        }
    }

    /**
     * Obtiene los rangos de numeración disponibles
     */
    public async getNumberingRanges(): Promise<FactusNumberingRangeResponse[]> {
        try {
            const accessToken = await this.authService.getValidAccessToken();

            const response = await fetch(`${this.apiUrl}/v1/numbering-ranges`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Error obteniendo rangos: ${response.status} - ${errorData.message || 'Error desconocido'}`);
            }

            const responseData = await response.json();
            return responseData.data || [];

        } catch (error) {
            console.error('❌ Error obteniendo rangos de numeración:', error);
            throw new Error(`Error obteniendo rangos: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * Obtiene un rango de numeración específico
     */
    public async getNumberingRange(rangeId: number): Promise<FactusNumberingRangeResponse> {
        try {
            const accessToken = await this.authService.getValidAccessToken();

            const response = await fetch(`${this.apiUrl}/v1/numbering-ranges/${rangeId}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Error obteniendo rango: ${response.status} - ${errorData.message || 'Error desconocido'}`);
            }

            const responseData = await response.json();
            return responseData.data;

        } catch (error) {
            console.error('❌ Error obteniendo rango de numeración:', error);
            throw new Error(`Error obteniendo rango: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * Obtiene información de una factura por su número
     */
    public async getInvoiceByNumber(invoiceNumber: string): Promise<FactusInvoiceResponse> {
        try {
            const accessToken = await this.authService.getValidAccessToken();

            const response = await fetch(`${this.apiUrl}/v1/bills/${invoiceNumber}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Error obteniendo factura: ${response.status} - ${errorData.message || 'Error desconocido'}`);
            }

            const responseData = await response.json();
            return responseData;

        } catch (error) {
            console.error('❌ Error obteniendo factura:', error);
            throw new Error(`Error obteniendo factura: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * Lista todas las facturas con paginación
     */
    public async listInvoices(page: number = 1, limit: number = 20): Promise<{
        invoices: FactusInvoiceSummary[];
        total: number;
        page: number;
        limit: number;
    }> {
        try {
            const accessToken = await this.authService.getValidAccessToken();

            const response = await fetch(`${this.apiUrl}/v1/bills?page=${page}&limit=${limit}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Error listando facturas: ${response.status} - ${errorData.message || 'Error desconocido'}`);
            }

            const responseData = await response.json();

            const invoices: FactusInvoiceSummary[] = (responseData.data || []).map((invoice: any) => ({
                referenceCode: invoice.reference_code,
                invoiceNumber: invoice.number,
                total: parseFloat(invoice.total),
                status: invoice.status === 1 ? 'Validada' : 'Pendiente',
                cufe: invoice.cufe,
                qrUrl: invoice.qr,
                createdAt: invoice.created_at
            }));

            return {
                invoices,
                total: responseData.total || 0,
                page,
                limit
            };

        } catch (error) {
            console.error('❌ Error listando facturas:', error);
            throw new Error(`Error listando facturas: ${error instanceof Error ? error.message : 'Error desconocido'}`);
        }
    }

    /**
     * Genera un resumen de factura para mostrar en la UI
     */
    public generateInvoiceSummary(invoiceResponse: FactusInvoiceResponse): FactusInvoiceSummary {
        const bill = invoiceResponse.data.bill;
        return {
            referenceCode: bill.reference_code,
            invoiceNumber: bill.number,
            total: parseFloat(bill.total),
            status: bill.status === 1 ? 'Validada' : 'Pendiente',
            cufe: bill.cufe,
            qrUrl: bill.qr,
            createdAt: bill.created_at
        };
    }

    /**
     * Obtiene el PDF de una factura electrónica
     */
    public async getInvoicePDF(invoiceNumber: string): Promise<Buffer | null> {
        try {
            const accessToken = await this.authService.getValidAccessToken();

            const response = await fetch(`${this.apiUrl}/v1/bills/download-pdf/${invoiceNumber}`, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                }
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return null; // PDF no disponible
                }
                const errorData = await response.json().catch(() => ({}));
                throw new Error(`Error obteniendo PDF: ${response.status} - ${errorData.message || 'Error desconocido'}`);
            }

            // La API devuelve el PDF en base64
            const data = await response.json();

            if (data.status === 'OK' && data.data?.pdf_base_64_encoded) {
                // Decodificar base64 a Buffer
                const pdfBuffer = Buffer.from(data.data.pdf_base_64_encoded, 'base64');
                return pdfBuffer;
            }

            return null;

        } catch (error) {
            console.error('Error obteniendo PDF de factura:', error);
            throw error;
        }
    }

    /**
     * Valida los datos de una factura antes de enviarla
     */
    public validateInvoiceData(invoiceRequest: FactusInvoiceRequest): FactusValidationResult {
        const errors: string[] = [];
        const warnings: string[] = [];

        // Validaciones obligatorias
        if (!invoiceRequest.reference_code) {
            errors.push('El código de referencia es obligatorio');
        }

        if (!invoiceRequest.customer) {
            errors.push('Los datos del cliente son obligatorios');
        } else {
            if (!invoiceRequest.customer.identification) {
                errors.push('La identificación del cliente es obligatoria');
            }
            if (!invoiceRequest.customer.legal_organization_id) {
                errors.push('El tipo de organización del cliente es obligatorio');
            }
            if (!invoiceRequest.customer.tribute_id) {
                errors.push('El tributo del cliente es obligatorio');
            }
        }

        if (!invoiceRequest.items || invoiceRequest.items.length === 0) {
            errors.push('Debe incluir al menos un item en la factura');
        } else {
            invoiceRequest.items.forEach((item, index) => {
                if (!item.code_reference) {
                    errors.push(`El código de referencia del item ${index + 1} es obligatorio`);
                }
                if (!item.name) {
                    errors.push(`El nombre del item ${index + 1} es obligatorio`);
                }
                if (!item.quantity || item.quantity <= 0) {
                    errors.push(`La cantidad del item ${index + 1} debe ser mayor a 0`);
                }
                if (!item.price || item.price <= 0) {
                    errors.push(`El precio del item ${index + 1} debe ser mayor a 0`);
                }
            });
        }

        // Validaciones de forma de pago
        if (invoiceRequest.payment_form === '2' && !invoiceRequest.payment_due_date) {
            errors.push('La fecha de vencimiento es obligatoria para pagos a crédito');
        }

        // Advertencias
        if (invoiceRequest.customer && !invoiceRequest.customer.email) {
            warnings.push('Se recomienda incluir el email del cliente para envío de la factura');
        }

        if (invoiceRequest.customer && !invoiceRequest.customer.address) {
            warnings.push('Se recomienda incluir la dirección del cliente');
        }

        return {
            isValid: errors.length === 0,
            errors,
            warnings
        };
    }
}

/**
 * Builder para construir facturas electrónicas paso a paso
 * Implementa el patrón Builder
 */
export class FactusInvoiceBuilder {
    private invoiceRequest: Partial<FactusInvoiceRequest> = {};

    constructor() {
        // Valores por defecto
        this.invoiceRequest.document = '01'; // FactusDocumentType.FACTURA_ELECTRONICA
        this.invoiceRequest.payment_form = '1';
        this.invoiceRequest.payment_method_code = '10'; // FactusPaymentMethod.EFECTIVO
        this.invoiceRequest.operation_type = 10; // FactusOperationType.ESTANDAR
        this.invoiceRequest.send_email = true;
        this.invoiceRequest.items = [];
    }

    /**
     * Establece el código de referencia único
     */
    public setReferenceCode(referenceCode: string): FactusInvoiceBuilder {
        this.invoiceRequest.reference_code = referenceCode;
        return this;
    }

    /**
     * Establece el ID del rango de numeración
     */
    public setNumberingRange(rangeId: number): FactusInvoiceBuilder {
        this.invoiceRequest.numbering_range_id = rangeId;
        return this;
    }

    /**
     * Establece observaciones
     */
    public setObservation(observation: string): FactusInvoiceBuilder {
        this.invoiceRequest.observation = observation;
        return this;
    }

    /**
     * Establece la forma de pago
     */
    public setPaymentForm(paymentForm: string): FactusInvoiceBuilder {
        this.invoiceRequest.payment_form = paymentForm;
        return this;
    }

    /**
     * Establece el método de pago
     */
    public setPaymentMethod(paymentMethod: string): FactusInvoiceBuilder {
        this.invoiceRequest.payment_method_code = paymentMethod;
        return this;
    }

    /**
     * Establece la fecha de vencimiento (para pagos a crédito)
     */
    public setPaymentDueDate(dueDate: string): FactusInvoiceBuilder {
        this.invoiceRequest.payment_due_date = dueDate;
        return this;
    }

    /**
     * Establece si se debe enviar email
     */
    public setSendEmail(sendEmail: boolean): FactusInvoiceBuilder {
        this.invoiceRequest.send_email = sendEmail;
        return this;
    }

    /**
     * Establece los datos del cliente
     */
    public setCustomer(customer: FactusCustomer): FactusInvoiceBuilder {
        this.invoiceRequest.customer = customer;
        return this;
    }

    /**
     * Establece los datos del establecimiento
     */
    public setEstablishment(establishment: FactusEstablishment): FactusInvoiceBuilder {
        this.invoiceRequest.establishment = establishment;
        return this;
    }

    /**
     * Agrega un item a la factura
     */
    public addItem(item: FactusItem): FactusInvoiceBuilder {
        if (!this.invoiceRequest.items) {
            this.invoiceRequest.items = [];
        }
        this.invoiceRequest.items.push(item);
        return this;
    }

    /**
     * Agrega múltiples items a la factura
     */
    public addItems(items: FactusItem[]): FactusInvoiceBuilder {
        if (!this.invoiceRequest.items) {
            this.invoiceRequest.items = [];
        }
        this.invoiceRequest.items.push(...items);
        return this;
    }

    /**
     * Agrega un descuento o recargo
     */
    public addAllowanceCharge(allowanceCharge: FactusAllowanceCharge): FactusInvoiceBuilder {
        if (!this.invoiceRequest.allowance_charges) {
            this.invoiceRequest.allowance_charges = [];
        }
        this.invoiceRequest.allowance_charges.push(allowanceCharge);
        return this;
    }

    /**
     * Establece la referencia de orden
     */
    public setOrderReference(orderReference: FactusOrderReference): FactusInvoiceBuilder {
        this.invoiceRequest.order_reference = orderReference;
        return this;
    }

    /**
     * Establece el período de facturación
     */
    public setBillingPeriod(billingPeriod: FactusBillingPeriod): FactusInvoiceBuilder {
        this.invoiceRequest.billing_period = billingPeriod;
        return this;
    }

    /**
     * Construye la factura final
     */
    public build(): FactusInvoiceRequest {
        if (!this.invoiceRequest.reference_code) {
            throw new Error('El código de referencia es obligatorio');
        }
        if (!this.invoiceRequest.customer) {
            throw new Error('Los datos del cliente son obligatorios');
        }
        if (!this.invoiceRequest.items || this.invoiceRequest.items.length === 0) {
            throw new Error('Debe incluir al menos un item');
        }

        return this.invoiceRequest as FactusInvoiceRequest;
    }

    /**
     * Resetea el builder para construir una nueva factura
     */
    public reset(): FactusInvoiceBuilder {
        this.invoiceRequest = {
            document: '01', // FactusDocumentType.FACTURA_ELECTRONICA
            payment_form: '1',
            payment_method_code: '10', // FactusPaymentMethod.EFECTIVO
            operation_type: 10, // FactusOperationType.ESTANDAR
            send_email: true,
            items: []
        };
        return this;
    }
}

/**
 * Factory para crear servicios de facturación
 * Implementa el patrón Factory Method
 */
export class FactusInvoiceServiceFactory {
    /**
     * Crea un servicio de facturación para pruebas
     */
    public static createForTesting(): FactusInvoiceService {
        const authService = FactusAuthService.getInstance();
        return new FactusInvoiceService(authService, 'https://api-sandbox.factus.com.co');
    }

    /**
     * Crea un servicio de facturación para producción
     */
    public static createForProduction(): FactusInvoiceService {
        const authService = FactusAuthService.getInstance();
        return new FactusInvoiceService(authService, 'https://api.factus.com.co');
    }

    /**
     * Crea un servicio de facturación con configuración personalizada
     */
    public static createWithConfig(authService: FactusAuthService, apiUrl: string): FactusInvoiceService {
        return new FactusInvoiceService(authService, apiUrl);
    }
}
