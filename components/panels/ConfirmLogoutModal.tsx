import React from 'react';
import CloseIcon from '../icons/CloseIcon';

interface ConfirmLogoutModalProps {
  onConfirm: () => void;
  onCancel: () => void;
}

const ConfirmLogoutModal: React.FC<ConfirmLogoutModalProps> = ({ onConfirm, onCancel }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md relative animate-fade-in-down">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Cerrar Sesión</h2>
          <button onClick={onCancel} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6">
          <p className="text-center text-gray-700 text-lg">
            ¿Está seguro de que desea finalizar su sesión?
          </p>
          <p className="text-center text-sm text-gray-500 mt-2">
            No se preocupe, todos sus cambios se han guardado automáticamente.
          </p>
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
            className="px-6 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-brand-dark transition-colors"
          >
            Confirmar y Salir
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmLogoutModal;
