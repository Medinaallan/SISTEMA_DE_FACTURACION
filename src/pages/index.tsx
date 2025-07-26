import React, { useEffect, useState } from 'react';
import { useProducts } from '../hooks/useProducts';
import { useConfig } from '../hooks/useConfig';
import { useInvoices } from '../hooks/useInvoices';
import { useClients } from '../hooks/useClients';
import { useCategories } from '../hooks/useCategories';
import { useUsers } from '../hooks/useUsers';
import { formatCurrency } from '../lib/utils';
import { initializeDatabase } from '../lib/database-init';
import { Product, InvoiceItem, Client, Category, User, db } from '../lib/database';
import { printInvoice, generateInvoicePDF, generateInvoicesCSV, downloadCSV, generateInvoiceHTML } from '../lib/invoice-generator';
import Login from '../components/Login';

export default function Dashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const { products, getLowStockProducts, addProduct, refresh, updateProduct } = useProducts();
  const { config, updateConfig } = useConfig();
  const { createInvoice, getTotalSalesThisMonth, getInvoiceCount } = useInvoices();
  const { clients, loadClients, addClient, updateClient, deleteClient, getActiveClients } = useClients();
  const { categories, loadCategories, addCategory, updateCategory, deleteCategory, getActiveCategories } = useCategories();
  const { users, loadUsers, addUser, updateUser, deleteUser, getActiveUsers } = useUsers();
  
  const [invoices, setInvoices] = useState<any[]>([]);
  const [lowStockProducts, setLowStockProducts] = useState<any[]>([]);
  const [showNewInvoice, setShowNewInvoice] = useState(false);
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showReports, setShowReports] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showAddProductModal, setShowAddProductModal] = useState(false);
  const [showStockAlerts, setShowStockAlerts] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const [showClients, setShowClients] = useState(false);
  const [showInvoiceList, setShowInvoiceList] = useState(false);
  const [showUsers, setShowUsers] = useState(false);
  
  // Estados para edición
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  
  // Estados para formularios
  const [productForm, setProductForm] = useState({
    sku: '',
    name: '',
    cost: '',
    salePrice: '',
    currentStock: ''
  });

  const [configForm, setConfigForm] = useState({
    companyName: '',
    companyRtn: '',
    companyAddress: '',
    companyPhone: '',
    companyEmail: '',
    companyWebsite: '',
    invoicePrefix: '',
    taxRate: '',
    currency: 'L',
    lowStockAlert: '10',
    autoBackup: true,
    emailNotifications: false,
    printFormat: 'A4',
    language: 'es',
    ticketHeader: '',
    ticketFooter: ''
  });

  const [invoiceForm, setInvoiceForm] = useState({
    clientName: '',
    clientRtn: '',
    selectedProducts: {} as Record<string, number>
  });

  // Estados adicionales para la facturación profesional
  const [invoiceItems, setInvoiceItems] = useState<Array<{
    productId: string;
    productName: string;
    sku: string;
    unitPrice: number;
    quantity: number;
    subtotal: number;
  }>>([]);

  const [invoiceTotals, setInvoiceTotals] = useState({
    subtotal: 0,
    tax: 0,
    total: 0
  });

  // Estados para previsualización de facturas
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    // Verificar autenticación
    const checkAuth = () => {
      const authenticated = localStorage.getItem('erp_authenticated');
      if (authenticated === 'true') {
        setIsAuthenticated(true);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  useEffect(() => {
    if (!isAuthenticated) return;
    
    // Inicializar datos si no existen
    initializeDatabase();
    
    // Cargar productos con stock bajo
    const lowStock = getLowStockProducts();
    setLowStockProducts(lowStock);
    
    // Cargar facturas
    const allInvoices = db.invoices.getAll();
    setInvoices(allInvoices);
  }, [isAuthenticated]);

  useEffect(() => {
    // Inicializar formularios con datos actuales cuando config esté disponible
    if (config) {
      setConfigForm({
        companyName: config.companyName || 'Mi Empresa Honduras',
        companyRtn: config.companyRtn || '12345678901234',
        companyAddress: config.companyAddress || 'Tegucigalpa, Honduras',
        companyPhone: config.companyPhone || '+504 1234-5678',
        companyEmail: config.companyEmail || 'info@empresa.hn',
        companyWebsite: config.companyWebsite || 'www.empresa.hn',
        invoicePrefix: config.invoicePrefix || 'FACT-',
        taxRate: ((config.taxRate || 0.15) * 100).toString(),
        currency: 'L',
        lowStockAlert: config.lowStockAlert?.toString() || '10',
        autoBackup: config.autoBackup || true,
        emailNotifications: config.emailNotifications || false,
        printFormat: config.printFormat || 'A4',
        language: config.language || 'es',
        ticketHeader: config.ticketHeader || 'Gracias por su compra',
        ticketFooter: config.ticketFooter || 'Vuelva pronto'
      });
    }
    
    // Cargar datos desde la base de datos
    if (isAuthenticated) {
      loadClients();
      loadCategories();
      loadUsers();
      
      // Configurar cliente por defecto
      const activeClients = getActiveClients();
      const defaultClient = activeClients.find(c => c.name === 'Consumidor Final');
      if (defaultClient) {
        setSelectedClientId(defaultClient.id);
      }
    }
  }, [config, isAuthenticated, loadClients, loadCategories, loadUsers, getActiveClients]);

  // Funciones para manejar formularios
  const handleProductSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!productForm.sku || !productForm.name || !productForm.salePrice) {
      alert('Por favor complete todos los campos obligatorios');
      return;
    }

    const newProduct = {
      sku: productForm.sku,
      name: productForm.name,
      category: 'General',
      cost: parseFloat(productForm.cost) || 0,
      salePrice: parseFloat(productForm.salePrice),
      tax: 0.15,
      minStock: 10,
      currentStock: parseInt(productForm.currentStock) || 0,
      description: ''
    };

    addProduct(newProduct);
    
    // Limpiar formulario
    setProductForm({
      sku: '',
      name: '',
      cost: '',
      salePrice: '',
      currentStock: ''
    });

    setShowAddProductModal(false);
    refresh();
    alert('Producto agregado exitosamente');
  };

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updates = {
      companyName: configForm.companyName,
      companyRtn: configForm.companyRtn,
      companyAddress: configForm.companyAddress,
      companyPhone: configForm.companyPhone,
      companyEmail: configForm.companyEmail,
      companyWebsite: configForm.companyWebsite,
      invoicePrefix: configForm.invoicePrefix,
      taxRate: parseFloat(configForm.taxRate) / 100,
      lowStockAlert: parseInt(configForm.lowStockAlert),
      autoBackup: configForm.autoBackup,
      emailNotifications: configForm.emailNotifications,
      printFormat: configForm.printFormat,
      language: configForm.language,
      ticketHeader: configForm.ticketHeader,
      ticketFooter: configForm.ticketFooter
    };

    updateConfig(updates);
    alert('Configuración guardada exitosamente. Los cambios se mantienen después de cerrar sesión.');
  };

  const handleInvoiceSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!invoiceForm.clientName.trim()) {
      alert('Por favor ingrese el nombre del cliente');
      return;
    }

    if (invoiceItems.length === 0) {
      alert('Por favor agregue al menos un producto a la factura');
      return;
    }

    // Verificar stock antes de crear la factura
    for (const item of invoiceItems) {
      const product = products.find(p => p.id === item.productId);
      if (!product || item.quantity > product.currentStock) {
        alert(`Stock insuficiente para ${item.productName}. Stock disponible: ${product?.currentStock || 0}`);
        return;
      }
    }

    // Crear items de la factura con el formato correcto
    const invoiceItemsFormatted: InvoiceItem[] = invoiceItems.map(item => ({
      productId: item.productId,
      productName: item.productName,
      sku: item.sku,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      tax: item.subtotal * (config?.taxRate || 0.15),
      total: item.subtotal
    }));

    const invoice = createInvoice(
      invoiceForm.clientName.trim(),
      invoiceForm.clientRtn.trim(),
      invoiceItemsFormatted
    );

    // Actualizar stock de productos
    invoiceItems.forEach(item => {
      const product = products.find(p => p.id === item.productId);
      if (product) {
        const newStock = product.currentStock - item.quantity;
        updateProduct(product.id, { currentStock: newStock });
      }
    });

    // Actualizar lista de facturas
    const allInvoices = db.invoices.getAll();
    setInvoices(allInvoices);

    clearInvoice();
    alert(`✅ Factura ${invoice.invoiceNumber} creada exitosamente!\n\n📋 CAI: ${invoice.cai}\n💰 Total: ${formatCurrency(invoice.total)}\n📊 Productos: ${invoiceItems.length}`);
  };

  const handleProductQuantityChange = (productId: string, quantity: string) => {
    const qty = parseInt(quantity) || 0;
    setInvoiceForm(prev => ({
      ...prev,
      selectedProducts: {
        ...prev.selectedProducts,
        [productId]: qty
      }
    }));
  };

  // Funciones para manejo profesional de facturación
  const addProductToInvoice = (productId: string) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    const existingItem = invoiceItems.find(item => item.productId === productId);
    if (existingItem) {
      alert('Este producto ya está en la factura. Use el botón de editar para cambiar la cantidad.');
      return;
    }

    const newItem = {
      productId: product.id,
      productName: product.name,
      sku: product.sku,
      unitPrice: product.salePrice,
      quantity: 1,
      subtotal: product.salePrice
    };

    setInvoiceItems(prev => [...prev, newItem]);
    calculateInvoiceTotals([...invoiceItems, newItem]);
  };

  const updateInvoiceItemQuantity = (productId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeProductFromInvoice(productId);
      return;
    }

    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (newQuantity > product.currentStock) {
      alert(`Stock insuficiente. Stock disponible: ${product.currentStock}`);
      return;
    }

    const updatedItems = invoiceItems.map(item => 
      item.productId === productId 
        ? { ...item, quantity: newQuantity, subtotal: item.unitPrice * newQuantity }
        : item
    );

    setInvoiceItems(updatedItems);
    calculateInvoiceTotals(updatedItems);
  };

  const removeProductFromInvoice = (productId: string) => {
    const updatedItems = invoiceItems.filter(item => item.productId !== productId);
    setInvoiceItems(updatedItems);
    calculateInvoiceTotals(updatedItems);
  };

  const calculateInvoiceTotals = (items: typeof invoiceItems) => {
    const subtotal = items.reduce((sum, item) => sum + item.subtotal, 0);
    const taxRate = config?.taxRate || 0.15;
    const tax = subtotal * taxRate;
    const total = subtotal + tax;

    setInvoiceTotals({
      subtotal,
      tax,
      total
    });
  };

  const handleLogout = () => {
    localStorage.removeItem('erp_authenticated');
    localStorage.removeItem('erp_user');
    localStorage.removeItem('erp_login_time');
    setIsAuthenticated(false);
    setCurrentView('dashboard');
  };

  const handleLogin = (success: boolean) => {
    if (success) {
      setIsAuthenticated(true);
    }
  };

  // Función para exportar datos
  const exportData = () => {
    const data = {
      products: db.products.getAll(),
      invoices: db.invoices.getAll(),
      config: db.config.get(),
      exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erp-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    alert('✅ Datos exportados exitosamente');
  };

  // Si está cargando
  if (loading) {
    return React.createElement('div', { className: 'min-h-screen bg-gray-50 flex items-center justify-center' },
      React.createElement('div', { className: 'text-center' },
        React.createElement('div', { className: 'text-6xl mb-4' }, '🏢'),
        React.createElement('div', { className: 'text-xl font-semibold text-gray-600' }, 'Cargando ERP Honduras...')
      )
    );
  }

  // Si no está autenticado, mostrar login
  if (!isAuthenticated) {
    return React.createElement(Login, { onLogin: handleLogin });
  }

  const clearInvoice = () => {
    setInvoiceForm({
      clientName: '',
      clientRtn: '',
      selectedProducts: {}
    });
    setInvoiceItems([]);
    setInvoiceTotals({
      subtotal: 0,
      tax: 0,
      total: 0
    });
  };

  // Funciones auxiliares adicionales
  const getTotalSalesToday = () => {
    const today = new Date().toDateString();
    return invoices
      .filter(invoice => new Date(invoice.date).toDateString() === today)
      .reduce((total, invoice) => total + invoice.total, 0);
  };

  const getTotalStock = () => {
    return products.reduce((sum, p) => sum + p.currentStock, 0);
  };

  const getRecentActivity = () => {
    const activities: Array<{
      id: string;
      icon: string;
      title: string;
      time: string;
    }> = [];
    invoices.slice(-5).forEach(invoice => {
      activities.push({
        id: invoice.id,
        icon: '🧾',
        title: `Factura creada para ${invoice.clientName}`,
        time: new Date(invoice.createdAt).toLocaleString()
      });
    });
    return activities.reverse();
  };

  const getTopProducts = () => {
    return products.slice(0, 5);
  };

  const getTotalItemsSold = () => {
    return invoices.reduce((total, invoice) =>
      total + invoice.items.reduce((itemTotal: number, item: any) => itemTotal + item.quantity, 0), 0
    );
  };  const getUniqueCustomers = () => {
    const uniqueCustomers = new Set(invoices.map(invoice => invoice.clientName));
    return uniqueCustomers.size;
  };

  // Funciones de renderizado para cada vista
  const renderDashboard = () => {
    return React.createElement('div', {},
      // Stats profesionales
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8' },
        React.createElement('div', { className: 'bg-gradient-to-r from-blue-500 to-blue-600 p-6 rounded-lg text-white' },
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('div', {},
              React.createElement('p', { className: 'text-blue-100' }, 'Ventas Hoy'),
              React.createElement('p', { className: 'text-2xl font-bold' }, formatCurrency(getTotalSalesToday()))
            ),
            React.createElement('div', { className: 'text-3xl' }, '💰')
          )
        ),
        React.createElement('div', { className: 'bg-gradient-to-r from-green-500 to-green-600 p-6 rounded-lg text-white' },
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('div', {},
              React.createElement('p', { className: 'text-green-100' }, 'Productos'),
              React.createElement('p', { className: 'text-2xl font-bold' }, products.length)
            ),
            React.createElement('div', { className: 'text-3xl' }, '📦')
          )
        ),
        React.createElement('div', { className: 'bg-gradient-to-r from-yellow-500 to-yellow-600 p-6 rounded-lg text-white' },
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('div', {},
              React.createElement('p', { className: 'text-yellow-100' }, 'Facturas'),
              React.createElement('p', { className: 'text-2xl font-bold' }, getInvoiceCount())
            ),
            React.createElement('div', { className: 'text-3xl' }, '🧾')
          )
        ),
        React.createElement('div', { className: 'bg-gradient-to-r from-purple-500 to-purple-600 p-6 rounded-lg text-white' },
          React.createElement('div', { className: 'flex items-center justify-between' },
            React.createElement('div', {},
              React.createElement('p', { className: 'text-purple-100' }, 'Stock Total'),
              React.createElement('p', { className: 'text-2xl font-bold' }, getTotalStock())
            ),
            React.createElement('div', { className: 'text-3xl' }, '📊')
          )
        )
      ),

      // Gráficos y resumen
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8' },
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, '📈 Ventas Últimos 7 Días'),
          React.createElement('div', { className: 'text-center py-8 text-gray-500' }, 'Gráfico en desarrollo')
        ),
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, '⚠️ Productos con Stock Bajo'),
          React.createElement('div', { className: 'space-y-2' },
            getLowStockProducts().length > 0 ? 
              getLowStockProducts().slice(0, 5).map(product => 
                React.createElement('div', { 
                  key: product.id,
                  className: 'flex justify-between items-center p-2 bg-red-50 rounded'
                },
                  React.createElement('span', { className: 'text-sm font-medium' }, product.name),
                  React.createElement('span', { className: 'text-sm text-red-600' }, `Stock: ${product.currentStock}`)
                )
              ) :
              React.createElement('p', { className: 'text-gray-500 text-center py-4' }, 'Todos los productos tienen stock suficiente')
          )
        )
      ),

      // Actividad reciente
      React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
        React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, '🕒 Actividad Reciente'),
        React.createElement('div', { className: 'space-y-3' },
          getRecentActivity().length > 0 ?
            getRecentActivity().slice(0, 5).map(activity =>
              React.createElement('div', { 
                key: activity.id,
                className: 'flex items-center space-x-3 p-3 bg-gray-50 rounded'
              },
                React.createElement('div', { className: 'text-2xl' }, activity.icon),
                React.createElement('div', { className: 'flex-1' },
                  React.createElement('p', { className: 'text-sm font-medium text-gray-900' }, activity.title),
                  React.createElement('p', { className: 'text-xs text-gray-500' }, activity.time)
                )
              )
            ) :
            React.createElement('p', { className: 'text-gray-500 text-center py-4' }, 'No hay actividad reciente')
        )
      )
    );
  };

  const renderNewInvoice = () => {
    return React.createElement('div', { className: 'bg-white rounded-lg shadow p-6' },
      React.createElement('div', { className: 'flex items-center justify-between mb-6' },
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, '🧾 Nueva Factura'),
        React.createElement('div', { className: 'text-sm text-gray-500' },
          `Factura #${config?.invoicePrefix || 'FAC'}-${String(getInvoiceCount() + 1).padStart(6, '0')}`
        )
      ),
      
      // Información del Cliente
      React.createElement('div', { className: 'mb-6 p-4 bg-gray-50 rounded-lg' },
        React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, '👤 Información del Cliente'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
          React.createElement('div', {},
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Seleccionar Cliente *'),
            React.createElement('select', { 
              value: selectedClientId,
              onChange: (e: any) => {
                setSelectedClientId(e.target.value);
                const selectedClient = clients.find(c => c.id === e.target.value);
                if (selectedClient) {
                  setInvoiceForm(prev => ({
                    ...prev, 
                    clientName: selectedClient.name,
                    clientRtn: selectedClient.rtn || ''
                  }));
                }
              },
              className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500',
              required: true
            },
              React.createElement('option', { value: '' }, 'Seleccione un cliente...'),
              getActiveClients().map(client => 
                React.createElement('option', { key: client.id, value: client.id }, client.name)
              )
            )
          ),
          React.createElement('div', {},
            React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'RTN del Cliente'),
            React.createElement('input', { 
              type: 'text',
              value: invoiceForm.clientRtn,
              readOnly: true,
              className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-100 text-gray-600',
              placeholder: 'Se auto-completa al seleccionar cliente'
            })
          )
        ),
        // Botón para agregar nuevo cliente rápido
        React.createElement('div', { className: 'mt-4' },
          React.createElement('button', {
            type: 'button',
            onClick: () => setShowClients(true),
            className: 'text-sm text-blue-600 hover:text-blue-800 font-medium'
          }, '+ Agregar nuevo cliente')
        )
      ),

      // Seleccionar Productos
      React.createElement('div', { className: 'mb-6 p-4 bg-gray-50 rounded-lg' },
        React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, '📦 Agregar Productos'),
        React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4' },
          products.length > 0 ? 
            products.map((product) => 
              React.createElement('div', { 
                key: product.id,
                className: 'border border-gray-200 rounded-lg p-3 hover:border-blue-500 transition-colors cursor-pointer' 
              },
                React.createElement('div', { className: 'flex flex-col h-full' },
                  React.createElement('h4', { className: 'font-medium text-gray-900 text-sm' }, product.name),
                  React.createElement('p', { className: 'text-xs text-gray-600' }, `SKU: ${product.sku}`),
                  React.createElement('p', { className: 'text-xs text-gray-600' }, `Stock: ${product.currentStock}`),
                  React.createElement('p', { className: 'text-lg font-bold text-green-600 mt-2' }, formatCurrency(product.salePrice)),
                  React.createElement('button', { 
                    type: 'button',
                    onClick: () => addProductToInvoice(product.id),
                    disabled: product.currentStock === 0,
                    className: `mt-2 w-full px-3 py-1 text-sm rounded ${
                      product.currentStock === 0 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`
                  }, product.currentStock === 0 ? 'Sin Stock' : '+ Agregar')
                )
              )
            ) : 
            React.createElement('p', { className: 'text-gray-500 col-span-full text-center py-8' }, 'No hay productos disponibles')
        )
      ),

      // Tabla de Productos en la Factura
      invoiceItems.length > 0 ? 
        React.createElement('div', { className: 'mb-6' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, '📋 Productos en la Factura'),
          React.createElement('div', { className: 'overflow-x-auto' },
            React.createElement('table', { className: 'min-w-full bg-white border border-gray-200 rounded-lg' },
              React.createElement('thead', { className: 'bg-gray-50' },
                React.createElement('tr', {},
                  React.createElement('th', { className: 'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase' }, 'Producto'),
                  React.createElement('th', { className: 'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase' }, 'Precio Unit.'),
                  React.createElement('th', { className: 'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase' }, 'Cantidad'),
                  React.createElement('th', { className: 'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase' }, 'Subtotal'),
                  React.createElement('th', { className: 'px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase' }, 'Acciones')
                )
              ),
              React.createElement('tbody', { className: 'divide-y divide-gray-200' },
                invoiceItems.map((item) => 
                  React.createElement('tr', { key: item.productId },
                    React.createElement('td', { className: 'px-4 py-2' },
                      React.createElement('div', {},
                        React.createElement('div', { className: 'font-medium text-gray-900' }, item.productName),
                        React.createElement('div', { className: 'text-sm text-gray-500' }, `SKU: ${item.sku}`)
                      )
                    ),
                    React.createElement('td', { className: 'px-4 py-2 text-gray-900' }, formatCurrency(item.unitPrice)),
                    React.createElement('td', { className: 'px-4 py-2' },
                      React.createElement('input', { 
                        type: 'number',
                        min: '1',
                        value: item.quantity,
                        onChange: (e: any) => updateInvoiceItemQuantity(item.productId, parseInt(e.target.value) || 0),
                        className: 'w-16 border border-gray-300 rounded px-2 py-1 text-center'
                      })
                    ),
                    React.createElement('td', { className: 'px-4 py-2 font-medium text-gray-900' }, formatCurrency(item.subtotal)),
                    React.createElement('td', { className: 'px-4 py-2' },
                      React.createElement('button', { 
                        type: 'button',
                        onClick: () => removeProductFromInvoice(item.productId),
                        className: 'text-red-600 hover:text-red-800 text-sm'
                      }, '🗑️')
                    )
                  )
                )
              )
            )
          ),

          // Totales
          React.createElement('div', { className: 'mt-4 bg-gray-50 p-4 rounded-lg' },
            React.createElement('div', { className: 'flex justify-end' },
              React.createElement('div', { className: 'w-64' },
                React.createElement('div', { className: 'flex justify-between py-1' },
                  React.createElement('span', { className: 'text-gray-600' }, 'Subtotal:'),
                  React.createElement('span', { className: 'font-medium' }, formatCurrency(invoiceTotals.subtotal))
                ),
                React.createElement('div', { className: 'flex justify-between py-1' },
                  React.createElement('span', { className: 'text-gray-600' }, `Impuesto (${((config?.taxRate || 0.15) * 100).toFixed(1)}%):`),
                  React.createElement('span', { className: 'font-medium' }, formatCurrency(invoiceTotals.tax))
                ),
                React.createElement('div', { className: 'flex justify-between py-2 border-t border-gray-300 font-bold text-lg' },
                  React.createElement('span', {}, 'Total:'),
                  React.createElement('span', { className: 'text-green-600' }, formatCurrency(invoiceTotals.total))
                )
              )
            )
          )
        ) : null,

      // Botones de Acción
      React.createElement('div', { className: 'flex space-x-4 pt-4 border-t border-gray-200' },
        React.createElement('button', { 
          type: 'button',
          onClick: handleInvoiceSubmit,
          disabled: invoiceItems.length === 0 || !invoiceForm.clientName.trim(),
          className: `px-6 py-2 rounded font-medium ${
            invoiceItems.length === 0 || !invoiceForm.clientName.trim()
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-blue-600 text-white hover:bg-blue-700'
          }`
        }, '💾 Crear Factura'),
        React.createElement('button', { 
          type: 'button',
          onClick: clearInvoice,
          className: 'bg-gray-600 text-white px-6 py-2 rounded hover:bg-gray-700'
        }, '🗑️ Limpiar Todo')
      )
    );
  };

  const renderProducts = () => {
    return React.createElement('div', {},
      React.createElement('div', { className: 'flex justify-between items-center mb-6' },
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, '📦 Gestión de Productos'),
        React.createElement('button', { 
          onClick: () => setShowAddProductModal(true),
          className: 'bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700'
        }, '+ Nuevo Producto')
      ),

      // Tabla de productos
      React.createElement('div', { className: 'bg-white rounded-lg shadow overflow-hidden' },
        React.createElement('table', { className: 'min-w-full' },
          React.createElement('thead', { className: 'bg-gray-50' },
            React.createElement('tr', {},
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Producto'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'SKU'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Stock'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Precio'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Estado')
            )
          ),
          React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
            products.map(product => 
              React.createElement('tr', { key: product.id },
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                  React.createElement('div', { className: 'text-sm font-medium text-gray-900' }, product.name)
                ),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, product.sku),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                  React.createElement('span', { 
                    className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.currentStock === 0 
                        ? 'bg-red-100 text-red-800' 
                        : product.currentStock < 10 
                          ? 'bg-yellow-100 text-yellow-800' 
                          : 'bg-green-100 text-green-800'
                    }`
                  }, product.currentStock)
                ),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-900' }, formatCurrency(product.salePrice)),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                  React.createElement('span', { 
                    className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      product.currentStock === 0 
                        ? 'bg-red-100 text-red-800' 
                        : 'bg-green-100 text-green-800'
                    }`
                  }, product.currentStock === 0 ? 'Sin Stock' : 'Disponible')
                )
              )
            )
          )
        )
      ),

      // Modal para agregar producto
      showAddProductModal ? React.createElement('div', { 
        className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'
      },
        React.createElement('div', { className: 'bg-white rounded-lg p-6 w-full max-w-md mx-4' },
          React.createElement('div', { className: 'flex justify-between items-center mb-4' },
            React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, '📦 Nuevo Producto'),
            React.createElement('button', { 
              onClick: () => setShowAddProductModal(false),
              className: 'text-gray-400 hover:text-gray-600'
            }, '✕')
          ),
          React.createElement('form', { 
            className: 'space-y-4',
            onSubmit: handleProductSubmit
          },
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'SKU *'),
              React.createElement('input', { 
                type: 'text',
                required: true,
                value: productForm.sku,
                onChange: (e: any) => setProductForm(prev => ({...prev, sku: e.target.value})),
                className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                placeholder: 'PROD001'
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Nombre del Producto *'),
              React.createElement('input', { 
                type: 'text',
                required: true,
                value: productForm.name,
                onChange: (e: any) => setProductForm(prev => ({...prev, name: e.target.value})),
                className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                placeholder: 'Nombre del producto'
              })
            ),
            React.createElement('div', { className: 'grid grid-cols-2 gap-4' },
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Precio de Costo (L)'),
                React.createElement('input', { 
                  type: 'number',
                  step: '0.01',
                  value: productForm.cost,
                  onChange: (e: any) => setProductForm(prev => ({...prev, cost: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                  placeholder: '0.00'
                })
              ),
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Precio de Venta (L) *'),
                React.createElement('input', { 
                  type: 'number',
                  step: '0.01',
                  required: true,
                  value: productForm.salePrice,
                  onChange: (e: any) => setProductForm(prev => ({...prev, salePrice: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                  placeholder: '0.00'
                })
              )
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Stock Inicial'),
              React.createElement('input', { 
                type: 'number',
                value: productForm.currentStock,
                onChange: (e: any) => setProductForm(prev => ({...prev, currentStock: e.target.value})),
                className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                placeholder: '0'
              })
            ),
            React.createElement('div', { className: 'flex space-x-3 pt-4' },
              React.createElement('button', { 
                type: 'submit',
                className: 'flex-1 bg-green-600 text-white py-2 px-4 rounded hover:bg-green-700'
              }, '💾 Agregar Producto'),
              React.createElement('button', { 
                type: 'button',
                onClick: () => setShowAddProductModal(false),
                className: 'flex-1 bg-gray-600 text-white py-2 px-4 rounded hover:bg-gray-700'
              }, '❌ Cancelar')
            )
          )
        )
      ) : null
    );
  };

  const renderSettings = () => {
    return React.createElement('div', {},
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-6' }, '⚙️ Configuración del Sistema'),
      
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6' },
        // Configuración de la Empresa
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, '🏢 Datos de la Empresa'),
          React.createElement('form', { 
            className: 'space-y-4',
            onSubmit: handleConfigSubmit 
          },
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Nombre de la Empresa'),
              React.createElement('input', { 
                type: 'text',
                value: configForm.companyName || '',
                onChange: (e: any) => setConfigForm(prev => ({...prev, companyName: e.target.value})),
                className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'RTN'),
              React.createElement('input', { 
                type: 'text',
                value: configForm.companyRtn || '',
                onChange: (e: any) => setConfigForm(prev => ({...prev, companyRtn: e.target.value})),
                className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Dirección'),
              React.createElement('textarea', { 
                value: configForm.companyAddress || '',
                onChange: (e: any) => setConfigForm(prev => ({...prev, companyAddress: e.target.value})),
                className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                rows: 3
              })
            ),
            React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 gap-4' },
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Teléfono'),
                React.createElement('input', { 
                  type: 'text',
                  value: configForm.companyPhone || '',
                  onChange: (e: any) => setConfigForm((prev: any) => ({...prev, companyPhone: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                })
              ),
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Email'),
                React.createElement('input', { 
                  type: 'email',
                  value: configForm.companyEmail || '',
                  onChange: (e: any) => setConfigForm((prev: any) => ({...prev, companyEmail: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                })
              )
            ),
            React.createElement('button', { 
              type: 'submit',
              className: 'w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700'
            }, '💾 Guardar Datos de Empresa')
          )
        ),

        // Configuración de Facturación
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, '🧾 Configuración de Facturación'),
          React.createElement('div', { className: 'space-y-4' },
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Prefijo de Facturas'),
              React.createElement('input', { 
                type: 'text',
                value: configForm.invoicePrefix || '',
                onChange: (e: any) => setConfigForm(prev => ({...prev, invoicePrefix: e.target.value})),
                className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Tasa de Impuesto (%)'),
              React.createElement('input', { 
                type: 'number',
                step: '0.01',
                value: configForm.taxRate || '',
                onChange: (e: any) => setConfigForm(prev => ({...prev, taxRate: e.target.value})),
                className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Moneda'),
              React.createElement('select', { 
                value: configForm.currency || 'HNL',
                onChange: (e: any) => setConfigForm(prev => ({...prev, currency: e.target.value})),
                className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
              },
                React.createElement('option', { value: 'HNL' }, 'Lempira (L)'),
                React.createElement('option', { value: 'USD' }, 'Dólar ($)'),
                React.createElement('option', { value: 'EUR' }, 'Euro (€)')
              )
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Encabezado de Ticket'),
              React.createElement('input', { 
                type: 'text',
                value: configForm.ticketHeader || '',
                onChange: (e: any) => setConfigForm(prev => ({...prev, ticketHeader: e.target.value})),
                placeholder: 'Ej: Gracias por su compra',
                className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
              })
            ),
            React.createElement('div', {},
              React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Pie de Ticket'),
              React.createElement('input', { 
                type: 'text',
                value: configForm.ticketFooter || '',
                onChange: (e: any) => setConfigForm(prev => ({...prev, ticketFooter: e.target.value})),
                placeholder: 'Ej: Vuelva pronto',
                className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
              })
            ),
            React.createElement('div', { className: 'flex items-center' },
              React.createElement('input', { 
                type: 'checkbox',
                checked: configForm.autoBackup || false,
                onChange: (e: any) => setConfigForm(prev => ({...prev, autoBackup: e.target.checked})),
                className: 'mr-2'
              }),
              React.createElement('label', { className: 'text-sm text-gray-700' }, 'Respaldo automático diario')
            ),
            React.createElement('div', { className: 'flex items-center' },
              React.createElement('input', { 
                type: 'checkbox',
                checked: configForm.autoBackup || false,
                onChange: (e: any) => setConfigForm((prev: any) => ({...prev, autoBackup: e.target.checked})),
                className: 'mr-2'
              }),
              React.createElement('label', { className: 'text-sm text-gray-700' }, 'Respaldo automático')
            )
          )
        )
      )
    );
  };

  const renderReports = () => {
    // Calcular estadísticas detalladas
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const monthlyInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.createdAt || inv.date);
      return invDate.getMonth() === currentMonth && invDate.getFullYear() === currentYear;
    });
    
    const weeklyInvoices = invoices.filter(inv => {
      const invDate = new Date(inv.createdAt || inv.date);
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return invDate >= weekAgo;
    });
    
    const totalSalesMonth = monthlyInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalSalesWeek = weeklyInvoices.reduce((sum, inv) => sum + inv.total, 0);
    const avgTicket = monthlyInvoices.length > 0 ? totalSalesMonth / monthlyInvoices.length : 0;
    
    // Top productos vendidos
    const productSales: Record<string, { name: string, quantity: number, revenue: number }> = {};
    monthlyInvoices.forEach(invoice => {
      invoice.items?.forEach((item: any) => {
        if (!productSales[item.productId]) {
          productSales[item.productId] = {
            name: item.productName,
            quantity: 0,
            revenue: 0
          };
        }
        productSales[item.productId].quantity += item.quantity;
        productSales[item.productId].revenue += item.total;
      });
    });
    
    const topProducts = Object.values(productSales)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
    
    // Clientes top
    const clientSales: Record<string, { name: string, invoices: number, total: number }> = {};
    monthlyInvoices.forEach(invoice => {
      if (!clientSales[invoice.clientName]) {
        clientSales[invoice.clientName] = {
          name: invoice.clientName,
          invoices: 0,
          total: 0
        };
      }
      clientSales[invoice.clientName].invoices++;
      clientSales[invoice.clientName].total += invoice.total;
    });
    
    const topClients = Object.values(clientSales)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);

    return React.createElement('div', {},
      React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-6' }, '📊 Reportes y Análisis Detallado'),
      
      // Métricas principales
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8' },
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow text-center' },
          React.createElement('div', { className: 'text-3xl mb-2' }, '💰'),
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, 'Ventas del Mes'),
          React.createElement('p', { className: 'text-2xl font-bold text-green-600' }, formatCurrency(totalSalesMonth)),
          React.createElement('p', { className: 'text-sm text-gray-600' }, `${monthlyInvoices.length} facturas`)
        ),
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow text-center' },
          React.createElement('div', { className: 'text-3xl mb-2' }, '📈'),
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, 'Ventas Semana'),
          React.createElement('p', { className: 'text-2xl font-bold text-blue-600' }, formatCurrency(totalSalesWeek)),
          React.createElement('p', { className: 'text-sm text-gray-600' }, `${weeklyInvoices.length} facturas`)
        ),
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow text-center' },
          React.createElement('div', { className: 'text-3xl mb-2' }, '🛒'),
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, 'Ticket Promedio'),
          React.createElement('p', { className: 'text-2xl font-bold text-purple-600' }, formatCurrency(avgTicket)),
          React.createElement('p', { className: 'text-sm text-gray-600' }, 'por factura')
        ),
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow text-center' },
          React.createElement('div', { className: 'text-3xl mb-2' }, '👥'),
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, 'Clientes Únicos'),
          React.createElement('p', { className: 'text-2xl font-bold text-orange-600' }, Object.keys(clientSales).length),
          React.createElement('p', { className: 'text-sm text-gray-600' }, 'este mes')
        )
      ),

      // Gráficos y análisis
      React.createElement('div', { className: 'grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8' },
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, '🏆 Top 5 Productos (Ingresos)'),
          React.createElement('div', { className: 'space-y-3' },
            topProducts.length > 0 ? topProducts.map((product, index) => 
              React.createElement('div', { 
                key: index,
                className: 'flex items-center justify-between p-3 bg-gray-50 rounded'
              },
                React.createElement('div', { className: 'flex items-center' },
                  React.createElement('span', { className: 'text-lg font-bold text-gray-400 mr-3' }, `#${index + 1}`),
                  React.createElement('div', {},
                    React.createElement('div', { className: 'font-medium' }, product.name),
                    React.createElement('div', { className: 'text-sm text-gray-500' }, `${product.quantity} vendidos`)
                  )
                ),
                React.createElement('div', { className: 'text-right' },
                  React.createElement('div', { className: 'font-bold text-green-600' }, formatCurrency(product.revenue)),
                  React.createElement('div', { className: 'text-sm text-gray-500' }, 'ingresos')
                )
              )
            ) : React.createElement('p', { className: 'text-gray-500 text-center py-4' }, 'No hay datos de ventas')
          )
        ),
        React.createElement('div', { className: 'bg-white p-6 rounded-lg shadow' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900 mb-4' }, '🌟 Top 5 Clientes'),
          React.createElement('div', { className: 'space-y-3' },
            topClients.length > 0 ? topClients.map((client, index) => 
              React.createElement('div', { 
                key: index,
                className: 'flex items-center justify-between p-3 bg-gray-50 rounded'
              },
                React.createElement('div', { className: 'flex items-center' },
                  React.createElement('span', { className: 'text-lg font-bold text-gray-400 mr-3' }, `#${index + 1}`),
                  React.createElement('div', {},
                    React.createElement('div', { className: 'font-medium' }, client.name),
                    React.createElement('div', { className: 'text-sm text-gray-500' }, `${client.invoices} compras`)
                  )
                ),
                React.createElement('div', { className: 'text-right' },
                  React.createElement('div', { className: 'font-bold text-blue-600' }, formatCurrency(client.total)),
                  React.createElement('div', { className: 'text-sm text-gray-500' }, 'total')
                )
              )
            ) : React.createElement('p', { className: 'text-gray-500 text-center py-4' }, 'No hay datos de clientes')
          )
        )
      ),
      
      // Tabla de facturas recientes
      React.createElement('div', { className: 'bg-white rounded-lg shadow' },
        React.createElement('div', { className: 'px-6 py-4 border-b border-gray-200' },
          React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, '📋 Facturas Recientes')
        ),
        React.createElement('div', { className: 'overflow-x-auto' },
          React.createElement('table', { className: 'min-w-full divide-y divide-gray-200' },
            React.createElement('thead', { className: 'bg-gray-50' },
              React.createElement('tr', {},
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Factura'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Cliente'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Fecha'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Items'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Total')
              )
            ),
            React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
              invoices.slice(-10).reverse().map(invoice => 
                React.createElement('tr', { key: invoice.id },
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement('div', { className: 'font-medium text-gray-900' }, invoice.invoiceNumber),
                    React.createElement('div', { className: 'text-sm text-gray-500' }, invoice.status)
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement('div', { className: 'text-sm text-gray-900' }, invoice.clientName)
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, 
                    new Date(invoice.createdAt || invoice.date).toLocaleDateString()
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, 
                    invoice.items?.length || 0
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement('div', { className: 'text-lg font-bold text-green-600' }, formatCurrency(invoice.total))
                  )
                )
              )
            )
          )
        )
      )
    );
  };

  const handleNewInvoice = () => {
    setShowNewInvoice(true);
    setShowAddProduct(false);
    setShowReports(false);
    setShowSettings(false);
  };

  const handleAddProduct = () => {
    setShowAddProduct(true);
    setShowNewInvoice(false);
    setShowReports(false);
    setShowSettings(false);
  };

  const handleReports = () => {
    setShowReports(true);
    setShowNewInvoice(false);
    setShowAddProduct(false);
    setShowSettings(false);
  };

  const handleSettings = () => {
    setShowSettings(true);
    setShowNewInvoice(false);
    setShowAddProduct(false);
    setShowReports(false);
  };

  const handleBackToDashboard = () => {
    setShowNewInvoice(false);
    setShowAddProduct(false);
    setShowReports(false);
    setShowSettings(false);
  };

  // Funciones de renderizado para las nuevas secciones
  const renderStockAlerts = () => {
    const criticalStock = products.filter(p => p.currentStock <= 0);
    const lowStock = products.filter(p => p.currentStock > 0 && p.currentStock <= (p.minStock || 10));
    const warningStock = products.filter(p => p.currentStock > (p.minStock || 10) && p.currentStock <= (p.minStock || 10) * 2);
    
    return React.createElement('div', {},
      React.createElement('div', { className: 'flex justify-between items-center mb-6' },
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, '⚠️ Alertas de Stock'),
        React.createElement('div', { className: 'text-sm text-gray-600' },
          `Última actualización: ${new Date().toLocaleString()}`
        )
      ),
      
      // Resumen de alertas
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-6' },
        React.createElement('div', { className: 'bg-red-50 border border-red-200 rounded-lg p-4' },
          React.createElement('div', { className: 'flex items-center' },
            React.createElement('div', { className: 'text-2xl mr-3' }, '🚨'),
            React.createElement('div', {},
              React.createElement('h3', { className: 'text-lg font-semibold text-red-800' }, 'Stock Crítico'),
              React.createElement('p', { className: 'text-red-600' }, `${criticalStock.length} productos sin stock`)
            )
          )
        ),
        React.createElement('div', { className: 'bg-yellow-50 border border-yellow-200 rounded-lg p-4' },
          React.createElement('div', { className: 'flex items-center' },
            React.createElement('div', { className: 'text-2xl mr-3' }, '⚠️'),
            React.createElement('div', {},
              React.createElement('h3', { className: 'text-lg font-semibold text-yellow-800' }, 'Stock Bajo'),
              React.createElement('p', { className: 'text-yellow-600' }, `${lowStock.length} productos con stock bajo`)
            )
          )
        ),
        React.createElement('div', { className: 'bg-orange-50 border border-orange-200 rounded-lg p-4' },
          React.createElement('div', { className: 'flex items-center' },
            React.createElement('div', { className: 'text-2xl mr-3' }, '📊'),
            React.createElement('div', {},
              React.createElement('h3', { className: 'text-lg font-semibold text-orange-800' }, 'Stock Medio'),
              React.createElement('p', { className: 'text-orange-600' }, `${warningStock.length} productos por monitorear`)
            )
          )
        )
      ),
      
      // Stock crítico
      criticalStock.length > 0 && React.createElement('div', { className: 'bg-white rounded-lg shadow mb-6' },
        React.createElement('div', { className: 'px-6 py-4 border-b border-gray-200 bg-red-50' },
          React.createElement('h3', { className: 'text-lg font-semibold text-red-800' }, '🚨 PRODUCTOS SIN STOCK - ACCIÓN INMEDIATA')
        ),
        React.createElement('div', { className: 'overflow-x-auto' },
          React.createElement('table', { className: 'min-w-full divide-y divide-gray-200' },
            React.createElement('thead', { className: 'bg-gray-50' },
              React.createElement('tr', {},
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Producto'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Categoría'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Stock'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Precio Venta'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Acciones')
              )
            ),
            React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
              criticalStock.map(product => 
                React.createElement('tr', { key: product.id, className: 'bg-red-50' },
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement('div', { className: 'font-medium text-gray-900' }, product.name),
                    React.createElement('div', { className: 'text-sm text-gray-500' }, `SKU: ${product.sku}`)
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, product.category),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement('span', { className: 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800' }, 
                      `${product.currentStock} / ${product.minStock || 10}`
                    )
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600' }, 
                    formatCurrency(product.salePrice)
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium' },
                    React.createElement('button', { 
                      className: 'text-blue-600 hover:text-blue-900',
                      onClick: () => {
                        const newStock = prompt(`Actualizar stock para ${product.name}:`, '10');
                        if (newStock && !isNaN(parseInt(newStock))) {
                          updateProduct(product.id, { currentStock: parseInt(newStock) });
                          refresh();
                        }
                      }
                    }, '🔄 Actualizar Stock')
                  )
                )
              )
            )
          )
        )
      ),
      
      // Stock bajo
      lowStock.length > 0 && React.createElement('div', { className: 'bg-white rounded-lg shadow mb-6' },
        React.createElement('div', { className: 'px-6 py-4 border-b border-gray-200 bg-yellow-50' },
          React.createElement('h3', { className: 'text-lg font-semibold text-yellow-800' }, '⚠️ PRODUCTOS CON STOCK BAJO')
        ),
        React.createElement('div', { className: 'overflow-x-auto' },
          React.createElement('table', { className: 'min-w-full divide-y divide-gray-200' },
            React.createElement('thead', { className: 'bg-gray-50' },
              React.createElement('tr', {},
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Producto'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Categoría'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Stock Actual'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Stock Mínimo'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Precio Venta'),
                React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Acciones')
              )
            ),
            React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
              lowStock.map(product => 
                React.createElement('tr', { key: product.id, className: 'bg-yellow-50' },
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement('div', { className: 'font-medium text-gray-900' }, product.name),
                    React.createElement('div', { className: 'text-sm text-gray-500' }, `SKU: ${product.sku}`)
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, product.category),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                    React.createElement('span', { className: 'inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-800' }, 
                      product.currentStock.toString()
                    )
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, 
                    product.minStock || 10
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium text-green-600' }, 
                    formatCurrency(product.salePrice)
                  ),
                  React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium' },
                    React.createElement('button', { 
                      className: 'text-blue-600 hover:text-blue-900',
                      onClick: () => {
                        const newStock = prompt(`Actualizar stock para ${product.name}:`, (product.minStock * 3).toString());
                        if (newStock && !isNaN(parseInt(newStock))) {
                          updateProduct(product.id, { currentStock: parseInt(newStock) });
                          refresh();
                        }
                      }
                    }, '📦 Reabastecer')
                  )
                )
              )
            )
          )
        )
      ),
      
      // Mensaje cuando todo está bien
      criticalStock.length === 0 && lowStock.length === 0 && React.createElement('div', { className: 'bg-white rounded-lg shadow' },
        React.createElement('div', { className: 'p-12 text-center' },
          React.createElement('div', { className: 'text-6xl mb-4' }, '✅'),
          React.createElement('h3', { className: 'text-xl font-semibold text-gray-900 mb-2' }, 'Inventario en Buen Estado'),
          React.createElement('p', { className: 'text-gray-600' }, 'Todos los productos tienen stock suficiente'),
          warningStock.length > 0 && React.createElement('p', { className: 'text-sm text-yellow-600 mt-2' }, 
            `${warningStock.length} productos están por debajo del doble del stock mínimo`
          )
        )
      )
    );
  };

  const renderCategories = () => {
    return React.createElement('div', {},
      React.createElement('div', { className: 'flex justify-between items-center mb-6' },
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, '🏷️ Categorías'),
        React.createElement('button', { 
          className: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2',
          onClick: () => setEditingCategory({ 
            id: '', 
            name: '', 
            description: '', 
            active: true, 
            createdAt: '', 
            updatedAt: '' 
          })
        }, '➕ Nueva Categoría')
      ),
      
      // Modal para agregar/editar categoría
      editingCategory && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
        React.createElement('div', { className: 'bg-white rounded-lg p-6 w-full max-w-md' },
          React.createElement('h3', { className: 'text-lg font-semibold mb-4' }, 
            editingCategory.id ? 'Editar Categoría' : 'Nueva Categoría'
          ),
          React.createElement('form', { 
            onSubmit: (e: any) => {
              e.preventDefault();
              if (editingCategory.id) {
                updateCategory(editingCategory.id, editingCategory);
              } else {
                addCategory(editingCategory);
              }
              setEditingCategory(null);
            }
          },
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Nombre *'),
                React.createElement('input', {
                  type: 'text',
                  required: true,
                  value: editingCategory.name,
                  onChange: (e: any) => setEditingCategory(prev => ({...prev!, name: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                })
              ),
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Descripción'),
                React.createElement('textarea', {
                  value: editingCategory.description,
                  onChange: (e: any) => setEditingCategory(prev => ({...prev!, description: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                  rows: 3
                })
              ),
              React.createElement('div', { className: 'flex gap-2 pt-4' },
                React.createElement('button', {
                  type: 'submit',
                  className: 'flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'
                }, 'Guardar'),
                React.createElement('button', {
                  type: 'button',
                  onClick: () => setEditingCategory(null),
                  className: 'flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400'
                }, 'Cancelar')
              )
            )
          )
        )
      ),
      
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
        categories.length > 0 ? categories.map(category => {
          const productCount = products.filter(p => p.category === category.name).length;
          return React.createElement('div', { 
            key: category.id,
            className: 'bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow'
          },
            React.createElement('div', { className: 'flex justify-between items-start mb-2' },
              React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, category.name),
              React.createElement('span', { 
                className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                  category.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`
              }, category.active ? 'Activa' : 'Inactiva')
            ),
            React.createElement('p', { className: 'text-gray-600 mb-4 min-h-12' }, category.description || 'Sin descripción'),
            React.createElement('div', { className: 'flex justify-between items-center' },
              React.createElement('span', { className: 'text-sm text-gray-500' }, `${productCount} producto${productCount !== 1 ? 's' : ''}`),
              React.createElement('div', { className: 'flex gap-2' },
                React.createElement('button', { 
                  className: 'text-blue-600 hover:text-blue-800 p-1',
                  onClick: () => setEditingCategory(category),
                  title: 'Editar categoría'
                }, '✏️'),
                React.createElement('button', { 
                  className: 'text-red-600 hover:text-red-800 p-1',
                  onClick: () => {
                    if (productCount > 0) {
                      alert('No se puede eliminar una categoría que tiene productos asignados');
                      return;
                    }
                    if (confirm('¿Está seguro de que desea eliminar esta categoría?')) {
                      deleteCategory(category.id);
                    }
                  },
                  title: 'Eliminar categoría'
                }, '🗑️')
              )
            )
          );
        }) : React.createElement('div', { className: 'col-span-full text-center py-8' },
          React.createElement('p', { className: 'text-gray-500' }, 'No hay categorías registradas')
        )
      )
    );
  };

  const renderClients = () => {
    return React.createElement('div', {},
      React.createElement('div', { className: 'flex justify-between items-center mb-6' },
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, '👥 Clientes'),
        React.createElement('button', { 
          className: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2',
          onClick: () => setEditingClient({ 
            id: '', 
            name: '', 
            rtn: '', 
            identityNumber: '', 
            phone: '', 
            email: '', 
            address: '', 
            city: '', 
            clientType: 'person', 
            active: true, 
            createdAt: '', 
            updatedAt: '' 
          })
        }, '➕ Nuevo Cliente')
      ),
      
      // Modal para agregar/editar cliente
      editingClient && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
        React.createElement('div', { className: 'bg-white rounded-lg p-6 w-full max-w-md max-h-96 overflow-y-auto' },
          React.createElement('h3', { className: 'text-lg font-semibold mb-4' }, 
            editingClient.id ? 'Editar Cliente' : 'Nuevo Cliente'
          ),
          React.createElement('form', { 
            onSubmit: (e: any) => {
              e.preventDefault();
              if (editingClient.id) {
                updateClient(editingClient.id, editingClient);
              } else {
                addClient(editingClient);
              }
              setEditingClient(null);
            }
          },
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Nombre *'),
                React.createElement('input', {
                  type: 'text',
                  required: true,
                  value: editingClient.name,
                  onChange: (e: any) => setEditingClient(prev => ({...prev!, name: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                })
              ),
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Tipo de Cliente'),
                React.createElement('select', {
                  value: editingClient.clientType,
                  onChange: (e: any) => setEditingClient(prev => ({...prev!, clientType: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                },
                  React.createElement('option', { value: 'person' }, 'Persona Natural'),
                  React.createElement('option', { value: 'company' }, 'Empresa')
                )
              ),
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'RTN'),
                React.createElement('input', {
                  type: 'text',
                  value: editingClient.rtn,
                  onChange: (e: any) => setEditingClient(prev => ({...prev!, rtn: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                })
              ),
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Teléfono'),
                React.createElement('input', {
                  type: 'tel',
                  value: editingClient.phone,
                  onChange: (e: any) => setEditingClient(prev => ({...prev!, phone: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                })
              ),
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Email'),
                React.createElement('input', {
                  type: 'email',
                  value: editingClient.email,
                  onChange: (e: any) => setEditingClient(prev => ({...prev!, email: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                })
              ),
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Dirección'),
                React.createElement('textarea', {
                  value: editingClient.address,
                  onChange: (e: any) => setEditingClient(prev => ({...prev!, address: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                  rows: 2
                })
              ),
              React.createElement('div', { className: 'flex gap-2 pt-4' },
                React.createElement('button', {
                  type: 'submit',
                  className: 'flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'
                }, 'Guardar'),
                React.createElement('button', {
                  type: 'button',
                  onClick: () => setEditingClient(null),
                  className: 'flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400'
                }, 'Cancelar')
              )
            )
          )
        )
      ),
      
      React.createElement('div', { className: 'bg-white rounded-lg shadow overflow-hidden' },
        React.createElement('table', { className: 'min-w-full divide-y divide-gray-200' },
          React.createElement('thead', { className: 'bg-gray-50' },
            React.createElement('tr', {},
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Cliente'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Tipo'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'RTN'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Contacto'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Estado'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Acciones')
            )
          ),
          React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
            clients.length > 0 ? clients.map(client => 
              React.createElement('tr', { key: client.id },
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                  React.createElement('div', { className: 'font-medium text-gray-900' }, client.name),
                  client.address && React.createElement('div', { className: 'text-sm text-gray-500' }, client.address)
                ),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                  React.createElement('span', { 
                    className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      client.clientType === 'company' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`
                  }, client.clientType === 'company' ? 'Empresa' : 'Persona')
                ),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, client.rtn || '-'),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                  React.createElement('div', { className: 'text-sm text-gray-900' }, client.phone || '-'),
                  React.createElement('div', { className: 'text-sm text-gray-500' }, client.email || '-')
                ),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                  React.createElement('span', { 
                    className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      client.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`
                  }, client.active ? 'Activo' : 'Inactivo')
                ),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium' },
                  React.createElement('div', { className: 'flex gap-2' },
                    React.createElement('button', { 
                      className: 'text-blue-600 hover:text-blue-900',
                      onClick: () => setEditingClient(client)
                    }, 'Editar'),
                    React.createElement('button', { 
                      className: 'text-red-600 hover:text-red-900',
                      onClick: () => {
                        if (confirm('¿Está seguro de que desea eliminar este cliente?')) {
                          deleteClient(client.id);
                        }
                      }
                    }, 'Eliminar')
                  )
                )
              )
            ) : React.createElement('tr', {},
              React.createElement('td', { className: 'px-6 py-4 text-center text-gray-500', colSpan: 6 }, 'No hay clientes registrados')
            )
          )
        )
      )
    );
  };

  const renderInvoiceList = () => {
    const handlePreview = (invoice: any) => {
      setSelectedInvoice(invoice);
      setShowPreview(true);
    };
    
    const handlePrint = (invoice: any) => {
      if (config) {
        printInvoice(invoice, config);
      }
    };
    
    const handleGeneratePDF = (invoice: any) => {
      if (config) {
        generateInvoicePDF(invoice, config);
      }
    };
    
    const handleExportCSV = () => {
      const csvContent = generateInvoicesCSV(invoices);
      const filename = `facturas_${new Date().toISOString().split('T')[0]}.csv`;
      downloadCSV(filename, csvContent);
    };
    
    return React.createElement('div', {},
      React.createElement('div', { className: 'flex justify-between items-center mb-6' },
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, '📋 Lista de Facturas SAR'),
        React.createElement('div', { className: 'flex gap-2' },
          React.createElement('button', {
            onClick: handleExportCSV,
            className: 'bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2'
          }, '📊 Exportar CSV'),
          React.createElement('button', {
            onClick: () => setShowNewInvoice(true),
            className: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2'
          }, '➕ Nueva Factura')
        )
      ),
      
      // Modal de previsualización
      showPreview && selectedInvoice && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
        React.createElement('div', { className: 'bg-white rounded-lg w-full max-w-4xl max-h-96 overflow-y-auto m-4' },
          React.createElement('div', { className: 'p-6' },
            React.createElement('div', { className: 'flex justify-between items-center mb-4' },
              React.createElement('h3', { className: 'text-lg font-semibold' }, `Previsualización - ${selectedInvoice.invoiceNumber}`),
              React.createElement('button', {
                onClick: () => setShowPreview(false),
                className: 'text-gray-500 hover:text-gray-700 text-xl'
              }, '✕')
            ),
            
            // Vista previa de factura con formato SAR
            React.createElement('div', { className: 'border-2 border-gray-300 p-6 bg-white font-mono text-sm' },
              React.createElement('div', { className: 'text-center border-b-2 border-black pb-4 mb-4' },
                React.createElement('div', { className: 'font-bold text-lg' }, config?.companyName?.toUpperCase() || 'MI EMPRESA'),
                React.createElement('div', { className: 'text-sm' }, `RTN: ${config?.companyRtn || 'N/A'}`),
                React.createElement('div', { className: 'text-sm' }, config?.companyAddress || 'Dirección no configurada'),
                React.createElement('div', { className: 'text-sm' }, `Tel: ${config?.companyPhone || 'N/A'}`),
                React.createElement('div', { className: 'font-bold text-lg mt-2 underline' }, 'FACTURA COMERCIAL')
              ),
              
              React.createElement('div', { className: 'text-xs text-center border border-black p-2 mb-4' },
                `CAI: ${selectedInvoice.cai} | Rango: ${selectedInvoice.rangoAutorizado || 'N/A'} | Fecha Límite: ${selectedInvoice.fechaLimiteEmision || 'N/A'}`
              ),
              
              React.createElement('div', { className: 'flex justify-between mb-4' },
                React.createElement('div', {},
                  React.createElement('div', {}, `No. Factura: ${selectedInvoice.invoiceNumber}`),
                  React.createElement('div', {}, `Correlativo: ${(selectedInvoice.correlativo || 1).toString().padStart(8, '0')}`),
                  React.createElement('div', {}, `Fecha: ${new Date(selectedInvoice.fechaEmision || selectedInvoice.createdAt).toLocaleDateString('es-HN')}`)
                ),
                React.createElement('div', {},
                  React.createElement('div', {}, `Moneda: ${selectedInvoice.codigoMoneda || 'HNL'}`),
                  React.createElement('div', {}, `Estado: ${selectedInvoice.status.toUpperCase()}`)
                )
              ),
              
              React.createElement('div', { className: 'border border-black p-3 mb-4' },
                React.createElement('div', { className: 'font-bold' }, 'FACTURAR A:'),
                React.createElement('div', {}, `Cliente: ${selectedInvoice.clientName}`),
                selectedInvoice.clientRtn && React.createElement('div', {}, `RTN: ${selectedInvoice.clientRtn}`),
                selectedInvoice.clientAddress && React.createElement('div', {}, `Dirección: ${selectedInvoice.clientAddress}`)
              ),
              
              React.createElement('table', { className: 'w-full border-2 border-black mb-4' },
                React.createElement('thead', {},
                  React.createElement('tr', { className: 'bg-gray-100' },
                    React.createElement('th', { className: 'border border-black p-2 text-xs' }, 'No.'),
                    React.createElement('th', { className: 'border border-black p-2 text-xs' }, 'DESCRIPCIÓN'),
                    React.createElement('th', { className: 'border border-black p-2 text-xs' }, 'CANT.'),
                    React.createElement('th', { className: 'border border-black p-2 text-xs' }, 'PRECIO UNIT.'),
                    React.createElement('th', { className: 'border border-black p-2 text-xs' }, 'TOTAL')
                  )
                ),
                React.createElement('tbody', {},
                  selectedInvoice.items?.map((item: any, index: number) => 
                    React.createElement('tr', { key: index },
                      React.createElement('td', { className: 'border border-black p-2 text-center text-xs' }, index + 1),
                      React.createElement('td', { className: 'border border-black p-2 text-xs' }, 
                        `${item.productName} (SKU: ${item.sku})`
                      ),
                      React.createElement('td', { className: 'border border-black p-2 text-right text-xs' }, item.quantity),
                      React.createElement('td', { className: 'border border-black p-2 text-right text-xs' }, formatCurrency(item.unitPrice)),
                      React.createElement('td', { className: 'border border-black p-2 text-right text-xs' }, formatCurrency(item.total))
                    )
                  ) || []
                )
              ),
              
              React.createElement('div', { className: 'border-2 border-black p-3 mb-4 font-bold' },
                `SON: ${selectedInvoice.totalLetras || 'N/A'}`
              ),
              
              React.createElement('div', { className: 'float-right w-80 border-2 border-black p-3' },
                React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', {}, 'Subtotal:'), React.createElement('span', {}, formatCurrency(selectedInvoice.subtotal))),
                React.createElement('div', { className: 'flex justify-between' }, React.createElement('span', {}, 'ISV 15%:'), React.createElement('span', {}, formatCurrency(selectedInvoice.tax))),
                React.createElement('div', { className: 'flex justify-between border-t-2 border-black pt-2 mt-2 font-bold' }, 
                  React.createElement('span', {}, 'TOTAL:'), 
                  React.createElement('span', {}, formatCurrency(selectedInvoice.total))
                )
              ),
              
              React.createElement('div', { className: 'clear-both pt-16 text-center text-xs' },
                React.createElement('div', { className: 'mb-4' },
                  '_________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; _________________',
                  React.createElement('br', {}),
                  'Firma del Cliente &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Firma y Sello'
                ),
                React.createElement('div', { className: 'font-bold' }, 'La factura es beneficio de todos. Exíjala.')
              )
            ),
            
            React.createElement('div', { className: 'flex justify-end gap-2 mt-6' },
              React.createElement('button', {
                onClick: () => handlePrint(selectedInvoice),
                className: 'bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700'
              }, '🖨️ Imprimir'),
              React.createElement('button', {
                onClick: () => handleGeneratePDF(selectedInvoice),
                className: 'bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700'
              }, '📄 Generar PDF'),
              React.createElement('button', {
                onClick: () => setShowPreview(false),
                className: 'bg-gray-300 text-gray-700 px-4 py-2 rounded hover:bg-gray-400'
              }, 'Cerrar')
            )
          )
        )
      ),
      
      React.createElement('div', { className: 'bg-white rounded-lg shadow overflow-hidden' },
        React.createElement('table', { className: 'min-w-full divide-y divide-gray-200' },
          React.createElement('thead', { className: 'bg-gray-50' },
            React.createElement('tr', {},
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Factura SAR'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Cliente'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Fecha Emisión'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Estado'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Total'),
              React.createElement('th', { className: 'px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider' }, 'Acciones')
            )
          ),
          React.createElement('tbody', { className: 'bg-white divide-y divide-gray-200' },
            invoices.length > 0 ? invoices.slice(-20).reverse().map(invoice => 
              React.createElement('tr', { key: invoice.id, className: 'hover:bg-gray-50' },
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                  React.createElement('div', { className: 'font-medium text-gray-900' }, invoice.invoiceNumber),
                  React.createElement('div', { className: 'text-sm text-gray-500' }, `CAI: ${invoice.cai?.substring(0, 15)}...`),
                  React.createElement('div', { className: 'text-xs text-gray-400' }, `Correlativo: ${(invoice.correlativo || 1).toString().padStart(8, '0')}`)
                ),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                  React.createElement('div', { className: 'text-sm text-gray-900' }, invoice.clientName),
                  invoice.clientRtn && React.createElement('div', { className: 'text-sm text-gray-500' }, `RTN: ${invoice.clientRtn}`)
                ),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm text-gray-500' }, 
                  new Date(invoice.fechaEmision || invoice.createdAt).toLocaleDateString('es-HN')
                ),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                  React.createElement('span', { 
                    className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                      invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                      invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                      invoice.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                      'bg-yellow-100 text-yellow-800'
                    }`
                  }, ({
                    draft: 'Borrador',
                    sent: 'Enviada',
                    paid: 'Pagada',
                    cancelled: 'Cancelada'
                  } as any)[invoice.status] || invoice.status)
                ),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap' },
                  React.createElement('div', { className: 'text-lg font-bold text-green-600' }, formatCurrency(invoice.total)),
                  React.createElement('div', { className: 'text-xs text-gray-500' }, `ISV: ${formatCurrency(invoice.tax)}`)
                ),
                React.createElement('td', { className: 'px-6 py-4 whitespace-nowrap text-sm font-medium' },
                  React.createElement('div', { className: 'flex flex-col gap-1' },
                    React.createElement('button', { 
                      onClick: () => handlePreview(invoice),
                      className: 'text-blue-600 hover:text-blue-900 text-xs'
                    }, '👁️ Previsualizar'),
                    React.createElement('button', { 
                      onClick: () => handlePrint(invoice),
                      className: 'text-green-600 hover:text-green-900 text-xs'
                    }, '🖨️ Imprimir'),
                    React.createElement('button', { 
                      onClick: () => handleGeneratePDF(invoice),
                      className: 'text-red-600 hover:text-red-900 text-xs'
                    }, '📄 PDF')
                  )
                )
              )
            ) : React.createElement('tr', {},
              React.createElement('td', { className: 'px-6 py-8 text-center text-gray-500', colSpan: 6 }, 'No hay facturas registradas')
            )
          )
        )
      )
    );
  };

  const renderUsers = () => {
    return React.createElement('div', {},
      React.createElement('div', { className: 'flex justify-between items-center mb-6' },
        React.createElement('h2', { className: 'text-2xl font-bold text-gray-900' }, '👤 Usuarios del Sistema'),
        React.createElement('button', { 
          className: 'bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2',
          onClick: () => setEditingUser({ 
            id: '', 
            username: '', 
            email: '', 
            password: '', 
            role: 'user', 
            permissions: {
              canCreateInvoices: false,
              canEditProducts: false,
              canViewReports: false,
              canManageUsers: false,
              canAccessSettings: false
            },
            active: true, 
            createdAt: '', 
            updatedAt: '' 
          })
        }, '➕ Agregar Usuario')
      ),
      
      // Modal para agregar/editar usuario
      editingUser && React.createElement('div', { className: 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50' },
        React.createElement('div', { className: 'bg-white rounded-lg p-6 w-full max-w-lg max-h-96 overflow-y-auto' },
          React.createElement('h3', { className: 'text-lg font-semibold mb-4' }, 
            editingUser.id ? 'Editar Usuario' : 'Nuevo Usuario'
          ),
          React.createElement('form', { 
            onSubmit: (e: any) => {
              e.preventDefault();
              if (editingUser.id) {
                updateUser(editingUser.id, editingUser);
              } else {
                addUser(editingUser);
              }
              setEditingUser(null);
            }
          },
            React.createElement('div', { className: 'space-y-4' },
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Nombre de Usuario *'),
                React.createElement('input', {
                  type: 'text',
                  required: true,
                  value: editingUser.username,
                  onChange: (e: any) => setEditingUser(prev => ({...prev!, username: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                })
              ),
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Email *'),
                React.createElement('input', {
                  type: 'email',
                  required: true,
                  value: editingUser.email,
                  onChange: (e: any) => setEditingUser(prev => ({...prev!, email: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                })
              ),
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Contraseña *'),
                React.createElement('input', {
                  type: 'password',
                  required: !editingUser.id,
                  value: editingUser.password,
                  onChange: (e: any) => setEditingUser(prev => ({...prev!, password: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2',
                  placeholder: editingUser.id ? 'Dejar en blanco para no cambiar' : 'Contraseña'
                })
              ),
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700' }, 'Rol'),
                React.createElement('select', {
                  value: editingUser.role,
                  onChange: (e: any) => setEditingUser(prev => ({...prev!, role: e.target.value})),
                  className: 'mt-1 block w-full border border-gray-300 rounded-md px-3 py-2'
                },
                  React.createElement('option', { value: 'admin' }, 'Administrador'),
                  React.createElement('option', { value: 'user' }, 'Usuario'),
                  React.createElement('option', { value: 'viewer' }, 'Solo Lectura')
                )
              ),
              React.createElement('div', {},
                React.createElement('label', { className: 'block text-sm font-medium text-gray-700 mb-2' }, 'Permisos'),
                React.createElement('div', { className: 'space-y-2' },
                  ['canCreateInvoices', 'canEditProducts', 'canViewReports', 'canManageUsers', 'canAccessSettings'].map(permission => 
                    React.createElement('label', { key: permission, className: 'flex items-center' },
                      React.createElement('input', {
                        type: 'checkbox',
                        checked: editingUser.permissions[permission as keyof typeof editingUser.permissions],
                        onChange: (e: any) => setEditingUser(prev => ({
                          ...prev!, 
                          permissions: {
                            ...prev!.permissions,
                            [permission]: e.target.checked
                          }
                        })),
                        className: 'mr-2'
                      }),
                      React.createElement('span', { className: 'text-sm' }, {
                        canCreateInvoices: 'Crear Facturas',
                        canEditProducts: 'Editar Productos',
                        canViewReports: 'Ver Reportes',
                        canManageUsers: 'Gestionar Usuarios',
                        canAccessSettings: 'Acceder a Configuración'
                      }[permission])
                    )
                  )
                )
              ),
              React.createElement('div', { className: 'flex gap-2 pt-4' },
                React.createElement('button', {
                  type: 'submit',
                  className: 'flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'
                }, 'Guardar'),
                React.createElement('button', {
                  type: 'button',
                  onClick: () => setEditingUser(null),
                  className: 'flex-1 bg-gray-300 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-400'
                }, 'Cancelar')
              )
            )
          )
        )
      ),
      
      React.createElement('div', { className: 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' },
        users.length > 0 ? users.map(user => 
          React.createElement('div', { 
            key: user.id,
            className: 'bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow'
          },
            React.createElement('div', { className: 'flex items-center mb-4' },
              React.createElement('div', { className: 'w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4' },
                React.createElement('span', { className: 'text-xl' }, '👤')
              ),
              React.createElement('div', {},
                React.createElement('h3', { className: 'text-lg font-semibold text-gray-900' }, user.username),
                React.createElement('p', { className: 'text-sm text-gray-600' }, {
                  admin: 'Administrador',
                  user: 'Usuario',
                  viewer: 'Solo Lectura'
                }[user.role])
              )
            ),
            React.createElement('div', { className: 'space-y-2 mb-4' },
              React.createElement('p', { className: 'text-sm text-gray-600' }, user.email),
              user.lastLogin && React.createElement('p', { className: 'text-xs text-gray-500' }, 
                `Último acceso: ${new Date(user.lastLogin).toLocaleDateString()}`
              ),
              React.createElement('div', { className: 'flex items-center' },
                React.createElement('span', { 
                  className: `inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    user.active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`
                }, user.active ? 'Activo' : 'Inactivo')
              )
            ),
            React.createElement('div', { className: 'text-xs text-gray-500 mb-4' },
              React.createElement('div', {}, 'Permisos:'),
              React.createElement('ul', { className: 'list-disc list-inside mt-1' },
                Object.entries(user.permissions).filter(([_, value]) => value).map(([permission]) => 
                  React.createElement('li', { key: permission }, {
                    canCreateInvoices: 'Facturas',
                    canEditProducts: 'Productos',
                    canViewReports: 'Reportes',
                    canManageUsers: 'Usuarios',
                    canAccessSettings: 'Configuración'
                  }[permission])
                )
              )
            ),
            React.createElement('div', { className: 'flex justify-between items-center' },
              React.createElement('button', { 
                className: 'text-blue-600 hover:text-blue-800 text-sm',
                onClick: () => setEditingUser(user)
              }, '✏️ Editar'),
              React.createElement('button', { 
                className: 'text-red-600 hover:text-red-800 text-sm',
                onClick: () => {
                  if (confirm('¿Está seguro de que desea eliminar este usuario?')) {
                    deleteUser(user.id);
                  }
                }
              }, '🗑️ Eliminar')
            )
          )
        ) : React.createElement('div', { className: 'col-span-full text-center py-8' },
          React.createElement('p', { className: 'text-gray-500' }, 'No hay usuarios registrados')
        )
      )
    );
  };

  const stats = [
    {
      name: 'Total Productos',
      value: products.length,
      color: 'bg-blue-500'
    },
    {
      name: 'Stock Bajo',
      value: lowStockProducts.length,
      color: 'bg-red-500'
    }
  ];

  return React.createElement('div', { className: 'min-h-screen bg-gray-50' },
    // Header profesional con navegación
    React.createElement('nav', { className: 'bg-white shadow-sm border-b border-gray-200' },
      React.createElement('div', { className: 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8' },
        React.createElement('div', { className: 'flex justify-between h-16' },
          React.createElement('div', { className: 'flex items-center' },
            React.createElement('div', { className: 'flex-shrink-0 flex items-center' },
              React.createElement('span', { className: 'text-2xl mr-3' }, '🏢'),
              React.createElement('h1', { 
                className: 'text-xl font-bold text-gray-900 cursor-pointer',
                onClick: () => setCurrentView('dashboard')
              }, 'ERP HONDURAS'),
              React.createElement('span', { className: 'ml-3 px-2 py-1 text-xs bg-green-100 text-green-800 rounded-full' }, 'PRO')
            )
          ),
          React.createElement('div', { className: 'flex items-center space-x-4' },
            React.createElement('span', { className: 'text-sm text-gray-600' }, 
              `👤 Usuario: ${localStorage.getItem('erp_user') || 'ADMIN'}`
            ),
            React.createElement('button', { 
              onClick: exportData,
              className: 'bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700'
            }, '💾 Backup'),
            React.createElement('button', { 
              onClick: handleLogout,
              className: 'bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700'
            }, '🚪 Salir')
          )
        )
      )
    ),

    // Sidebar y contenido principal
    React.createElement('div', { className: 'flex' },
      // Sidebar profesional
      React.createElement('div', { className: 'w-64 bg-white shadow-sm h-screen overflow-y-auto' },
        React.createElement('nav', { className: 'mt-5 px-2' },
          React.createElement('div', { className: 'space-y-1' },
            // Dashboard
            React.createElement('button', { 
              onClick: () => setCurrentView('dashboard'),
              className: `${currentView === 'dashboard' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`
            }, '📊 Dashboard'),
            
            // Ventas
            React.createElement('div', { className: 'mt-4' },
              React.createElement('h3', { className: 'px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider' }, 'VENTAS'),
              React.createElement('button', { 
                onClick: () => setCurrentView('invoices'),
                className: `${currentView === 'invoices' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`
              }, '🧾 Nueva Factura'),
              React.createElement('button', { 
                onClick: () => setCurrentView('invoice-list'),
                className: `${currentView === 'invoice-list' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`
              }, '📋 Lista Facturas'),
              React.createElement('button', { 
                onClick: () => setCurrentView('clients'),
                className: `${currentView === 'clients' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`
              }, '👥 Clientes')
            ),

            // Inventario
            React.createElement('div', { className: 'mt-4' },
              React.createElement('h3', { className: 'px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider' }, 'INVENTARIO'),
              React.createElement('button', { 
                onClick: () => setCurrentView('products'),
                className: `${currentView === 'products' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`
              }, '📦 Productos'),
              React.createElement('button', { 
                onClick: () => setCurrentView('categories'),
                className: `${currentView === 'categories' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`
              }, '🏷️ Categorías'),
              React.createElement('button', { 
                onClick: () => setCurrentView('stock-alerts'),
                className: `${currentView === 'stock-alerts' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`
              }, '⚠️ Alertas Stock')
            ),

            // Reportes
            React.createElement('div', { className: 'mt-4' },
              React.createElement('h3', { className: 'px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider' }, 'REPORTES'),
              React.createElement('button', { 
                onClick: () => setCurrentView('reports'),
                className: `${currentView === 'reports' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`
              }, '📈 Ventas'),
              React.createElement('button', { 
                onClick: () => setCurrentView('financial-reports'),
                className: `${currentView === 'financial-reports' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`
              }, '💰 Financieros'),
              React.createElement('button', { 
                onClick: () => setCurrentView('inventory-reports'),
                className: `${currentView === 'inventory-reports' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`
              }, '📊 Inventario')
            ),

            // Configuración
            React.createElement('div', { className: 'mt-4' },
              React.createElement('h3', { className: 'px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider' }, 'SISTEMA'),
              React.createElement('button', { 
                onClick: () => setCurrentView('settings'),
                className: `${currentView === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`
              }, '⚙️ Configuración'),
              React.createElement('button', { 
                onClick: () => setCurrentView('users'),
                className: `${currentView === 'users' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`
              }, '👤 Usuarios'),
              React.createElement('button', { 
                onClick: () => setCurrentView('backup'),
                className: `${currentView === 'backup' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50'} group flex items-center px-2 py-2 text-sm font-medium rounded-md w-full text-left`
              }, '💾 Respaldos')
            )
          )
        )
      ),

      // Contenido principal
      React.createElement('div', { className: 'flex-1 overflow-auto' },
        React.createElement('main', { className: 'p-6' },
          // Renderizar vista actual
          currentView === 'dashboard' ? renderDashboard() :
          currentView === 'invoices' ? renderNewInvoice() :
          currentView === 'products' ? renderProducts() :
          currentView === 'settings' ? renderSettings() :
          currentView === 'reports' ? renderReports() :
          currentView === 'stock-alerts' ? renderStockAlerts() :
          currentView === 'categories' ? renderCategories() :
          currentView === 'clients' ? renderClients() :
          currentView === 'invoice-list' ? renderInvoiceList() :
          currentView === 'users' ? renderUsers() :
          React.createElement('div', { className: 'text-center py-12' },
            React.createElement('div', { className: 'text-6xl mb-4' }, '🚧'),
            React.createElement('h2', { className: 'text-2xl font-bold text-gray-900 mb-2' }, 'Funcionalidad en Desarrollo'),
            React.createElement('p', { className: 'text-gray-600' }, `La sección "${currentView}" estará disponible próximamente.`)
          )
        )
      )
    )
  );
}
