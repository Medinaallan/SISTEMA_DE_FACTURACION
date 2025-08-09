import React, { useState, useEffect } from 'react';
import { formatCurrency } from '../../lib/utils';
import { CashSession } from '../../hooks/useCashRegister';

interface CloseCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCloseCash: (cashCount: number, cardCount: number, transferCount: number) => void;
  currentSession: CashSession | null;
}

export default function CloseCashModal({ 
  isOpen, 
  onClose, 
  onCloseCash, 
  currentSession 
}: CloseCashModalProps) {
  const [cashCount, setCashCount] = useState('');
  const [cardCount, setCardCount] = useState('');
  const [transferCount, setTransferCount] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [canClose, setCanClose] = useState(false);

  // Resetear formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      setCashCount('');
      setCardCount('');
      setTransferCount('');
      setErrors({});
      setCanClose(false);
    }
  }, [isOpen]);

  // Verificar si se pueden habilitar los botones
  useEffect(() => {
    const cash = parseFloat(cashCount) || 0;
    const card = parseFloat(cardCount) || 0;
    const transfer = parseFloat(transferCount) || 0;
    
    const hasValidAmounts = cash >= 0 && card >= 0 && transfer >= 0;
    const hasAtLeastOneAmount = cashCount !== '' || cardCount !== '' || transferCount !== '';
    
    setCanClose(hasValidAmounts && hasAtLeastOneAmount);
  }, [cashCount, cardCount, transferCount]);

  const handleAmountChange = (value: string, setter: (val: string) => void, field: string) => {
    // Solo permitir números y punto decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    setter(numericValue);
    
    // Limpiar error del campo
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const formatInputValue = (value: string) => {
    if (!value) return '';
    const numValue = parseFloat(value);
    if (isNaN(numValue)) return value;
    return numValue.toLocaleString('es-HN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    const cash = parseFloat(cashCount) || 0;
    const card = parseFloat(cardCount) || 0;
    const transfer = parseFloat(transferCount) || 0;
    
    if (cash < 0) newErrors.cash = 'El monto no puede ser negativo';
    if (card < 0) newErrors.card = 'El monto no puede ser negativo';
    if (transfer < 0) newErrors.transfer = 'El monto no puede ser negativo';
    
    if (cashCount === '' && cardCount === '' && transferCount === '') {
      newErrors.general = 'Debe ingresar al menos un monto';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    const cash = parseFloat(cashCount) || 0;
    const card = parseFloat(cardCount) || 0;
    const transfer = parseFloat(transferCount) || 0;
    
    onCloseCash(cash, card, transfer);
    onClose();
  };

  const calculateDifference = () => {
    if (!currentSession || !cashCount) return 0;
    const cash = parseFloat(cashCount) || 0;
    return cash - currentSession.expectedCash;
  };

  const getDifferenceColor = () => {
    const diff = calculateDifference();
    if (diff > 0) return 'text-green-600';
    if (diff < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (!isOpen || !currentSession) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="text-3xl mr-3">🔒</span>
            Cierre de Caja
          </h2>
        </div>

        {/* Resumen de la sesión */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-800 mb-3">📊 Resumen del Turno</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-blue-700">Apertura:</span>
              <div className="font-semibold">{formatCurrency(currentSession.startingCash)}</div>
            </div>
            <div>
              <span className="text-blue-700">Ventas Totales:</span>
              <div className="font-semibold">{formatCurrency(currentSession.totalSales)}</div>
            </div>
            <div>
              <span className="text-blue-700">Efectivo Esperado:</span>
              <div className="font-semibold text-green-600">{formatCurrency(currentSession.expectedCash)}</div>
            </div>
            <div>
              <span className="text-blue-700">Duración:</span>
              <div className="font-semibold">
                {Math.floor((Date.now() - new Date(currentSession.startDate).getTime()) / (1000 * 60 * 60))}h 
                {Math.floor(((Date.now() - new Date(currentSession.startDate).getTime()) % (1000 * 60 * 60)) / (1000 * 60))}m
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {errors.general && (
            <div className="mb-4 text-sm text-red-600 flex items-center bg-red-50 p-3 rounded-lg">
              <span className="mr-2">⚠️</span>
              {errors.general}
            </div>
          )}

          {/* Efectivo */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💵 Efectivo en Caja
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                L.
              </span>
              <input
                type="text"
                value={cashCount}
                onChange={(e) => handleAmountChange(e.target.value, setCashCount, 'cash')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-lg font-semibold"
                placeholder="0.00"
              />
            </div>
            
            {cashCount && (
              <div className="mt-1 flex justify-between text-sm">
                <span className="text-gray-600">Formato: {formatInputValue(cashCount)}</span>
                <span className={`font-semibold ${getDifferenceColor()}`}>
                  Diferencia: {formatCurrency(calculateDifference())}
                </span>
              </div>
            )}
            
            {errors.cash && (
              <div className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.cash}
              </div>
            )}
          </div>

          {/* Tarjeta */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💳 Ventas con Tarjeta
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                L.
              </span>
              <input
                type="text"
                value={cardCount}
                onChange={(e) => handleAmountChange(e.target.value, setCardCount, 'card')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-lg font-semibold"
                placeholder="0.00"
              />
            </div>
            
            {cardCount && (
              <div className="mt-1 text-sm text-gray-600">
                Formato: {formatInputValue(cardCount)}
              </div>
            )}
            
            {errors.card && (
              <div className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.card}
              </div>
            )}
          </div>

          {/* Transferencia */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🏦 Transferencias
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                L.
              </span>
              <input
                type="text"
                value={transferCount}
                onChange={(e) => handleAmountChange(e.target.value, setTransferCount, 'transfer')}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-lg font-semibold"
                placeholder="0.00"
              />
            </div>
            
            {transferCount && (
              <div className="mt-1 text-sm text-gray-600">
                Formato: {formatInputValue(transferCount)}
              </div>
            )}
            
            {errors.transfer && (
              <div className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {errors.transfer}
              </div>
            )}
          </div>

          {/* Advertencia */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-xl mr-2 mt-0.5">⚠️</span>
              <div className="text-sm">
                <p className="font-semibold text-yellow-800 mb-1">Importante:</p>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Verifique los montos antes de cerrar</li>
                  <li>• El cierre es irreversible</li>
                  <li>• Se generará el reporte automáticamente</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-3 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 font-medium transition-colors"
            >
              ❌ Cancelar
            </button>
            <button
              type="submit"
              disabled={!canClose}
              className={`flex-1 px-4 py-3 rounded-lg font-medium transition-colors ${
                canClose
                  ? 'bg-red-600 text-white hover:bg-red-700'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              🔒 Corte X
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
