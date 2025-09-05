// Datos de ejemplo para poblar el sistema de restaurante
// Este archivo contiene datos de prueba para demostrar el dashboard

const sampleData = {
    // Categorías del menú
    categories: [
        { id: "1", name: "Entradas", description: "Aperitivos y entradas" },
        { id: "2", name: "Platos Principales", description: "Platos principales del menú" },
        { id: "3", name: "Postres", description: "Postres y dulces" },
        { id: "4", name: "Bebidas", description: "Bebidas y refrescos" }
    ],

    // Elementos del menú
    menuItems: [
        {
            id: "1",
            name: "Ensalada César",
            description: "Lechuga romana, crutones, queso parmesano y aderezo césar",
            price: 12.99,
            category_id: "1",
            category_name: "Entradas",
            available: true,
            featured: true,
            allergens: ["lácteos", "gluten"]
        },
        {
            id: "2",
            name: "Pasta Carbonara",
            description: "Pasta con salsa carbonara, panceta y queso parmesano",
            price: 18.50,
            category_id: "2",
            category_name: "Platos Principales",
            available: true,
            featured: false,
            allergens: ["huevos", "lácteos", "gluten"]
        },
        {
            id: "3",
            name: "Tiramisú",
            description: "Postre italiano con café y mascarpone",
            price: 8.99,
            category_id: "3",
            category_name: "Postres",
            available: true,
            featured: true,
            allergens: ["huevos", "lácteos", "gluten"]
        },
        {
            id: "4",
            name: "Limonada Natural",
            description: "Limonada fresca con hielo",
            price: 4.50,
            category_id: "4",
            category_name: "Bebidas",
            available: true,
            featured: false,
            allergens: []
        }
    ],

    // Clientes
    customers: [
        {
            id: "1",
            first_name: "Juan",
            last_name: "Pérez",
            email: "juan.perez@email.com",
            phone: "+1234567890",
            is_vip: true,
            created_at: "2024-01-15T10:30:00Z"
        },
        {
            id: "2",
            first_name: "María",
            last_name: "García",
            email: "maria.garcia@email.com",
            phone: "+1234567891",
            is_vip: false,
            created_at: "2024-01-20T14:15:00Z"
        },
        {
            id: "3",
            first_name: "Carlos",
            last_name: "López",
            email: "carlos.lopez@email.com",
            phone: "+1234567892",
            is_vip: true,
            created_at: "2024-01-25T09:45:00Z"
        }
    ],

    // Mesas
    tables: [
        {
            id: "1",
            number: 1,
            capacity: 4,
            status: "available",
            zone: "Terraza",
            created_at: "2024-01-01T00:00:00Z"
        },
        {
            id: "2",
            number: 2,
            capacity: 2,
            status: "occupied",
            zone: "Interior",
            created_at: "2024-01-01T00:00:00Z"
        },
        {
            id: "3",
            number: 3,
            capacity: 6,
            status: "reserved",
            zone: "VIP",
            created_at: "2024-01-01T00:00:00Z"
        },
        {
            id: "4",
            number: 4,
            capacity: 4,
            status: "available",
            zone: "Interior",
            created_at: "2024-01-01T00:00:00Z"
        }
    ],

    // Pedidos
    orders: [
        {
            id: "1",
            order_number: "ORD-001",
            customer_id: "1",
            customer_name: "Juan Pérez",
            table_id: "1",
            table_number: 1,
            status: "preparing",
            order_type: "dine_in",
            total: 45.98,
            created_at: "2024-01-30T12:30:00Z",
            items: [
                { name: "Ensalada César", quantity: 1, price: 12.99 },
                { name: "Pasta Carbonara", quantity: 1, price: 18.50 },
                { name: "Limonada Natural", quantity: 2, price: 4.50 }
            ]
        },
        {
            id: "2",
            order_number: "ORD-002",
            customer_id: "2",
            customer_name: "María García",
            table_id: "2",
            table_number: 2,
            status: "ready",
            order_type: "dine_in",
            total: 27.48,
            created_at: "2024-01-30T13:15:00Z",
            items: [
                { name: "Ensalada César", quantity: 1, price: 12.99 },
                { name: "Tiramisú", quantity: 1, price: 8.99 },
                { name: "Limonada Natural", quantity: 1, price: 4.50 }
            ]
        }
    ],

    // Inventario
    inventoryItems: [
        {
            id: "1",
            name: "Lechuga Romana",
            category: "Vegetales",
            current_stock: 15,
            minimum_stock: 10,
            unit: "kg",
            cost_per_unit: 2.50,
            supplier: "Frutas Frescas S.A."
        },
        {
            id: "2",
            name: "Pasta Spaghetti",
            category: "Pasta",
            current_stock: 5,
            minimum_stock: 8,
            unit: "kg",
            cost_per_unit: 3.20,
            supplier: "Importaciones Italianas"
        },
        {
            id: "3",
            name: "Queso Parmesano",
            category: "Lácteos",
            current_stock: 12,
            minimum_stock: 15,
            unit: "kg",
            cost_per_unit: 15.00,
            supplier: "Lácteos Premium"
        },
        {
            id: "4",
            name: "Tomates",
            category: "Vegetales",
            current_stock: 3,
            minimum_stock: 10,
            unit: "kg",
            cost_per_unit: 1.80,
            supplier: "Huerta Local"
        }
    ],

    // Facturas
    invoices: [
        {
            id: "1",
            invoice_number: "INV-001",
            customer_id: "1",
            customer_name: "Juan Pérez",
            order_id: "1",
            total: 45.98,
            payment_status: "paid",
            payment_method: "credit_card",
            created_at: "2024-01-30T12:30:00Z",
            paid_at: "2024-01-30T12:35:00Z"
        },
        {
            id: "2",
            invoice_number: "INV-002",
            customer_id: "2",
            customer_name: "María García",
            order_id: "2",
            total: 27.48,
            payment_status: "pending",
            payment_method: "cash",
            created_at: "2024-01-30T13:15:00Z"
        }
    ],

    // Estadísticas de facturación
    billingStats: {
        total_revenue: 1250.50,
        pending_payments: 150.25,
        paid_invoices: 45,
        pending_invoices: 3,
        average_invoice_amount: 27.79,
        payment_methods: {
            credit_card: 60,
            cash: 25,
            debit_card: 15
        }
    }
};

// Función para poblar el sistema con datos de ejemplo
async function populateSystemWithSampleData() {
    try {
        console.log('Poblando sistema con datos de ejemplo...');

        // Crear categorías
        for (const category of sampleData.categories) {
            try {
                await fetch('/api/v1/menu/categories', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(category)
                });
            } catch (error) {
                console.log('Categoría ya existe o error:', error);
            }
        }

        // Crear elementos del menú
        for (const item of sampleData.menuItems) {
            try {
                await fetch('/api/v1/menu/items', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
            } catch (error) {
                console.log('Elemento del menú ya existe o error:', error);
            }
        }

        // Crear clientes
        for (const customer of sampleData.customers) {
            try {
                await fetch('/api/v1/customers/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(customer)
                });
            } catch (error) {
                console.log('Cliente ya existe o error:', error);
            }
        }

        // Crear mesas
        for (const table of sampleData.tables) {
            try {
                await fetch('/api/v1/tables/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(table)
                });
            } catch (error) {
                console.log('Mesa ya existe o error:', error);
            }
        }

        // Crear elementos de inventario
        for (const item of sampleData.inventoryItems) {
            try {
                await fetch('/api/v1/inventory/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(item)
                });
            } catch (error) {
                console.log('Elemento de inventario ya existe o error:', error);
            }
        }

        console.log('Sistema poblado exitosamente con datos de ejemplo');
        return true;
    } catch (error) {
        console.error('Error poblando el sistema:', error);
        return false;
    }
}

// Función para obtener datos de ejemplo (para cuando la API no esté disponible)
function getSampleData(type) {
    return sampleData[type] || [];
}

// Exportar para uso global
window.sampleData = sampleData;
window.populateSystemWithSampleData = populateSystemWithSampleData;
window.getSampleData = getSampleData;
