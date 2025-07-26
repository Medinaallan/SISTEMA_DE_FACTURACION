import React, { useState } from 'react';
import Layout from '@/components/Layout/Layout';
import { useProducts } from '@/hooks/useProducts';
import { formatCurrency } from '@/lib/utils';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const Products: React.FC = () => {
  const { products, loading, deleteProduct } = useProducts();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  // Filtrar productos
  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         product.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === '' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Obtener categorías únicas
  const categories = [...new Set(products.map(product => product.category))];

  const handleDelete = async (id: string) => {
    if (window.confirm('¿Estás seguro de que quieres eliminar este producto?')) {
      await deleteProduct(id);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">Cargando productos...</div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Productos</h1>
            <p className="mt-2 text-gray-600">
              Gestiona tu inventario y productos
            </p>
          </div>
          <button className="btn-primary flex items-center space-x-2">
            <PlusIcon className="h-5 w-5" />
            <span>Agregar Producto</span>
          </button>
        </div>

        {/* Filters */}
        <div className="card">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Search */}
            <div className="relative">
              <MagnifyingGlassIcon className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar productos..."
                className="input-field pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Category Filter */}
            <select
              className="input-field"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">Todas las categorías</option>
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div key={product.id} className="card hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {product.name}
                    </h3>
                    {product.currentStock <= product.minStock && (
                      <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
                    )}
                  </div>
                  
                  <p className="text-sm text-gray-600 mb-2">
                    SKU: {product.sku}
                  </p>
                  
                  <div className="space-y-1 text-sm">
                    <p className="text-gray-600">
                      Categoría: <span className="font-medium">{product.category}</span>
                    </p>
                    <p className="text-gray-600">
                      Precio: <span className="font-medium text-green-600">
                        {formatCurrency(product.salePrice)}
                      </span>
                    </p>
                    <p className="text-gray-600">
                      Stock: <span className={`font-medium ${
                        product.currentStock <= product.minStock 
                          ? 'text-red-600' 
                          : 'text-gray-900'
                      }`}>
                        {product.currentStock} unidades
                      </span>
                    </p>
                  </div>
                  
                  {product.currentStock <= product.minStock && (
                    <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded-md">
                      <p className="text-xs text-red-600">
                        ⚠️ Stock bajo (mínimo: {product.minStock})
                      </p>
                    </div>
                  )}
                </div>

                {/* Actions */}
                <div className="flex flex-col space-y-2 ml-4">
                  <button
                    className="p-2 text-blue-600 hover:bg-blue-50 rounded-md"
                    title="Editar producto"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                    title="Eliminar producto"
                    onClick={() => product.id && handleDelete(product.id)}
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-500 mb-4">
              {searchTerm || selectedCategory 
                ? 'No se encontraron productos con esos filtros'
                : 'No hay productos registrados'
              }
            </div>
            <button className="btn-primary">
              Agregar Primer Producto
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {products.length}
              </div>
              <div className="text-sm text-gray-600">Total Productos</div>
            </div>
          </div>
          
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {products.reduce((sum, p) => sum + p.currentStock, 0)}
              </div>
              <div className="text-sm text-gray-600">Unidades en Stock</div>
            </div>
          </div>
          
          <div className="card">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {products.filter(p => p.currentStock <= p.minStock).length}
              </div>
              <div className="text-sm text-gray-600">Productos con Stock Bajo</div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
