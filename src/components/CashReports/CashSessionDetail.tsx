import React from 'react';
import { CashSession } from '../../hooks/useCashRegister';
import { formatCurrency } from '../../lib/utils';

interface CashSessionDetailProps {
  session: CashSession;
  onBack: () => void;
}

export default function CashSessionDetail({ session, onBack }: CashSessionDetailProps) {
  const getDuration = () => {
    if (!session.endDate) return 'Sesión abierta';
    
    const duration = new Date(session.endDate).getTime() - new Date(session.startDate).getTime();
    const hours = Math.floor(duration / (1000 * 60 * 60));
    const minutes = Math.floor((duration % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  };

  const getDifferenceClass = (difference: number) => {
    if (difference === 0) return 'text-gray-600 bg-gray-50 border-gray-200';
    return difference > 0 
      ? 'text-green-600 bg-green-50 border-green-200' 
      : 'text-red-600 bg-red-50 border-red-200';
  };

  const getDifferenceIcon = (difference: number) => {
    if (difference === 0) return '✅';
    return difference > 0 ? '📈' : '📉';
  };

  const getDifferenceText = (difference: number) => {
    if (difference === 0) return 'Caja Cuadrada';
    return difference > 0 ? 'Sobrante' : 'Faltante';
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <button
            onClick={onBack}
            className="mr-4 text-blue-600 hover:text-blue-800 flex items-center"
          >
            ← Volver
          </button>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <span className="text-4xl mr-3">🔍</span>
            Detalle de Sesión #{session.id.slice(-6)}
          </h1>
        </div>
        
        <div className="flex items-center">
          <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
            session.isOpen 
              ? 'bg-yellow-100 text-yellow-800' 
              : 'bg-green-100 text-green-800'
          }`}>
            {session.isOpen ? '🔄 Sesión Abierta' : '✅ Sesión Cerrada'}
          </span>
        </div>
      </div>

      {/* Información General */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">ℹ️</span>
          Información General
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">ID de Sesión</label>
              <p className="text-lg text-gray-900 font-mono">{session.id}</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuario</label>
              <p className="text-lg text-gray-900 flex items-center">
                <span className="mr-2">👤</span>
                {session.userName}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Apertura</label>
              <p className="text-lg text-gray-900">
                📅 {new Date(session.startDate).toLocaleString('es-HN')}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Fecha de Cierre</label>
              <p className="text-lg text-gray-900">
                {session.endDate 
                  ? `📅 ${new Date(session.endDate).toLocaleString('es-HN')}`
                  : '⏳ Sesión en curso'
                }
              </p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Duración</label>
              <p className="text-lg text-gray-900 flex items-center">
                <span className="mr-2">⏱️</span>
                {getDuration()}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Estado</label>
              <p className="text-lg">
                <span className={`inline-flex px-3 py-1 text-sm font-semibold rounded-full ${
                  session.isOpen 
                    ? 'bg-yellow-100 text-yellow-800' 
                    : 'bg-green-100 text-green-800'
                }`}>
                  {session.isOpen ? '🔄 Abierta' : '✅ Cerrada'}
                </span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Resumen Financiero */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">💰</span>
            <div>
              <h3 className="text-sm font-medium text-blue-800">Fondo Inicial</h3>
              <p className="text-xl font-bold text-blue-600">{formatCurrency(session.startingCash)}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📈</span>
            <div>
              <h3 className="text-sm font-medium text-green-800">Total Ventas</h3>
              <p className="text-xl font-bold text-green-600">{formatCurrency(session.totalSales)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">💵</span>
            <div>
              <h3 className="text-sm font-medium text-purple-800">Efectivo Esperado</h3>
              <p className="text-xl font-bold text-purple-600">{formatCurrency(session.expectedCash)}</p>
            </div>
          </div>
        </div>

        <div className={`border rounded-lg p-4 ${getDifferenceClass(session.difference)}`}>
          <div className="flex items-center">
            <span className="text-2xl mr-3">{getDifferenceIcon(session.difference)}</span>
            <div>
              <h3 className="text-sm font-medium">{getDifferenceText(session.difference)}</h3>
              <p className="text-xl font-bold">{formatCurrency(Math.abs(session.difference))}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Desglose de Pagos */}
      {!session.isOpen && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">💳</span>
            Desglose de Pagos (Cierre)
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-2xl mr-3">💵</span>
                  <div>
                    <h3 className="text-sm font-medium text-green-800">Efectivo Contado</h3>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(session.endingCash || 0)}</p>
                  </div>
                </div>
              </div>
              <div className="mt-2 text-xs text-green-700">
                Esperado: {formatCurrency(session.expectedCash)}
              </div>
            </div>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">💳</span>
                <div>
                  <h3 className="text-sm font-medium text-blue-800">Ventas Tarjeta</h3>
                  <p className="text-lg font-bold text-blue-600">{formatCurrency(session.totalCard || 0)}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">🏦</span>
                <div>
                  <h3 className="text-sm font-medium text-orange-800">Transferencias</h3>
                  <p className="text-lg font-bold text-orange-600">{formatCurrency(session.totalTransfer || 0)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Análisis de Diferencia */}
      {!session.isOpen && session.difference !== 0 && (
        <div className={`rounded-lg border p-6 mb-6 ${getDifferenceClass(session.difference)}`}>
          <h2 className="text-xl font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">{getDifferenceIcon(session.difference)}</span>
            Análisis de Diferencia
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2">Resumen:</h3>
              <ul className="space-y-1 text-sm">
                <li>• Efectivo esperado: {formatCurrency(session.expectedCash)}</li>
                <li>• Efectivo contado: {formatCurrency(session.endingCash || 0)}</li>
                <li>• Diferencia: {formatCurrency(session.difference)}</li>
                <li>• Tipo: {getDifferenceText(session.difference)}</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2">Interpretación:</h3>
              <p className="text-sm">
                {session.difference > 0 
                  ? `Se encontró un sobrante de ${formatCurrency(session.difference)}. Esto podría indicar ingresos no registrados o errores en el conteo.`
                  : `Se detectó un faltante de ${formatCurrency(Math.abs(session.difference))}. Es recomendable revisar las transacciones y el manejo del efectivo.`
                }
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Acciones */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">⚙️</span>
          Acciones
        </h2>
        
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => window.print()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            🖨️ Imprimir Detalle
          </button>
          
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center transition-colors"
          >
            ← Volver a Lista
          </button>
        </div>
      </div>
    </div>
  );
}
