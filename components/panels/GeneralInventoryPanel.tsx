
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
  const [searchTerm, setSearchTerm] = useState('');
  
  const inventory = useMemo(() => {
    const map = new Map<string, AggregatedMedication>();

    residentMedications.forEach((med) => {
      // Create a unique key based on Name + DoseValue + DoseUnit
      const normalizedName = med.medicationName.trim();
      const normalizedDose = `${med.doseValue} ${med.doseUnit}`;
      const key = `${normalizedName.toLowerCase()}-${normalizedDose.toLowerCase()}`;

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
        
        // Avoid duplicate resident names for the same medication (e.g. multiple schedules)
        if (!item.residentNames.includes(residentName)) {
            item.residentNames.push(residentName);
            item.residentCount += 1;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [residentMedications, residents]);

  const filteredInventory = useMemo(() => {
    if (!searchTerm.trim()) return inventory;
    const lowerTerm = searchTerm.toLowerCase().trim();
    return inventory.filter(item => item.name.toLowerCase().includes(lowerTerm));
  }, [inventory, searchTerm]);

  const togglePopover = (key: string) => {
    if (activePopoverKey === key) {
        setActivePopoverKey(null);
    } else {
        setActivePopoverKey(key);
    }
  };

  return (
    <div onClick={() => setActivePopoverKey(null)}>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Inventario General</h1>
        <p className="text-slate-500 mt-2 font-medium">
          Listado consolidado de todos los medicamentos existentes en el sistema, sumando el stock de todos los residentes.
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100">
        
        {/* Search Bar */}
        <div className="mb-6">
            <div className="relative max-w-md">
                <input
                    type="text"
                    placeholder="Buscar medicamento por nombre..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 font-medium focus:ring-2 focus:ring-brand-primary focus:border-transparent transition-all shadow-sm placeholder-slate-400"
                />
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                </div>
            </div>
        </div>

        <div className="overflow-x-auto pb-20 custom-scrollbar"> 
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-wider rounded-tl-2xl">Medicamento</th>
                <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Dosis</th>
                <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center">Stock Total</th>
                <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center">Unidad</th>
                <th className="p-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center rounded-tr-2xl">N° Residentes</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.length > 0 ? (
                filteredInventory.map((item) => (
                  <tr key={item.key} className="border-b border-slate-50 hover:bg-slate-50/80 transition-colors group">
                    <td className="p-4 font-semibold text-slate-800">{item.name}</td>
                    <td className="p-4 text-slate-600 font-medium">{item.dose}</td>
                    <td className="p-4 text-center">
                        <span className={`font-bold text-lg px-3 py-1 rounded-lg border shadow-sm inline-block min-w-[3rem] transition-colors ${
                            item.totalStock < 7 
                                ? 'bg-red-100 text-red-600 border-red-200' 
                                : 'bg-brand-light text-brand-primary border-brand-secondary/20'
                        }`}>
                            {item.totalStock}
                        </span>
                    </td>
                    <td className="p-4 text-center text-slate-500 font-medium">{item.unit}</td>
                    <td className="p-4 text-center relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); togglePopover(item.key); }}
                        className="inline-flex items-center justify-center w-8 h-8 bg-blue-50 text-blue-600 font-bold rounded-full hover:bg-blue-100 hover:scale-110 transition-all shadow-sm border border-blue-100"
                        title="Ver lista de residentes"
                      >
                         {item.residentCount}
                      </button>
                      
                      {/* Popover Menu */}
                      {activePopoverKey === item.key && (
                        <div 
                            className="absolute right-4 top-10 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 animate-scale-in overflow-hidden"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="flex justify-between items-center p-3 border-b border-slate-100 bg-slate-50">
                                <h4 className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                    <UsersIcon className="w-3 h-3" />
                                    UTILIZADO POR:
                                </h4>
                                <button onClick={() => setActivePopoverKey(null)} className="text-slate-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-slate-200">
                                    <CloseIcon className="w-4 h-4" />
                                </button>
                            </div>
                            <div className="p-2 max-h-60 overflow-y-auto custom-scrollbar">
                                <ul className="space-y-1">
                                    {item.residentNames.map((name, idx) => (
                                        <li key={idx} className="text-xs font-bold text-slate-600 px-3 py-2 hover:bg-slate-50 rounded-xl transition-colors flex items-center">
                                            <div className="w-1.5 h-1.5 rounded-full bg-brand-secondary mr-2 flex-shrink-0"></div>
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
                  <td colSpan={5} className="text-center p-12">
                    <div className="flex flex-col items-center justify-center text-slate-400">
                        <p className="text-lg font-medium italic">No se encontraron medicamentos.</p>
                        {searchTerm && <p className="text-sm mt-1">Pruebe con otro nombre.</p>}
                    </div>
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
