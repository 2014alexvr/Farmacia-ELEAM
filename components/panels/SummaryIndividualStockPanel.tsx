import React, { useMemo } from 'react';
import { Resident, ResidentMedication, Provenance } from '../../types';

interface SummaryIndividualStockPanelProps {
  residents: Resident[];
  residentMedications: ResidentMedication[];
  onSelectResident: (resident: Resident) => void;
}

const provenanceStyles: Record<Provenance, string> = {
  'Cesfam': 'bg-blue-100 text-blue-800',
  'Salud Mental': 'bg-indigo-100 text-indigo-800',
  'Hospital': 'bg-pink-100 text-pink-800',
  'CAE Quilpué': 'bg-purple-100 text-purple-800',
  'CAE Viña': 'bg-fuchsia-100 text-fuchsia-800',
  'Familia': 'bg-lime-100 text-lime-800',
  'Compras': 'bg-green-100 text-green-800',
  'Donación': 'bg-yellow-100 text-yellow-800',
};


const SummaryIndividualStockPanel: React.FC<SummaryIndividualStockPanelProps> = ({ residents, residentMedications, onSelectResident }) => {

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
        if (stockDays < 7) {
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

  const getResidentMinStockDays = (residentId: number) => {
    const medications = residentMedications.filter(m => m.residentId === residentId);
    if (medications.length === 0) return Infinity;

    let minStockDays = Infinity;
    let hasMedsWithExpense = false;

    medications.forEach(med => {
      const dailyExpense = med.schedules.reduce((sum, s) => sum + s.quantity, 0);
      if (dailyExpense > 0) {
        hasMedsWithExpense = true;
        const stockDays = Math.floor(med.stock / dailyExpense);
        if (stockDays < minStockDays) {
          minStockDays = stockDays;
        }
      }
    });

    return hasMedsWithExpense ? minStockDays : Infinity;
  };

  const sortedResidents = useMemo(() => {
    return [...residents].sort((a, b) => {
      const minStockA = getResidentMinStockDays(a.id);
      const minStockB = getResidentMinStockDays(b.id);
      return minStockA - minStockB;
    });
  }, [residents, residentMedications]);


  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Resumen de Stock Individual</h1>
      <p className="text-gray-600 mb-8">
        Análisis del inventario de medicamentos asignado a cada residente. Se considera "Bajo Stock" si un medicamento tiene cobertura para menos de 7 días.
      </p>

      <div className="bg-white p-6 rounded-xl shadow-lg">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold text-gray-600">Residente</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Medicamentos Asignados</th>
                <th className="p-4 font-semibold text-gray-600">Medicamentos con Bajo Stock</th>
                <th className="p-4 font-semibold text-gray-600">Procedencia</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Días de Stock</th>
                <th className="p-4 font-semibold text-gray-600 text-center">Umbral Mínimo</th>
              </tr>
            </thead>
            <tbody>
              {sortedResidents.map((resident, index) => {
                const summary = getResidentStockSummary(resident.id);
                const hasLowStock = summary.lowStockItems.length > 0;
                const hasNoMeds = summary.medicationCount === 0;

                return (
                  <tr key={resident.id} className={`border-t ${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                    <td className="p-4 font-medium text-gray-800 align-top">
                      <button onClick={() => onSelectResident(resident)} className="text-left text-brand-secondary hover:underline">
                        {resident.name}
                      </button>
                    </td>
                    <td className={`p-4 text-center font-medium align-top ${hasNoMeds ? 'text-gray-400' : 'text-gray-800'}`}>
                      {summary.medicationCount}
                    </td>
                    <td className="p-4 text-gray-800 align-top">
                      {hasLowStock ? (
                        <div>
                          {summary.lowStockItems.map((item, i) => (
                            <p key={i} className="mb-1 h-8 flex items-center">{item.name}</p>
                          ))}
                        </div>
                      ) : (
                        <span className={hasNoMeds ? 'text-gray-400' : 'text-green-600'}>Ninguno</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-800 align-top">
                        {hasLowStock ? (
                            <div>
                                {summary.lowStockItems.map((item, i) => (
                                    <p key={i} className="mb-1 h-8 flex items-center">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${provenanceStyles[item.provenance] || 'bg-gray-100 text-gray-800'}`}>
                                            {item.provenance}
                                        </span>
                                    </p>
                                ))}
                            </div>
                        ) : (
                           <span className={hasNoMeds ? 'text-gray-400' : ''}>N/A</span>
                        )}
                    </td>
                    <td className="p-4 text-center font-bold align-top">
                      {hasLowStock ? (
                        <div>
                          {summary.lowStockItems.map((item, i) => (
                            <p key={i} className="mb-1 h-8 flex items-center justify-center text-red-600">{`${item.stockDays} días`}</p>
                          ))}
                        </div>
                      ) : (
                        <span className={hasNoMeds ? 'text-gray-400' : ''}>N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-gray-700 align-top">
                      {hasNoMeds ? 'N/A' : '< 7 días'}
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