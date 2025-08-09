import { CashSession } from '../hooks/useCashRegister';
import { formatCurrency } from './utils';

// Función para generar CSV (que se puede abrir en Excel)
export const generateCashReportCSV = (sessions: CashSession[]): string => {
  const headers = [
    'ID Sesión',
    'Fecha Apertura',
    'Fecha Cierre',
    'Usuario',
    'Fondo Inicial',
    'Total Ventas',
    'Efectivo Esperado',
    'Efectivo Contado',
    'Ventas Tarjeta',
    'Transferencias',
    'Diferencia',
    'Estado',
    'Duración (horas)'
  ];

  const rows = sessions.map(session => {
    const duration = session.endDate 
      ? Math.round((new Date(session.endDate).getTime() - new Date(session.startDate).getTime()) / (1000 * 60 * 60) * 100) / 100
      : 0;

    return [
      session.id,
      new Date(session.startDate).toLocaleString('es-HN'),
      session.endDate ? new Date(session.endDate).toLocaleString('es-HN') : 'Abierta',
      session.userName,
      session.startingCash.toFixed(2),
      session.totalSales.toFixed(2),
      session.expectedCash.toFixed(2),
      session.endingCash?.toFixed(2) || '0.00',
      session.totalCard?.toFixed(2) || '0.00',
      session.totalTransfer?.toFixed(2) || '0.00',
      session.difference.toFixed(2),
      session.isOpen ? 'Abierta' : 'Cerrada',
      duration.toFixed(2)
    ];
  });

  // Convertir a CSV
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n');

  return csvContent;
};

// Función para descargar CSV
export const downloadCashReportCSV = (sessions: CashSession[], filename: string = 'reporte-cierres.csv') => {
  const csvContent = generateCashReportCSV(sessions);
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Función para generar HTML del reporte (para PDF)
export const generateCashReportHTML = (sessions: CashSession[], title: string = 'Reporte de Cierres de Caja'): string => {
  const closedSessions = sessions.filter(s => !s.isOpen);
  
  // Calcular estadísticas
  const totalSales = closedSessions.reduce((sum, s) => sum + s.totalSales, 0);
  const totalCash = closedSessions.reduce((sum, s) => sum + (s.totalCash || 0), 0);
  const totalCard = closedSessions.reduce((sum, s) => sum + (s.totalCard || 0), 0);
  const totalTransfer = closedSessions.reduce((sum, s) => sum + (s.totalTransfer || 0), 0);
  const totalDifferences = closedSessions.reduce((sum, s) => sum + s.difference, 0);
  const perfectCount = closedSessions.filter(s => s.difference === 0).length;

  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: 'Arial', sans-serif;
          margin: 0;
          padding: 20px;
          background-color: #f5f5f5;
          color: #333;
        }
        .container {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          padding: 30px;
          border-radius: 10px;
          box-shadow: 0 0 20px rgba(0,0,0,0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          border-bottom: 3px solid #0ea5e9;
          padding-bottom: 20px;
        }
        .header h1 {
          color: #0ea5e9;
          margin: 0;
          font-size: 2.5rem;
        }
        .header p {
          color: #666;
          margin: 10px 0 0 0;
          font-size: 1.1rem;
        }
        .summary {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 20px;
          margin-bottom: 30px;
        }
        .summary-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 10px;
          text-align: center;
        }
        .summary-card h3 {
          margin: 0 0 10px 0;
          font-size: 0.9rem;
          opacity: 0.9;
        }
        .summary-card .value {
          font-size: 1.8rem;
          font-weight: bold;
          margin: 0;
        }
        .table-container {
          overflow-x: auto;
          margin-top: 20px;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
          font-size: 0.9rem;
        }
        th, td {
          padding: 12px 8px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        th {
          background-color: #f8f9fa;
          font-weight: bold;
          color: #333;
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 0.5px;
        }
        tr:hover {
          background-color: #f5f5f5;
        }
        .positive {
          color: #10b981;
          font-weight: bold;
        }
        .negative {
          color: #ef4444;
          font-weight: bold;
        }
        .zero {
          color: #6b7280;
          font-weight: bold;
        }
        .status-open {
          background: #fef3c7;
          color: #92400e;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .status-closed {
          background: #d1fae5;
          color: #065f46;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          font-weight: bold;
        }
        .footer {
          margin-top: 30px;
          text-align: center;
          color: #666;
          font-size: 0.9rem;
          border-top: 1px solid #eee;
          padding-top: 20px;
        }
        .no-data {
          text-align: center;
          color: #666;
          font-style: italic;
          padding: 40px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>📊 ${title}</h1>
          <p>Generado el ${new Date().toLocaleString('es-HN')}</p>
        </div>

        <div class="summary">
          <div class="summary-card">
            <h3>TOTAL SESIONES</h3>
            <p class="value">${sessions.length}</p>
          </div>
          <div class="summary-card">
            <h3>VENTAS TOTALES</h3>
            <p class="value">${formatCurrency(totalSales)}</p>
          </div>
          <div class="summary-card">
            <h3>EFECTIVO TOTAL</h3>
            <p class="value">${formatCurrency(totalCash)}</p>
          </div>
          <div class="summary-card">
            <h3>TARJETAS</h3>
            <p class="value">${formatCurrency(totalCard)}</p>
          </div>
          <div class="summary-card">
            <h3>TRANSFERENCIAS</h3>
            <p class="value">${formatCurrency(totalTransfer)}</p>
          </div>
          <div class="summary-card">
            <h3>DIFERENCIAS</h3>
            <p class="value ${totalDifferences === 0 ? 'zero' : totalDifferences > 0 ? 'positive' : 'negative'}">${formatCurrency(totalDifferences)}</p>
          </div>
          <div class="summary-card">
            <h3>CAJAS CUADRADAS</h3>
            <p class="value">${perfectCount}/${closedSessions.length}</p>
          </div>
          <div class="summary-card">
            <h3>PRECISIÓN</h3>
            <p class="value">${closedSessions.length > 0 ? Math.round((perfectCount / closedSessions.length) * 100) : 0}%</p>
          </div>
        </div>

        <div class="table-container">
          ${sessions.length > 0 ? `
            <table>
              <thead>
                <tr>
                  <th>Fecha Apertura</th>
                  <th>Fecha Cierre</th>
                  <th>Usuario</th>
                  <th>Fondo Inicial</th>
                  <th>Ventas</th>
                  <th>Efectivo</th>
                  <th>Tarjeta</th>
                  <th>Transferencia</th>
                  <th>Diferencia</th>
                  <th>Estado</th>
                  <th>Duración</th>
                </tr>
              </thead>
              <tbody>
                ${sessions.map(session => {
                  const duration = session.endDate 
                    ? Math.round((new Date(session.endDate).getTime() - new Date(session.startDate).getTime()) / (1000 * 60 * 60) * 100) / 100
                    : 0;
                  
                  return `
                    <tr>
                      <td>${new Date(session.startDate).toLocaleString('es-HN')}</td>
                      <td>${session.endDate ? new Date(session.endDate).toLocaleString('es-HN') : '-'}</td>
                      <td>${session.userName}</td>
                      <td>${formatCurrency(session.startingCash)}</td>
                      <td>${formatCurrency(session.totalSales)}</td>
                      <td>${formatCurrency(session.endingCash || 0)}</td>
                      <td>${formatCurrency(session.totalCard || 0)}</td>
                      <td>${formatCurrency(session.totalTransfer || 0)}</td>
                      <td class="${session.difference === 0 ? 'zero' : session.difference > 0 ? 'positive' : 'negative'}">${formatCurrency(session.difference)}</td>
                      <td><span class="${session.isOpen ? 'status-open' : 'status-closed'}">${session.isOpen ? 'Abierta' : 'Cerrada'}</span></td>
                      <td>${session.endDate ? duration.toFixed(1) + 'h' : '-'}</td>
                    </tr>
                  `;
                }).join('')}
              </tbody>
            </table>
          ` : `
            <div class="no-data">
              <p>No hay datos para mostrar en el rango seleccionado</p>
            </div>
          `}
        </div>

        <div class="footer">
          <p><strong>Sistema ERP Honduras</strong> - Reporte generado automáticamente</p>
          <p>© 2025 Allan Medina - Todos los derechos reservados</p>
        </div>
      </div>
    </body>
    </html>
  `;

  return html;
};

// Función para generar PDF del reporte
export const generateCashReportPDF = (sessions: CashSession[], filename: string = 'reporte-cierres.pdf') => {
  const htmlContent = generateCashReportHTML(sessions);
  
  // Crear un iframe oculto para imprimir
  const iframe = document.createElement('iframe');
  iframe.style.position = 'absolute';
  iframe.style.top = '-9999px';
  iframe.style.left = '-9999px';
  document.body.appendChild(iframe);
  
  const doc = iframe.contentWindow!.document;
  doc.open();
  doc.write(htmlContent);
  doc.close();
  
  // Esperar a que se cargue el contenido y luego imprimir
  setTimeout(() => {
    iframe.contentWindow!.print();
    setTimeout(() => {
      document.body.removeChild(iframe);
    }, 1000);
  }, 500);
};
