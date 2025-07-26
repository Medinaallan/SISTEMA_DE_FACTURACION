import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Invoice, Configuration } from './database';
import { formatCurrency, formatDate, numberToWords } from './utils';

declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export async function generateInvoicePDF(invoice: Invoice, config: Configuration): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Configuración de colores
  const primaryColor: [number, number, number] = [14, 165, 233]; // blue-500
  const textColor: [number, number, number] = [31, 41, 55]; // gray-800
  const lightGray: [number, number, number] = [243, 244, 246]; // gray-100

  // Encabezado de la empresa
  doc.setFontSize(20);
  doc.setTextColor(...primaryColor);
  doc.text(config.companyName, margin, 30);

  // Información de la empresa
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  let yPos = 45;
  doc.text(`RTN: ${config.companyRtn}`, margin, yPos);
  yPos += 5;
  doc.text(`Dirección: ${config.companyAddress}`, margin, yPos);
  yPos += 5;
  doc.text(`Teléfono: ${config.companyPhone}`, margin, yPos);
  yPos += 5;
  doc.text(`Email: ${config.companyEmail}`, margin, yPos);

  // Título FACTURA
  doc.setFontSize(24);
  doc.setTextColor(...primaryColor);
  doc.text('FACTURA', pageWidth - 60, 30);

  // Información de la factura
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  const invoiceInfoX = pageWidth - 80;
  yPos = 45;
  doc.text(`No. Factura: ${invoice.invoiceNumber}`, invoiceInfoX, yPos);
  yPos += 5;
  doc.text(`CAI: ${invoice.cai}`, invoiceInfoX, yPos);
  yPos += 5;
  doc.text(`Fecha: ${formatDate(invoice.createdAt)}`, invoiceInfoX, yPos);

  // Línea separadora
  yPos = 80;
  doc.setDrawColor(...primaryColor);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Información del cliente
  yPos += 10;
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text('FACTURAR A:', margin, yPos);

  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  yPos += 8;
  doc.text(`Cliente: ${invoice.clientName}`, margin, yPos);
  if (invoice.clientRtn) {
    yPos += 5;
    doc.text(`RTN: ${invoice.clientRtn}`, margin, yPos);
  }
  if (invoice.clientAddress) {
    yPos += 5;
    doc.text(`Dirección: ${invoice.clientAddress}`, margin, yPos);
  }
  if (invoice.clientPhone) {
    yPos += 5;
    doc.text(`Teléfono: ${invoice.clientPhone}`, margin, yPos);
  }

  // Tabla de productos
  yPos += 15;
  const tableData = invoice.items.map(item => [
    item.sku,
    item.productName,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    `${item.tax}%`,
    formatCurrency(item.total)
  ]);

  doc.autoTable({
    startY: yPos,
    head: [['SKU', 'Producto', 'Cant.', 'Precio Unit.', 'Impuesto', 'Total']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: textColor
    },
    alternateRowStyles: {
      fillColor: lightGray
    },
    margin: { left: margin, right: margin },
    tableWidth: 'auto',
    columnStyles: {
      0: { cellWidth: 25 },
      1: { cellWidth: 60 },
      2: { cellWidth: 20, halign: 'center' },
      3: { cellWidth: 25, halign: 'right' },
      4: { cellWidth: 20, halign: 'center' },
      5: { cellWidth: 25, halign: 'right' }
    }
  });

  // Totales
  const finalY = (doc as any).lastAutoTable.finalY || yPos + 50;
  const totalsX = pageWidth - 80;
  let totalsY = finalY + 15;

  doc.setFontSize(10);
  doc.text(`Subtotal: ${formatCurrency(invoice.subtotal)}`, totalsX, totalsY);
  totalsY += 6;
  doc.text(`Impuestos: ${formatCurrency(invoice.tax)}`, totalsX, totalsY);
  totalsY += 6;

  // Total final
  doc.setFontSize(12);
  doc.setTextColor(...primaryColor);
  doc.text(`TOTAL: ${formatCurrency(invoice.total)}`, totalsX, totalsY);

  // Monto en letras
  totalsY += 15;
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  const totalInWords = numberToWords(Math.floor(invoice.total));
  const centavos = Math.round((invoice.total % 1) * 100);
  const fullAmountInWords = `${totalInWords} lempiras con ${centavos}/100`;
  
  doc.text('Son:', margin, totalsY);
  doc.text(fullAmountInWords.toUpperCase(), margin + 15, totalsY);

  // Pie de página
  const footerY = doc.internal.pageSize.height - 30;
  doc.setFontSize(8);
  doc.setTextColor(128, 128, 128);
  doc.text('Esta factura fue generada electrónicamente por el Sistema ERP Honduras', margin, footerY);
  doc.text(`CAI: ${invoice.cai}`, margin, footerY + 5);

  // Descargar el PDF
  doc.save(`Factura-${invoice.invoiceNumber}.pdf`);
}

export async function generateProductReport(products: any[]): Promise<void> {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.width;
  const margin = 20;

  // Título
  doc.setFontSize(18);
  doc.setTextColor(14, 165, 233);
  doc.text('REPORTE DE PRODUCTOS', margin, 30);

  // Fecha del reporte
  doc.setFontSize(10);
  doc.setTextColor(31, 41, 55);
  doc.text(`Fecha: ${formatDate(new Date())}`, pageWidth - 60, 30);

  // Tabla de productos
  const tableData = products.map(product => [
    product.sku,
    product.name,
    product.category,
    product.currentStock.toString(),
    product.minStock.toString(),
    formatCurrency(product.cost),
    formatCurrency(product.salePrice)
  ]);

  doc.autoTable({
    startY: 50,
    head: [['SKU', 'Producto', 'Categoría', 'Stock', 'Mín.', 'Costo', 'Precio Venta']],
    body: tableData,
    theme: 'grid',
    headStyles: {
      fillColor: [14, 165, 233],
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      fontSize: 9,
      textColor: [31, 41, 55]
    },
    margin: { left: margin, right: margin }
  });

  doc.save(`Reporte-Productos-${formatDate(new Date())}.pdf`);
}
