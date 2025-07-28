import React from 'react';
import { formatCurrency } from '../../lib/utils';

interface ProductTableItem {
  id: string;
  sku: string;
  name: string;
  salePrice: number;
  quantity: number;
  total: number;
  stock: number;
}

interface ProductTableProps {
  items: ProductTableItem[];
  onQuantityChange: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
  selectedItemId?: string;
}

export default function ProductTable({
  items,
  onQuantityChange,
  onRemoveItem,
  selectedItemId
}: ProductTableProps) {
  return (
    <div className="flex-1 bg-white overflow-hidden">
      <div className="overflow-auto h-full">
        <table className="w-full">
          <thead className="bg-gray-100 sticky top-0">
            <tr>
              <th className="text-left p-3 border-b font-semibold">Código</th>
              <th className="text-left p-3 border-b font-semibold">Descripción</th>
              <th className="text-right p-3 border-b font-semibold">Precio</th>
              <th className="text-center p-3 border-b font-semibold">Cantidad</th>
              <th className="text-right p-3 border-b font-semibold">Importe</th>
              <th className="text-center p-3 border-b font-semibold">Existencia</th>
              <th className="text-center p-3 border-b font-semibold">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center p-8 text-gray-500">
                  No hay productos en el ticket actual
                </td>
              </tr>
            ) : (
              items.map((item, index) => (
                <tr
                  key={item.id}
                  className={`
                    ${selectedItemId === item.id ? 'bg-blue-100' : 'hover:bg-gray-50'}
                    ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}
                  `}
                >
                  <td className="p-3 border-b font-mono">{item.sku}</td>
                  <td className="p-3 border-b">{item.name}</td>
                  <td className="p-3 border-b text-right font-mono">
                    {formatCurrency(item.salePrice)}
                  </td>
                  <td className="p-3 border-b text-center">
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(e) => onQuantityChange(item.id, parseInt(e.target.value) || 1)}
                      className="w-16 p-1 border rounded text-center"
                    />
                  </td>
                  <td className="p-3 border-b text-right font-mono font-semibold">
                    {formatCurrency(item.total)}
                  </td>
                  <td className="p-3 border-b text-center">
                    <span className={`
                      px-2 py-1 rounded text-sm
                      ${item.stock <= 5 ? 'bg-red-100 text-red-800' : 
                        item.stock <= 10 ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'}
                    `}>
                      {item.stock}
                    </span>
                  </td>
                  <td className="p-3 border-b text-center">
                    <button
                      onClick={() => onRemoveItem(item.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded text-sm transition-colors"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
