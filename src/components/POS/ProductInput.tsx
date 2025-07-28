import React, { useState } from 'react';

interface ProductInputProps {
  onAddProduct: (code: string) => void;
  onSearchProduct: () => void;
  productCode: string;
  setProductCode: (code: string) => void;
}

export default function ProductInput({
  onAddProduct,
  onSearchProduct,
  productCode,
  setProductCode
}: ProductInputProps) {
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onAddProduct(productCode);
    }
  };

  return (
    <div className="bg-white p-4 border-b">
      <div className="flex items-center space-x-4 mb-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Código del Producto:
          </label>
          <input
            type="text"
            value={productCode}
            onChange={(e) => setProductCode(e.target.value)}
            onKeyPress={handleKeyPress}
            className="w-full p-3 border-2 border-gray-300 rounded-lg text-lg focus:border-blue-500 focus:outline-none"
            placeholder="Escanee o escriba el código..."
            autoFocus
          />
        </div>
        
        <button
          onClick={() => onAddProduct(productCode)}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg text-lg font-semibold transition-colors"
        >
          <span className="text-yellow-300">ENTER</span> Agregar
        </button>
      </div>
    </div>
  );
}
