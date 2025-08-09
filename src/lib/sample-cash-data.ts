// Script temporal para crear datos de prueba de cierres de caja

const createSampleCashSessions = () => {
  const sampleSessions = [
    {
      id: '1703756400000', // Timestamp como ID
      startDate: new Date('2024-12-28T08:00:00'),
      endDate: new Date('2024-12-28T18:30:00'),
      startingCash: 1000,
      endingCash: 2150,
      totalSales: 1200,
      totalCard: 800,
      totalTransfer: 400,
      totalCash: 1150,
      expectedCash: 2150,
      difference: 0,
      isOpen: false,
      userId: '1',
      userName: 'Juan Pérez'
    },
    {
      id: '1703842800000',
      startDate: new Date('2024-12-29T08:15:00'),
      endDate: new Date('2024-12-29T17:45:00'),
      startingCash: 1000,
      endingCash: 1780,
      totalSales: 850,
      totalCard: 450,
      totalTransfer: 200,
      totalCash: 780,
      expectedCash: 1800,
      difference: -20,
      isOpen: false,
      userId: '2',
      userName: 'María González'
    },
    {
      id: '1703929200000',
      startDate: new Date('2024-12-30T09:00:00'),
      endDate: new Date('2024-12-30T19:00:00'),
      startingCash: 1200,
      endingCash: 2650,
      totalSales: 1500,
      totalCard: 950,
      totalTransfer: 550,
      totalCash: 1450,
      expectedCash: 2650,
      difference: 0,
      isOpen: false,
      userId: '1',
      userName: 'Juan Pérez'
    },
    {
      id: '1704015600000',
      startDate: new Date('2024-12-31T08:30:00'),
      endDate: new Date('2024-12-31T16:30:00'),
      startingCash: 1500,
      endingCash: 2320,
      totalSales: 900,
      totalCard: 600,
      totalTransfer: 300,
      totalCash: 820,
      expectedCash: 2320,
      difference: 0,
      isOpen: false,
      userId: '3',
      userName: 'Carlos Rodríguez'
    },
    {
      id: '1704102000000',
      startDate: new Date('2025-01-01T10:00:00'),
      endDate: null,
      startingCash: 1000,
      endingCash: null,
      totalSales: 550,
      totalCard: 0,
      totalTransfer: 0,
      totalCash: 1550,
      expectedCash: 1550,
      difference: 0,
      isOpen: true,
      userId: '1',
      userName: 'Juan Pérez'
    }
  ];

  // Guardar en localStorage
  localStorage.setItem('cashSessions', JSON.stringify(sampleSessions));
  
  console.log('✅ Datos de prueba de cierres de caja creados exitosamente');
  console.log(`📊 Se crearon ${sampleSessions.length} sesiones de ejemplo`);
  console.log('🔄 Recarga la página para ver los datos');
};

// Función para limpiar datos de prueba
const clearSampleData = () => {
  localStorage.removeItem('cashSessions');
  localStorage.removeItem('cashMovements');
  localStorage.removeItem('currentCashSession');
  console.log('🗑️ Datos de cierres de caja eliminados');
};

// Exportar funciones para uso en consola del navegador
if (typeof window !== 'undefined') {
  (window as any).createSampleCashSessions = createSampleCashSessions;
  (window as any).clearSampleData = clearSampleData;
}

export { createSampleCashSessions, clearSampleData };
