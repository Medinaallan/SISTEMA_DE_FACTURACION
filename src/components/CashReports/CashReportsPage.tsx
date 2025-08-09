import React, { useState, useEffect } from 'react';
import { useCashReports, CashReportFilter } from '../../hooks/useCashReports';
import { CashSession } from '../../hooks/useCashRegister';
import { formatCurrency } from '../../lib/utils';
import { downloadCashReportCSV, generateCashReportPDF } from '../../lib/cash-reports';
import CashSessionDetail from './CashSessionDetail';

interface CashReportsPageProps {
  onBack: () => void;
}

export default function CashReportsPage({ onBack }: CashReportsPageProps) {
  const { 
    sessions, 
    allSessions, 
    loading, 
    filterSessions, 
    getStatistics,
    getSessionById 
  } = useCashReports();

  const [filters, setFilters] = useState<CashReportFilter>({
    startDate: '',
    endDate: '',
    userId: 'all',
    status: 'all'
  });

  const [selectedSession, setSelectedSession] = useState<CashSession | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Aplicar filtros al cargar
  useEffect(() => {
    filterSessions(filters);
  }, []);

  const handleFilterChange = (newFilters: Partial<CashReportFilter>) => {
    const updatedFilters = { ...filters, ...newFilters };
    setFilters(updatedFilters);
    filterSessions(updatedFilters);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    const clearedFilters: CashReportFilter = {
      startDate: '',
      endDate: '',
      userId: 'all',
      status: 'all'
    };
    setFilters(clearedFilters);
    filterSessions(clearedFilters);
    setCurrentPage(1);
  };

  const handleViewDetail = (session: CashSession) => {
    setSelectedSession(session);
    setShowDetail(true);
  };

  const handleDownloadExcel = () => {
    const filename = `reporte-cierres-${new Date().toISOString().split('T')[0]}.csv`;
    downloadCashReportCSV(sessions, filename);
  };

  const handleDownloadPDF = () => {
    const filename = `reporte-cierres-${new Date().toISOString().split('T')[0]}.pdf`;
    generateCashReportPDF(sessions, filename);
  };

  const statistics = getStatistics();

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentSessions = sessions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(sessions.length / itemsPerPage);

  const getDifferenceClass = (difference: number) => {
    if (difference === 0) return 'text-gray-600';
    return difference > 0 ? 'text-green-600' : 'text-red-600';
  };

  const getDifferenceIcon = (difference: number) => {
    if (difference === 0) return '✅';
    return difference > 0 ? '📈' : '📉';
  };

  if (showDetail && selectedSession) {
    return (
      <CashSessionDetail
        session={selectedSession}
        onBack={() => setShowDetail(false)}
      />
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
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
            <span className="text-4xl mr-3">📊</span>
            Reportes de Cierres de Caja
          </h1>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={handleDownloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
          >
            📊 Descargar Excel
          </button>
          <button
            onClick={handleDownloadPDF}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg flex items-center font-medium transition-colors"
          >
            📄 Descargar PDF
          </button>
        </div>
      </div>

      {/* Estadísticas Generales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">🏪</span>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">Total Sesiones</h3>
              <p className="text-2xl font-bold text-blue-600">{statistics.totalSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">💰</span>
            <div>
              <h3 className="text-lg font-semibold text-green-800">Ventas Totales</h3>
              <p className="text-2xl font-bold text-green-600">{formatCurrency(statistics.totalSales)}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">✅</span>
            <div>
              <h3 className="text-lg font-semibold text-purple-800">Precisión</h3>
              <p className="text-2xl font-bold text-purple-600">{statistics.accuracyRate.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <span className="text-2xl mr-3">📊</span>
            <div>
              <h3 className="text-lg font-semibold text-orange-800">Diferencias</h3>
              <p className={`text-2xl font-bold ${getDifferenceClass(statistics.totalDifferences)}`}>
                {formatCurrency(statistics.totalDifferences)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtros */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-xl mr-2">🔍</span>
          Filtros de Búsqueda
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Fecha Desde
            </label>
            <input
              type="date"
              value={filters.startDate || ''}
              onChange={(e) => handleFilterChange({ startDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              📅 Fecha Hasta
            </label>
            <input
              type="date"
              value={filters.endDate || ''}
              onChange={(e) => handleFilterChange({ endDate: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              👤 Usuario
            </label>
            <select
              value={filters.userId || 'all'}
              onChange={(e) => handleFilterChange({ userId: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos los usuarios</option>
              {Array.from(new Set(allSessions.map(s => s.userName))).map(userName => (
                <option key={userName} value={userName}>{userName}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              🔄 Estado
            </label>
            <select
              value={filters.status || 'all'}
              onChange={(e) => handleFilterChange({ status: e.target.value as any })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">Todos</option>
              <option value="closed">Cerradas</option>
              <option value="open">Abiertas</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 mt-4">
          <button
            onClick={clearFilters}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            🗑️ Limpiar Filtros
          </button>
          <div className="text-sm text-gray-600 flex items-center">
            Mostrando {sessions.length} sesión(es) de {allSessions.length} total(es)
          </div>
        </div>
      </div>

      {/* Tabla de Sesiones */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Lista de Cierres</h3>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">Cargando...</p>
          </div>
        ) : sessions.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <span className="text-4xl mb-4 block">📭</span>
            <p>No hay sesiones que coincidan con los filtros seleccionados</p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sesión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Fechas
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Montos
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Diferencia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {currentSessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            Sesión #{session.id.slice(-6)}
                          </div>
                          <div className="text-sm text-gray-500">{session.userName}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          <div>📅 {new Date(session.startDate).toLocaleDateString('es-HN')}</div>
                          <div className="text-gray-500">
                            {session.endDate 
                              ? new Date(session.endDate).toLocaleDateString('es-HN')
                              : 'En curso'
                            }
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm">
                          <div className="font-medium text-gray-900">
                            💰 {formatCurrency(session.totalSales)}
                          </div>
                          <div className="text-gray-500">
                            Inicial: {formatCurrency(session.startingCash)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-medium flex items-center ${getDifferenceClass(session.difference)}`}>
                          <span className="mr-1">{getDifferenceIcon(session.difference)}</span>
                          {formatCurrency(session.difference)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          session.isOpen 
                            ? 'bg-yellow-100 text-yellow-800' 
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {session.isOpen ? '🔄 Abierta' : '✅ Cerrada'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleViewDetail(session)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                        >
                          👁️ Ver Detalle
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, sessions.length)} de {sessions.length} sesiones
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-3 py-1 rounded ${
                      currentPage === 1 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    ← Anterior
                  </button>
                  
                  <span className="px-3 py-1 text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-3 py-1 rounded ${
                      currentPage === totalPages 
                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                        : 'bg-blue-600 text-white hover:bg-blue-700'
                    }`}
                  >
                    Siguiente →
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
