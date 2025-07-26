// Base de datos simple sin Dexie para evitar errores
export interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  cost: number;
  salePrice: number;
  tax: number;
  minStock: number;
  currentStock: number;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  cai: string;
  rangoAutorizado: string;
  fechaLimiteEmision: string;
  clientName: string;
  clientRtn?: string;
  clientAddress?: string;
  clientPhone?: string;
  clientEmail?: string;
  items: InvoiceItem[];
  subtotal: number;
  tax: number;
  total: number;
  descuento?: number;
  exonerado?: number;
  exento?: number;
  gravado15?: number;
  gravado18?: number;
  isv15?: number;
  isv18?: number;
  totalLetras: string;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  correlativo: number;
  fechaEmision: string;
  codigoMoneda: string;
  observaciones?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  productId: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  tax: number;
  total: number;
}

export interface Configuration {
  id: string;
  companyName: string;
  companyRtn: string;
  companyAddress: string;
  companyPhone: string;
  companyEmail: string;
  companyWebsite?: string;
  taxRate: number;
  currencySymbol: string;
  invoicePrefix: string;
  lastInvoiceNumber: number;
  lowStockAlert: number;
  autoBackup: boolean;
  emailNotifications: boolean;
  printFormat: string;
  language: string;
  ticketHeader: string;
  ticketFooter: string;
}

export interface Client {
  id: string;
  name: string;
  rtn?: string;
  identityNumber?: string;
  phone?: string;
  email?: string;
  address?: string;
  city?: string;
  clientType: 'person' | 'company';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  username: string;
  email: string;
  password?: string;
  role: 'admin' | 'user' | 'viewer';
  permissions: {
    canCreateInvoices: boolean;
    canEditProducts: boolean;
    canViewReports: boolean;
    canManageUsers: boolean;
    canAccessSettings: boolean;
  };
  active: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt: string;
}

// Funciones simples para localStorage
export const db = {
  products: {
    getAll: (): Product[] => {
      const data = localStorage.getItem('erp_products');
      return data ? JSON.parse(data) : [];
    },
    save: (products: Product[]) => {
      localStorage.setItem('erp_products', JSON.stringify(products));
    },
    add: (product: Product) => {
      const products = db.products.getAll();
      products.push(product);
      db.products.save(products);
    },
    update: (id: string, updates: Partial<Product>) => {
      const products = db.products.getAll();
      const index = products.findIndex(p => p.id === id);
      if (index !== -1) {
        products[index] = { ...products[index], ...updates };
        db.products.save(products);
      }
    },
    delete: (id: string) => {
      const products = db.products.getAll();
      const filtered = products.filter(p => p.id !== id);
      db.products.save(filtered);
    }
  },
  invoices: {
    getAll: (): Invoice[] => {
      const data = localStorage.getItem('erp_invoices');
      return data ? JSON.parse(data) : [];
    },
    save: (invoices: Invoice[]) => {
      localStorage.setItem('erp_invoices', JSON.stringify(invoices));
    },
    add: (invoice: Invoice) => {
      const invoices = db.invoices.getAll();
      invoices.push(invoice);
      db.invoices.save(invoices);
    },
    update: (id: string, updates: Partial<Invoice>) => {
      const invoices = db.invoices.getAll();
      const index = invoices.findIndex(i => i.id === id);
      if (index !== -1) {
        invoices[index] = { ...invoices[index], ...updates };
        db.invoices.save(invoices);
      }
    },
    delete: (id: string) => {
      const invoices = db.invoices.getAll();
      const filtered = invoices.filter(i => i.id !== id);
      db.invoices.save(filtered);
    }
  },
  clients: {
    getAll: (): Client[] => {
      const data = localStorage.getItem('erp_clients');
      return data ? JSON.parse(data) : [];
    },
    save: (clients: Client[]) => {
      localStorage.setItem('erp_clients', JSON.stringify(clients));
    },
    add: (client: Client) => {
      const clients = db.clients.getAll();
      clients.push(client);
      db.clients.save(clients);
    },
    update: (id: string, updates: Partial<Client>) => {
      const clients = db.clients.getAll();
      const index = clients.findIndex(c => c.id === id);
      if (index !== -1) {
        clients[index] = { ...clients[index], ...updates };
        db.clients.save(clients);
      }
    },
    delete: (id: string) => {
      const clients = db.clients.getAll();
      const filtered = clients.filter(c => c.id !== id);
      db.clients.save(filtered);
    }
  },
  categories: {
    getAll: (): Category[] => {
      const data = localStorage.getItem('erp_categories');
      return data ? JSON.parse(data) : [];
    },
    save: (categories: Category[]) => {
      localStorage.setItem('erp_categories', JSON.stringify(categories));
    },
    add: (category: Category) => {
      const categories = db.categories.getAll();
      categories.push(category);
      db.categories.save(categories);
    },
    update: (id: string, updates: Partial<Category>) => {
      const categories = db.categories.getAll();
      const index = categories.findIndex(c => c.id === id);
      if (index !== -1) {
        categories[index] = { ...categories[index], ...updates };
        db.categories.save(categories);
      }
    },
    delete: (id: string) => {
      const categories = db.categories.getAll();
      const filtered = categories.filter(c => c.id !== id);
      db.categories.save(filtered);
    }
  },
  users: {
    getAll: (): User[] => {
      const data = localStorage.getItem('erp_users');
      return data ? JSON.parse(data) : [];
    },
    save: (users: User[]) => {
      localStorage.setItem('erp_users', JSON.stringify(users));
    },
    add: (user: User) => {
      const users = db.users.getAll();
      users.push(user);
      db.users.save(users);
    },
    update: (id: string, updates: Partial<User>) => {
      const users = db.users.getAll();
      const index = users.findIndex(u => u.id === id);
      if (index !== -1) {
        users[index] = { ...users[index], ...updates };
        db.users.save(users);
      }
    },
    delete: (id: string) => {
      const users = db.users.getAll();
      const filtered = users.filter(u => u.id !== id);
      db.users.save(filtered);
    }
  },
  config: {
    get: (): Configuration | null => {
      const data = localStorage.getItem('erp_config');
      return data ? JSON.parse(data) : null;
    },
    save: (config: Configuration) => {
      localStorage.setItem('erp_config', JSON.stringify(config));
    }
  }
};
