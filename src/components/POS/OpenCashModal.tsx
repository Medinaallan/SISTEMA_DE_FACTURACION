import React, { useState } from 'react';
import { formatCurrency } from '../../lib/utils';

interface OpenCashModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenCash: (startingCash: number) => void;
}

export default function OpenCashModal({ isOpen, onClose, onOpenCash }: OpenCashModalProps) {
  const [startingCash, setStartingCash] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const amount = parseFloat(startingCash);
    
    if (isNaN(amount) || amount < 0) {
      setError('Ingrese un monto válido');
      return;
    }

    onOpenCash(amount);
    setStartingCash('');
    setError('');
    onClose();
  };

  const handleAmountChange = (value: string) => {
    // Solo permitir números y punto decimal
    const numericValue = value.replace(/[^0-9.]/g, '');
    setStartingCash(numericValue);
    setError('');
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="text-3xl mr-3">💰</span>
            Apertura de Caja
          </h2>
        </div>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <div className="flex items-center">
            <span className="text-2xl mr-3">ℹ️</span>
            <div>
              <h3 className="font-semibold text-blue-800">Inicio de Turno</h3>
              <p className="text-blue-600 text-sm">
                Ingrese el fondo de cambio inicial para comenzar las operaciones del día.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              💵 Fondo de Cambio Inicial
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 font-semibold">
                L.
              </span>
              <input
                type="text"
                value={startingCash}
                onChange={(e) => handleAmountChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-right text-lg font-semibold"
                placeholder="0.00"
                autoFocus
              />
            </div>
            
            {startingCash && (
              <div className="mt-2 text-sm text-gray-600">
                Formato: {formatInputValue(startingCash)}
              </div>
            )}
            
            {error && (
              <div className="mt-2 text-sm text-red-600 flex items-center">
                <span className="mr-1">⚠️</span>
                {error}
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <span className="text-xl mr-2 mt-0.5">⚠️</span>
              <div className="text-sm">
                <p className="font-semibold text-yellow-800 mb-1">Importante:</p>
                <ul className="text-yellow-700 space-y-1">
                  <li>• Verifique que el monto ingresado sea correcto</li>
                  <li>• Este será el fondo inicial disponible para cambio</li>
                  <li>• Una vez abierta la caja, puede registrar ventas</li>
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
              className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium transition-colors"
            >
              🚀 Abrir Turno
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
