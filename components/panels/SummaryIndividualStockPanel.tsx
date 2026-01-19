import React, { useMemo, useState } from 'react';
import { Resident, ResidentMedication, Provenance, User } from '../../types';
import ZoomControls from '../ZoomControls';

interface SummaryIndividualStockPanelProps {
  residents: Resident[];
  residentMedications: ResidentMedication[];
  onSelectResident: (resident: Resident) => void;
  user: User;
  threshold: number;
}

const provenanceStyles: Record<Provenance, string> = {
  'Cesfam': 'bg-blue-50 text-blue-600 border border-blue-100',
  'Salud Mental': 'bg-indigo-50 text-indigo-600 border border-indigo-100',
  'Hospital': 'bg-pink-50 text-pink-600 border border-pink-100',
  'CAE Quilpué': 'bg-purple-50 text-purple-600 border border-purple-100',
  'CAE Viña': 'bg-fuchsia-50 text-fuchsia-600 border border-fuchsia-100',
  'Familia': 'bg-lime-50 text-lime-600 border border-lime-100',
  'Compras': 'bg-emerald-50 text-emerald-600 border border-emerald-100',
  'Donación': 'bg-yellow-50 text-yellow-600 border border-yellow-100',
};

type SortField = 'resident' | 'stockDays';
type SortDirection = 'asc' | 'desc';

const SummaryIndividualStockPanel: React.FC<SummaryIndividualStockPanelProps> = ({ 
  residents, 
  residentMedications, 
  onSelectResident, 
  user,
  threshold
}) => {
  const [sortField, setSortField] = useState<SortField>('stockDays');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  // ZOOM STATE - DEFAULT 100%
  const [zoomLevel, setZoomLevel] = useState(1);

  const processedResidents = useMemo(() => {
      return residents.map(resident => {
          const medications = residentMedications.filter(m => m.residentId === resident.id);
          const lowStockItems: { name: string; stockDays: number; provenance: Provenance }[] = [];
          let minStockDays = 9999;

          medications.forEach(med => {
            const dailyExpense = med.schedules.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
            if (dailyExpense > 0) {
              const anchorDateStr = med.stockUpdatedAt || new Date().toISOString();
              const anchorDate = new Date(anchorDateStr);
              const today = new Date();
              anchorDate.setHours(0,0,0,0);
              today.setHours(0,0,0,0);
              const diffTime = today.getTime() - anchorDate.getTime();
              const daysElapsed = Math.max(0, Math.floor(diffTime / (1000 * 60 * 60 * 24)));
              const consumed = dailyExpense * daysElapsed;
              const realStock = Math.max(0, med.stock - consumed);
              const stockDays = Math.floor(realStock / dailyExpense);

              if (stockDays < threshold) {
                lowStockItems.push({ name: med.medicationName, stockDays, provenance: med.provenance });
                if (stockDays < minStockDays) minStockDays = stockDays;
              }
            }
          });

          return {
              ...resident,
              summary: {
                medicationCount: medications.length,
                lowStockItems,
                minStockDays: lowStockItems.length > 0 ? minStockDays : 9999,
              }
          };
      });
  }, [residents, residentMedications, threshold]);

  const sortedResidents = useMemo(() => {
    return [...processedResidents].sort((a, b) => {
       let res = sortField === 'resident' ? a.name.localeCompare(b.name) : a.summary.minStockDays - b.summary.minStockDays;
       return sortDirection === 'asc' ? res : -res;
    });
  }, [processedResidents, sortField, sortDirection]);

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
    <div className="w-full max-w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Stock Individual</h1>
        <p className="text-slate-500 mt-1 text-sm font-medium">Resumen por residente (Umbral: {threshold} días).</p>
      </div>

      <div className="bg-white p-4 rounded-3xl shadow-soft border border-slate-100 w-full overflow-hidden">
        <div className="flex justify-end mb-4"><ZoomControls zoom={zoomLevel} setZoom={setZoomLevel} /></div>
        <div className="overflow-x-auto w-full custom-scrollbar border border-slate-100 rounded-2xl">
          <div style={{ zoom: zoomLevel }}>
            <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                    <th className="w-[25%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort('resident')}>
                        <div className="flex items-center">Residente <SortIcon active={sortField === 'resident'} direction={sortDirection} /></div>
                    </th>
                    <th className="w-[12%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase text-center">Medicamentos</th>
                    <th className="w-[30%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase">Bajo Stock</th>
                    <th className="w-[15%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase">Origen</th>
                    <th className="w-[10%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase text-center cursor-pointer hover:bg-slate-100 select-none" onClick={() => handleSort('stockDays')}>
                        <div className="flex items-center justify-center">Días Mín. <SortIcon active={sortField === 'stockDays'} direction={sortDirection} /></div>
                    </th>
                    <th className="w-[8%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase text-center">Umbral</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {sortedResidents.map((resident) => {
                    const { lowStockItems, medicationCount } = resident.summary;
                    const hasLowStock = lowStockItems.length > 0;
                    return (
                    <tr key={resident.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-4 py-2 font-bold text-sm text-slate-800 align-top">
                          <button onClick={() => onSelectResident(resident)} className="text-left text-brand-secondary hover:underline truncate w-full">{resident.name}</button>
                        </td>
                        <td className={`px-4 py-2 text-center font-bold text-sm align-top ${medicationCount === 0 ? 'text-slate-300' : 'text-slate-700'}`}>{medicationCount}</td>
                        <td className="px-4 py-2 align-top">
                        {hasLowStock ? (
                            <div className="space-y-1">
                            {lowStockItems.map((item, i) => (
                                <p key={i} className="text-xs font-bold text-red-600 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-red-500 shrink-0"></span>{item.name}
                                </p>
                            ))}
                            </div>
                        ) : <span className={`text-sm font-medium ${medicationCount === 0 ? 'text-slate-300' : 'text-emerald-600'}`}>{medicationCount === 0 ? 'Sin Meds' : 'Óptimo'}</span>}
                        </td>
                        <td className="px-4 py-2 align-top">
                            {hasLowStock ? (
                                <div className="space-y-1">
                                    {lowStockItems.map((item, i) => (
                                        <div key={i} className="text-[9px] font-bold uppercase inline-block mr-1 px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">{item.provenance}</div>
                                    ))}
                                </div>
                            ) : <span className="text-slate-300 text-xs">-</span>}
                        </td>
                        <td className="px-4 py-2 text-center align-top">
                        {hasLowStock ? (
                            <div className="space-y-1">
                            {lowStockItems.map((item, i) => (
                                <p key={i} className="font-extrabold text-red-600 text-sm">{item.stockDays} d</p>
                            ))}
                            </div>
                        ) : <span className="text-slate-300 text-xs">-</span>}
                        </td>
                        <td className="px-4 py-2 text-center text-slate-400 font-medium text-xs align-top">{medicationCount === 0 ? '-' : `< ${threshold}d`}</td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SummaryIndividualStockPanel;