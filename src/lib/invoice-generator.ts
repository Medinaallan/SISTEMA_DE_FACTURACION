import { Invoice, Configuration } from './database';
import { formatCurrency } from './utils';

// Función para convertir números a letras
export function numeroALetras(numero: number): string {
  const unidades = ['', 'uno', 'dos', 'tres', 'cuatro', 'cinco', 'seis', 'siete', 'ocho', 'nueve'];
  const especiales = ['diez', 'once', 'doce', 'trece', 'catorce', 'quince', 'dieciséis', 'diecisiete', 'dieciocho', 'diecinueve'];
  const decenas = ['', '', 'veinte', 'treinta', 'cuarenta', 'cincuenta', 'sesenta', 'setenta', 'ochenta', 'noventa'];
  const centenas = ['', 'cien', 'doscientos', 'trescientos', 'cuatrocientos', 'quinientos', 'seiscientos', 'setecientos', 'ochocientos', 'novecientos'];

  if (numero === 0) return 'cero';
  if (numero === 100) return 'cien';

  let resultado = '';
  
  // Parte entera
  const entero = Math.floor(numero);
  const decimal = Math.round((numero - entero) * 100);

  if (entero >= 1000000) {
    const millones = Math.floor(entero / 1000000);
    resultado += convertirGrupo(millones) + (millones === 1 ? ' millón ' : ' millones ');
  }

  if (entero >= 1000) {
    const miles = Math.floor((entero % 1000000) / 1000);
    if (miles > 0) {
      if (miles === 1) {
        resultado += 'mil ';
      } else {
        resultado += convertirGrupo(miles) + ' mil ';
      }
    }
  }

  const resto = entero % 1000;
  if (resto > 0) {
    resultado += convertirGrupo(resto);
  }

  resultado = resultado.trim();
  if (decimal > 0) {
    resultado += ` lempiras con ${decimal.toString().padStart(2, '0')}/100 centavos`;
  } else {
    resultado += ' lempiras exactos';
  }

  return resultado.charAt(0).toUpperCase() + resultado.slice(1);

  function convertirGrupo(num: number): string {
    let grupo = '';
    
    const c = Math.floor(num / 100);
    const d = Math.floor((num % 100) / 10);
    const u = num % 10;

    if (c > 0) {
      if (num === 100) {
        grupo += 'cien';
      } else if (c === 1) {
        grupo += 'ciento ';
      } else {
        grupo += centenas[c] + ' ';
      }
    }

    if (d > 0) {
      if (d === 1 && u > 0) {
        grupo += especiales[u];
      } else if (d === 2 && u > 0) {
        grupo += 'veinti' + unidades[u];
      } else {
        grupo += decenas[d];
        if (u > 0) {
          grupo += (d > 2 ? ' y ' : '') + unidades[u];
        }
      }
    } else if (u > 0) {
      grupo += unidades[u];
    }

    return grupo.trim();
  }
}

// Función para generar el HTML de la factura con formato SAR
export function generateInvoiceHTML(invoice: Invoice, config: Configuration): string {
  const fechaEmision = new Date(invoice.fechaEmision || invoice.createdAt);
  
  return `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Factura ${invoice.invoiceNumber}</title>
      <style>
        @page {
          size: letter;
          margin: 0.5in;
        }
        
        body {
          font-family: 'Courier New', monospace;
          font-size: 11px;
          line-height: 1.2;
          margin: 0;
          padding: 0;
          color: #000;
        }
        
        .invoice-container {
          width: 100%;
          max-width: 7.5in;
          margin: 0 auto;
          border: 2px solid #000;
          padding: 10px;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        
        .company-name {
          font-weight: bold;
          font-size: 16px;
          margin-bottom: 5px;
        }
        
        .company-info {
          font-size: 10px;
          margin: 2px 0;
        }
        
        .invoice-title {
          font-weight: bold;
          font-size: 14px;
          margin: 10px 0;
          text-decoration: underline;
        }
        
        .invoice-details {
          display: flex;
          justify-content: space-between;
          margin: 15px 0;
          border: 1px solid #000;
          padding: 8px;
        }
        
        .client-info {
          border: 1px solid #000;
          padding: 8px;
          margin: 10px 0;
        }
        
        .items-table {
          width: 100%;
          border-collapse: collapse;
          margin: 15px 0;
          border: 2px solid #000;
        }
        
        .items-table th,
        .items-table td {
          border: 1px solid #000;
          padding: 4px;
          text-align: left;
          font-size: 10px;
        }
        
        .items-table th {
          background-color: #f0f0f0;
          font-weight: bold;
          text-align: center;
        }
        
        .number-column {
          text-align: right;
          width: 80px;
        }
        
        .totals-section {
          float: right;
          width: 300px;
          border: 2px solid #000;
          padding: 8px;
          margin: 15px 0;
        }
        
        .total-row {
          display: flex;
          justify-content: space-between;
          margin: 3px 0;
          padding: 2px 0;
        }
        
        .total-final {
          font-weight: bold;
          border-top: 2px solid #000;
          padding-top: 5px;
          margin-top: 5px;
        }
        
        .amount-words {
          clear: both;
          border: 2px solid #000;
          padding: 8px;
          margin: 20px 0;
          font-weight: bold;
        }
        
        .footer {
          text-align: center;
          font-size: 9px;
          margin-top: 20px;
          border-top: 1px solid #000;
          padding-top: 10px;
        }
        
        .sar-info {
          font-size: 8px;
          text-align: center;
          margin: 10px 0;
          padding: 5px;
          border: 1px solid #000;
        }
        
        @media print {
          .no-print {
            display: none;
          }
          
          body {
            print-color-adjust: exact;
          }
        }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <!-- Header -->
        <div class="header">
          <div class="company-name">${config.companyName.toUpperCase()}</div>
          <div class="company-info">RTN: ${config.companyRtn}</div>
          <div class="company-info">${config.companyAddress}</div>
          <div class="company-info">Tel: ${config.companyPhone} | Email: ${config.companyEmail}</div>
          ${config.companyWebsite ? `<div class="company-info">Web: ${config.companyWebsite}</div>` : ''}
          
          <div class="invoice-title">FACTURA COMERCIAL</div>
        </div>
        
        <!-- Información SAR -->
        <div class="sar-info">
          <strong>CAI:</strong> ${invoice.cai} | 
          <strong>Rango Autorizado:</strong> ${invoice.rangoAutorizado} | 
          <strong>Fecha Límite de Emisión:</strong> ${invoice.fechaLimiteEmision}
        </div>
        
        <!-- Detalles de la factura -->
        <div class="invoice-details" style="display: block;">
          <div style="float: left; width: 48%;">
            <strong>No. Factura:</strong> ${invoice.invoiceNumber}<br>
            <strong>No. Correlativo:</strong> ${invoice.correlativo.toString().padStart(8, '0')}<br>
            <strong>Fecha de Emisión:</strong> ${fechaEmision.toLocaleDateString('es-HN')}
          </div>
          <div style="float: right; width: 48%;">
            <strong>Moneda:</strong> ${invoice.codigoMoneda || 'HNL'}<br>
            <strong>Tipo de Documento:</strong> Factura<br>
            <strong>Estado:</strong> ${invoice.status.toUpperCase()}
          </div>
          <div style="clear: both;"></div>
        </div>
        
        <!-- Información del cliente -->
        <div class="client-info">
          <strong>FACTURAR A:</strong><br>
          <strong>Cliente:</strong> ${invoice.clientName}<br>
          ${invoice.clientRtn ? `<strong>RTN:</strong> ${invoice.clientRtn}<br>` : ''}
          ${invoice.clientAddress ? `<strong>Dirección:</strong> ${invoice.clientAddress}<br>` : ''}
          ${invoice.clientPhone ? `<strong>Teléfono:</strong> ${invoice.clientPhone}<br>` : ''}
          ${invoice.clientEmail ? `<strong>Email:</strong> ${invoice.clientEmail}` : ''}
        </div>
        
        <!-- Tabla de productos -->
        <table class="items-table">
          <thead>
            <tr>
              <th style="width: 5%;">No.</th>
              <th style="width: 40%;">DESCRIPCIÓN</th>
              <th style="width: 10%;">CANT.</th>
              <th style="width: 15%;">PRECIO UNIT.</th>
              <th style="width: 10%;">DESCUENTO</th>
              <th style="width: 20%;">VALOR TOTAL</th>
            </tr>
          </thead>
          <tbody>
            ${invoice.items.map((item, index) => `
              <tr>
                <td style="text-align: center;">${index + 1}</td>
                <td>${item.productName}<br><small>SKU: ${item.sku}</small></td>
                <td class="number-column">${item.quantity}</td>
                <td class="number-column">${formatCurrency(item.unitPrice)}</td>
                <td class="number-column">L. 0.00</td>
                <td class="number-column">${formatCurrency(item.total)}</td>
              </tr>
            `).join('')}
            
            <!-- Rellenar filas vacías si hay pocas -->
            ${Array.from({ length: Math.max(0, 8 - invoice.items.length) }, (_, i) => `
              <tr>
                <td style="text-align: center;">&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <!-- Total en letras -->
        <div class="amount-words">
          <strong>SON:</strong> ${invoice.totalLetras || numeroALetras(invoice.total)}
        </div>
        
        <!-- Sección de totales -->
        <div class="totals-section">
          <div class="total-row">
            <span>Importe Exonerado:</span>
            <span>${formatCurrency(invoice.exonerado || 0)}</span>
          </div>
          <div class="total-row">
            <span>Importe Exento:</span>
            <span>${formatCurrency(invoice.exento || 0)}</span>
          </div>
          <div class="total-row">
            <span>Importe Gravado 15%:</span>
            <span>${formatCurrency(invoice.gravado15 || invoice.subtotal)}</span>
          </div>
          <div class="total-row">
            <span>Importe Gravado 18%:</span>
            <span>${formatCurrency(invoice.gravado18 || 0)}</span>
          </div>
          <div class="total-row">
            <span>ISV 15%:</span>
            <span>${formatCurrency(invoice.isv15 || invoice.tax)}</span>
          </div>
          <div class="total-row">
            <span>ISV 18%:</span>
            <span>${formatCurrency(invoice.isv18 || 0)}</span>
          </div>
          <div class="total-row">
            <span>Descuento/Rebaja:</span>
            <span>${formatCurrency(invoice.descuento || 0)}</span>
          </div>
          <div class="total-row total-final">
            <span><strong>TOTAL A PAGAR:</strong></span>
            <span><strong>${formatCurrency(invoice.total)}</strong></span>
          </div>
        </div>
        
        <div style="clear: both;"></div>
        
        ${invoice.observaciones ? `
        <div style="border: 1px solid #000; padding: 8px; margin: 10px 0;">
          <strong>OBSERVACIONES:</strong><br>
          ${invoice.observaciones}
        </div>
        ` : ''}
        
        <!-- Footer -->
        <div class="footer">
          <div style="margin: 20px 0;">
            ______________________ &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ______________________<br>
            <small>Firma del Cliente &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; Firma y Sello de la Empresa</small>
          </div>
          
          <div class="sar-info">
            <strong>La factura es beneficio de todos. Exíjala.</strong><br>
            Resolución SAR No. XXX-2024 | Esta factura contribuye al desarrollo del país.
          </div>
          
          <div style="font-size: 8px; margin-top: 10px;">
            Impreso el: ${new Date().toLocaleString('es-HN')} | 
            Sistema ERP Honduras v1.0
          </div>
        </div>
        
      </div>
    </body>
    </html>
  `;
}

// Función para generar CSV de facturas
export function generateInvoicesCSV(invoices: Invoice[]): string {
  const headers = [
    'No. Factura',
    'CAI',
    'Correlativo', 
    'Fecha Emisión',
    'Cliente',
    'RTN Cliente',
    'Subtotal',
    'ISV',
    'Total',
    'Estado',
    'Observaciones'
  ];
  
  const csvContent = [
    headers.join(','),
    ...invoices.map(invoice => [
      `"${invoice.invoiceNumber}"`,
      `"${invoice.cai}"`,
      invoice.correlativo,
      `"${new Date(invoice.fechaEmision || invoice.createdAt).toLocaleDateString('es-HN')}"`,
      `"${invoice.clientName}"`,
      `"${invoice.clientRtn || ''}"`,
      invoice.subtotal,
      invoice.tax,
      invoice.total,
      `"${invoice.status}"`,
      `"${invoice.observaciones || ''}"`
    ].join(','))
  ].join('\n');
  
  return csvContent;
}

// Función para generar PDF
export async function generateInvoicePDF(invoice: Invoice, config: Configuration): Promise<void> {
  try {
    const { jsPDF } = await import('jspdf');
    const doc = new jsPDF('p', 'mm', 'letter');
    
    // Configuración de fuente
    doc.setFont('courier', 'normal');
    doc.setFontSize(10);
    
    let yPos = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 15;
    const usableWidth = pageWidth - (margin * 2);
    
    // Encabezado de empresa
    doc.setFontSize(14);
    doc.setFont('courier', 'bold');
    doc.text((config?.companyName || 'MI EMPRESA').toUpperCase(), pageWidth / 2, yPos, { align: 'center' });
    yPos += 6;
    
    doc.setFontSize(10);
    doc.setFont('courier', 'normal');
    doc.text(`RTN: ${config?.companyRtn || 'N/A'}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.text(config?.companyAddress || 'Dirección no configurada', pageWidth / 2, yPos, { align: 'center' });
    yPos += 4;
    doc.text(`Tel: ${config?.companyPhone || 'N/A'}`, pageWidth / 2, yPos, { align: 'center' });
    yPos += 8;
    
    doc.setFont('courier', 'bold');
    doc.text('FACTURA COMERCIAL', pageWidth / 2, yPos, { align: 'center' });
    yPos += 10;
    
    // Información SAR
    doc.setFont('courier', 'normal');
    doc.rect(margin, yPos, usableWidth, 15);
    yPos += 4;
    doc.text(`CAI: ${invoice.cai}`, margin + 2, yPos);
    yPos += 4;
    doc.text(`Rango: ${invoice.rangoAutorizado || 'N/A'}`, margin + 2, yPos);
    yPos += 4;
    doc.text(`Fecha Límite: ${invoice.fechaLimiteEmision || 'N/A'}`, margin + 2, yPos);
    yPos += 10;
    
    // Información de factura
    doc.text(`No. Factura: ${invoice.invoiceNumber}`, margin, yPos);
    doc.text(`Correlativo: ${(invoice.correlativo || 1).toString().padStart(8, '0')}`, pageWidth - margin - 60, yPos);
    yPos += 5;
    doc.text(`Fecha: ${new Date(invoice.fechaEmision || invoice.createdAt).toLocaleDateString('es-HN')}`, margin, yPos);
    doc.text(`Moneda: ${invoice.codigoMoneda || 'HNL'}`, pageWidth - margin - 40, yPos);
    yPos += 10;
    
    // Cliente
    doc.rect(margin, yPos, usableWidth, 20);
    yPos += 4;
    doc.setFont('courier', 'bold');
    doc.text('FACTURAR A:', margin + 2, yPos);
    yPos += 5;
    doc.setFont('courier', 'normal');
    doc.text(`Cliente: ${invoice.clientName}`, margin + 2, yPos);
    yPos += 4;
    if (invoice.clientRtn) {
      doc.text(`RTN: ${invoice.clientRtn}`, margin + 2, yPos);
      yPos += 4;
    }
    if (invoice.clientAddress) {
      doc.text(`Dirección: ${invoice.clientAddress}`, margin + 2, yPos);
      yPos += 4;
    }
    yPos += 8;
    
    // Tabla de productos
    const tableHeaders = ['No.', 'DESCRIPCIÓN', 'CANT.', 'P. UNIT.', 'TOTAL'];
    const colWidths = [15, 80, 20, 25, 25];
    let xPos = margin;
    
    // Encabezados de tabla
    doc.setFont('courier', 'bold');
    doc.rect(margin, yPos, usableWidth, 8);
    for (let i = 0; i < tableHeaders.length; i++) {
      doc.text(tableHeaders[i], xPos + 2, yPos + 5);
      if (i < colWidths.length - 1) {
        doc.line(xPos + colWidths[i], yPos, xPos + colWidths[i], yPos + 8);
      }
      xPos += colWidths[i];
    }
    yPos += 8;
    
    // Filas de productos
    doc.setFont('courier', 'normal');
    invoice.items?.forEach((item: any, index: number) => {
      xPos = margin;
      doc.rect(margin, yPos, usableWidth, 6);
      
      doc.text((index + 1).toString(), xPos + 2, yPos + 4);
      xPos += colWidths[0];
      doc.line(xPos, yPos, xPos, yPos + 6);
      
      doc.text(item.productName.substring(0, 25), xPos + 2, yPos + 4);
      xPos += colWidths[1];
      doc.line(xPos, yPos, xPos, yPos + 6);
      
      doc.text(item.quantity.toString(), xPos + 2, yPos + 4);
      xPos += colWidths[2];
      doc.line(xPos, yPos, xPos, yPos + 6);
      
      doc.text(formatCurrency(item.unitPrice), xPos + 2, yPos + 4);
      xPos += colWidths[3];
      doc.line(xPos, yPos, xPos, yPos + 6);
      
      doc.text(formatCurrency(item.total), xPos + 2, yPos + 4);
      
      yPos += 6;
    });
    
    yPos += 10;
    
    // Total en letras
    doc.rect(margin, yPos, usableWidth, 15);
    yPos += 4;
    doc.setFont('courier', 'bold');
    doc.text('SON:', margin + 2, yPos);
    yPos += 4;
    doc.setFont('courier', 'normal');
    const totalEnLetras = invoice.totalLetras || `${formatCurrency(invoice.total)} EXACTOS`;
    doc.text(totalEnLetras.toUpperCase(), margin + 2, yPos);
    yPos += 15;
    
    // Totales
    const totalXPos = pageWidth - margin - 60;
    doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, totalXPos, yPos);
    yPos += 5;
    if (invoice.descuento && invoice.descuento > 0) {
      doc.text(`Descuento: ${formatCurrency(invoice.descuento)}`, totalXPos, yPos);
      yPos += 5;
    }
    doc.text(`ISV (15%): ${formatCurrency(invoice.isv15 || 0)}`, totalXPos, yPos);
    yPos += 5;
    doc.text(`ISV (18%): ${formatCurrency(invoice.isv18 || 0)}`, totalXPos, yPos);
    yPos += 5;
    doc.setFont('courier', 'bold');
    doc.text(`TOTAL: ${formatCurrency(invoice.total)}`, totalXPos, yPos);
    
    // Descargar PDF
    doc.save(`Factura_${invoice.invoiceNumber}.pdf`);
    
  } catch (error) {
    console.error('Error generando PDF:', error);
    alert('Error al generar PDF. Inténtalo de nuevo.');
  }
}

// Función para imprimir factura
export function printInvoice(invoice: Invoice, config: Configuration): void {
  const html = generateInvoiceHTML(invoice, config);
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(html);
    printWindow.document.close();
    
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}

// Función para descargar CSV
export function downloadCSV(filename: string, csvContent: string): void {
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
}
