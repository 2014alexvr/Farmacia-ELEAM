
import React from 'react';
import { MOCK_MEDICATIONS } from '../../constants';

const MedicationsPanel: React.FC = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">{`Panel de Medicamentos`}</h1>
      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="flex justify-between items-center mb-4">
          <input 
            type="text" 
            placeholder="Buscar medicamento..."
            className="px-4 py-2 border rounded-lg w-1/3 focus:ring-brand-secondary focus:border-brand-secondary"
          />
          <button className="px-4 py-2 bg-brand-primary text-white rounded-lg hover:bg-brand-dark transition-colors">
            Agregar Medicamento
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Nombre</th>
                <th className="p-4 font-semibold text-gray-600">Stock Actual</th>
                <th className="p-4 font-semibold text-gray-600">Último Pedido</th>
                <th className="p-4 font-semibold text-gray-600">Estado</th>
                <th className="p-4 font-semibold text-gray-600">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {MOCK_MEDICATIONS.map((med, index) => {
                const isLowStock = med.stock < med.lowStockThreshold;
                return (
                  <tr key={med.id} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-4 font-medium">{med.name}</td>
                    <td className="p-4">{`${med.stock} ${med.unit}`}</td>
                    <td className="p-4">{med.lastOrdered}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        isLowStock ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {isLowStock ? 'Bajo Stock' : 'En Stock'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button className="text-brand-secondary hover:underline">Ver Detalles</button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default MedicationsPanel;
