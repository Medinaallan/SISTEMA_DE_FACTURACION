import { useState, useEffect } from 'react';
import { db, Product } from '../lib/database';
import { generateId } from '../lib/utils';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const loadProducts = () => {
    try {
      const allProducts = db.products.getAll();
      setProducts(allProducts);
    } catch (error) {
      console.error('Error loading products:', error);
    } finally {
      setLoading(false);
    }
  };

  const addProduct = (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const now = new Date().toISOString();
      const newProduct: Product = {
        ...product,
        id: generateId(),
        createdAt: now,
        updatedAt: now
      };
      db.products.add(newProduct);
      loadProducts();
    } catch (error) {
      console.error('Error adding product:', error);
    }
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    try {
      db.products.update(id, {
        ...updates,
        updatedAt: new Date().toISOString()
      });
      loadProducts();
    } catch (error) {
      console.error('Error updating product:', error);
    }
  };

  const deleteProduct = (id: string) => {
    try {
      db.products.delete(id);
      loadProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  const getProductById = (id: string): Product | undefined => {
    try {
      return db.products.getAll().find(p => p.id === id);
    } catch (error) {
      console.error('Error getting product:', error);
      return undefined;
    }
  };

  const getLowStockProducts = (): Product[] => {
    try {
      return db.products.getAll().filter(product => 
        product.currentStock <= product.minStock
      );
    } catch (error) {
      console.error('Error getting low stock products:', error);
      return [];
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    loading,
    addProduct,
    updateProduct,
    deleteProduct,
    getProductById,
    getLowStockProducts,
    refresh: loadProducts
  };
}
