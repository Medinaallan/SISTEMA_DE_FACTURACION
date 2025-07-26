import { useState, useEffect } from 'react';
import { Invoice, InvoiceItem, db } from '../lib/database';
import { generateCAI, generateRangoAutorizado, generateFechaLimiteEmision } from '../lib/utils';
import { numeroALetras } from '../lib/invoice-generator';
import { useConfig } from './useConfig';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const { config, updateConfig } = useConfig();

  const loadInvoices = () => {
    const allInvoices = db.invoices.getAll();
    setInvoices(allInvoices);
    return allInvoices;
  };

  const generateInvoiceNumber = (): string => {
    const currentConfig = config || { invoicePrefix: 'FACT-', lastInvoiceNumber: 0 };
    const newNumber = currentConfig.lastInvoiceNumber + 1;
    
    // Actualizar el número de factura en la configuración
    updateConfig({ lastInvoiceNumber: newNumber });
    
    return `${currentConfig.invoicePrefix}${newNumber.toString().padStart(6, '0')}`;
  };

  const createInvoice = (
    clientName: string,
    clientRtn: string = '',
    items: InvoiceItem[]
  ): Invoice => {
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * (config?.taxRate || 0.15);
    const total = subtotal + tax;
    const fechaEmision = new Date();
    const fechaLimite = new Date();
    fechaLimite.setFullYear(fechaLimite.getFullYear() + 1); // CAI válido por 1 año

    const invoice: Invoice = {
      id: Date.now().toString(),
      invoiceNumber: generateInvoiceNumber(),
      cai: generateCAI(),
      rangoAutorizado: generateRangoAutorizado(),
      fechaLimiteEmision: generateFechaLimiteEmision(),
      clientName,
      clientRtn,
      items,
      subtotal,
      tax,
      total,
      descuento: 0,
      exonerado: 0,
      exento: 0,
      gravado15: subtotal,
      gravado18: 0,
      isv15: tax,
      isv18: 0,
      totalLetras: numeroALetras(total),
      status: 'draft',
      correlativo: (config?.lastInvoiceNumber || 0) + 1,
      fechaEmision: fechaEmision.toISOString(),
      codigoMoneda: 'HNL',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    db.invoices.add(invoice);
    setInvoices(prev => [...prev, invoice]);
    
    return invoice;
  };

  const getInvoicesByMonth = (year: number, month: number): Invoice[] => {
    return invoices.filter(invoice => {
      const invoiceDate = new Date(invoice.createdAt);
      return invoiceDate.getFullYear() === year && invoiceDate.getMonth() === month;
    });
  };

  const getTotalSalesThisMonth = (): number => {
    const now = new Date();
    const thisMonth = getInvoicesByMonth(now.getFullYear(), now.getMonth());
    return thisMonth
      .filter(inv => inv.status !== 'cancelled')
      .reduce((sum, inv) => sum + inv.total, 0);
  };

  const getInvoiceCount = (): number => {
    return invoices.filter(inv => inv.status !== 'cancelled').length;
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  return {
    invoices,
    loadInvoices,
    createInvoice,
    getInvoicesByMonth,
    getTotalSalesThisMonth,
    getInvoiceCount
  };
}
