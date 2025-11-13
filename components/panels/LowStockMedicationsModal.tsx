import React from 'react';
import { LowStockItem } from '../../types';
import CloseIcon from '../icons/CloseIcon';

interface LowStockMedicationsModalProps {
  lowStockItems: LowStockItem[];
  onClose: () => void;
}

const LowStockMedicationsModal: React.FC<LowStockMedicationsModalProps> = ({ lowStockItems, onClose }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl relative animate-fade-in-down">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-800">Medicamentos con Bajo Stock Crítico</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 max-h-[60vh] overflow-y-auto">
          <p className="text-gray-600 mb-4">
            La siguiente lista muestra los medicamentos de todos los residentes que tienen un stock para 6 días o menos.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 font-semibold text-gray-600">Medicamento</th>
                  <th className="p-4 font-semibold text-gray-600">Residente</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Stock Actual</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Días con Stock</th>
                  <th className="p-4 font-semibold text-gray-600 text-center">Umbral Mínimo</th>
                </tr>
              </thead>
              <tbody>
                {lowStockItems.length > 0 ? (
                  lowStockItems.map((item, index) => (
                    <tr key={index} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                      <td className="p-4 font-medium text-gray-800">{item.medicationName}</td>
                      <td className="p-4 text-gray-700">{item.residentName}</td>
                      <td className="p-4 text-center font-bold text-gray-800">{item.currentStock}</td>
                      <td className="p-4 text-center font-bold text-red-600">{`${item.stockDays} días`}</td>
                      <td className="p-4 text-center text-gray-700">{"< 7 días"}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="text-center p-8 text-gray-500">
                        No hay medicamentos con bajo stock crítico.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
        <div className="flex justify-end items-center p-6 border-t bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 bg-brand-primary text-white rounded-md hover:bg-brand-dark transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default LowStockMedicationsModal;
