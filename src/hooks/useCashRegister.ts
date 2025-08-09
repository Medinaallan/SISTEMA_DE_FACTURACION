import { useState, useEffect } from 'react';

export interface CashSession {
  id: string;
  startDate: Date;
  endDate?: Date;
  startingCash: number;
  endingCash?: number;
  totalSales: number;
  totalCard: number;
  totalTransfer: number;
  totalCash: number;
  expectedCash: number;
  difference: number;
  isOpen: boolean;
  userId: string;
  userName: string;
}

export interface CashMovement {
  id: string;
  sessionId: string;
  type: 'entry' | 'exit' | 'sale';
  amount: number;
  description: string;
  date: Date;
  userId: string;
}

export const useCashRegister = () => {
  const [currentSession, setCurrentSession] = useState<CashSession | null>(null);
  const [sessions, setSessions] = useState<CashSession[]>([]);
  const [movements, setMovements] = useState<CashMovement[]>([]);

  // Cargar datos del localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('cashSessions');
    const savedMovements = localStorage.getItem('cashMovements');
    const savedCurrentSession = localStorage.getItem('currentCashSession');

    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }

    if (savedMovements) {
      setMovements(JSON.parse(savedMovements));
    }

    if (savedCurrentSession) {
      setCurrentSession(JSON.parse(savedCurrentSession));
    }
  }, []);

  // Guardar datos en localStorage
  const saveSessions = (newSessions: CashSession[]) => {
    setSessions(newSessions);
    localStorage.setItem('cashSessions', JSON.stringify(newSessions));
  };

  const saveMovements = (newMovements: CashMovement[]) => {
    setMovements(newMovements);
    localStorage.setItem('cashMovements', JSON.stringify(newMovements));
  };

  const saveCurrentSession = (session: CashSession | null) => {
    setCurrentSession(session);
    localStorage.setItem('currentCashSession', JSON.stringify(session));
  };

  // Abrir caja
  const openCashRegister = (startingCash: number, userId: string, userName: string): CashSession => {
    const newSession: CashSession = {
      id: Date.now().toString(),
      startDate: new Date(),
      startingCash,
      totalSales: 0,
      totalCard: 0,
      totalTransfer: 0,
      totalCash: startingCash,
      expectedCash: startingCash,
      difference: 0,
      isOpen: true,
      userId,
      userName
    };

    const updatedSessions = [...sessions, newSession];
    saveSessions(updatedSessions);
    saveCurrentSession(newSession);

    // Registrar movimiento inicial
    const initialMovement: CashMovement = {
      id: Date.now().toString(),
      sessionId: newSession.id,
      type: 'entry',
      amount: startingCash,
      description: 'Apertura de caja - Fondo inicial',
      date: new Date(),
      userId
    };

    const updatedMovements = [...movements, initialMovement];
    saveMovements(updatedMovements);

    return newSession;
  };

  // Cerrar caja
  const closeCashRegister = (
    cashCount: number,
    cardCount: number,
    transferCount: number
  ): CashSession | null => {
    if (!currentSession) return null;

    const totalSales = currentSession.totalSales;
    const expectedCash = currentSession.startingCash + currentSession.totalCash;
    const difference = cashCount - expectedCash;

    const closedSession: CashSession = {
      ...currentSession,
      endDate: new Date(),
      endingCash: cashCount,
      totalCard: cardCount,
      totalTransfer: transferCount,
      expectedCash,
      difference,
      isOpen: false
    };

    // Actualizar sesiones
    const updatedSessions = sessions.map(s => 
      s.id === currentSession.id ? closedSession : s
    );
    saveSessions(updatedSessions);
    saveCurrentSession(null);

    return closedSession;
  };

  // Registrar venta
  const registerSale = (amount: number, paymentMethod: 'cash' | 'card' | 'transfer') => {
    if (!currentSession) return;

    let updatedSession = { ...currentSession };
    updatedSession.totalSales += amount;

    switch (paymentMethod) {
      case 'cash':
        updatedSession.totalCash += amount;
        updatedSession.expectedCash += amount;
        break;
      case 'card':
        updatedSession.totalCard += amount;
        break;
      case 'transfer':
        updatedSession.totalTransfer += amount;
        break;
    }

    // Actualizar sesiones
    const updatedSessions = sessions.map(s => 
      s.id === currentSession.id ? updatedSession : s
    );
    saveSessions(updatedSessions);
    saveCurrentSession(updatedSession);

    // Registrar movimiento
    const saleMovement: CashMovement = {
      id: Date.now().toString(),
      sessionId: currentSession.id,
      type: 'sale',
      amount,
      description: `Venta - ${paymentMethod}`,
      date: new Date(),
      userId: currentSession.userId
    };

    const updatedMovements = [...movements, saleMovement];
    saveMovements(updatedMovements);
  };

  // Registrar entrada/salida de efectivo
  const addCashMovement = (
    type: 'entry' | 'exit',
    amount: number,
    description: string,
    userId: string
  ) => {
    if (!currentSession) return;

    const movement: CashMovement = {
      id: Date.now().toString(),
      sessionId: currentSession.id,
      type,
      amount: type === 'entry' ? amount : -amount,
      description,
      date: new Date(),
      userId
    };

    const updatedMovements = [...movements, movement];
    saveMovements(updatedMovements);

    // Actualizar efectivo en sesión actual
    if (type === 'entry') {
      const updatedSession = {
        ...currentSession,
        totalCash: currentSession.totalCash + amount,
        expectedCash: currentSession.expectedCash + amount
      };
      
      const updatedSessions = sessions.map(s => 
        s.id === currentSession.id ? updatedSession : s
      );
      saveSessions(updatedSessions);
      saveCurrentSession(updatedSession);
    } else {
      const updatedSession = {
        ...currentSession,
        totalCash: currentSession.totalCash - amount,
        expectedCash: currentSession.expectedCash - amount
      };
      
      const updatedSessions = sessions.map(s => 
        s.id === currentSession.id ? updatedSession : s
      );
      saveSessions(updatedSessions);
      saveCurrentSession(updatedSession);
    }
  };

  // Verificar si hay sesión abierta
  const hasOpenSession = () => {
    return currentSession && currentSession.isOpen;
  };

  // Obtener movimientos de la sesión actual
  const getCurrentSessionMovements = () => {
    if (!currentSession) return [];
    return movements.filter(m => m.sessionId === currentSession.id);
  };

  return {
    currentSession,
    sessions,
    movements,
    openCashRegister,
    closeCashRegister,
    registerSale,
    addCashMovement,
    hasOpenSession,
    getCurrentSessionMovements
  };
};
