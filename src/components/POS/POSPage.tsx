import React, { useState, useEffect } from 'react';
import { useProducts } from '../../hooks/useProducts';
import HeaderMenu from './HeaderMenu';
import ProductInput from './ProductInput';
import ActionButtons from './ActionButtons';
import ProductTable from './ProductTable';
import SaleSummary from './SaleSummary';
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
  const [currentItems, setCurrentItems] = useState<POSItem[]>([]);
  const [productCode, setProductCode] = useState('');
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [lastInvoice, setLastInvoice] = useState<any>(null);

  // Calcular total
  const total = currentItems.reduce((sum, item) => sum + item.total, 0);

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

  // Procesar pago
  const handlePay = (paidAmount: number) => {
    if (currentItems.length === 0) {
      alert('No hay productos en el ticket');
      return;
    }

    // Crear la factura
    onCreateInvoice(currentItems, total, paidAmount);
    
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
          // Cambiar - implementar lógica adicional si es necesario
          break;
        case 'F6':
          e.preventDefault();
          // Pendiente - implementar lógica adicional si es necesario
          break;
        case 'F12':
          e.preventDefault();
          if (currentItems.length > 0) {
            // Simular clic en cobrar
            const event = new CustomEvent('posPayClick');
            document.dispatchEvent(event);
          }
          break;
        case 'Delete':
          if (selectedItemId) {
            e.preventDefault();
            handleRemoveItem(selectedItemId);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [currentItems.length, selectedItemId, onClientClick, onProductClick, onInventoryClick]);

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <HeaderMenu
        onClientClick={onClientClick}
        onProductClick={onProductClick}
        onInventoryClick={onInventoryClick}
        onConfigClick={onConfigClick}
        onCutClick={onCutClick}
        onExitClick={onExitClick}
      />

      {/* Input de Producto */}
      <ProductInput
        onAddProduct={handleAddProduct}
        onSearchProduct={() => {/* Implementar búsqueda */}}
        productCode={productCode}
        setProductCode={setProductCode}
      />

      {/* Botones de Acción */}
      <ActionButtons
        onVariousClick={() => {/* Implementar varios */}}
        onSearchClick={() => {/* Implementar búsqueda avanzada */}}
        onWholesaleClick={() => {/* Implementar mayoreo */}}
        onEntriesClick={() => {/* Implementar entradas */}}
        onExitsClick={() => {/* Implementar salidas */}}
        onDeleteItemClick={() => {
          if (selectedItemId) {
            handleRemoveItem(selectedItemId);
          }
        }}
      />

      {/* Tabla de Productos */}
      <ProductTable
        items={currentItems}
        onQuantityChange={handleQuantityChange}
        onRemoveItem={handleRemoveItem}
        selectedItemId={selectedItemId}
      />

      {/* Resumen de Venta */}
      <SaleSummary
        total={total}
        onPay={handlePay}
        onChange={() => {/* Implementar cambio */}}
        onPending={() => {/* Implementar pendiente */}}
        onDeleteProduct={() => {
          if (selectedItemId) {
            handleRemoveItem(selectedItemId);
          }
        }}
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
  );
}
