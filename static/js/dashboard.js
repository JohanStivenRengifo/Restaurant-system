// Dashboard JavaScript - Sistema de Restaurante
// Funcionalidad completa para interactuar con todas las APIs

// Configuración global
const API_BASE_URL = '/api/v1';
let charts = {};
let currentData = {
    menuItems: [],
    orders: [],
    customers: [],
    tables: [],
    inventoryItems: [],
    invoices: [],
    categories: []
};

// Inicialización del dashboard
document.addEventListener('DOMContentLoaded', function () {
    initializeDashboard();
});

// Función principal de inicialización
async function initializeDashboard() {
    try {
        showLoading();

        // Configurar navegación
        setupNavigation();

        // Cargar datos iniciales
        await loadOverviewData();

        // Configurar fechas por defecto para reportes
        setupDefaultDates();

        hideLoading();
        showToast('Dashboard cargado exitosamente', 'success');
    } catch (error) {
        console.error('Error inicializando dashboard:', error);
        showToast('Error al cargar el dashboard', 'error');
        hideLoading();
    }
}

// Configurar navegación del sidebar
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.section');

    navItems.forEach(item => {
        item.addEventListener('click', () => {
            const targetSection = item.dataset.section;

            // Actualizar navegación activa
            navItems.forEach(nav => nav.classList.remove('active'));
            item.classList.add('active');

            // Mostrar sección correspondiente
            sections.forEach(section => section.classList.remove('active'));
            document.getElementById(targetSection).classList.add('active');

            // Cargar datos de la sección si es necesario
            loadSectionData(targetSection);
        });
    });
}

// Cargar datos según la sección
async function loadSectionData(section) {
    switch (section) {
        case 'overview':
            await loadOverviewData();
            break;
        case 'menu':
            await loadMenuItems();
            await loadCategories();
            break;
        case 'orders':
            await loadOrders();
            break;
        case 'customers':
            await loadCustomers();
            break;
        case 'tables':
            await loadTables();
            break;
        case 'inventory':
            await loadInventoryItems();
            break;
        case 'billing':
            await loadInvoices();
            await loadBillingStats();
            break;
        case 'reports':
            // Los reportes se cargan bajo demanda
            break;
    }
}

// ==================== FUNCIONES DE API ====================

// Función genérica para hacer peticiones HTTP
async function apiRequest(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    const config = { ...defaultOptions, ...options };

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            let errorData = {};
            try {
                errorData = await response.json();
            } catch (jsonError) {
                console.warn('No se pudo parsear respuesta de error como JSON:', jsonError);
            }
            throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
        }

        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            return await response.json();
        } else {
            const text = await response.text();
            // Para respuestas DELETE exitosas sin contenido, devolver un objeto vacío
            if (response.status === 204 || text === '') {
                return {};
            }
            console.warn('Respuesta no es JSON:', text);
            return text;
        }
    } catch (error) {
        console.error(`Error en API ${endpoint}:`, error);
        throw error;
    }
}

// ==================== FUNCIONES DE RESUMEN ====================

async function loadOverviewData() {
    try {
        // Intentar cargar datos reales primero
        let menuData = { data: [] };
        let ordersData = [];
        let customersData = [];
        let tablesData = [];

        try {
            const [menuItems, orders, customers, tables] = await Promise.allSettled([
                apiRequest('/menu/items?limit=100'),
                apiRequest('/orders/'),
                apiRequest('/customers/'),
                apiRequest('/tables/')
            ]);

            menuData = menuItems.status === 'fulfilled' ? menuItems.value : { data: [] };
            ordersData = orders.status === 'fulfilled' ? orders.value : [];
            customersData = customers.status === 'fulfilled' ? customers.value : [];
            tablesData = tables.status === 'fulfilled' ? tables.value : [];

        } catch (apiError) {
            console.log('APIs no disponibles, usando datos de prueba');
            // Si las APIs fallan, usar datos de prueba
            try {
                const testData = await apiRequest('/api/v1/test-data');
                menuData = { data: testData.menu_items || [] };
                ordersData = testData.orders || [];
                customersData = testData.customers || [];
                tablesData = testData.tables || [];
            } catch (testError) {
                console.log('Usando datos de ejemplo locales');
                // Usar datos de ejemplo locales como último recurso
                menuData = { data: getSampleData('menuItems') };
                ordersData = getSampleData('orders');
                customersData = getSampleData('customers');
                tablesData = getSampleData('tables');
            }
        }

        // Actualizar contadores
        updateOverviewStats(menuData, ordersData, customersData, tablesData);

        // Crear gráficos
        createOverviewCharts(ordersData, menuData);

    } catch (error) {
        console.error('Error cargando datos de resumen:', error);
        showToast('Error al cargar datos de resumen', 'error');
    }
}

function updateOverviewStats(menuItems, orders, customers, tables) {
    document.getElementById('total-menu-items').textContent = menuItems.data?.length || 0;
    document.getElementById('total-orders').textContent = orders.filter(o => ['pending', 'confirmed', 'preparing'].includes(o.status)).length;
    document.getElementById('total-customers').textContent = customers.length;
    document.getElementById('available-tables').textContent = tables.filter(t => t.status === 'available').length;
}

function createOverviewCharts(orders, menuItems) {
    // Gráfico de ventas por día
    const salesCtx = document.getElementById('salesChart');
    if (salesCtx && !charts.sales) {
        charts.sales = new Chart(salesCtx, {
            type: 'line',
            data: {
                labels: generateLast7Days(),
                datasets: [{
                    label: 'Ventas ($)',
                    data: generateSalesData(orders),
                    borderColor: '#2563eb',
                    backgroundColor: 'rgba(37, 99, 235, 0.1)',
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    // Gráfico de elementos populares
    const popularCtx = document.getElementById('popularItemsChart');
    if (popularCtx && !charts.popular) {
        charts.popular = new Chart(popularCtx, {
            type: 'doughnut',
            data: {
                labels: ['Entradas', 'Platos Principales', 'Postres', 'Bebidas'],
                datasets: [{
                    data: [25, 40, 20, 15],
                    backgroundColor: ['#2563eb', '#10b981', '#f59e0b', '#ef4444']
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }
}

// ==================== FUNCIONES DEL MENÚ ====================

// Función para refrescar datos cuando hay inconsistencias
function refreshMenuData() {
    console.log('Refrescando datos del menú...');
    loadMenuItems();
    loadCategories();
}

async function loadMenuItems() {
    try {
        showLoading();
        const response = await apiRequest('/menu/items?limit=100');
        console.log('Respuesta del menú:', response); // Debug

        // Manejar diferentes estructuras de respuesta
        if (response && typeof response === 'object') {
            if (response.items && Array.isArray(response.items)) {
                // Estructura PaginatedResponse
                currentData.menuItems = response.items;
            } else if (response.data && Array.isArray(response.data)) {
                // Estructura con data
                currentData.menuItems = response.data;
            } else if (Array.isArray(response)) {
                // Array directo
                currentData.menuItems = response;
            } else {
                currentData.menuItems = [];
            }
        } else {
            currentData.menuItems = [];
        }

        console.log('Elementos del menú cargados:', currentData.menuItems); // Debug
        renderMenuItems(currentData.menuItems);
        hideLoading();
    } catch (error) {
        console.error('Error cargando elementos del menú:', error);
        showToast('Error al cargar elementos del menú', 'error');
        currentData.menuItems = [];
        renderMenuItems([]);
        hideLoading();
    }
}

async function loadCategories() {
    try {
        const categories = await apiRequest('/menu/categories');
        currentData.categories = categories;

        // Crear un mapa de categorías para búsqueda rápida
        currentData.categoryMap = {};
        if (Array.isArray(categories)) {
            categories.forEach(cat => {
                currentData.categoryMap[cat.id] = cat.name;
            });
        }
        populateCategoryFilter(categories);
    } catch (error) {
        console.error('Error cargando categorías:', error);
    }
}

function renderMenuItems(items) {
    const tbody = document.getElementById('menu-items-table');
    if (!tbody) return;

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay elementos del menú</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => {
        const categoryName = item.category_id && currentData.categoryMap
            ? currentData.categoryMap[item.category_id]
            : 'Sin categoría';

        return `
        <tr>
            <td>${item.name}</td>
            <td>${categoryName}</td>
            <td>$${item.price?.toFixed(2) || '0.00'}</td>
            <td>
                <span class="status-badge ${item.is_available ? 'available' : 'occupied'}">
                    ${item.is_available ? 'Disponible' : 'No disponible'}
                </span>
            </td>
            <td>
                <button class="btn btn-outline" onclick="editMenuItem('${item.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline" onclick="deleteMenuItem('${item.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

function populateCategoryFilter(categories) {
    const select = document.getElementById('category-filter');
    if (!select) return;

    select.innerHTML = '<option value="">Todas las categorías</option>' +
        categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

function applyMenuFilters() {
    const search = document.getElementById('menu-search').value.toLowerCase();
    const categoryId = document.getElementById('category-filter').value;

    let filtered = currentData.menuItems;

    if (search) {
        filtered = filtered.filter(item =>
            item.name.toLowerCase().includes(search) ||
            item.description?.toLowerCase().includes(search)
        );
    }

    if (categoryId) {
        filtered = filtered.filter(item => item.category_id === categoryId);
    }

    renderMenuItems(filtered);
}

// ==================== FUNCIONES DE PEDIDOS ====================

async function loadOrders() {
    try {
        showLoading();

        // Cargar pedidos, clientes y mesas en paralelo
        const [ordersResponse, customersResponse, tablesResponse] = await Promise.allSettled([
            apiRequest('/orders/'),
            apiRequest('/customers/'),
            apiRequest('/tables/')
        ]);

        // Procesar pedidos
        const orders = ordersResponse.status === 'fulfilled' ? ordersResponse.value : [];
        currentData.orders = orders;

        // Procesar clientes
        if (customersResponse.status === 'fulfilled') {
            const customersData = customersResponse.value;
            currentData.customers = Array.isArray(customersData) ? customersData : (customersData.items || []);
        } else {
            // Fallback a datos de prueba
            try {
                const testData = await apiRequest('/api/v1/test-data');
                currentData.customers = testData.customers || [];
            } catch (testError) {
                console.error('Error cargando datos de prueba para clientes:', testError);
                currentData.customers = [];
            }
        }

        // Procesar mesas
        if (tablesResponse.status === 'fulfilled') {
            const tablesData = tablesResponse.value;
            currentData.tables = Array.isArray(tablesData) ? tablesData : (tablesData.items || []);
        } else {
            // Fallback a datos de prueba
            try {
                const testData = await apiRequest('/api/v1/test-data');
                currentData.tables = testData.tables || [];
            } catch (testError) {
                console.error('Error cargando datos de prueba para mesas:', testError);
                currentData.tables = [];
            }
        }

        console.log('Datos cargados para pedidos:', {
            orders: currentData.orders.length,
            customers: currentData.customers.length,
            tables: currentData.tables.length
        });

        renderOrders(orders);
        hideLoading();
    } catch (error) {
        console.error('Error cargando pedidos:', error);
        showToast('Error al cargar pedidos', 'error');
        hideLoading();
    }
}

function renderOrders(orders) {
    const tbody = document.getElementById('orders-table');
    if (!tbody) return;

    if (orders.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay pedidos</td></tr>';
        return;
    }

    tbody.innerHTML = orders.map(order => {
        // Resolver nombre del cliente
        let customerName = 'Cliente no especificado';
        if (order.customer_id && currentData.customers) {
            const customer = currentData.customers.find(c => c.id === order.customer_id);
            if (customer) {
                customerName = `${customer.first_name} ${customer.last_name}`;
            }
        }

        // Resolver información de la mesa
        let tableInfo = 'N/A';
        if (order.table_id && currentData.tables) {
            const table = currentData.tables.find(t => t.id === order.table_id);
            if (table) {
                tableInfo = `Mesa ${table.number}`;
            }
        }

        return `
        <tr>
            <td>${order.order_number || order.id}</td>
            <td>${customerName}</td>
            <td>${tableInfo}</td>
            <td>
                <span class="status-badge ${order.status}">
                    ${getStatusText(order.status)}
                </span>
            </td>
            <td>$${order.total_amount?.toFixed(2) || '0.00'}</td>
            <td>
                <button class="btn btn-outline" onclick="viewOrder('${order.id}')" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline" onclick="editOrder('${order.id}')" title="Editar pedido">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline" onclick="updateOrderStatus('${order.id}')" title="Cambiar estado">
                    <i class="fas fa-sync"></i>
                </button>
            </td>
        </tr>
        `;
    }).join('');
}

function applyOrderFilters() {
    const status = document.getElementById('order-status-filter').value;

    let filtered = currentData.orders;

    if (status) {
        filtered = filtered.filter(order => order.status === status);
    }

    renderOrders(filtered);
}

// ==================== FUNCIONES DE CLIENTES ====================

async function loadCustomers() {
    try {
        showLoading();
        const customers = await apiRequest('/customers/');
        currentData.customers = customers;
        renderCustomers(customers);
        hideLoading();
    } catch (error) {
        console.error('Error cargando clientes:', error);
        showToast('Error al cargar clientes', 'error');
        hideLoading();
    }
}

function renderCustomers(customers) {
    const tbody = document.getElementById('customers-table');
    if (!tbody) return;

    if (customers.length === 0) {
        tbody.innerHTML = '<tr><td colspan="5" class="text-center">No hay clientes</td></tr>';
        return;
    }

    tbody.innerHTML = customers.map(customer => `
        <tr>
            <td>${customer.first_name} ${customer.last_name}</td>
            <td>${customer.email || 'N/A'}</td>
            <td>${customer.phone || 'N/A'}</td>
            <td>
                <span class="status-badge ${customer.is_vip ? 'available' : 'occupied'}">
                    ${customer.is_vip ? 'VIP' : 'Regular'}
                </span>
            </td>
            <td>
                <button class="btn btn-outline" onclick="editCustomer('${customer.id}')">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline" onclick="deleteCustomer('${customer.id}')">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function applyCustomerFilters() {
    const search = document.getElementById('customer-search').value.toLowerCase();
    const vipOnly = document.getElementById('vip-only-filter').checked;

    let filtered = currentData.customers;

    if (search) {
        filtered = filtered.filter(customer =>
            customer.first_name?.toLowerCase().includes(search) ||
            customer.last_name?.toLowerCase().includes(search) ||
            customer.email?.toLowerCase().includes(search)
        );
    }

    if (vipOnly) {
        filtered = filtered.filter(customer => customer.is_vip);
    }

    renderCustomers(filtered);
}

// ==================== FUNCIONES DE MESAS ====================

async function loadTables() {
    try {
        showLoading();
        const tables = await apiRequest('/tables/');
        currentData.tables = tables;
        renderTables(tables);
        hideLoading();
    } catch (error) {
        console.error('Error cargando mesas:', error);
        showToast('Error al cargar mesas', 'error');
        hideLoading();
    }
}

function renderTables(tables) {
    const container = document.getElementById('tables-grid');
    if (!container) return;

    if (tables.length === 0) {
        container.innerHTML = '<div class="text-center">No hay mesas</div>';
        return;
    }

    container.innerHTML = tables.map(table => {
        // Determinar el estado basado en is_active y otros campos
        const status = table.is_active ? 'available' : 'maintenance';
        const statusText = getTableStatusText(status);

        return `
        <div class="table-card ${status}">
            <h3>Mesa ${table.number}</h3>
            <p>Capacidad: ${table.capacity} personas</p>
            <p>Zona: ${table.zone || 'N/A'}</p>
            <span class="status-badge ${status}">
                ${statusText}
            </span>
            <div class="table-actions">
                <button class="btn btn-outline" onclick="editTable('${table.id}')" title="Editar mesa">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline" onclick="deleteTable('${table.id}')" title="Eliminar mesa">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        `;
    }).join('');
}

// ==================== FUNCIONES DE INVENTARIO ====================

async function loadInventoryItems() {
    try {
        showLoading();
        const items = await apiRequest('/inventory/');
        currentData.inventoryItems = items;
        renderInventoryItems(items);
        hideLoading();
    } catch (error) {
        console.error('Error cargando inventario:', error);
        showToast('Error al cargar inventario', 'error');
        hideLoading();
    }
}

function renderInventoryItems(items) {
    const tbody = document.getElementById('inventory-table');
    if (!tbody) return;

    if (items.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay elementos en el inventario</td></tr>';
        return;
    }

    tbody.innerHTML = items.map(item => {
        const stockStatus = item.current_stock <= item.minimum_stock ? 'low' : 'ok';
        return `
            <tr>
                <td>${item.name}</td>
                <td>${item.category || 'N/A'}</td>
                <td>${item.current_stock || 0}</td>
                <td>${item.minimum_stock || 0}</td>
                <td>
                    <span class="status-badge ${stockStatus === 'low' ? 'warning' : 'available'}">
                        ${stockStatus === 'low' ? 'Stock Bajo' : 'OK'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-outline" onclick="editInventoryItem('${item.id}')" title="Editar elemento">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-outline" onclick="deleteInventoryItem('${item.id}')" title="Eliminar elemento">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            </tr>
        `;
    }).join('');
}

function applyInventoryFilters() {
    const category = document.getElementById('inventory-category-filter').value;
    const lowStockOnly = document.getElementById('low-stock-filter').checked;

    let filtered = currentData.inventoryItems;

    if (category) {
        filtered = filtered.filter(item => item.category === category);
    }

    if (lowStockOnly) {
        filtered = filtered.filter(item => item.current_stock <= item.minimum_stock);
    }

    renderInventoryItems(filtered);
}

// ==================== FUNCIONES DE FACTURACIÓN ====================

async function loadInvoices() {
    try {
        showLoading();
        const invoices = await apiRequest('/billing/');
        currentData.invoices = invoices;
        renderInvoices(invoices);
        hideLoading();
    } catch (error) {
        console.error('Error cargando facturas:', error);
        showToast('Error al cargar facturas', 'error');
        hideLoading();
    }
}

async function loadBillingStats() {
    try {
        const stats = await apiRequest('/billing/stats/overview');
        updateBillingStats(stats);
    } catch (error) {
        console.error('Error cargando estadísticas de facturación:', error);
    }
}

function updateBillingStats(stats) {
    document.getElementById('total-revenue').textContent = `$${stats.total_revenue?.toFixed(2) || '0.00'}`;
    document.getElementById('pending-payments').textContent = `$${stats.pending_payments?.toFixed(2) || '0.00'}`;
    document.getElementById('paid-invoices').textContent = stats.paid_invoices || 0;
}

function renderInvoices(invoices) {
    const tbody = document.getElementById('invoices-table');
    if (!tbody) return;

    if (invoices.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center">No hay facturas</td></tr>';
        return;
    }

    tbody.innerHTML = invoices.map(invoice => `
        <tr>
            <td>${invoice.invoice_number || invoice.id}</td>
            <td>${invoice.customer_name || 'N/A'}</td>
            <td>$${invoice.total?.toFixed(2) || '0.00'}</td>
            <td>
                <span class="status-badge ${invoice.payment_status}">
                    ${getPaymentStatusText(invoice.payment_status)}
                </span>
            </td>
            <td>${formatDate(invoice.created_at)}</td>
            <td>
                <button class="btn btn-outline" onclick="viewInvoice('${invoice.id}')" title="Ver detalles">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="btn btn-outline" onclick="updatePaymentStatus('${invoice.id}')" title="Actualizar estado">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="btn btn-outline" onclick="showToast('Eliminación de facturas no disponible', 'info')" title="Eliminar factura (no disponible)">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

// ==================== FUNCIONES DE REPORTES ====================

async function generateSalesReport() {
    const startDate = document.getElementById('sales-start-date').value;
    const endDate = document.getElementById('sales-end-date').value;

    if (!startDate || !endDate) {
        showToast('Por favor selecciona las fechas de inicio y fin', 'warning');
        return;
    }

    try {
        showLoading();
        const report = await apiRequest(`/reports/sales/generate?start_date=${startDate}&end_date=${endDate}`);
        displayReport('Reporte de Ventas', report);
        hideLoading();
    } catch (error) {
        console.error('Error generando reporte de ventas:', error);
        showToast('Error al generar reporte de ventas', 'error');
        hideLoading();
    }
}

async function generateInventoryReport() {
    try {
        showLoading();
        const report = await apiRequest('/reports/inventory/generate');
        displayReport('Reporte de Inventario', report);
        hideLoading();
    } catch (error) {
        console.error('Error generando reporte de inventario:', error);
        showToast('Error al generar reporte de inventario', 'error');
        hideLoading();
    }
}

function displayReport(title, data) {
    const container = document.getElementById('report-results');
    const content = document.getElementById('report-content');

    content.innerHTML = `
        <div class="report-data">
            <h4>${title}</h4>
            <pre>${JSON.stringify(data, null, 2)}</pre>
        </div>
    `;

    container.style.display = 'block';
    container.scrollIntoView({ behavior: 'smooth' });
}

// ==================== FUNCIONES DE UTILIDAD ====================

function showLoading() {
    document.getElementById('loading-overlay').style.display = 'flex';
}

function hideLoading() {
    document.getElementById('loading-overlay').style.display = 'none';
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;

    const icon = getToastIcon(type);
    toast.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;

    container.appendChild(toast);

    // Auto remove after 5 seconds
    setTimeout(() => {
        toast.remove();
    }, 5000);
}

function getToastIcon(type) {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        warning: 'fa-exclamation-triangle',
        info: 'fa-info-circle'
    };
    return icons[type] || icons.info;
}

function getStatusText(status) {
    const statusMap = {
        pending: 'Pendiente',
        confirmed: 'Confirmado',
        preparing: 'Preparando',
        ready: 'Listo',
        delivered: 'Entregado',
        cancelled: 'Cancelado'
    };
    return statusMap[status] || status;
}

function getTableStatusText(status) {
    const statusMap = {
        available: 'Disponible',
        occupied: 'Ocupada',
        reserved: 'Reservada',
        maintenance: 'Mantenimiento'
    };
    return statusMap[status] || status;
}

function getPaymentStatusText(status) {
    const statusMap = {
        pending: 'Pendiente',
        paid: 'Pagado',
        failed: 'Fallido',
        refunded: 'Reembolsado'
    };
    return statusMap[status] || status;
}

function formatDate(dateString) {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('es-ES');
}

function generateLast7Days() {
    const days = [];
    for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        days.push(date.toLocaleDateString('es-ES', { weekday: 'short' }));
    }
    return days;
}

function generateSalesData(orders) {
    // Generar datos de ventas simulados para los últimos 7 días
    return [120, 150, 180, 200, 160, 190, 220];
}

function setupDefaultDates() {
    const today = new Date();
    const lastWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    document.getElementById('sales-start-date').value = lastWeek.toISOString().split('T')[0];
    document.getElementById('sales-end-date').value = today.toISOString().split('T')[0];
}

// ==================== FUNCIONES DE MODALES ====================

async function showCreateMenuItemModal() {
    // Cargar categorías primero
    let categories = [];
    try {
        categories = await apiRequest('/menu/categories');
    } catch (error) {
        console.error('Error cargando categorías:', error);
        // Usar datos de prueba como fallback
        try {
            const testData = await apiRequest('/api/v1/test-data');
            categories = testData.categories || [];
        } catch (testError) {
            console.error('Error cargando datos de prueba:', testError);
            categories = [];
        }
    }

    showModal('Crear Elemento del Menú', `
        <form id="menu-item-form">
            <div class="form-group">
                <label>Nombre:</label>
                <input type="text" id="item-name" class="form-input" required>
            </div>
            <div class="form-group">
                <label>Descripción:</label>
                <textarea id="item-description" class="form-input" rows="3"></textarea>
            </div>
            <div class="form-group">
                <label>Precio:</label>
                <input type="number" id="item-price" class="form-input" step="0.01" required>
            </div>
            <div class="form-group">
                <label>Categoría:</label>
                <select id="item-category" class="form-input">
                    <option value="">Seleccionar categoría (opcional)</option>
                    ${categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('')}
                </select>
            </div>
        </form>
    `, async () => {
        const formData = {
            name: document.getElementById('item-name').value,
            description: document.getElementById('item-description').value,
            price: parseFloat(document.getElementById('item-price').value),
            category_id: document.getElementById('item-category').value
        };

        try {
            await apiRequest('/menu/items', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showToast('Elemento del menú creado exitosamente', 'success');
            closeModal();
            loadMenuItems();
        } catch (error) {
            showToast('Error al crear elemento del menú', 'error');
        }
    });
}

async function showCreateOrderModal() {
    // Cargar clientes y mesas
    let customers = [];
    let tables = [];

    try {
        const [customersResponse, tablesResponse] = await Promise.allSettled([
            apiRequest('/customers/'),
            apiRequest('/tables/')
        ]);

        // Manejar diferentes estructuras de respuesta
        if (customersResponse.status === 'fulfilled') {
            const customersData = customersResponse.value;
            customers = Array.isArray(customersData) ? customersData : (customersData.items || []);
        }

        if (tablesResponse.status === 'fulfilled') {
            const tablesData = tablesResponse.value;
            tables = Array.isArray(tablesData) ? tablesData : (tablesData.items || []);
        }

        console.log('Clientes cargados:', customers);
        console.log('Mesas cargadas:', tables);
    } catch (error) {
        console.error('Error cargando datos:', error);
        // Usar datos de prueba como fallback
        try {
            const testData = await apiRequest('/api/v1/test-data');
            customers = testData.customers || [];
            tables = testData.tables || [];
            console.log('Usando datos de prueba - Clientes:', customers);
            console.log('Usando datos de prueba - Mesas:', tables);
        } catch (testError) {
            console.error('Error cargando datos de prueba:', testError);
        }
    }

    showModal('Crear Pedido', `
        <form id="order-form">
            <div class="form-group">
                <label>Cliente:</label>
                <select id="order-customer" class="form-input">
                    <option value="">Seleccionar cliente (opcional)</option>
                    ${customers.map(customer => `<option value="${customer.id}">${customer.first_name} ${customer.last_name}</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Mesa:</label>
                <select id="order-table" class="form-input">
                    <option value="">Seleccionar mesa (opcional)</option>
                    ${tables.map(table => `<option value="${table.id}">Mesa ${table.number} (Capacidad: ${table.capacity})</option>`).join('')}
                </select>
            </div>
            <div class="form-group">
                <label>Tipo de Pedido:</label>
                <select id="order-type" class="form-input" required>
                    <option value="dine_in">Comer en el local</option>
                    <option value="takeaway">Para llevar</option>
                    <option value="delivery">Delivery</option>
                </select>
            </div>
            <div class="form-group">
                <label>Instrucciones Especiales:</label>
                <textarea id="order-instructions" class="form-input" rows="3" placeholder="Instrucciones especiales para el pedido..."></textarea>
            </div>
        </form>
    `, async () => {
        const formData = {
            customer_id: document.getElementById('order-customer').value || null,
            table_id: document.getElementById('order-table').value || null,
            order_type: document.getElementById('order-type').value,
            special_instructions: document.getElementById('order-instructions').value || null,
            items: [] // Array vacío por ahora, se puede agregar elementos después
        };

        try {
            const response = await apiRequest('/orders/', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            console.log('Pedido creado:', response);
            showToast('Pedido creado exitosamente', 'success');
            closeModal();
            loadOrders();
        } catch (error) {
            console.error('Error creando pedido:', error);
            showToast('Error al crear pedido: ' + (error.message || 'Error desconocido'), 'error');
        }
    });
}

function showCreateCustomerModal() {
    showModal('Crear Cliente', `
        <form id="customer-form">
            <div class="form-group">
                <label>Nombre:</label>
                <input type="text" id="customer-first-name" class="form-input" required>
            </div>
            <div class="form-group">
                <label>Apellido:</label>
                <input type="text" id="customer-last-name" class="form-input" required>
            </div>
            <div class="form-group">
                <label>Email:</label>
                <input type="email" id="customer-email" class="form-input">
            </div>
            <div class="form-group">
                <label>Teléfono:</label>
                <input type="tel" id="customer-phone" class="form-input">
            </div>
            <div class="form-group">
                <label>
                    <input type="checkbox" id="customer-vip"> Cliente VIP
                </label>
            </div>
        </form>
    `, async () => {
        const formData = {
            first_name: document.getElementById('customer-first-name').value,
            last_name: document.getElementById('customer-last-name').value,
            email: document.getElementById('customer-email').value,
            phone: document.getElementById('customer-phone').value,
            is_vip: document.getElementById('customer-vip').checked
        };

        try {
            await apiRequest('/customers/', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showToast('Cliente creado exitosamente', 'success');
            closeModal();
            loadCustomers();
        } catch (error) {
            showToast('Error al crear cliente', 'error');
        }
    });
}

function showModal(title, content, onSave) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = content;
    document.getElementById('modal-overlay').style.display = 'flex';

    // Configurar función de guardado
    document.getElementById('modal-save').onclick = onSave;
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

function saveModal() {
    // Esta función se sobrescribe dinámicamente
}

// ==================== FUNCIONES DE ACCIONES ====================

function refreshAllData() {
    showLoading();
    loadOverviewData().finally(() => hideLoading());
}

function openApiDocs() {
    window.open('/docs', '_blank');
}

async function populateWithSampleData() {
    if (confirm('¿Estás seguro de que quieres poblar el sistema con datos de ejemplo? Esto puede crear datos duplicados.')) {
        try {
            showLoading();
            const success = await populateSystemWithSampleData();
            if (success) {
                showToast('Sistema poblado exitosamente con datos de ejemplo', 'success');
                // Recargar datos del dashboard
                await loadOverviewData();
            } else {
                showToast('Error al poblar el sistema', 'error');
            }
            hideLoading();
        } catch (error) {
            console.error('Error poblando sistema:', error);
            showToast('Error al poblar el sistema', 'error');
            hideLoading();
        }
    }
}

// Funciones placeholder para acciones específicas
async function editMenuItem(id) {
    try {
        // Buscar el elemento en los datos actuales
        const item = currentData.menuItems.find(item => item.id === id);
        if (!item) {
            showToast('Elemento no encontrado', 'error');
            return;
        }

        // Cargar categorías para el formulario
        let categories = [];
        try {
            categories = await apiRequest('/menu/categories');
        } catch (error) {
            console.error('Error cargando categorías:', error);
            // Usar datos de prueba como fallback
            try {
                const testData = await apiRequest('/api/v1/test-data');
                categories = testData.categories || [];
            } catch (testError) {
                console.error('Error cargando datos de prueba:', testError);
                categories = [];
            }
        }

        showModal('Editar Elemento del Menú', `
            <form id="edit-menu-item-form">
                <div class="form-group">
                    <label>Nombre:</label>
                    <input type="text" id="edit-item-name" class="form-input" value="${item.name}" required>
                </div>
                <div class="form-group">
                    <label>Descripción:</label>
                    <textarea id="edit-item-description" class="form-input" rows="3">${item.description || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Precio:</label>
                    <input type="number" id="edit-item-price" class="form-input" step="0.01" value="${item.price || 0}" required>
                </div>
                <div class="form-group">
                    <label>Categoría:</label>
                    <select id="edit-item-category" class="form-input">
                        <option value="">Seleccionar categoría (opcional)</option>
                        ${categories.map(cat => `<option value="${cat.id}" ${cat.id === item.category_id ? 'selected' : ''}>${cat.name}</option>`).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Disponible:</label>
                    <select id="edit-item-available" class="form-input">
                        <option value="true" ${item.is_available ? 'selected' : ''}>Disponible</option>
                        <option value="false" ${!item.is_available ? 'selected' : ''}>No disponible</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Destacado:</label>
                    <select id="edit-item-featured" class="form-input">
                        <option value="false" ${!item.is_featured ? 'selected' : ''}>No destacado</option>
                        <option value="true" ${item.is_featured ? 'selected' : ''}>Destacado</option>
                    </select>
                </div>
            </form>
        `, async () => {
            const formData = {
                name: document.getElementById('edit-item-name').value,
                description: document.getElementById('edit-item-description').value,
                price: parseFloat(document.getElementById('edit-item-price').value),
                category_id: document.getElementById('edit-item-category').value || null,
                is_available: document.getElementById('edit-item-available').value === 'true',
                is_featured: document.getElementById('edit-item-featured').value === 'true'
            };

            try {
                await apiRequest(`/menu/items/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                showToast('Elemento del menú actualizado exitosamente', 'success');
                closeModal();
                loadMenuItems();
            } catch (error) {
                console.error('Error actualizando elemento:', error);
                if (error.message.includes('500') || error.message.includes('Internal Server Error')) {
                    showToast('El elemento puede haber sido eliminado. Recargando lista...', 'warning');
                    loadMenuItems(); // Recargar la lista
                } else {
                    showToast('Error al actualizar elemento del menú', 'error');
                }
            }
        });
    } catch (error) {
        console.error('Error editando elemento del menú:', error);
        showToast('Error al cargar datos para edición', 'error');
    }
}

async function deleteMenuItem(id) {
    try {
        // Buscar el elemento para mostrar su nombre en la confirmación
        const item = currentData.menuItems.find(item => item.id === id);
        const itemName = item ? item.name : 'este elemento';

        if (confirm(`¿Estás seguro de que quieres eliminar "${itemName}"? Esta acción no se puede deshacer.`)) {
            showLoading();

            try {
                await apiRequest(`/menu/items/${id}`, {
                    method: 'DELETE'
                });
                showToast('Elemento del menú eliminado exitosamente', 'success');
                loadMenuItems(); // Recargar la lista
            } catch (error) {
                console.error('Error eliminando elemento del menú:', error);
                if (error.message.includes('404') || error.message.includes('Not Found')) {
                    showToast('El elemento ya no existe. Recargando lista...', 'warning');
                    loadMenuItems(); // Recargar la lista
                } else {
                    showToast('Error al eliminar elemento del menú', 'error');
                }
            } finally {
                hideLoading();
            }
        }
    } catch (error) {
        console.error('Error en función de eliminación:', error);
        showToast('Error al procesar eliminación', 'error');
    }
}

async function viewOrder(id) {
    try {
        // Buscar el pedido en los datos actuales
        const order = currentData.orders.find(order => order.id === id);
        if (!order) {
            showToast('Pedido no encontrado', 'error');
            return;
        }

        // Cargar datos adicionales si es necesario
        let customerName = 'Cliente no especificado';
        let tableInfo = 'N/A';

        if (order.customer_id) {
            try {
                const customer = await apiRequest(`/customers/${order.customer_id}`);
                customerName = `${customer.first_name} ${customer.last_name}`;
            } catch (error) {
                console.error('Error cargando cliente:', error);
            }
        }

        if (order.table_id) {
            try {
                const table = await apiRequest(`/tables/${order.table_id}`);
                tableInfo = `Mesa ${table.number}`;
            } catch (error) {
                console.error('Error cargando mesa:', error);
            }
        }

        showModal('Detalles del Pedido', `
            <div class="order-details">
                <div class="detail-section">
                    <h3>Información del Pedido</h3>
                    <div class="detail-row">
                        <strong>Número:</strong> ${order.order_number}
                    </div>
                    <div class="detail-row">
                        <strong>Cliente:</strong> ${customerName}
                    </div>
                    <div class="detail-row">
                        <strong>Mesa:</strong> ${tableInfo}
                    </div>
                    <div class="detail-row">
                        <strong>Estado:</strong> 
                        <span class="status-badge ${order.status === 'pending' ? 'pending' : order.status === 'preparing' ? 'preparing' : 'ready'}">
                            ${order.status === 'pending' ? 'Pendiente' : order.status === 'preparing' ? 'Preparando' : 'Listo'}
                        </span>
                    </div>
                    <div class="detail-row">
                        <strong>Tipo:</strong> ${order.order_type === 'dine_in' ? 'Comer en el local' : order.order_type === 'takeaway' ? 'Para llevar' : 'Delivery'}
                    </div>
                    <div class="detail-row">
                        <strong>Total:</strong> $${order.total_amount?.toFixed(2) || '0.00'}
                    </div>
                    <div class="detail-row">
                        <strong>Subtotal:</strong> $${order.subtotal?.toFixed(2) || '0.00'}
                    </div>
                    <div class="detail-row">
                        <strong>Impuestos:</strong> $${order.tax_amount?.toFixed(2) || '0.00'}
                    </div>
                    <div class="detail-row">
                        <strong>Descuento:</strong> $${order.discount_amount?.toFixed(2) || '0.00'}
                    </div>
                    ${order.special_instructions ? `
                    <div class="detail-row">
                        <strong>Instrucciones Especiales:</strong><br>
                        <em>${order.special_instructions}</em>
                    </div>
                    ` : ''}
                    <div class="detail-row">
                        <strong>Creado:</strong> ${new Date(order.created_at).toLocaleString()}
                    </div>
                    ${order.updated_at ? `
                    <div class="detail-row">
                        <strong>Actualizado:</strong> ${new Date(order.updated_at).toLocaleString()}
                    </div>
                    ` : ''}
                </div>
                
                <div class="detail-section">
                    <h3>Elementos del Pedido</h3>
                    ${order.items && order.items.length > 0 ? `
                        <div class="order-items">
                            ${order.items.map(item => `
                                <div class="order-item">
                                    <strong>${item.name}</strong> x${item.quantity} - $${item.price?.toFixed(2) || '0.00'}
                                </div>
                            `).join('')}
                        </div>
                    ` : '<p>No hay elementos en este pedido</p>'}
                </div>
            </div>
        `, null, true); // true para modal de solo lectura
    } catch (error) {
        console.error('Error visualizando pedido:', error);
        showToast('Error al cargar detalles del pedido', 'error');
    }
}

async function updateOrderStatus(id) {
    try {
        // Buscar el pedido en los datos actuales
        const order = currentData.orders.find(order => order.id === id);
        if (!order) {
            showToast('Pedido no encontrado', 'error');
            return;
        }

        const statusOptions = [
            { value: 'pending', label: 'Pendiente' },
            { value: 'preparing', label: 'Preparando' },
            { value: 'ready', label: 'Listo' },
            { value: 'served', label: 'Servido' },
            { value: 'cancelled', label: 'Cancelado' }
        ];

        showModal('Actualizar Estado del Pedido', `
            <div class="order-update">
                <div class="detail-row">
                    <strong>Pedido:</strong> ${order.order_number}
                </div>
                <div class="detail-row">
                    <strong>Estado Actual:</strong> 
                    <span class="status-badge ${order.status}">
                        ${statusOptions.find(s => s.value === order.status)?.label || order.status}
                    </span>
                </div>
                <div class="form-group">
                    <label>Nuevo Estado:</label>
                    <select id="new-status" class="form-input" required>
                        ${statusOptions.map(status =>
            `<option value="${status.value}" ${status.value === order.status ? 'selected' : ''}>${status.label}</option>`
        ).join('')}
                    </select>
                </div>
            </div>
        `, async () => {
            const newStatus = document.getElementById('new-status').value;

            if (newStatus === order.status) {
                showToast('El estado no ha cambiado', 'info');
                return;
            }

            try {
                await apiRequest(`/orders/${id}/status`, {
                    method: 'PATCH',
                    body: JSON.stringify({ status: newStatus })
                });
                showToast('Estado del pedido actualizado exitosamente', 'success');
                closeModal();
                loadOrders();
            } catch (error) {
                console.error('Error actualizando estado:', error);
                showToast('Error al actualizar estado del pedido', 'error');
            }
        });
    } catch (error) {
        console.error('Error en función de actualización:', error);
        showToast('Error al cargar datos para actualización', 'error');
    }
}

async function editOrder(id) {
    try {
        // Buscar el pedido en los datos actuales
        const order = currentData.orders.find(order => order.id === id);
        if (!order) {
            showToast('Pedido no encontrado', 'error');
            return;
        }

        // Cargar clientes y mesas
        let customers = [];
        let tables = [];

        try {
            const [customersResponse, tablesResponse] = await Promise.allSettled([
                apiRequest('/customers/'),
                apiRequest('/tables/')
            ]);

            customers = customersResponse.status === 'fulfilled' ? customersResponse.value : [];
            tables = tablesResponse.status === 'fulfilled' ? tablesResponse.value : [];
        } catch (error) {
            console.error('Error cargando datos:', error);
            // Usar datos de prueba como fallback
            try {
                const testData = await apiRequest('/api/v1/test-data');
                customers = testData.customers || [];
                tables = testData.tables || [];
            } catch (testError) {
                console.error('Error cargando datos de prueba:', testError);
            }
        }

        showModal('Editar Pedido', `
            <form id="edit-order-form">
                <div class="form-group">
                    <label>Cliente:</label>
                    <select id="edit-order-customer" class="form-input">
                        <option value="">Seleccionar cliente (opcional)</option>
                        ${customers.map(customer =>
            `<option value="${customer.id}" ${customer.id === order.customer_id ? 'selected' : ''}>${customer.first_name} ${customer.last_name}</option>`
        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Mesa:</label>
                    <select id="edit-order-table" class="form-input">
                        <option value="">Seleccionar mesa (opcional)</option>
                        ${tables.map(table =>
            `<option value="${table.id}" ${table.id === order.table_id ? 'selected' : ''}>Mesa ${table.number} (Capacidad: ${table.capacity})</option>`
        ).join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Tipo de Pedido:</label>
                    <select id="edit-order-type" class="form-input" required>
                        <option value="dine_in" ${order.order_type === 'dine_in' ? 'selected' : ''}>Comer en el local</option>
                        <option value="takeaway" ${order.order_type === 'takeaway' ? 'selected' : ''}>Para llevar</option>
                        <option value="delivery" ${order.order_type === 'delivery' ? 'selected' : ''}>Delivery</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Estado:</label>
                    <select id="edit-order-status" class="form-input" required>
                        <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                        <option value="preparing" ${order.status === 'preparing' ? 'selected' : ''}>Preparando</option>
                        <option value="ready" ${order.status === 'ready' ? 'selected' : ''}>Listo</option>
                        <option value="served" ${order.status === 'served' ? 'selected' : ''}>Servido</option>
                        <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Instrucciones Especiales:</label>
                    <textarea id="edit-order-instructions" class="form-input" rows="3" placeholder="Instrucciones especiales para el pedido...">${order.special_instructions || ''}</textarea>
                </div>
            </form>
        `, async () => {
            const formData = {
                customer_id: document.getElementById('edit-order-customer').value || null,
                table_id: document.getElementById('edit-order-table').value || null,
                order_type: document.getElementById('edit-order-type').value,
                status: document.getElementById('edit-order-status').value,
                special_instructions: document.getElementById('edit-order-instructions').value || null
            };

            try {
                await apiRequest(`/orders/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                showToast('Pedido actualizado exitosamente', 'success');
                closeModal();
                loadOrders();
            } catch (error) {
                console.error('Error actualizando pedido:', error);
                showToast('Error al actualizar pedido', 'error');
            }
        });
    } catch (error) {
        console.error('Error editando pedido:', error);
        showToast('Error al cargar datos para edición', 'error');
    }
}

async function editCustomer(id) {
    try {
        // Buscar el cliente en los datos actuales
        const customer = currentData.customers.find(c => c.id === id);
        if (!customer) {
            showToast('Cliente no encontrado', 'error');
            return;
        }

        showModal('Editar Cliente', `
            <form id="edit-customer-form">
                <div class="form-group">
                    <label>Nombre:</label>
                    <input type="text" id="edit-customer-first-name" class="form-input" value="${customer.first_name}" required>
                </div>
                <div class="form-group">
                    <label>Apellido:</label>
                    <input type="text" id="edit-customer-last-name" class="form-input" value="${customer.last_name}" required>
                </div>
                <div class="form-group">
                    <label>Email:</label>
                    <input type="email" id="edit-customer-email" class="form-input" value="${customer.email || ''}">
                </div>
                <div class="form-group">
                    <label>Teléfono:</label>
                    <input type="tel" id="edit-customer-phone" class="form-input" value="${customer.phone || ''}">
                </div>
                <div class="form-group">
                    <label>
                        <input type="checkbox" id="edit-customer-vip" ${customer.is_vip ? 'checked' : ''}> Cliente VIP
                    </label>
                </div>
            </form>
        `, async () => {
            const formData = {
                first_name: document.getElementById('edit-customer-first-name').value,
                last_name: document.getElementById('edit-customer-last-name').value,
                email: document.getElementById('edit-customer-email').value,
                phone: document.getElementById('edit-customer-phone').value,
                is_vip: document.getElementById('edit-customer-vip').checked
            };

            try {
                await apiRequest(`/customers/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                showToast('Cliente actualizado exitosamente', 'success');
                closeModal();
                loadCustomers();
            } catch (error) {
                console.error('Error actualizando cliente:', error);
                showToast('Error al actualizar cliente', 'error');
            }
        });
    } catch (error) {
        console.error('Error editando cliente:', error);
        showToast('Error al editar cliente', 'error');
    }
}

async function deleteCustomer(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este cliente?')) {
        try {
            await apiRequest(`/customers/${id}`, {
                method: 'DELETE'
            });
            showToast('Cliente eliminado exitosamente', 'success');
            loadCustomers();
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            showToast('Error al eliminar cliente', 'error');
        }
    }
}

function showCreateTableModal() {
    showModal('Crear Mesa', `
        <form id="table-form">
            <div class="form-group">
                <label>Número de Mesa:</label>
                <input type="number" id="table-number" class="form-input" required>
            </div>
            <div class="form-group">
                <label>Capacidad:</label>
                <input type="number" id="table-capacity" class="form-input" required min="1">
            </div>
            <div class="form-group">
                <label>Zona:</label>
                <input type="text" id="table-zone" class="form-input" placeholder="Ej: Terraza, Interior, VIP">
            </div>
            <div class="form-group">
                <label>Estado:</label>
                <select id="table-status" class="form-input" required>
                    <option value="available">Disponible</option>
                    <option value="occupied">Ocupada</option>
                    <option value="reserved">Reservada</option>
                    <option value="maintenance">Mantenimiento</option>
                </select>
            </div>
        </form>
    `, async () => {
        const formData = {
            number: document.getElementById('table-number').value,
            capacity: parseInt(document.getElementById('table-capacity').value),
            zone: document.getElementById('table-zone').value || null,
            is_active: document.getElementById('table-status').value === 'available'
        };

        try {
            await apiRequest('/tables/', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showToast('Mesa creada exitosamente', 'success');
            closeModal();
            loadTables();
        } catch (error) {
            console.error('Error creando mesa:', error);
            showToast('Error al crear mesa', 'error');
        }
    });
}

async function editTable(id) {
    try {
        // Buscar la mesa en los datos actuales
        const table = currentData.tables.find(t => t.id === id);
        if (!table) {
            showToast('Mesa no encontrada', 'error');
            return;
        }

        showModal('Editar Mesa', `
            <form id="edit-table-form">
                <div class="form-group">
                    <label>Número de Mesa:</label>
                    <input type="number" id="edit-table-number" class="form-input" value="${table.number}" required>
                </div>
                <div class="form-group">
                    <label>Capacidad:</label>
                    <input type="number" id="edit-table-capacity" class="form-input" value="${table.capacity}" required min="1">
                </div>
                <div class="form-group">
                    <label>Zona:</label>
                    <input type="text" id="edit-table-zone" class="form-input" value="${table.zone || ''}" placeholder="Ej: Terraza, Interior, VIP">
                </div>
                <div class="form-group">
                    <label>Estado:</label>
                    <select id="edit-table-status" class="form-input" required>
                        <option value="available" ${table.is_active ? 'selected' : ''}>Disponible</option>
                        <option value="maintenance" ${!table.is_active ? 'selected' : ''}>Mantenimiento</option>
                    </select>
                </div>
            </form>
        `, async () => {
            const formData = {
                number: document.getElementById('edit-table-number').value,
                capacity: parseInt(document.getElementById('edit-table-capacity').value),
                zone: document.getElementById('edit-table-zone').value || null,
                is_active: document.getElementById('edit-table-status').value === 'available'
            };

            try {
                await apiRequest(`/tables/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                showToast('Mesa actualizada exitosamente', 'success');
                closeModal();
                loadTables();
            } catch (error) {
                console.error('Error actualizando mesa:', error);
                showToast('Error al actualizar mesa', 'error');
            }
        });
    } catch (error) {
        console.error('Error editando mesa:', error);
        showToast('Error al editar mesa', 'error');
    }
}

async function deleteTable(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta mesa?')) {
        try {
            await apiRequest(`/tables/${id}`, {
                method: 'DELETE'
            });
            showToast('Mesa eliminada exitosamente', 'success');
            loadTables();
        } catch (error) {
            console.error('Error eliminando mesa:', error);
            showToast('Error al eliminar mesa', 'error');
        }
    }
}

function selectTable(id) {
    showToast('Función de selección de mesa en desarrollo', 'info');
}

function showCreateInventoryModal() {
    showModal('Crear Elemento de Inventario', `
        <form id="inventory-form">
            <div class="form-group">
                <label>Nombre:</label>
                <input type="text" id="inventory-name" class="form-input" required>
            </div>
            <div class="form-group">
                <label>Categoría:</label>
                <input type="text" id="inventory-category" class="form-input" placeholder="Ej: Bebidas, Ingredientes, Utensilios">
            </div>
            <div class="form-group">
                <label>Stock Actual:</label>
                <input type="number" id="inventory-current-stock" class="form-input" required min="0">
            </div>
            <div class="form-group">
                <label>Stock Mínimo:</label>
                <input type="number" id="inventory-minimum-stock" class="form-input" required min="0">
            </div>
            <div class="form-group">
                <label>Unidad de Medida:</label>
                <select id="inventory-unit" class="form-input" required>
                    <option value="unidad">Unidad</option>
                    <option value="kg">Kilogramo</option>
                    <option value="litro">Litro</option>
                    <option value="caja">Caja</option>
                    <option value="paquete">Paquete</option>
                </select>
            </div>
            <div class="form-group">
                <label>Precio Unitario:</label>
                <input type="number" id="inventory-unit-price" class="form-input" step="0.01" min="0">
            </div>
            <div class="form-group">
                <label>Proveedor:</label>
                <input type="text" id="inventory-supplier" class="form-input" placeholder="Nombre del proveedor">
            </div>
        </form>
    `, async () => {
        const formData = {
            name: document.getElementById('inventory-name').value,
            category: document.getElementById('inventory-category').value || null,
            current_stock: parseInt(document.getElementById('inventory-current-stock').value),
            min_stock: parseInt(document.getElementById('inventory-minimum-stock').value),
            max_stock: parseInt(document.getElementById('inventory-current-stock').value) * 2, // Establecer max_stock como 2x el current_stock
            unit: document.getElementById('inventory-unit').value,
            unit_price: parseFloat(document.getElementById('inventory-unit-price').value) || 0,
            supplier: document.getElementById('inventory-supplier').value || null
        };

        try {
            await apiRequest('/inventory/', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showToast('Elemento de inventario creado exitosamente', 'success');
            closeModal();
            await loadInventoryItems();
        } catch (error) {
            console.error('Error creando elemento de inventario:', error);
            showToast('Error al crear elemento de inventario', 'error');
        }
    });
}

async function editInventoryItem(id) {
    try {
        // Buscar el elemento en los datos actuales
        const item = currentData.inventoryItems.find(i => i.id === id);
        if (!item) {
            showToast('Elemento no encontrado', 'error');
            return;
        }

        showModal('Editar Elemento de Inventario', `
            <form id="edit-inventory-form">
                <div class="form-group">
                    <label>Nombre:</label>
                    <input type="text" id="edit-inventory-name" class="form-input" value="${item.name}" required>
                </div>
                <div class="form-group">
                    <label>Categoría:</label>
                    <input type="text" id="edit-inventory-category" class="form-input" value="${item.category || ''}" placeholder="Ej: Bebidas, Ingredientes, Utensilios">
                </div>
                <div class="form-group">
                    <label>Stock Actual:</label>
                    <input type="number" id="edit-inventory-current-stock" class="form-input" value="${item.current_stock || 0}" required min="0">
                </div>
                <div class="form-group">
                    <label>Stock Mínimo:</label>
                    <input type="number" id="edit-inventory-minimum-stock" class="form-input" value="${item.minimum_stock || 0}" required min="0">
                </div>
                <div class="form-group">
                    <label>Unidad de Medida:</label>
                    <select id="edit-inventory-unit" class="form-input" required>
                        <option value="unidad" ${item.unit === 'unidad' ? 'selected' : ''}>Unidad</option>
                        <option value="kg" ${item.unit === 'kg' ? 'selected' : ''}>Kilogramo</option>
                        <option value="litro" ${item.unit === 'litro' ? 'selected' : ''}>Litro</option>
                        <option value="caja" ${item.unit === 'caja' ? 'selected' : ''}>Caja</option>
                        <option value="paquete" ${item.unit === 'paquete' ? 'selected' : ''}>Paquete</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Precio Unitario:</label>
                    <input type="number" id="edit-inventory-unit-price" class="form-input" value="${item.unit_price || 0}" step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label>Proveedor:</label>
                    <input type="text" id="edit-inventory-supplier" class="form-input" value="${item.supplier || ''}" placeholder="Nombre del proveedor">
                </div>
            </form>
        `, async () => {
            const formData = {
                name: document.getElementById('edit-inventory-name').value,
                category: document.getElementById('edit-inventory-category').value || null,
                current_stock: parseInt(document.getElementById('edit-inventory-current-stock').value),
                min_stock: parseInt(document.getElementById('edit-inventory-minimum-stock').value),
                max_stock: parseInt(document.getElementById('edit-inventory-current-stock').value) * 2, // Establecer max_stock como 2x el current_stock
                unit: document.getElementById('edit-inventory-unit').value,
                unit_price: parseFloat(document.getElementById('edit-inventory-unit-price').value) || 0,
                supplier: document.getElementById('edit-inventory-supplier').value || null
            };

            try {
                await apiRequest(`/inventory/${id}`, {
                    method: 'PUT',
                    body: JSON.stringify(formData)
                });
                showToast('Elemento de inventario actualizado exitosamente', 'success');
                closeModal();
                await loadInventoryItems();
            } catch (error) {
                console.error('Error actualizando elemento de inventario:', error);
                showToast('Error al actualizar elemento de inventario', 'error');
            }
        });
    } catch (error) {
        console.error('Error editando elemento de inventario:', error);
        showToast('Error al editar elemento de inventario', 'error');
    }
}

async function deleteInventoryItem(id) {
    if (confirm('¿Estás seguro de que quieres eliminar este elemento del inventario?')) {
        try {
            await apiRequest(`/inventory/${id}`, {
                method: 'DELETE'
            });
            showToast('Elemento de inventario eliminado exitosamente', 'success');
            await loadInventoryItems();
        } catch (error) {
            console.error('Error eliminando elemento de inventario:', error);
            showToast('Error al eliminar elemento de inventario', 'error');
        }
    }
}

function updateStock(id) {
    showToast('Función de actualización de stock en desarrollo', 'info');
}

function showCreateInvoiceModal() {
    showModal('Crear Factura', `
        <form id="invoice-form">
            <div class="form-group">
                <label>Cliente:</label>
                <select id="invoice-customer" class="form-input" required>
                    <option value="">Seleccionar cliente</option>
                </select>
            </div>
            <div class="form-group">
                <label>Pedido:</label>
                <select id="invoice-order" class="form-input" required>
                    <option value="">Seleccionar pedido</option>
                </select>
            </div>
            <div class="form-group">
                <label>Método de Pago:</label>
                <select id="invoice-payment-method" class="form-input" required>
                    <option value="cash">Efectivo</option>
                    <option value="card">Tarjeta</option>
                    <option value="transfer">Transferencia</option>
                </select>
            </div>
            <div class="form-group">
                <label>Descuento (%):</label>
                <input type="number" id="invoice-discount" class="form-input" min="0" max="100" value="0">
            </div>
            <div class="form-group">
                <label>Impuestos (%):</label>
                <input type="number" id="invoice-tax" class="form-input" min="0" max="100" value="19">
            </div>
        </form>
    `, async () => {
        // Cargar clientes y pedidos
        try {
            const [customersResponse, ordersResponse] = await Promise.allSettled([
                apiRequest('/customers/'),
                apiRequest('/orders/')
            ]);

            const customers = customersResponse.status === 'fulfilled' ? customersResponse.value : [];
            const orders = ordersResponse.status === 'fulfilled' ? ordersResponse.value : [];

            // Llenar dropdowns
            const customerSelect = document.getElementById('invoice-customer');
            const orderSelect = document.getElementById('invoice-order');

            customerSelect.innerHTML = '<option value="">Seleccionar cliente</option>' +
                customers.map(customer =>
                    `<option value="${customer.id}">${customer.first_name} ${customer.last_name}</option>`
                ).join('');

            orderSelect.innerHTML = '<option value="">Seleccionar pedido</option>' +
                orders.map(order =>
                    `<option value="${order.id}">${order.order_number} - $${order.total_amount?.toFixed(2) || '0.00'}</option>`
                ).join('');

        } catch (error) {
            console.error('Error cargando datos:', error);
        }

        const formData = {
            customer_id: document.getElementById('invoice-customer').value,
            order_id: document.getElementById('invoice-order').value,
            payment_method: document.getElementById('invoice-payment-method').value,
            discount_percentage: parseFloat(document.getElementById('invoice-discount').value) || 0,
            tax_percentage: parseFloat(document.getElementById('invoice-tax').value) || 19
        };

        try {
            await apiRequest('/billing/', {
                method: 'POST',
                body: JSON.stringify(formData)
            });
            showToast('Factura creada exitosamente', 'success');
            closeModal();
            loadBillingData();
        } catch (error) {
            console.error('Error creando factura:', error);
            showToast('Error al crear factura', 'error');
        }
    });
}

async function viewInvoice(id) {
    try {
        const invoice = await apiRequest(`/billing/${id}`);

        showModal('Detalles de Factura', `
            <div class="invoice-details">
                <div class="detail-section">
                    <h3>Información de la Factura</h3>
                    <div class="detail-row">
                        <span>Número:</span>
                        <span>${invoice.invoice_number || invoice.id}</span>
                    </div>
                    <div class="detail-row">
                        <span>Fecha:</span>
                        <span>${new Date(invoice.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="detail-row">
                        <span>Estado:</span>
                        <span class="status-badge ${invoice.status}">${invoice.status}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Cliente</h3>
                    <div class="detail-row">
                        <span>Nombre:</span>
                        <span>${invoice.customer_name || 'N/A'}</span>
                    </div>
                    <div class="detail-row">
                        <span>Email:</span>
                        <span>${invoice.customer_email || 'N/A'}</span>
                    </div>
                </div>
                
                <div class="detail-section">
                    <h3>Totales</h3>
                    <div class="detail-row">
                        <span>Subtotal:</span>
                        <span>$${invoice.subtotal?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="detail-row">
                        <span>Descuento:</span>
                        <span>$${invoice.discount_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="detail-row">
                        <span>Impuestos:</span>
                        <span>$${invoice.tax_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                    <div class="detail-row total-row">
                        <span>Total:</span>
                        <span>$${invoice.total_amount?.toFixed(2) || '0.00'}</span>
                    </div>
                </div>
            </div>
        `, null);
    } catch (error) {
        console.error('Error obteniendo factura:', error);
        showToast('Error al obtener factura', 'error');
    }
}

async function updatePaymentStatus(id) {
    try {
        const invoice = await apiRequest(`/billing/${id}`);

        showModal('Actualizar Estado de Pago', `
            <form id="payment-status-form">
                <div class="form-group">
                    <label>Estado Actual:</label>
                    <span class="status-badge ${invoice.status}">${invoice.status}</span>
                </div>
                <div class="form-group">
                    <label>Nuevo Estado:</label>
                    <select id="new-payment-status" class="form-input" required>
                        <option value="pending" ${invoice.status === 'pending' ? 'selected' : ''}>Pendiente</option>
                        <option value="paid" ${invoice.status === 'paid' ? 'selected' : ''}>Pagado</option>
                        <option value="cancelled" ${invoice.status === 'cancelled' ? 'selected' : ''}>Cancelado</option>
                        <option value="refunded" ${invoice.status === 'refunded' ? 'selected' : ''}>Reembolsado</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Método de Pago:</label>
                    <select id="payment-method" class="form-input">
                        <option value="cash" ${invoice.payment_method === 'cash' ? 'selected' : ''}>Efectivo</option>
                        <option value="card" ${invoice.payment_method === 'card' ? 'selected' : ''}>Tarjeta</option>
                        <option value="transfer" ${invoice.payment_method === 'transfer' ? 'selected' : ''}>Transferencia</option>
                    </select>
                </div>
            </form>
        `, async () => {
            const formData = {
                status: document.getElementById('new-payment-status').value,
                payment_method: document.getElementById('payment-method').value
            };

            try {
                const params = new URLSearchParams({
                    payment_status: formData.status,
                    payment_method: formData.payment_method
                });
                await apiRequest(`/billing/${id}/payment?${params}`, {
                    method: 'PATCH'
                });
                showToast('Estado de pago actualizado exitosamente', 'success');
                closeModal();
                loadBillingData();
            } catch (error) {
                console.error('Error actualizando estado de pago:', error);
                showToast('Error al actualizar estado de pago', 'error');
            }
        });
    } catch (error) {
        console.error('Error obteniendo factura:', error);
        showToast('Error al obtener factura', 'error');
    }
}

async function deleteInvoice(id) {
    if (confirm('¿Estás seguro de que quieres eliminar esta factura?')) {
        try {
            await apiRequest(`/billing/${id}`, {
                method: 'DELETE'
            });
            showToast('Factura eliminada exitosamente', 'success');
            loadBillingData();
        } catch (error) {
            console.error('Error eliminando factura:', error);
            showToast('Error al eliminar factura', 'error');
        }
    }
}

// ==================== FUNCIONES DE INICIALIZACIÓN ADICIONALES ====================

// Cargar datos cuando se cambie de sección
document.addEventListener('DOMContentLoaded', function () {
    // Configurar eventos de filtros
    const searchInputs = document.querySelectorAll('input[type="text"]');
    searchInputs.forEach(input => {
        input.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                const section = this.closest('.section').id;
                if (section === 'menu') applyMenuFilters();
                if (section === 'customers') applyCustomerFilters();
            }
        });
    });

    // Configurar eventos de selects
    const selects = document.querySelectorAll('select');
    selects.forEach(select => {
        select.addEventListener('change', function () {
            const section = this.closest('.section').id;
            if (section === 'orders') applyOrderFilters();
            if (section === 'inventory') applyInventoryFilters();
        });
    });
});
