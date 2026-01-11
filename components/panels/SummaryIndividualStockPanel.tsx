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
  
  // ZOOM STATE - DEFAULT 50%
  const [zoomLevel, setZoomLevel] = useState(0.5);

  // Helper function to calculate stock summary for a single resident
  // Includes VIRTUAL STOCK LOGIC to match other panels
  const getResidentStockSummary = (residentId: number) => {
    const medications = residentMedications.filter(m => m.residentId === residentId);
    
    if (medications.length === 0) {
      return {
        medicationCount: 0,
        lowStockItems: [],
        minStockDays: 9999, // High number for sorting (puts them at the end if sorting asc)
      };
    }

    const lowStockItems: { name: string; stockDays: number; provenance: Provenance }[] = [];
    let minStockDays = 9999; 

    medications.forEach(med => {
      const dailyExpense = med.schedules.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
      
      if (dailyExpense > 0) {
        // --- LÓGICA DE STOCK VIRTUAL (CRÍTICA PARA CONSISTENCIA) ---
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
          lowStockItems.push({
            name: med.medicationName,
            stockDays: stockDays,
            provenance: med.provenance,
          });
          // Track the most critical item for this resident for sorting purposes
          if (stockDays < minStockDays) {
              minStockDays = stockDays;
          }
        }
      }
    });

    return {
      medicationCount: medications.length,
      lowStockItems,
      minStockDays: lowStockItems.length > 0 ? minStockDays : 9999,
    };
  };

  // Pre-calculate summaries for all residents to allow sorting
  const processedResidents = useMemo(() => {
      return residents.map(resident => {
          const summary = getResidentStockSummary(resident.id);
          return {
              ...resident,
              summary
          };
      });
  }, [residents, residentMedications, threshold]);

  const sortedResidents = useMemo(() => {
    return [...processedResidents].sort((a, b) => {
       let result = 0;
       
       if (sortField === 'resident') {
           result = a.name.localeCompare(b.name);
       } else if (sortField === 'stockDays') {
           // Sort by urgency (minStockDays)
           // If 'asc': Critical items (low numbers) first, then healthy/no items (9999)
           result = a.summary.minStockDays - b.summary.minStockDays;
       }

       return sortDirection === 'asc' ? result : -result;
    });
  }, [processedResidents, sortField, sortDirection]);

  const handleSort = (field: SortField) => {
      if (sortField === field) {
          setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
      } else {
          setSortField(field);
          setSortDirection('asc');
      }
  };

  const SortIcon = ({ active, direction }: { active: boolean; direction: SortDirection }) => (
    <span className={`ml-2 inline-flex flex-col space-y-[2px] ${active ? 'text-brand-primary' : 'text-slate-300'}`}>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-2 h-2 ${active && direction === 'asc' ? 'opacity-100' : 'opacity-40'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 4l-8 8h16l-8-8z" /></svg>
        <svg xmlns="http://www.w3.org/2000/svg" className={`w-2 h-2 ${active && direction === 'desc' ? 'opacity-100' : 'opacity-40'}`} viewBox="0 0 24 24" fill="currentColor"><path d="M12 20l8-8H4l8 8z" /></svg>
    </span>
  );

  return (
    <div className="w-full max-w-full min-w-full">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Resumen de Stock Individual</h1>
        <p className="text-slate-500 mt-2 font-medium">
            Análisis del inventario de medicamentos asignado a cada residente. Se considera "Bajo Stock" si un medicamento tiene cobertura inferior al umbral configurado ({threshold} días).
        </p>
      </div>

      {/* FORCE BRUTE: w-full max-w-full */}
      <div className="bg-white p-4 sm:p-6 rounded-3xl shadow-soft border border-slate-100 w-full max-w-full min-w-full overflow-hidden">
        
        {/* TOOLBAR: ZOOM */}
        <div className="flex justify-end mb-4">
            <ZoomControls zoom={zoomLevel} setZoom={setZoomLevel} />
        </div>

        <div className="overflow-x-auto w-full custom-scrollbar border border-slate-100 rounded-2xl">
          <div style={{ zoom: zoomLevel }}>
            <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                    <th 
                        className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider rounded-tl-2xl cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                        onClick={() => handleSort('resident')}
                    >
                        <div className="flex items-center">
                            Residente
                            <SortIcon active={sortField === 'resident'} direction={sortDirection} />
                        </div>
                    </th>
                    <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center">Medicamentos Asignados</th>
                    <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Medicamentos con Bajo Stock</th>
                    <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Procedencia</th>
                    <th 
                        className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                        onClick={() => handleSort('stockDays')}
                    >
                        <div className="flex items-center justify-center">
                            Días de Stock (Mín)
                            <SortIcon active={sortField === 'stockDays'} direction={sortDirection} />
                        </div>
                    </th>
                    <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center rounded-tr-2xl">Umbral Mínimo</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                {sortedResidents.map((resident) => {
                    const { lowStockItems, medicationCount } = resident.summary;
                    const hasLowStock = lowStockItems.length > 0;
                    const hasNoMeds = medicationCount === 0;

                    return (
                    <tr key={resident.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-5 font-bold text-lg text-slate-800 align-top">
                        <button onClick={() => onSelectResident(resident)} className="text-left text-brand-secondary hover:underline">
                            {resident.name}
                        </button>
                        </td>
                        <td className={`px-5 py-5 text-center font-bold text-lg align-top ${hasNoMeds ? 'text-slate-300' : 'text-slate-700'}`}>
                        {medicationCount}
                        </td>
                        <td className="px-5 py-5 text-slate-700 align-top">
                        {hasLowStock ? (
                            <div className="space-y-2">
                            {lowStockItems.map((item, i) => (
                                <p key={i} className="text-sm font-bold text-red-600 flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-red-500 block"></span>
                                    {item.name}
                                </p>
                            ))}
                            </div>
                        ) : (
                            <span className={`text-lg font-medium ${hasNoMeds ? 'text-slate-300' : 'text-emerald-600'}`}>Ninguno</span>
                        )}
                        </td>
                        <td className="px-5 py-5 align-top">
                            {hasLowStock ? (
                                <div className="space-y-2">
                                    {lowStockItems.map((item, i) => (
                                        <div key={i}>
                                            <span className={`inline-block px-3 py-1 text-xs font-bold uppercase tracking-wide rounded-full ${provenanceStyles[item.provenance] || 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                                                {item.provenance}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                            <span className="text-slate-300">N/A</span>
                            )}
                        </td>
                        <td className="px-5 py-5 text-center align-top">
                        {hasLowStock ? (
                            <div className="space-y-2">
                            {lowStockItems.map((item, i) => (
                                <p key={i} className="font-extrabold text-red-600 text-lg border border-red-100 bg-red-50 rounded-lg px-2 inline-block shadow-sm">
                                    {item.stockDays} días
                                </p>
                            ))}
                            </div>
                        ) : (
                            <span className="text-slate-300">N/A</span>
                        )}
                        </td>
                        <td className="px-5 py-5 text-center text-slate-400 font-medium text-lg align-top">
                        {hasNoMeds ? 'N/A' : `< ${threshold} días`}
                        </td>
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