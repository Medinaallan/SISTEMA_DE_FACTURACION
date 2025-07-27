import React, { useState } from 'react';
import { formatCurrency } from '../../lib/utils';

interface SaleSummaryProps {
  total: number;
  onPay: (paidAmount: number) => void;
  onChange: () => void;
  onPending: () => void;
  onDeleteProduct: () => void;
  onReprint: () => void;
  onDailySales: () => void;
  disabled?: boolean;
}

export default function SaleSummary({
  total,
  onPay,
  onChange,
  onPending,
  onDeleteProduct,
  onReprint,
  onDailySales,
  disabled = false
}: SaleSummaryProps) {
  const [paidAmount, setPaidAmount] = useState<string>('');
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  const calculateChange = () => {
    const paid = parseFloat(paidAmount) || 0;
    return paid - total;
  };

  const handlePay = () => {
    if (!showPaymentModal) {
      setShowPaymentModal(true);
      setPaidAmount(total.toString());
      return;
    }

    const paid = parseFloat(paidAmount) || 0;
    if (paid >= total) {
      onPay(paid);
      setShowPaymentModal(false);
      setPaidAmount('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handlePay();
    }
  };

  return (
    <div className="bg-gray-100 p-4 border-t">
      {/* Total Principal */}
      <div className="mb-4">
        <div className="text-right">
          <span className="text-2xl font-bold text-gray-700">Total a Pagar:</span>
        </div>
        <div className="text-right">
          <span className="text-4xl font-bold text-blue-900">
            {formatCurrency(total)}
          </span>
        </div>
      </div>

      {/* Modal de Pago */}
      {showPaymentModal && (
        <div className="mb-4 p-4 bg-white rounded-lg border-2 border-blue-500">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total:
              </label>
              <div className="text-lg font-bold text-blue-900">
                {formatCurrency(total)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Pagó con:
              </label>
              <input
                type="number"
                step="0.01"
                value={paidAmount}
                onChange={(e) => setPaidAmount(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full p-2 border border-gray-300 rounded-lg text-lg font-mono"
                placeholder="0.00"
                autoFocus
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cambio:
              </label>
              <div className={`text-lg font-bold ${
                calculateChange() >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                {formatCurrency(Math.max(0, calculateChange()))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Botones de Acción */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
        <button
          onClick={onChange}
          disabled={disabled}
          className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
        >
          <span className="text-yellow-300">F5</span> Cambiar
        </button>
        
        <button
          onClick={onPending}
          disabled={disabled}
          className="bg-orange-600 hover:bg-orange-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
        >
          <span className="text-yellow-300">F6</span> Pendiente
        </button>
        
        <button
          onClick={onDeleteProduct}
          disabled={disabled}
          className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-4 py-2 rounded transition-colors"
        >
          Eliminar Producto
        </button>
        
        <button
          onClick={onReprint}
          className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded transition-colors"
        >
          Reimprimir
        </button>
      </div>

      {/* Botón Principal de Cobrar */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
        <button
          onClick={handlePay}
          disabled={disabled || total <= 0}
          className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-8 py-4 rounded-lg text-xl font-bold transition-colors"
        >
          <span className="text-yellow-300">F12</span> {showPaymentModal ? 'CONFIRMAR PAGO' : 'COBRAR'}
        </button>
        
        <button
          onClick={onDailySales}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-4 rounded-lg transition-colors"
        >
          Consultar Ventas del Día
        </button>
      </div>

      {showPaymentModal && (
        <div className="mt-2 text-center">
          <button
            onClick={() => setShowPaymentModal(false)}
            className="text-sm text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
        </div>
      )}
    </div>
  );
}
