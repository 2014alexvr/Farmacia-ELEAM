import React, { useMemo } from 'react';
import { Resident, ResidentMedication, LowStockItem } from '../../types';

interface SummaryCesfamPanelProps {
    residents: Resident[];
    residentMedications: ResidentMedication[];
    lowStockThreshold: number;
}

const SummaryCesfamPanel: React.FC<SummaryCesfamPanelProps> = ({ residents, residentMedications, lowStockThreshold }) => {

    const lowStockItems: LowStockItem[] = useMemo(() => {
        const items: LowStockItem[] = [];
        residentMedications.forEach(med => {
            const dailyExpense = med.schedules.reduce((sum, s) => sum + s.quantity, 0);
            if (dailyExpense > 0) {
                const stockDays = Math.floor(med.stock / dailyExpense);
                if (stockDays < lowStockThreshold) {
                    const resident = residents.find(r => r.id === med.residentId);
                    items.push({
                        medicationName: `${med.medicationName} ${med.doseValue}${med.doseUnit}`,
                        residentName: resident ? resident.name : 'Desconocido',
                        currentStock: `${med.stock} ${med.stockUnit}`,
                        stockDays: stockDays,
                    });
                }
            }
        });
        return items;
    }, [residentMedications, residents, lowStockThreshold]);

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Bajo Stock Crítico</h1>
                <p className="text-slate-500 mt-2 font-medium">
                    Análisis del inventario de todos los medicamentos en el sistema. Se considera bajo stock si un medicamento tiene cobertura para menos de {lowStockThreshold} días.
                </p>
            </div>

            <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider rounded-tl-2xl">Medicamento</th>
                                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Residente</th>
                                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center">Stock Actual</th>
                                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center">Días con Stock</th>
                                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center rounded-tr-2xl">Umbral Mínimo</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {lowStockItems.length > 0 ? (
                                lowStockItems.map((item, index) => (
                                    <tr key={index} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-5 py-5 font-bold text-lg text-slate-800 align-middle">{item.medicationName}</td>
                                        <td className="px-5 py-5 text-slate-600 font-medium text-lg align-middle">{item.residentName}</td>
                                        <td className="px-5 py-5 text-center font-bold text-slate-800 text-lg align-middle">{item.currentStock}</td>
                                        <td className="px-5 py-5 text-center font-bold text-red-600 text-lg align-middle">{`${item.stockDays} días`}</td>
                                        <td className="px-5 py-5 text-center text-slate-500 text-lg align-middle">{`< ${lowStockThreshold} días`}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={5} className="text-center p-12 text-slate-400 italic">
                                        No hay medicamentos con bajo stock crítico.
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