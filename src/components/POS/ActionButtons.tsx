import React from 'react';

interface ActionButtonsProps {
  onVariousClick: () => void;
  onSearchClick: () => void;
  onWholesaleClick: () => void;
  onEntriesClick: () => void;
  onExitsClick: () => void;
}

export default function ActionButtons({
  onVariousClick,
  onSearchClick,
  onWholesaleClick,
  onEntriesClick,
  onExitsClick
}: ActionButtonsProps) {
  return (
    <div className="bg-gray-50 p-4 border-b">
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
        <button
          onClick={onVariousClick}
          className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded transition-colors"
        >
          <span className="text-yellow-300">INS</span> Cliente
        </button>
        
        <button
          onClick={onSearchClick}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
        >
          Buscar
        </button>
        
        <button
          onClick={onWholesaleClick}
          className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-2 rounded transition-colors"
        >
          Mayoreo
        </button>
        
        <button
          onClick={onEntriesClick}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded transition-colors"
        >
          Entradas
        </button>
        
        <button
          onClick={onExitsClick}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded transition-colors"
        >
          Salidas
        </button>
      </div>
    </div>
  );
}
