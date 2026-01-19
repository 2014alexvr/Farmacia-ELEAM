import React, { useMemo, useState } from 'react';
import { ResidentMedication, Resident } from '../../types';
import UsersIcon from '../icons/UsersIcon';
import CloseIcon from '../icons/CloseIcon';
import ZoomControls from '../ZoomControls';

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
  // ZOOM STATE - DEFAULT 100%
  const [zoomLevel, setZoomLevel] = useState(1);
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  const inventory = useMemo(() => {
    const map = new Map<string, AggregatedMedication>();
    residentMedications.forEach((med) => {
      const normalizedName = med.medicationName.trim();
      const normalizedDose = `${med.doseValue} ${med.doseUnit}`;
      const key = `${normalizedName.toLowerCase()}-${normalizedDose.toLowerCase()}`;
      const resident = residents.find(r => r.id === med.residentId);
      const residentName = resident ? resident.name : 'Desconocido';

      let realStock = med.stock;
      const dailyExpense = med.schedules.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      if (dailyExpense > 0) {
          const anchorDateStr = med.stockUpdatedAt || new Date().toISOString();
          const anchorDate = new Date(anchorDateStr);
          const today = new Date();
          anchorDate.setHours(0,0,0,0);
          today.setHours(0,0,0,0);
          const daysElapsed = Math.max(0, Math.floor((today.getTime() - anchorDate.getTime()) / (1000 * 60 * 60 * 24)));
          realStock = Math.max(0, med.stock - (dailyExpense * daysElapsed));
      }

      if (!map.has(key)) {
        map.set(key, { key, name: normalizedName, dose: normalizedDose, totalStock: realStock, unit: med.stockUnit, residentCount: 1, residentNames: [residentName] });
      } else {
        const item = map.get(key)!;
        item.totalStock += realStock;
        if (!item.residentNames.includes(residentName)) { item.residentNames.push(residentName); item.residentCount += 1; }
      }
    });
    return Array.from(map.values());
  }, [residentMedications, residents]);

  const filteredAndSortedInventory = useMemo(() => {
    let result = inventory;
    if (searchTerm.trim()) result = result.filter(item => item.name.toLowerCase().includes(searchTerm.toLowerCase().trim()));
    return result.sort((a, b) => {
      let res = sortField === 'name' ? a.name.localeCompare(b.name) : a.totalStock - b.totalStock;
      return sortDirection === 'asc' ? res : -res;
    });
  }, [inventory, searchTerm, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
    if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDirection('asc'); }
  };

  const SortIcon = ({ active, direction }: { active: boolean; direction: SortDirection }) => (
    <span className={`ml-1 inline-flex flex-col space-y-[1px] ${active ? 'text-brand-primary' : 'text-slate-300'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-2 h-2 ${active && direction === 'asc' ? 'opacity-100' : 'opacity-40'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-8 8h16l-8-8z" /></svg>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-2 h-2 ${active && direction === 'desc' ? 'opacity-100' : 'opacity-40'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l8-8H4l8 8z" /></svg>
    </span>
  );

  return (
    <div className="w-full max-w-full" onClick={() => setActivePopoverKey(null)}>
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Inventario General</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Consolidado total de todos los residentes.</p>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-soft border border-slate-100 w-full">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-4">
            <input type="text" placeholder="Buscar..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full max-w-xs px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-brand-primary outline-none transition-all shadow-sm" />
            <ZoomControls zoom={zoomLevel} setZoom={setZoomLevel} />
        </div>

        <div className="overflow-x-auto pb-10 custom-scrollbar w-full border border-slate-100 rounded-2xl"> 
          <div style={{ zoom: zoomLevel }}>
            <table className="w-full text-left border-collapse table-fixed min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                    <th className="w-[35%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase cursor-pointer hover:bg-slate-100" onClick={() => handleSort('name')}>
                        <div className="flex items-center">Medicamento <SortIcon active={sortField === 'name'} direction={sortDirection} /></div>
                    </th>
                    <th className="w-[20%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase">Dosis</th>
                    <th className="w-[15%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase text-center cursor-pointer hover:bg-slate-100" onClick={() => handleSort('stock')}>
                        <div className="flex items-center justify-center">Stock Total <SortIcon active={sortField === 'stock'} direction={sortDirection} /></div>
                    </th>
                    <th className="w-[15%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase text-center">Unidad</th>
                    <th className="w-[15%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase text-center">Residentes</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {filteredAndSortedInventory.length > 0 ? (
                    filteredAndSortedInventory.map((item) => (
                    <tr key={item.key} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-4 py-2 font-bold text-sm text-slate-800 truncate">{item.name}</td>
                        <td className="px-4 py-2 text-slate-600 font-medium text-sm truncate">{item.dose}</td>
                        <td className="px-4 py-2 text-center align-middle">
                            <span className={`font-bold text-sm px-2 py-0.5 rounded border ${item.totalStock < lowStockThreshold ? 'bg-red-50 text-red-600 border-red-100' : 'bg-brand-light text-brand-primary border-brand-secondary/10'}`}>
                                {parseFloat(item.totalStock.toFixed(2))}
                            </span>
                        </td>
                        <td className="px-4 py-2 text-center text-slate-500 font-medium text-sm">{item.unit}</td>
                        <td className="px-4 py-2 text-center align-middle relative">
                            <button onClick={(e) => { e.stopPropagation(); setActivePopoverKey(activePopoverKey === item.key ? null : item.key); }} className="w-8 h-8 bg-blue-50 text-blue-600 font-bold rounded-full hover:bg-blue-100 text-xs shadow-sm border border-blue-100">{item.residentCount}</button>
                            {activePopoverKey === item.key && (
                                <div className="absolute right-4 top-10 w-64 bg-white rounded-xl shadow-xl border border-slate-100 z-50 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                                    <div className="flex justify-between items-center p-2 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                                        <h4 className="text-[9px] font-bold text-slate-400 uppercase">Utilizado por:</h4>
                                        <button onClick={() => setActivePopoverKey(null)} className="text-slate-400 hover:text-red-500 transition-colors"><CloseIcon className="w-4 h-4" /></button>
                                    </div>
                                    <div className="p-2 max-h-40 overflow-y-auto custom-scrollbar">
                                        {item.residentNames.map((name, idx) => (
                                            <div key={idx} className="text-[10px] font-bold text-slate-600 py-1 flex items-center"><div className="w-1 h-1 rounded-full bg-brand-secondary mr-2"></div>{name}</div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </td>
                    </tr>
                    ))
                ) : <tr><td colSpan={5} className="text-center p-8 text-slate-400 text-sm italic">No se encontraron medicamentos.</td></tr>}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInventoryPanel;