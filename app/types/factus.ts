/**
 * Tipos TypeScript para la integración con la API de Factus
 * Sistema de facturación electrónica válida en Colombia
 */

// ===== TIPOS DE AUTENTICACIÓN =====

export interface FactusAuthCredentials {
    client_id: string;
    client_secret: string;
    username: string;
    password: string;
    grant_type?: 'password' | 'refresh_token';
}

export interface FactusTokenResponse {
    token_type: 'Bearer';
    expires_in: number;
    access_token: string;
    refresh_token: string;
}

export interface FactusRefreshTokenRequest {
    grant_type: 'refresh_token';
    client_id: string;
    client_secret: string;
    refresh_token: string;
}

// ===== TIPOS DE CLIENTE =====

export interface FactusCustomer {
    identification_document_id: number;
    identification: string;
    dv?: string; // Dígito de verificación para NIT
    company?: string; // Razón social para persona jurídica
    trade_name?: string; // Nombre comercial
    names?: string; // Nombre para persona natural
    address?: string;
    email?: string;
    phone?: string;
    legal_organization_id: number;
    tribute_id: number;
    municipality_id?: number; // Solo para Colombia
}

// ===== TIPOS DE ESTABLECIMIENTO =====

export interface FactusEstablishment {
    name: string;
    address: string;
    phone_number: string;
    email: string;
    municipality_id: number;
}

// ===== TIPOS DE ITEMS/PRODUCTOS =====

export interface FactusWithholdingTax {
    code: string;
    withholding_tax_rate: string;
}

export interface FactusMandate {
    identification_document_id: number;
    identification: string;
}

export interface FactusItem {
    scheme_id?: string; // 0: ingreso propio, 1: ingresos para terceros
    note?: string;
    code_reference: string;
    name: string;
    quantity: number;
    discount_rate: number;
    price: number;
    tax_rate: string;
    unit_measure_id: number;
    standard_code_id: number;
    is_excluded: 0 | 1; // 0: no excluido de IVA, 1: excluido de IVA
    tribute_id: number;
    withholding_taxes?: FactusWithholdingTax[];
    mandate?: FactusMandate;
}

// ===== TIPOS DE DESCUENTOS Y RECARGOS =====

export interface FactusAllowanceCharge {
    concept_type: string;
    is_surcharge: boolean; // true: recargo, false: descuento
    reason: string;
    base_amount: string;
    amount: string;
}

// ===== TIPOS DE REFERENCIAS =====

export interface FactusOrderReference {
    reference_code: string;
    issue_date?: string;
}

export interface FactusBillingPeriod {
    start_date: string;
    start_time?: string;
    end_date: string;
    end_time?: string;
}

export interface FactusRelatedDocument {
    code: string;
    issue_date: string;
    number: string;
}

// ===== TIPOS DE FACTURA =====

export interface FactusInvoiceRequest {
    document?: '01' | '03'; // 01: Factura electrónica, 03: Instrumento electrónico
    numbering_range_id?: number;
    reference_code: string;
    observation?: string;
    payment_form?: string; // 1: contado, 2: crédito
    payment_due_date?: string; // Requerido si payment_form = 2
    payment_method_code?: string; // 10: efectivo por defecto
    operation_type?: number; // 10: estándar por defecto
    send_email?: boolean; // true por defecto
    order_reference?: FactusOrderReference;
    billing_period?: FactusBillingPeriod;
    establishment?: FactusEstablishment;
    customer: FactusCustomer;
    items: FactusItem[];
    allowance_charges?: FactusAllowanceCharge[];
    related_documents?: FactusRelatedDocument[];
}

// ===== TIPOS DE RESPUESTA =====

export interface FactusCompany {
    url_logo: string;
    nit: string;
    dv: string;
    company: string;
    name: string;
    graphic_representation_name: string;
    registration_code: string;
    economic_activity: string;
    phone: string;
    email: string;
    direction: string;
    municipality: string;
}

export interface FactusMunicipality {
    id: number;
    code: string;
    name: string;
    department?: {
        id: number;
        code: string;
        name: string;
    };
}

export interface FactusLegalOrganization {
    id: number;
    code: string;
    name: string;
}

export interface FactusTribute {
    id: number;
    code: string;
    name: string;
}

export interface FactusNumberingRange {
    prefix: string;
    from: number;
    to: number;
    resolution_number: string;
    start_date: string;
    end_date: string;
    months: number;
}

export interface FactusDocument {
    code: string;
    name: string;
}

export interface FactusOperationTypeInfo {
    code: string;
    name: string;
}

export interface FactusPaymentFormInfo {
    code: string;
    name: string;
}

export interface FactusPaymentMethodInfo {
    code: string;
    name: string;
}

export interface FactusUnitMeasureInfo {
    id: number;
    code: string;
    name: string;
}

export interface FactusStandardCodeInfo {
    id: number;
    code: string;
    name: string;
}

export interface FactusWithholdingTaxRate {
    code: string;
    name: string;
    rate: string;
}

export interface FactusWithholdingTaxDetail {
    tribute_code: string;
    name: string;
    value: string;
    rates: FactusWithholdingTaxRate[];
}

export interface FactusItemResponse {
    scheme_id: string | null;
    note: string | null;
    code_reference: string;
    name: string;
    quantity: number;
    discount_rate: string;
    discount: string;
    gross_value: string;
    tax_rate: string;
    taxable_amount: string;
    tax_amount: string;
    price: string;
    is_excluded: number;
    unit_measure: FactusUnitMeasure;
    standard_code: FactusStandardCode;
    tribute: FactusTribute;
    total: number;
    withholding_taxes: FactusWithholdingTaxDetail[];
    mandate: FactusMandate | null;
}

export interface FactusBill {
    id: number;
    document: FactusDocument;
    operation_type: FactusOperationType;
    order_reference: FactusOrderReference | null;
    number: string;
    reference_code: string;
    status: number;
    send_email: number;
    qr: string;
    cufe: string;
    validated: string;
    discount_rate: string;
    discount: string;
    gross_value: string;
    taxable_amount: string;
    tax_amount: string;
    total: string;
    observation: string | null;
    errors: Record<string, unknown>[];
    created_at: string;
    payment_due_date: string | null;
    qr_image: string;
    has_claim: number;
    is_negotiable_instrument: number;
    payment_form: FactusPaymentForm;
    payment_method: FactusPaymentMethod;
}

export interface FactusInvoiceResponse {
    status: 'Created' | 'OK' | 'Error';
    message: string;
    data: {
        company: FactusCompany;
        establishment: {
            name: string;
            address: string;
            phone_number: string;
            email: string;
            municipality: FactusMunicipality;
        };
        customer: {
            identification: string;
            dv: string | null;
            graphic_representation_name: string;
            trade_name: string;
            company: string;
            names: string;
            address: string;
            email: string;
            phone: string;
            legal_organization: FactusLegalOrganization;
            tribute: FactusTribute;
            municipality: FactusMunicipality;
        };
        numbering_range: FactusNumberingRange;
        billing_period: Record<string, unknown>[];
        bill: FactusBill;
        related_documents: Record<string, unknown>[];
        items: FactusItemResponse[];
        withholding_taxes: FactusWithholdingTaxDetail[];
        credit_notes: Record<string, unknown>[];
        debit_notes: Record<string, unknown>[];
    };
}

// ===== TIPOS DE RANGOS DE NUMERACIÓN =====

export interface FactusNumberingRangeRequest {
    document: number; // 21: Factura de Venta, 22: Nota Crédito, etc.
    prefix: string;
    from: number;
    to: number;
    current: number;
    resolution_number: string;
    start_date: string;
    end_date: string;
    technical_key: string;
}

export interface FactusNumberingRangeResponse {
    id: number;
    document: string;
    document_name: string;
    prefix: string;
    from: number;
    to: number;
    current: number;
    resolution_number: string;
    start_date: string;
    end_date: string;
    technical_key: string;
    is_expired: boolean;
    is_active: number;
    created_at: string;
    updated_at: string;
}

// ===== TIPOS DE ERRORES =====

export interface FactusError {
    status: 'Error';
    message: string;
    errors?: {
        field: string;
        message: string;
    }[];
}

// ===== TIPOS DE CONFIGURACIÓN =====

export interface FactusConfig {
    apiUrl: string;
    credentials: FactusAuthCredentials;
    defaultNumberingRangeId?: number;
    defaultPaymentMethod: string;
    defaultPaymentForm: string;
    defaultOperationType: number;
    sendEmailByDefault: boolean;
}

// ===== TIPOS DE UTILIDADES =====

export interface FactusValidationResult {
    isValid: boolean;
    errors: string[];
    warnings: string[];
}

export interface FactusInvoiceSummary {
    id?: string;
    referenceCode: string;
    invoiceNumber: string;
    total: number;
    status: string;
    cufe: string;
    qrUrl: string;
    createdAt: string;
}

// ===== ENUMS Y CONSTANTES =====

export enum FactusDocumentType {
    FACTURA_ELECTRONICA = '01',
    INSTRUMENTO_ELECTRONICO = '03'
}

export enum FactusPaymentForm {
    CONTADO = '1',
    CREDITO = '2'
}

export enum FactusPaymentMethod {
    EFECTIVO = '10',
    TARJETA_CREDITO = '20',
    TARJETA_DEBITO = '21',
    TRANSFERENCIA = '31',
    CHEQUE = '32'
}

export enum FactusOperationType {
    ESTANDAR = 10,
    MANDATOS = 11
}

export enum FactusLegalOrganizationType {
    PERSONA_NATURAL = 2,
    PERSONA_JURIDICA = 1
}

export enum FactusTributeType {
    IVA = 1,
    NO_APLICA = 21
}

export enum FactusIdentificationDocument {
    CEDULA_CIUDADANIA = 3,
    NIT = 6,
    CEDULA_EXTRANJERIA = 4,
    PASAPORTE = 5
}

export enum FactusUnitMeasure {
    UNIDAD = 70,
    KILOGRAMO = 1,
    LITRO = 2,
    METRO = 3
}

export enum FactusStandardCode {
    ESTANDAR_CONTRIBUYENTE = 1,
    GTIN = 2,
    EAN = 3
}
