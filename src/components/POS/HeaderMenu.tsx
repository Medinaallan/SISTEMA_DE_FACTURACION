import React from 'react';

interface HeaderMenuProps {
  onClientClick: () => void;
  onProductClick: () => void;
  onInventoryClick: () => void;
  onConfigClick: () => void;
  onCutClick: () => void;
  onExitClick: () => void;
}

export default function HeaderMenu({
  onClientClick,
  onProductClick,
  onInventoryClick,
  onConfigClick,
  onCutClick,
  onExitClick
}: HeaderMenuProps) {
  return (
    <div className="bg-blue-900 text-white p-3 flex justify-between items-center">
      <div className="flex space-x-2">
        <button
          onClick={onClientClick}
          className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded transition-colors"
        >
          <span className="text-yellow-300">F1</span> Clientes
        </button>
        
        <button
          onClick={onProductClick}
          className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded transition-colors"
        >
          <span className="text-yellow-300">F3</span> Productos
        </button>
        
        <button
          onClick={onInventoryClick}
          className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded transition-colors"
        >
          <span className="text-yellow-300">F4</span> Inventario
        </button>
        
        <button
          onClick={onConfigClick}
          className="bg-blue-700 hover:bg-blue-600 px-4 py-2 rounded transition-colors"
        >
          Configuración
        </button>
        
        <button
          onClick={onCutClick}
          className="bg-green-700 hover:bg-green-600 px-4 py-2 rounded transition-colors"
        >
          Corte
        </button>
      </div>
      
      <button
        onClick={onExitClick}
        className="bg-red-700 hover:bg-red-600 px-4 py-2 rounded transition-colors"
      >
        Salir
      </button>
    </div>
  );
}
