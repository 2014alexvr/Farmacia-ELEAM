import React, { useMemo, useState } from 'react';
import { Resident, ResidentMedication } from '../../types';
import ArrowRightIcon from '../icons/ArrowRightIcon';

interface SummaryCesfamPanelProps {
    residents: Resident[];
    residentMedications: ResidentMedication[];
    lowStockThreshold: number;
    onSelectResident: (resident: Resident) => void;
}

// Extended type for internal use to include the full resident object for navigation
interface ExtendedLowStockItem {
    id: string; // medication id for uniqueness
    medicationName: string;
    residentName: string;
    resident: Resident | undefined;
    currentStockValue: number; // for sorting
    currentStockDisplay: string;
    stockDays: number;
}

type SortField = 'medication' | 'resident' | 'days';
type SortDirection = 'asc' | 'desc';

const SummaryCesfamPanel: React.FC<SummaryCesfamPanelProps> = ({ residents, residentMedications, lowStockThreshold, onSelectResident }) => {
    
    // State for sorting
    const [sortField, setSortField] = useState<SortField>('days');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

    const lowStockItems: ExtendedLowStockItem[] = useMemo(() => {
        const items: ExtendedLowStockItem[] = [];
        residentMedications.forEach(med => {
            const dailyExpense = med.schedules.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
            
            if (dailyExpense > 0) {
                // --- LÓGICA DE STOCK VIRTUAL ---
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

                if (stockDays < lowStockThreshold) {
                    const resident = residents.find(r => r.id === med.residentId);
                    items.push({
                        id: med.id,
                        medicationName: `${med.medicationName} ${med.doseValue}${med.doseUnit}`,
                        residentName: resident ? resident.name : 'Desconocido',
                        resident: resident,
                        currentStockValue: realStock,
                        currentStockDisplay: `${parseFloat(realStock.toFixed(2))} ${med.stockUnit}`,
                        stockDays: stockDays,
                    });
                }
            }
        });
        return items;
    }, [residentMedications, residents, lowStockThreshold]);

    const sortedItems = useMemo(() => {
        return [...lowStockItems].sort((a, b) => {
            let valA: any = '';
            let valB: any = '';

            switch (sortField) {
                case 'medication':
                    valA = a.medicationName.toLowerCase();
                    valB = b.medicationName.toLowerCase();
                    break;
                case 'resident':
                    valA = a.residentName.toLowerCase();
                    valB = b.residentName.toLowerCase();
                    break;
                case 'days':
                    valA = a.stockDays;
                    valB = b.stockDays;
                    break;
            }

            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [lowStockItems, sortField, sortDirection]);

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
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Bajo Stock Crítico</h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Análisis del inventario de todos los medicamentos en el sistema. Se considera bajo stock si un medicamento tiene cobertura para menos de {lowStockThreshold} días.
                </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100">
                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-left border-collapse min-w-[700px]">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th 
                                    className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider rounded-tl-2xl cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                                    onClick={() => handleSort('medication')}
                                >
                                    <div className="flex items-center">
                                        Medicamento
                                        <SortIcon active={sortField === 'medication'} direction={sortDirection} />
                                    </div>
                                </th>
                                <th 
                                    className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                                    onClick={() => handleSort('resident')}
                                >
                                    <div className="flex items-center">
                                        Residente
                                        <SortIcon active={sortField === 'resident'} direction={sortDirection} />
                                    </div>
                                </th>
                                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center">Stock Actual</th>
                                <th 
                                    className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors group select-none"
                                    onClick={() => handleSort('days')}
                                >
                                    <div className="flex items-center justify-center">
                                        Días con Stock
                                        <SortIcon active={sortField === 'days'} direction={sortDirection} />
                                    </div>
                                </th>
                                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center rounded-tr-2xl">Umbral Mínimo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {sortedItems.length > 0 ? (
                                sortedItems.map((item) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-5 font-bold text-lg text-slate-800 align-middle">{item.medicationName}</td>
                                        <td className="px-5 py-5 align-middle">
                                            {item.resident ? (
                                                <button 
                                                    onClick={() => onSelectResident(item.resident!)}
                                                    className="text-left text-brand-secondary hover:text-brand-primary font-bold text-lg hover:underline decoration-2 underline-offset-2 flex items-center group/btn"
                                                >
                                                    {item.residentName}
                                                    <ArrowRightIcon className="w-4 h-4 ml-1 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                </button>
                                            ) : (
                                                <span className="text-slate-400 font-medium text-lg">Desconocido</span>
                                            )}
                                        </td>
                                        <td className="px-5 py-5 text-center font-bold text-slate-800 text-lg align-middle">{item.currentStockDisplay}</td>
                                        <td className="px-5 py-5 text-center align-middle">
                                            <span className="inline-block px-3 py-1 bg-red-100 text-red-600 font-bold rounded-lg border border-red-200 text-lg shadow-sm">
                                                {item.stockDays} días
                                            </span>
                                        </td>
                                        <td className="px-5 py-5 text-center text-slate-500 text-lg align-middle">{`< ${lowStockThreshold} días`}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-12">
                                        <div className="flex flex-col items-center justify-center text-emerald-500">
                                            <p className="text-2xl font-bold">¡Excelente!</p>
                                            <p className="text-slate-500 mt-2">No hay medicamentos con bajo stock crítico.</p>
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

export default SummaryCesfamPanel;