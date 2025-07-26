import { db, Product, Configuration, Client, Category, User } from './database';
import { generateId } from './utils';

export function initializeDatabase(): void {
  try {
    // Verificar si ya hay datos
    const existingProducts = db.products.getAll();
    const existingConfig = db.config.get();
    const existingClients = db.clients.getAll();
    const existingCategories = db.categories.getAll();
    const existingUsers = db.users.getAll();

    // Si ya hay datos básicos, no hacer nada
    if (existingProducts.length > 0 && existingConfig && existingClients.length > 0) {
      console.log('Database already initialized');
      return;
    }

    console.log('Initializing database with sample data...');

    // Insertar categorías iniciales
    if (existingCategories.length === 0) {
      const sampleCategories: Omit<Category, 'id'>[] = [
        {
          name: 'Electrónicos',
          description: 'Dispositivos electrónicos y tecnología',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Accesorios',
          description: 'Accesorios para computadoras y periféricos',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Ropa',
          description: 'Prendas de vestir y textiles',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Hogar',
          description: 'Artículos para el hogar y decoración',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      sampleCategories.forEach(category => {
        const categoryWithId: Category = {
          ...category,
          id: generateId()
        };
        db.categories.add(categoryWithId);
      });

      console.log(`Added ${sampleCategories.length} initial categories`);
    }

    // Insertar clientes iniciales
    if (existingClients.length === 0) {
      const sampleClients: Omit<Client, 'id'>[] = [
        {
          name: 'Consumidor Final',
          rtn: '',
          identityNumber: '',
          phone: '',
          email: '',
          address: '',
          city: 'Tegucigalpa',
          clientType: 'person',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Juan Carlos Pérez',
          rtn: '08011234567890',
          identityNumber: '0801-1990-12345',
          phone: '+504 9999-1234',
          email: 'juan.perez@email.com',
          address: 'Col. Palmira, Tegucigalpa',
          city: 'Tegucigalpa',
          clientType: 'person',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: 'María Fernanda García',
          rtn: '08017654321098',
          identityNumber: '0801-1985-67890',
          phone: '+504 8888-5678',
          email: 'maria.garcia@email.com',
          address: 'Col. Kennedy, San Pedro Sula',
          city: 'San Pedro Sula',
          clientType: 'person',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          name: 'Empresa ABC S.A. de C.V.',
          rtn: '08019876543210',
          phone: '+504 7777-9012',
          email: 'info@empresaabc.hn',
          address: 'Blvd. Morazán, Tegucigalpa',
          city: 'Tegucigalpa',
          clientType: 'company',
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      sampleClients.forEach(client => {
        const clientWithId: Client = {
          ...client,
          id: generateId()
        };
        db.clients.add(clientWithId);
      });

      console.log(`Added ${sampleClients.length} initial clients`);
    }

    // Insertar usuarios iniciales
    if (existingUsers.length === 0) {
      const sampleUsers: Omit<User, 'id'>[] = [
        {
          username: 'admin',
          email: 'admin@empresa.hn',
          password: 'admin123',
          role: 'admin',
          permissions: {
            canCreateInvoices: true,
            canEditProducts: true,
            canViewReports: true,
            canManageUsers: true,
            canAccessSettings: true
          },
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          username: 'vendedor',
          email: 'vendedor@empresa.hn',
          password: 'vendedor123',
          role: 'user',
          permissions: {
            canCreateInvoices: true,
            canEditProducts: false,
            canViewReports: true,
            canManageUsers: false,
            canAccessSettings: false
          },
          active: true,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      sampleUsers.forEach(user => {
        const userWithId: User = {
          ...user,
          id: generateId()
        };
        db.users.add(userWithId);
      });

      console.log(`Added ${sampleUsers.length} initial users`);
    }

    // Insertar productos iniciales
    if (existingProducts.length === 0) {
      const sampleProducts: Omit<Product, 'id'>[] = [
        {
          sku: 'PROD001',
          name: 'Laptop HP Pavilion 15',
          category: 'Electrónicos',
          cost: 12000,
          salePrice: 15000,
          tax: 15,
          minStock: 5,
          currentStock: 10,
          description: 'Laptop HP Pavilion 15 pulgadas',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          sku: 'PROD002',
          name: 'Mouse Inalámbrico',
          category: 'Accesorios',
          cost: 300,
          salePrice: 450,
          tax: 15,
          minStock: 20,
          currentStock: 50,
          description: 'Mouse inalámbrico Logitech',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          sku: 'PROD003',
          name: 'Teclado Mecánico RGB',
          category: 'Accesorios',
          cost: 800,
          salePrice: 1200,
          tax: 15,
          minStock: 10,
          currentStock: 25,
          description: 'Teclado mecánico con RGB',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];

      sampleProducts.forEach(product => {
        const productWithId: Product = {
          ...product,
          id: generateId()
        };
        db.products.add(productWithId);
      });

      console.log(`Added ${sampleProducts.length} initial products`);
    }

    // Insertar configuración inicial
    if (!existingConfig) {
      const config: Configuration = {
        id: generateId(),
        companyName: 'Mi Empresa Honduras',
        companyRtn: '12345678901234',
        companyAddress: 'Tegucigalpa, Honduras',
        companyPhone: '+504 2234-5678',
        companyEmail: 'info@miempresa.hn',
        companyWebsite: 'www.miempresa.hn',
        taxRate: 0.15,
        currencySymbol: 'L',
        invoicePrefix: 'FACT-',
        lastInvoiceNumber: 0,
        lowStockAlert: 10,
        autoBackup: true,
        emailNotifications: false,
        printFormat: 'A4',
        language: 'es',
        ticketHeader: 'Gracias por su compra',
        ticketFooter: 'Vuelva pronto'
      };

      db.config.save(config);
      console.log('Added initial configuration');
    }

    console.log('Database initialization completed');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
}
