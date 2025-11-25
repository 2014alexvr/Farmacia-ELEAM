import React, { useMemo } from 'react';
import { Resident, ResidentMedication, Provenance, User } from '../../types';

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


const SummaryIndividualStockPanel: React.FC<SummaryIndividualStockPanelProps> = ({ 
  residents, 
  residentMedications, 
  onSelectResident, 
  user,
  threshold
}) => {
  
  const getResidentStockSummary = (residentId: number) => {
    const medications = residentMedications.filter(m => m.residentId === residentId);
    if (medications.length === 0) {
      return {
        medicationCount: 0,
        lowStockItems: [],
      };
    }

    const lowStockItems: { name: string; stockDays: number; provenance: Provenance }[] = [];

    medications.forEach(med => {
      const dailyExpense = med.schedules.reduce((sum, s) => sum + s.quantity, 0);
      if (dailyExpense > 0) {
        const stockDays = Math.floor(med.stock / dailyExpense);
        if (stockDays < threshold) {
          lowStockItems.push({
            name: med.medicationName,
            stockDays: stockDays,
            provenance: med.provenance,
          });
        }
      }
    });

    return {
      medicationCount: medications.length,
      lowStockItems,
    };
  };

  const sortedResidents = useMemo(() => {
    return [...residents].sort((a, b) => {
       // Sort by name
       return a.name.localeCompare(b.name);
    });
  }, [residents]);


  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Resumen de Stock Individual</h1>
        <p className="text-slate-500 mt-2 font-medium">
            Análisis del inventario de medicamentos asignado a cada residente. Se considera "Bajo Stock" si un medicamento tiene cobertura inferior al umbral configurado ({threshold} días).
        </p>
      </div>

      <div className="bg-white p-6 rounded-3xl shadow-soft border border-slate-100">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider rounded-tl-2xl">Residente</th>
                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center">Medicamentos Asignados</th>
                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Medicamentos con Bajo Stock</th>
                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider">Procedencia</th>
                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center">Días de Stock</th>
                <th className="px-5 py-4 font-bold text-xs text-slate-400 uppercase tracking-wider text-center rounded-tr-2xl">Umbral Mínimo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sortedResidents.map((resident, index) => {
                const summary = getResidentStockSummary(resident.id);
                const hasLowStock = summary.lowStockItems.length > 0;
                const hasNoMeds = summary.medicationCount === 0;

                return (
                  <tr key={resident.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-5 font-bold text-lg text-slate-800 align-top">
                      <button onClick={() => onSelectResident(resident)} className="text-left text-brand-secondary hover:underline">
                        {resident.name}
                      </button>
                    </td>
                    <td className={`px-5 py-5 text-center font-bold text-lg align-top ${hasNoMeds ? 'text-slate-300' : 'text-slate-700'}`}>
                      {summary.medicationCount}
                    </td>
                    <td className="px-5 py-5 text-slate-700 align-top">
                      {hasLowStock ? (
                        <div className="space-y-2">
                          {summary.lowStockItems.map((item, i) => (
                            <p key={i} className="text-lg font-medium">{item.name}</p>
                          ))}
                        </div>
                      ) : (
                        <span className={`text-lg font-medium ${hasNoMeds ? 'text-slate-300' : 'text-emerald-600'}`}>Ninguno</span>
                      )}
                    </td>
                    <td className="px-5 py-5 align-top">
                        {hasLowStock ? (
                            <div className="space-y-2">
                                {summary.lowStockItems.map((item, i) => (
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
                          {summary.lowStockItems.map((item, i) => (
                            <p key={i} className="font-bold text-red-600 text-lg">{`${item.stockDays} días`}</p>
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
  );
};

export default SummaryIndividualStockPanel;