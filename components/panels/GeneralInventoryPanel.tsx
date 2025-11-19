
import React, { useMemo } from 'react';
import { ResidentMedication } from '../../types';

interface GeneralInventoryPanelProps {
  residentMedications: ResidentMedication[];
}

interface AggregatedMedication {
  key: string;
  name: string;
  dose: string;
  totalStock: number;
  unit: string;
  residentCount: number;
}

const GeneralInventoryPanel: React.FC<GeneralInventoryPanelProps> = ({ residentMedications }) => {
  
  const inventory = useMemo(() => {
    const map = new Map<string, AggregatedMedication>();

    residentMedications.forEach((med) => {
      // Create a unique key based on Name + DoseValue + DoseUnit
      // Normalizing strings to lowercase to avoid duplicates due to casing
      const normalizedName = med.medicationName.trim();
      const normalizedDose = `${med.doseValue} ${med.doseUnit}`;
      const key = `${normalizedName.toLowerCase()}-${normalizedDose.toLowerCase()}`;

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: normalizedName,
          dose: normalizedDose,
          totalStock: med.stock,
          unit: med.stockUnit,
          residentCount: 1,
        });
      } else {
        const item = map.get(key)!;
        item.totalStock += med.stock;
        item.residentCount += 1;
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [residentMedications]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Inventario General</h1>
      <p className="text-gray-600 mb-8">
        Listado consolidado de todos los medicamentos existentes en el sistema, sumando el stock de todos los residentes.
      </p>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Medicamento</th>
                <th className="p-4 font-semibold text-gray-600">Dosis</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Stock Total</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Unidad</th>
                <th className="p-4 font-semibold text-gray-600 text-center">N° Residentes</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length > 0 ? (
                inventory.map((item) => (
                  <tr key={item.key} className="border-t hover:bg-gray-50 transition-colors">
                    <td className="p-4 font-medium text-gray-800">{item.name}</td>
                    <td className="p-4 text-gray-700">{item.dose}</td>
                    <td className="p-4 text-center font-bold text-brand-primary text-lg">{item.totalStock}</td>
                    <td className="p-4 text-center text-gray-600">{item.unit}</td>
                    <td className="p-4 text-center text-gray-600">{item.residentCount}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center p-8 text-gray-500">
                    No hay medicamentos registrados en el sistema.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GeneralInventoryPanel;
