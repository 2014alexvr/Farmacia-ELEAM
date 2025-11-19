
import React, { useMemo } from 'react';
import { Resident, ResidentMedication, LowStockItem } from '../../types';

interface SummaryCesfamPanelProps {
    residents: Resident[];
    residentMedications: ResidentMedication[];
}

const SummaryCesfamPanel: React.FC<SummaryCesfamPanelProps> = ({ residents, residentMedications }) => {

    const lowStockItems: LowStockItem[] = useMemo(() => {
        const items: LowStockItem[] = [];
        residentMedications.forEach(med => {
            const dailyExpense = med.schedules.reduce((sum, s) => sum + s.quantity, 0);
            if (dailyExpense > 0) {
                const stockDays = Math.floor(med.stock / dailyExpense);
                if (stockDays <= 6) { // "menos de 7 días" is 6 or less
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
    }, [residentMedications, residents]);

    return (
        <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{`Bajo Stock Crítico`}</h1>
            <p className="text-gray-600 mb-8">
                Análisis del inventario de todos los medicamentos en el sistema. Se considera bajo stock si un medicamento tiene cobertura para 6 días o menos.
            </p>

            <div className="bg-white p-6 rounded-xl shadow-lg">
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="p-4 font-semibold text-gray-600">Medicamento</th>
                                <th className="p-4 font-semibold text-gray-600 text-center">Stock Actual</th>
                                <th className="p-4 font-semibold text-gray-600 text-center">Días con Stock</th>
                                <th className="p-4 font-semibold text-gray-600 text-center">Umbral Mínimo</th>
                            </tr>
                        </thead>
                        <tbody>
                            {lowStockItems.length > 0 ? (
                                lowStockItems.map((item, index) => (
                                    <tr key={index} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                                        <td className="p-4 font-medium text-gray-800">{item.medicationName}</td>
                                        <td className="p-4 text-center font-bold text-gray-800">{item.currentStock}</td>
                                        <td className="p-4 text-center font-bold text-red-600">{`${item.stockDays} días`}</td>
                                        <td className="p-4 text-center text-gray-700">{"< 7 días"}</td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={4} className="text-center p-8 text-gray-500">
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
