import { useState, useEffect } from 'react';
import { CashSession } from './useCashRegister';

export interface CashReportFilter {
  startDate?: string;
  endDate?: string;
  userId?: string;
  status?: 'all' | 'open' | 'closed';
}

export const useCashReports = () => {
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<CashSession[]>([]);
  const [loading, setLoading] = useState(false);

  // Cargar sesiones del localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('cashSessions');
    if (savedSessions) {
      const parsedSessions = JSON.parse(savedSessions);
      setSessions(parsedSessions);
      setFilteredSessions(parsedSessions);
    }
  }, []);

  // Filtrar sesiones
  const filterSessions = (filters: CashReportFilter) => {
    setLoading(true);
    
    let filtered = [...sessions];

    // Filtrar por fechas
    if (filters.startDate) {
      filtered = filtered.filter(session => 
        new Date(session.startDate) >= new Date(filters.startDate!)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(session => 
        new Date(session.startDate) <= new Date(filters.endDate!)
      );
    }

    // Filtrar por usuario
    if (filters.userId && filters.userId !== 'all') {
      filtered = filtered.filter(session => session.userId === filters.userId);
    }

    // Filtrar por estado
    if (filters.status && filters.status !== 'all') {
      if (filters.status === 'open') {
        filtered = filtered.filter(session => session.isOpen);
      } else if (filters.status === 'closed') {
        filtered = filtered.filter(session => !session.isOpen);
      }
    }

    setFilteredSessions(filtered);
    setLoading(false);
  };

  // Obtener estadísticas generales
  const getStatistics = () => {
    const closedSessions = sessions.filter(s => !s.isOpen);
    
    const totalSessions = closedSessions.length;
    const totalSales = closedSessions.reduce((sum, s) => sum + s.totalSales, 0);
    const totalCash = closedSessions.reduce((sum, s) => sum + (s.totalCash || 0), 0);
    const totalCard = closedSessions.reduce((sum, s) => sum + (s.totalCard || 0), 0);
    const totalTransfer = closedSessions.reduce((sum, s) => sum + (s.totalTransfer || 0), 0);
    const totalDifferences = closedSessions.reduce((sum, s) => sum + s.difference, 0);
    
    const perfectSessions = closedSessions.filter(s => s.difference === 0).length;
    const surplusSessions = closedSessions.filter(s => s.difference > 0).length;
    const deficitSessions = closedSessions.filter(s => s.difference < 0).length;

    return {
      totalSessions,
      totalSales,
      totalCash,
      totalCard,
      totalTransfer,
      totalDifferences,
      perfectSessions,
      surplusSessions,
      deficitSessions,
      averageSale: totalSessions > 0 ? totalSales / totalSessions : 0,
      accuracyRate: totalSessions > 0 ? (perfectSessions / totalSessions) * 100 : 0
    };
  };

  // Obtener sesión por ID
  const getSessionById = (id: string): CashSession | null => {
    return sessions.find(s => s.id === id) || null;
  };

  // Obtener sesiones por rango de fechas
  const getSessionsByDateRange = (startDate: Date, endDate: Date): CashSession[] => {
    return sessions.filter(session => {
      const sessionDate = new Date(session.startDate);
      return sessionDate >= startDate && sessionDate <= endDate;
    });
  };

  // Obtener resumen diario
  const getDailySummary = (date: Date) => {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const daySessions = sessions.filter(session => {
      const sessionDate = new Date(session.startDate);
      return sessionDate >= startOfDay && sessionDate <= endOfDay;
    });

    const closedSessions = daySessions.filter(s => !s.isOpen);

    return {
      totalSessions: daySessions.length,
      closedSessions: closedSessions.length,
      openSessions: daySessions.length - closedSessions.length,
      totalSales: closedSessions.reduce((sum, s) => sum + s.totalSales, 0),
      totalCash: closedSessions.reduce((sum, s) => sum + (s.totalCash || 0), 0),
      totalCard: closedSessions.reduce((sum, s) => sum + (s.totalCard || 0), 0),
      totalTransfer: closedSessions.reduce((sum, s) => sum + (s.totalTransfer || 0), 0),
      totalDifferences: closedSessions.reduce((sum, s) => sum + s.difference, 0)
    };
  };

  return {
    sessions: filteredSessions,
    allSessions: sessions,
    loading,
    filterSessions,
    getStatistics,
    getSessionById,
    getSessionsByDateRange,
    getDailySummary
  };
};
