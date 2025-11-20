
import React, { useMemo, useState } from 'react';
import { ResidentMedication, Resident } from '../../types';
import UsersIcon from '../icons/UsersIcon';
import CloseIcon from '../icons/CloseIcon';

interface GeneralInventoryPanelProps {
  residentMedications: ResidentMedication[];
  residents: Resident[];
}

interface AggregatedMedication {
  key: string;
  name: string;
  dose: string;
  totalStock: number;
  unit: string;
  residentCount: number;
  residentNames: string[];
}

const GeneralInventoryPanel: React.FC<GeneralInventoryPanelProps> = ({ residentMedications, residents }) => {
  const [activePopoverKey, setActivePopoverKey] = useState<string | null>(null);
  
  const inventory = useMemo(() => {
    const map = new Map<string, AggregatedMedication>();

    residentMedications.forEach((med) => {
      // Create a unique key based on Name + DoseValue + DoseUnit
      // Normalizing strings to lowercase to avoid duplicates due to casing
      const normalizedName = med.medicationName.trim();
      const normalizedDose = `${med.doseValue} ${med.doseUnit}`;
      const key = `${normalizedName.toLowerCase()}-${normalizedDose.toLowerCase()}`;

      // Find resident name
      const resident = residents.find(r => r.id === med.residentId);
      const residentName = resident ? resident.name : 'Desconocido';

      if (!map.has(key)) {
        map.set(key, {
          key,
          name: normalizedName,
          dose: normalizedDose,
          totalStock: med.stock,
          unit: med.stockUnit,
          residentCount: 1,
          residentNames: [residentName],
        });
      } else {
        const item = map.get(key)!;
        item.totalStock += med.stock;
        item.residentCount += 1;
        item.residentNames.push(residentName);
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [residentMedications, residents]);

  const togglePopover = (key: string) => {
    if (activePopoverKey === key) {
        setActivePopoverKey(null);
    } else {
        setActivePopoverKey(key);
    }
  };

  return (
    <div onClick={() => setActivePopoverKey(null)}> {/* Click outside to close */}
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Inventario General</h1>
      <p className="text-gray-600 mb-8">
        Listado consolidado de todos los medicamentos existentes en el sistema, sumando el stock de todos los residentes.
      </p>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="overflow-x-auto pb-20"> {/* Extra padding for popovers */}
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
                    <td className="p-4 text-center relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); togglePopover(item.key); }}
                        className="inline-flex items-center justify-center px-3 py-1 bg-blue-50 text-brand-primary font-bold rounded-full hover:bg-blue-100 transition-colors"
                        title="Ver lista de residentes"
                      >
                         {item.residentCount}
                      </button>
                      
                      {/* Popover Menu */}
                      {activePopoverKey === item.key && (
                        <div 
                            className="absolute right-0 top-full mt-2 w-64 bg-white rounded-lg shadow-xl border border-gray-200 z-50 animate-fade-in-down"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-3 border-b bg-gray-50 rounded-t-lg">
                                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
                                    <UsersIcon className="w-4 h-4" />
                                    UTILIZADO POR:
                                </h4>
                                <button onClick={() => setActivePopoverKey(null)} className="text-gray-400 hover:text-gray-600">
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-2 max-h-48 overflow-y-auto">
                                <ul className="space-y-1">
                                    {item.residentNames.map((name, idx) => (
                                        <li key={idx} className="text-sm text-gray-700 px-2 py-1.5 hover:bg-gray-100 rounded">
                                            {name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                      )}
                    </td>
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
