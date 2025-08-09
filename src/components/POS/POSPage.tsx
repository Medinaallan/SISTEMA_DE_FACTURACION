import React, { useState, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import { useClients } from '../../hooks/useClients';
import { useInvoices } from '../../hooks/useInvoices';
import { useCashRegister } from '../../hooks/useCashRegister';
import HeaderMenu from './HeaderMenu';
import ProductInput from './ProductInput';
import ActionButtons from './ActionButtons';
import ProductTable from './ProductTable';
import SaleSummary from './SaleSummary';
import OpenCashModal from './OpenCashModal';
import CloseCashModal from './CloseCashModal';
import { formatCurrency } from '../../lib/utils';

interface POSItem {
  id: string;
  sku: string;
  name: string;
  salePrice: number;
  quantity: number;
  total: number;
  stock: number;
}

interface POSPageProps {
  onClientClick: () => void;
  onProductClick: () => void;
  onInventoryClick: () => void;
  onConfigClick: () => void;
  onCutClick: () => void;
  onExitClick: () => void;
  onCreateInvoice: (items: POSItem[], total: number, paidAmount: number) => void;
}

export default function POSPage({
  onClientClick,
  onProductClick,
  onInventoryClick,
  onConfigClick,
  onCutClick,
  onExitClick,
  onCreateInvoice
}: POSPageProps) {
  const { products } = useProducts();
  const { clients, loadClients } = useClients();
  const { invoices, loadInvoices } = useInvoices();
  const { 
    currentSession, 
    openCashRegister, 
    closeCashRegister, 
    registerSale, 
    hasOpenSession 
  } = useCashRegister();
  
  const [currentItems, setCurrentItems] = useState<POSItem[]>([]);
  const [productCode, setProductCode] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [lastInvoice, setLastInvoice] = useState<any>(null);
  const [selectedClient, setSelectedClient] = useState<any>(null);
  
  // Estados para modales
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [showClientModal, setShowClientModal] = useState(false);
  const [showEntriesModal, setShowEntriesModal] = useState(false);
  const [showExitsModal, setShowExitsModal] = useState(false);
  const [showPendingModal, setShowPendingModal] = useState(false);
  const [showOpenCashModal, setShowOpenCashModal] = useState(false);
  const [showCloseCashModal, setShowCloseCashModal] = useState(false);
  
  // Estados para formularios
  const [searchTerm, setSearchTerm] = useState('');
  const [supervisorPassword, setSupervisorPassword] = useState('');
  const [cashAmount, setCashAmount] = useState('');
  const [cashDescription, setCashDescription] = useState('');

  // Cargar datos al montar
  useEffect(() => {
    loadClients();
    loadInvoices();
  }, [loadClients, loadInvoices]);

  // Mostrar modal de apertura de caja si no hay sesión abierta
  useEffect(() => {
    if (!hasOpenSession()) {
      setShowOpenCashModal(true);
    }
  }, [hasOpenSession]);

  // Calcular total
  const total = currentItems.reduce((sum, item) => sum + item.total, 0);

  // Función para buscar productos
  const handleSearch = () => {
    setShowSearchModal(true);
  };

  // Función para seleccionar cliente
  const handleClientSelect = () => {
    setShowClientModal(true);
  };

  // Función para aplicar descuento mayoreo
  const handleWholesale = () => {
    const password = prompt('Ingrese contraseña de supervisor:');
    if (password === '1234') {
      // Aplicar 5% de descuento
      setCurrentItems(items =>
        items.map(item => ({
          ...item,
          salePrice: item.salePrice * 0.95,
          total: item.quantity * (item.salePrice * 0.95)
        }))
      );
      alert('Descuento mayoreo del 5% aplicado exitosamente');
    } else {
      alert('Contraseña incorrecta');
    }
  };

  // Función para registrar entrada de efectivo
  const handleEntries = () => {
    const password = prompt('Ingrese contraseña de supervisor:');
    if (password === '1234') {
      setShowEntriesModal(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  // Función para registrar salida de efectivo
  const handleExits = () => {
    const password = prompt('Ingrese contraseña de supervisor:');
    if (password === '1234') {
      setShowExitsModal(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  // Función para mostrar facturas pendientes
  const handlePending = () => {
    setShowPendingModal(true);
  };

  // Función para eliminar último producto
  const handleDeleteLastProduct = () => {
    if (currentItems.length > 0) {
      setCurrentItems(items => items.slice(0, -1));
    }
  };

  // Agregar producto por código
  const handleAddProduct = (code: string) => {
    if (!code.trim()) return;

    const product = products.find(p => 
      p.sku.toLowerCase() === code.toLowerCase() || 
      p.name.toLowerCase().includes(code.toLowerCase())
    );

    if (!product) {
      alert('Producto no encontrado');
      return;
    }

    if (product.currentStock <= 0) {
      alert('Producto sin existencias');
      return;
    }

    // Verificar si el producto ya está en la lista
    const existingItem = currentItems.find(item => item.sku === product.sku);
    
    if (existingItem) {
      // Incrementar cantidad
      handleQuantityChange(existingItem.id, existingItem.quantity + 1);
    } else {
      // Agregar nuevo item
      const newItem: POSItem = {
        id: Date.now().toString(),
        sku: product.sku,
        name: product.name,
        salePrice: product.salePrice,
        quantity: 1,
        total: product.salePrice,
        stock: product.currentStock
      };
      
      setCurrentItems([...currentItems, newItem]);
    }
    
    setProductCode('');
  };

  // Cambiar cantidad de un producto
  const handleQuantityChange = (id: string, quantity: number) => {
    if (quantity <= 0) {
      handleRemoveItem(id);
      return;
    }

    setCurrentItems(items =>
      items.map(item =>
        item.id === id
          ? { ...item, quantity, total: item.salePrice * quantity }
          : item
      )
    );
  };

  // Eliminar un producto
  const handleRemoveItem = (id: string) => {
    setCurrentItems(items => items.filter(item => item.id !== id));
    if (selectedItemId === id) {
      setSelectedItemId('');
    }
  };

  // Función para abrir caja
  const handleOpenCash = (startingCash: number) => {
    // Obtener datos del usuario actual (simulado)
    const userId = '1';
    const userName = 'Usuario POS';
    
    openCashRegister(startingCash, userId, userName);
    setShowOpenCashModal(false);
    alert(`¡Caja abierta exitosamente!\nFondo inicial: ${formatCurrency(startingCash)}`);
  };

  // Función para cerrar caja 
  const handleCloseCash = (cashCount: number, cardCount: number, transferCount: number) => {
    const closedSession = closeCashRegister(cashCount, cardCount, transferCount);
    
    if (closedSession) {
      const message = `🔒 CIERRE DE CAJA REALIZADO\n\n` +
        `💰 Resumen Final:\n` +
        `• Efectivo esperado: ${formatCurrency(closedSession.expectedCash)}\n` +
        `• Efectivo contado: ${formatCurrency(cashCount)}\n` +
        `• Diferencia: ${formatCurrency(closedSession.difference)}\n` +
        `• Ventas tarjeta: ${formatCurrency(cardCount)}\n` +
        `• Transferencias: ${formatCurrency(transferCount)}\n` +
        `• Total ventas: ${formatCurrency(closedSession.totalSales)}\n\n` +
        `${closedSession.difference === 0 ? '✅ Caja cuadrada' : 
          closedSession.difference > 0 ? '📈 Sobrante en caja' : '📉 Faltante en caja'}`;
      
      alert(message);
      setShowCloseCashModal(false);
      
      // Limpiar el ticket actual
      setCurrentItems([]);
      setProductCode('');
      setSelectedItemId('');
      
      // Mostrar modal de apertura para siguiente turno
      setTimeout(() => {
        setShowOpenCashModal(true);
      }, 1000);
    }
  };

  // Procesar pago
  const handlePay = (paidAmount: number) => {
    if (currentItems.length === 0) {
      alert('No hay productos en el ticket');
      return;
    }

    if (!hasOpenSession()) {
      alert('No hay una caja abierta. Abra una caja para continuar.');
      setShowOpenCashModal(true);
      return;
    }

    // Crear la factura
    onCreateInvoice(currentItems, total, paidAmount);
    
    // Registrar la venta en la caja (asumir efectivo por defecto)
    registerSale(total, 'cash');

    // Guardar para reimprimir
    setLastInvoice({
      items: [...currentItems],
      total,
      paidAmount,
      change: paidAmount - total,
      date: new Date()
    });

    // Limpiar el ticket
    setCurrentItems([]);
    setProductCode('');
    setSelectedItemId('');
    
    alert(`Venta realizada exitosamente!\nTotal: ${formatCurrency(total)}\nPagó con: ${formatCurrency(paidAmount)}\nCambio: ${formatCurrency(paidAmount - total)}`);
  };

  // Manejar teclas de función
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case 'F1':
          e.preventDefault();
          onClientClick();
          break;
        case 'F3':
          e.preventDefault();
          onProductClick();
          break;
        case 'F4':
          e.preventDefault();
          onInventoryClick();
          break;
        case 'F5':
          e.preventDefault();
          // F5 eliminado según solicitud
          break;
        case 'F6':
          e.preventDefault();
          handlePending();
          break;
        case 'F12':
          e.preventDefault();
          if (currentItems.length > 0) {
            handlePay(total); // Llamar directamente con el total
          }
          break;
        case 'Delete':
          if (selectedItemId) {
            e.preventDefault();
            handleRemoveItem(selectedItemId);
          }
          break;
        case 'Insert':
          e.preventDefault();
          handleClientSelect();
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentItems.length, selectedItemId, total, onClientClick, onProductClick, onInventoryClick]);

  return (
    <div className="h-screen flex flex-col bg-gray-100 overflow-hidden">
      {/* Header */}
      <div className="flex-shrink-0">
        <HeaderMenu
          onClientClick={onClientClick}
          onProductClick={onProductClick}
          onInventoryClick={onInventoryClick}
          onConfigClick={onConfigClick}
          onCutClick={onCutClick}
          onExitClick={onExitClick}
          onCloseCashClick={() => setShowCloseCashModal(true)}
          hasOpenSession={hasOpenSession()}
        />
      </div>

      {/* Input de Producto */}
      <div className="flex-shrink-0">
        <ProductInput
          onAddProduct={handleAddProduct}
          onSearchProduct={handleSearch}
          productCode={productCode}
          setProductCode={setProductCode}
          selectedClient={selectedClient}
        />
      </div>

      {/* Botones de Acción */}
      <div className="flex-shrink-0">
        <ActionButtons
          onVariousClick={handleClientSelect}
          onSearchClick={handleSearch}
          onWholesaleClick={handleWholesale}
          onEntriesClick={handleEntries}
          onExitsClick={handleExits}
        />
      </div>

      {/* Tabla de Productos - Área flexible */}
      <div className="flex-1 min-h-0">
        <ProductTable
          items={currentItems}
          onQuantityChange={handleQuantityChange}
          onRemoveItem={handleRemoveItem}
          selectedItemId={selectedItemId}
        />
      </div>

      {/* Resumen de Venta */}
      <div className="flex-shrink-0">
        <SaleSummary
          total={total}
          onPay={handlePay}
          onPending={handlePending}
          onDeleteProduct={handleDeleteLastProduct}
          onReprint={() => {
            if (lastInvoice) {
              alert(`Última venta:\nTotal: ${formatCurrency(lastInvoice.total)}\nFecha: ${lastInvoice.date.toLocaleString()}`);
            } else {
              alert('No hay facturas para reimprimir');
            }
          }}
          onDailySales={() => {
            // Implementar consulta de ventas del día
            alert('Funcionalidad de ventas del día');
          }}
          disabled={currentItems.length === 0}
        />
      </div>

      {/* Modal de Búsqueda de Productos */}
      {showSearchModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-auto">
            <h2 className="text-xl font-bold mb-4">Buscar Producto</h2>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por nombre o código..."
              className="w-full p-2 border rounded mb-4"
              autoFocus
            />
            <div className="max-h-40 overflow-auto">
              {products
                .filter(p => 
                  p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                  p.sku.toLowerCase().includes(searchTerm.toLowerCase())
                )
                .map(product => (
                  <div
                    key={product.id}
                    onClick={() => {
                      handleAddProduct(product.sku);
                      setShowSearchModal(false);
                      setSearchTerm('');
                    }}
                    className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                  >
                    <div className="font-medium">{product.name}</div>
                    <div className="text-sm text-gray-600">
                      {product.sku} - {formatCurrency(product.salePrice)} - Stock: {product.currentStock}
                    </div>
                  </div>
                ))
              }
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  setShowSearchModal(false);
                  setSearchTerm('');
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Selección de Cliente */}
      {showClientModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-2xl w-full mx-4 max-h-96 overflow-auto">
            <h2 className="text-xl font-bold mb-4">Seleccionar Cliente</h2>
            <div className="max-h-60 overflow-auto">
              <div
                onClick={() => {
                  setSelectedClient(null);
                  setShowClientModal(false);
                }}
                className="p-2 hover:bg-gray-100 cursor-pointer border-b"
              >
                <div className="font-medium">Cliente General</div>
                <div className="text-sm text-gray-600">Sin RTN</div>
              </div>
              {clients.map(client => (
                <div
                  key={client.id}
                  onClick={() => {
                    setSelectedClient(client);
                    setShowClientModal(false);
                  }}
                  className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                >
                  <div className="font-medium">{client.name}</div>
                  <div className="text-sm text-gray-600">
                    RTN: {client.rtn || 'N/A'} - {client.email || 'Sin email'}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowClientModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Entradas de Efectivo */}
      {showEntriesModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Entrada de Efectivo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Monto:</label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descripción:</label>
                <textarea
                  value={cashDescription}
                  onChange={(e) => setCashDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Motivo de la entrada..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (cashAmount && cashDescription) {
                    // Aquí guardarías el registro de entrada
                    alert(`Entrada registrada:\nMonto: ${formatCurrency(parseFloat(cashAmount))}\nDescripción: ${cashDescription}`);
                    setCashAmount('');
                    setCashDescription('');
                    setShowEntriesModal(false);
                  } else {
                    alert('Complete todos los campos');
                  }
                }}
                className="bg-green-600 text-white px-4 py-2 rounded"
              >
                Registrar
              </button>
              <button
                onClick={() => {
                  setCashAmount('');
                  setCashDescription('');
                  setShowEntriesModal(false);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Salidas de Efectivo */}
      {showExitsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h2 className="text-xl font-bold mb-4">Salida de Efectivo</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Monto:</label>
                <input
                  type="number"
                  value={cashAmount}
                  onChange={(e) => setCashAmount(e.target.value)}
                  className="w-full p-2 border rounded"
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Descripción:</label>
                <textarea
                  value={cashDescription}
                  onChange={(e) => setCashDescription(e.target.value)}
                  className="w-full p-2 border rounded"
                  rows={3}
                  placeholder="Motivo de la salida..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => {
                  if (cashAmount && cashDescription) {
                    // Aquí guardarías el registro de salida
                    alert(`Salida registrada:\nMonto: ${formatCurrency(parseFloat(cashAmount))}\nDescripción: ${cashDescription}`);
                    setCashAmount('');
                    setCashDescription('');
                    setShowExitsModal(false);
                  } else {
                    alert('Complete todos los campos');
                  }
                }}
                className="bg-red-600 text-white px-4 py-2 rounded"
              >
                Registrar
              </button>
              <button
                onClick={() => {
                  setCashAmount('');
                  setCashDescription('');
                  setShowExitsModal(false);
                }}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Facturas Pendientes */}
      {showPendingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-4xl w-full mx-4 max-h-96 overflow-auto">
            <h2 className="text-xl font-bold mb-4">Facturas Pendientes</h2>
            <div className="max-h-60 overflow-auto">
              {invoices
                .filter(inv => inv.status === 'draft')
                .map(invoice => (
                  <div
                    key={invoice.id}
                    className="p-3 hover:bg-gray-100 cursor-pointer border-b"
                    onClick={() => {
                      // Cargar factura pendiente
                      alert(`Factura: ${invoice.invoiceNumber}\nCliente: ${invoice.clientName}\nTotal: ${formatCurrency(invoice.total)}`);
                      setShowPendingModal(false);
                    }}
                  >
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">{invoice.invoiceNumber}</div>
                        <div className="text-sm text-gray-600">
                          Cliente: {invoice.clientName}
                        </div>
                        <div className="text-sm text-gray-600">
                          Fecha: {new Date(invoice.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold text-lg">{formatCurrency(invoice.total)}</div>
                        <div className="text-sm text-orange-600">Pendiente</div>
                      </div>
                    </div>
                  </div>
                ))
              }
              {invoices.filter(inv => inv.status === 'draft').length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay facturas pendientes
                </div>
              )}
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => setShowPendingModal(false)}
                className="bg-gray-500 text-white px-4 py-2 rounded"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Apertura de Caja */}
      <OpenCashModal
        isOpen={showOpenCashModal}
        onClose={() => {
          // No permitir cerrar si no hay sesión abierta
          if (hasOpenSession()) {
            setShowOpenCashModal(false);
          }
        }}
        onOpenCash={handleOpenCash}
      />

      {/* Modal de Cierre de Caja */}
      <CloseCashModal
        isOpen={showCloseCashModal}
        onClose={() => setShowCloseCashModal(false)}
        onCloseCash={handleCloseCash}
        currentSession={currentSession}
      />
    </div>
  );
}
