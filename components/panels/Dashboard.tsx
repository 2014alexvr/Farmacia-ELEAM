import React, { useMemo } from 'react';
import Card from '../Card';
import UsersIcon from '../icons/UsersIcon';
import PillIcon from '../icons/PillIcon';
import { User, Resident, ResidentMedication, Panel } from '../../types';
import ChartBarIcon from '../icons/ChartBarIcon';

interface DashboardProps {
    user: User;
    residents: Resident[];
    residentMedications: ResidentMedication[];
    onNavigate: (panel: Panel) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ user, residents, residentMedications, onNavigate }) => {
    const lowStockMedications = useMemo(() => {
        return residentMedications.reduce((count, med) => {
             const dailyExpense = med.schedules.reduce((sum, s) => sum + (Number(s.quantity) || 0), 0);
             if (dailyExpense > 0) {
                 const stockDays = Math.floor(med.stock / dailyExpense);
                 if (stockDays <= 6) {
                     return count + 1;
                 }
             }
             return count;
        }, 0);
    }, [residentMedications]);
    
    const uniqueMedicationTypes = useMemo(() => {
        const names = new Set(residentMedications.map(m => m.medicationName.trim()));
        return names.size;
    }, [residentMedications]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Bienvenido, {user.name}</h1>
        <p className="text-slate-500 mt-2 font-medium">Panel de control del sistema FARMACIA ELEAM EL NAZARENO.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div 
          onClick={() => onNavigate(Panel.Residents)}
          className="cursor-pointer transform transition-all hover:scale-[1.02] active:scale-95"
        >
          <Card title="Total Residentes" value={residents.length} icon={UsersIcon} color="text-blue-600" />
        </div>
        
        <div 
          onClick={() => onNavigate(Panel.GeneralInventory)}
          className="cursor-pointer transform transition-all hover:scale-[1.02] active:scale-95"
        >
          <Card title="Tipos de Medicamentos" value={uniqueMedicationTypes} icon={PillIcon} color="text-emerald-600" />
        </div>
        
        <div 
          onClick={() => onNavigate(Panel.SummaryCesfam)} 
          className="cursor-pointer transform transition-all hover:scale-[1.02] active:scale-95"
        >
          <Card title="Medicamentos con Bajo Stock" value={lowStockMedications} icon={ChartBarIcon} color={lowStockMedications > 0 ? 'text-red-600' : 'text-amber-500'}>
              {lowStockMedications > 0 ? (
                  <div className="flex items-center text-red-600 bg-red-50 py-1 px-3 rounded-full w-fit">
                     <span className="w-2 h-2 bg-red-500 rounded-full mr-2 animate-pulse"></span>
                     <p>Requiere atención</p>
                  </div>
              ) : (
                  <div className="flex items-center text-emerald-600 bg-emerald-50 py-1 px-3 rounded-full w-fit">
                     <span className="w-2 h-2 bg-emerald-500 rounded-full mr-2"></span>
                     <p>Stock en orden</p>
                  </div>
              )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;