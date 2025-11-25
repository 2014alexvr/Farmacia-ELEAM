import React, { useMemo, useState } from 'react';
import { ResidentMedication, Resident } from '../../types';
import UsersIcon from '../icons/UsersIcon';
import CloseIcon from '../icons/CloseIcon';

interface GeneralInventoryPanelProps {
  residentMedications: ResidentMedication[];
  residents: Resident[];
  lowStockThreshold: number;
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

type SortField = 'name' | 'stock';
type SortDirection = 'asc' | 'desc';

const GeneralInventoryPanel: React.FC<GeneralInventoryPanelProps> = ({ residentMedications, residents, lowStockThreshold }) => {
  const [activePopoverKey, setActivePopoverKey] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estados para el ordenamiento
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
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

    return Array.from(map.values());
  }, [residentMedications, residents]);

  const filteredAndSortedInventory = useMemo(() => {
    let result = inventory;

    // 1. Filtrado
    if (searchTerm.trim()) {
      const lowerTerm = searchTerm.toLowerCase().trim();
      result = result.filter(item => item.name.toLowerCase().includes(lowerTerm));
    }

    // 2. Ordenamiento
    return result.sort((a, b) => {
      if (sortField === 'name') {
        return sortDirection === 'asc' 
          ? a.name.localeCompare(b.name) 
          : b.name.localeCompare(a.name);
      } else {
        return sortDirection === 'asc' 
          ? a.totalStock - b.totalStock 
          : b.totalStock - a.totalStock;
      }
    });
  }, [inventory, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Si ya estamos ordenando por esta columna, invertimos la dirección
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // Si es una columna nueva, ordenamos ascendente por defecto
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const togglePopover = (key: string) => {
    if (activePopoverKey === key) {
        setActivePopoverKey(null);
    } else {
        setActivePopoverKey(key);
    }
  };

  // Componente interno para el icono de ordenamiento
  const SortIcon = ({ active, direction }: { active: boolean; direction: SortDirection }) => (
    <span className={`ml-2 inline-flex flex-col space-y-[2px] ${active ? 'text-brand-primary' : 'text-slate-300'}`}>
        {/* Flecha Arriba */}
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`w-2 h-2 ${active && direction === 'asc' ? 'opacity-100' : 'opacity-40'}`} 
            viewBox="0 0 24 24" 
            fill="currentColor"
        >
            <path d="M12 4l-8 8h16l-8-8z" />
        </svg>
        {/* Flecha Abajo */}
        <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className={`w-2 h-2 ${active && direction === 'desc' ? 'opacity-100' : 'opacity-40'}`} 
            viewBox="0 0 24 24" 
            fill="currentColor"
        >
            <path d="M12 20l8-8H4l8 8z" />
        </svg>
    </span>
  );

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
                <th 
                    className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider rounded-tl-2xl cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                    onClick={() => handleSort('name')}
                >
                    <div className="flex items-center">
                        Medicamento
                        <SortIcon active={sortField === 'name'} direction={sortDirection} />
                    </div>
                </th>
                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Dosis</th>
                <th 
                    className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors select-none group"
                    onClick={() => handleSort('stock')}
                >
                    <div className="flex items-center justify-center">
                        Stock Total
                        <SortIcon active={sortField === 'stock'} direction={sortDirection} />
                    </div>
                </th>
                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center">Unidad</th>
                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center rounded-tr-2xl">N° Residentes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAndSortedInventory.length > 0 ? (
                filteredAndSortedInventory.map((item) => (
                  <tr key={item.key} className="hover:bg-slate-50 transition-colors group">
                    <td className="px-5 py-5 font-bold text-lg text-slate-800 align-middle">{item.name}</td>
                    <td className="px-5 py-5 text-slate-600 font-medium text-lg align-middle">{item.dose}</td>
                    <td className="px-5 py-5 text-center align-middle">
                        <span className={`font-bold text-lg px-4 py-1.5 rounded-lg border shadow-sm inline-block min-w-[3.5rem] transition-colors ${
                            item.totalStock < lowStockThreshold 
                                ? 'bg-red-100 text-red-600 border-red-200' 
                                : 'bg-brand-light text-brand-primary border-brand-secondary/20'
                        }`}>
                            {item.totalStock}
                        </span>
                    </td>
                    <td className="px-5 py-5 text-center text-slate-500 font-medium text-lg align-middle">{item.unit}</td>
                    <td className="px-5 py-5 text-center align-middle relative">
                      <button 
                        onClick={(e) => { e.stopPropagation(); togglePopover(item.key); }}
                        className="inline-flex items-center justify-center w-10 h-10 bg-blue-50 text-blue-600 font-bold rounded-full hover:bg-blue-100 hover:scale-110 transition-all shadow-sm border border-blue-100"
                        title="Ver lista de residentes"
                      >
                         {item.residentCount}
                      </button>
                      
                      {/* Popover Menu */}
                      {activePopoverKey === item.key && (
                        <div 
                            className="absolute right-4 top-14 w-72 bg-white rounded-2xl shadow-xl border border-slate-100 z-50 animate-scale-in overflow-hidden"
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