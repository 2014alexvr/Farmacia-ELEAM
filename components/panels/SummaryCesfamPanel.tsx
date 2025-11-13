import React, { useState, useMemo } from 'react';
import { Resident, ResidentMedication, LowStockItem } from '../../types';
import PillIcon from '../icons/PillIcon';
import LowStockMedicationsModal from './LowStockMedicationsModal';

interface SummaryCesfamPanelProps {
    residents: Resident[];
    residentMedications: ResidentMedication[];
}

const SummaryCesfamPanel: React.FC<SummaryCesfamPanelProps> = ({ residents, residentMedications }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);

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
            <h1 className="text-3xl font-bold text-gray-800 mb-6">{`Resumen de Stock General`}</h1>
            <p className="text-gray-600 mb-8">
                Análisis del inventario de todos los medicamentos en el sistema. Se considera bajo stock si un medicamento tiene cobertura para 6 días o menos.
            </p>

            <div className="max-w-md">
                <button
                    onClick={() => setIsModalOpen(true)}
                    disabled={lowStockItems.length === 0}
                    className="disabled:opacity-60 disabled:cursor-not-allowed w-full text-left focus:outline-none focus:ring-2 focus:ring-brand-secondary rounded-xl group"
                >
                    <div className="bg-white py-6 px-4 rounded-xl shadow-lg flex items-center justify-between transition-shadow group-hover:shadow-xl">
                        <div className="flex items-center">
                            <div className={`p-3 mr-4 rounded-full ${lowStockItems.length > 0 ? "bg-red-500" : "bg-yellow-500"} text-white`}>
                                <PillIcon className="w-8 h-8" />
                            </div>
                            <div>
                                <p className="text-lg font-bold text-gray-800">Medicamentos con Bajo Stock</p>
                                <p className="text-sm text-gray-500">{lowStockItems.length} items requieren atención</p>
                            </div>
                        </div>
                        <span className="text-base font-bold text-brand-secondary group-hover:underline">Ver</span>
                    </div>
                </button>
            </div>


            {isModalOpen && (
                <LowStockMedicationsModal
                    lowStockItems={lowStockItems}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};

export default SummaryCesfamPanel;