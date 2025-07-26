import { useState, useEffect } from 'react';
import { Configuration, db } from '../lib/database';

export const useConfig = () => {
  const [config, setConfig] = useState<Configuration | null>(null);

  const getDefaultConfig = (): Configuration => ({
    id: 'main-config',
    companyName: 'Mi Empresa Honduras',
    companyRtn: '12345678901234',
    companyAddress: 'Tegucigalpa, Honduras',
    companyPhone: '+504 1234-5678',
    companyEmail: 'contacto@miempresa.hn',
    companyWebsite: 'www.miempresa.hn',
    taxRate: 0.15,
    currencySymbol: 'L',
    invoicePrefix: 'FACT-',
    lastInvoiceNumber: 0,
    lowStockAlert: 10,
    autoBackup: true,
    emailNotifications: false,
    printFormat: 'carta',
    language: 'es',
    ticketHeader: 'Gracias por su compra',
    ticketFooter: 'La factura es beneficio de todos. Exíjala.'
  });

  const loadConfig = () => {
    let currentConfig = db.config.get();
    if (!currentConfig) {
      currentConfig = getDefaultConfig();
      db.config.save(currentConfig);
    }
    setConfig(currentConfig);
    return currentConfig;
  };

  const updateConfig = (updates: Partial<Configuration>) => {
    const currentConfig = config || getDefaultConfig();
    const newConfig = { ...currentConfig, ...updates };
    db.config.save(newConfig);
    setConfig(newConfig);
    return newConfig;
  };

  useEffect(() => {
    loadConfig();
  }, []);

  return {
    config,
    loadConfig,
    updateConfig
  };
};
