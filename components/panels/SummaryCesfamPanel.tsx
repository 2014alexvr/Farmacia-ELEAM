import React, { useMemo, useState } from 'react';
import { Resident, ResidentMedication } from '../../types';
import ArrowRightIcon from '../icons/ArrowRightIcon';
import ZoomControls from '../ZoomControls';
import TrashIcon from '../icons/TrashIcon';
import ConfirmDeleteModal from './ConfirmDeleteModal';

interface SummaryCesfamPanelProps {
    residents: Resident[];
    residentMedications: ResidentMedication[];
    lowStockThreshold: number;
    onSelectResident: (resident: Resident) => void;
    onDeleteMedication: (medicationId: string) => void;
}

interface ExtendedLowStockItem {
    id: string;
    medicationName: string;
    residentName: string;
    resident: Resident | undefined;
    currentStockValue: number;
    currentStockDisplay: string;
    stockDays: number;
}

type SortField = 'medication' | 'resident' | 'days';
type SortDirection = 'asc' | 'desc';

const SummaryCesfamPanel: React.FC<SummaryCesfamPanelProps> = ({ residents, residentMedications, lowStockThreshold, onSelectResident, onDeleteMedication }) => {
    const [sortField, setSortField] = useState<SortField>('days');
    const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
    // ZOOM STATE - DEFAULT 100%
    const [zoomLevel, setZoomLevel] = useState(1);
    const [itemToDelete, setItemToDelete] = useState<ExtendedLowStockItem | null>(null);

    const lowStockItems: ExtendedLowStockItem[] = useMemo(() => {
        const items: ExtendedLowStockItem[] = [];
        residentMedications.forEach(med => {
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
                case 'medication': valA = a.medicationName.toLowerCase(); valB = b.medicationName.toLowerCase(); break;
                case 'resident': valA = a.residentName.toLowerCase(); valB = b.residentName.toLowerCase(); break;
                case 'days': valA = a.stockDays; valB = b.stockDays; break;
            }
            if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
            if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });
    }, [lowStockItems, sortField, sortDirection]);

    const handleSort = (field: SortField) => {
        if (sortField === field) setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
        else { setSortField(field); setSortDirection('asc'); }
    };

    const confirmDelete = () => {
        if (itemToDelete) {
            onDeleteMedication(itemToDelete.id);
            setItemToDelete(null);
        }
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
                <h1 className="text-2xl font-extrabold text-slate-800 tracking-tight">Bajo Stock Crítico</h1>
                <p className="text-slate-500 mt-1 text-sm font-medium">
                    Análisis de inventario. Umbral: {lowStockThreshold} días.
                </p>
            </div>

            <div className="bg-white p-4 rounded-3xl shadow-soft border border-slate-100 w-full">
                <div className="flex justify-end mb-4">
                    <ZoomControls zoom={zoomLevel} setZoom={setZoomLevel} />
                </div>

                <div className="overflow-x-auto custom-scrollbar w-full border border-slate-100 rounded-2xl">
                    <div style={{ zoom: zoomLevel }}>
                        <table className="w-full text-left border-collapse table-fixed min-w-[900px]">
                            <thead className="bg-slate-50 border-b border-slate-100">
                                <tr>
                                    <th className="w-[28%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSort('medication')}>
                                        <div className="flex items-center">Medicamento <SortIcon active={sortField === 'medication'} direction={sortDirection} /></div>
                                    </th>
                                    <th className="w-[25%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSort('resident')}>
                                        <div className="flex items-center">Residente <SortIcon active={sortField === 'resident'} direction={sortDirection} /></div>
                                    </th>
                                    <th className="w-[12%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center">Stock Actual</th>
                                    <th className="w-[15%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center cursor-pointer hover:bg-slate-100 transition-colors group select-none" onClick={() => handleSort('days')}>
                                        <div className="flex items-center justify-center">Días con Stock <SortIcon active={sortField === 'days'} direction={sortDirection} /></div>
                                    </th>
                                    <th className="w-[12%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-center">Umbral</th>
                                    <th className="w-[8%] px-4 py-3 font-bold text-[10px] text-slate-400 uppercase tracking-wider text-right">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {sortedItems.length > 0 ? (
                                    sortedItems.map((item) => (
                                        <tr key={item.id} className="hover:bg-slate-50 transition-colors group">
                                            <td className="px-4 py-2.5 font-bold text-sm text-slate-800 align-middle truncate">{item.medicationName}</td>
                                            <td className="px-4 py-2.5 align-middle truncate">
                                                {item.resident ? (
                                                    <button onClick={() => onSelectResident(item.resident!)} className="text-left text-brand-secondary hover:text-brand-primary font-bold text-sm hover:underline flex items-center group/btn truncate">
                                                        {item.residentName} <ArrowRightIcon className="w-3 h-3 ml-1 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
                                                    </button>
                                                ) : <span className="text-slate-400 font-medium text-sm italic">Desconocido</span>}
                                            </td>
                                            <td className="px-4 py-2.5 text-center font-bold text-slate-800 text-sm align-middle">{item.currentStockDisplay}</td>
                                            <td className="px-4 py-2.5 text-center align-middle">
                                                <span className="inline-block px-2 py-0.5 bg-red-100 text-red-600 font-extrabold rounded text-xs border border-red-200">
                                                    {item.stockDays} días
                                                </span>
                                            </td>
                                            <td className="px-4 py-2.5 text-center text-slate-500 text-sm align-middle">{`< ${lowStockThreshold} d`}</td>
                                            <td className="px-4 py-2.5 text-right align-middle">
                                                <button onClick={() => setItemToDelete(item)} className="p-1.5 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100" title="Eliminar definitivamente">
                                                    <TrashIcon className="w-4 h-4" />
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr><td colSpan={6} className="text-center p-12 text-emerald-500 font-bold">No hay medicamentos con bajo stock crítico.</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {itemToDelete && (
                <ConfirmDeleteModal 
                    itemName={`${itemToDelete.medicationName} (${itemToDelete.residentName})`}
                    onConfirm={confirmDelete}
                    onCancel={() => setItemToDelete(null)}
                />
            )}
        </div>
    );
};

export default SummaryCesfamPanel;