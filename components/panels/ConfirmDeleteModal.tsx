import React from 'react';
import CloseIcon from '../icons/CloseIcon';

interface ConfirmDeleteModalProps {
  itemName: string;
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmDeleteModal: React.FC<ConfirmDeleteModalProps> = ({ itemName, onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-down">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Confirmar Eliminación</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-center text-gray-700 text-lg">
            ¿Está seguro de que desea eliminar <br />
            <span className="font-bold">{itemName}</span>?
          </p>
          <p className="text-center text-sm text-red-600 mt-2">Esta acción no se puede deshacer.</p>
        </div>
        <div className="flex justify-end items-center p-6 border-t bg-gray-50 rounded-b-lg space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-6 py-2 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700 transition-colors"
          >
            Confirmar Eliminación
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;