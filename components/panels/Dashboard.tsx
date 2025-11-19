
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
                 // Consider low stock if stock is for 6 days or less (less than 7 days)
                 if (stockDays <= 6) {
                     return count + 1;
                 }
             }
             return count;
        }, 0);
    }, [residentMedications]);
    
    const uniqueMedicationTypes = useMemo(() => {
        // Extract unique medication names from the real resident medications database
        const names = new Set(residentMedications.map(m => m.medicationName.trim()));
        return names.size;
    }, [residentMedications]);

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {user.name}</h1>
      <p className="text-gray-600 mt-1">Resumen del sistema FARMACIA ELEAM.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <div 
          onClick={() => onNavigate(Panel.Residents)}
          className="cursor-pointer transform transition-all hover:scale-105"
        >
          <Card title="Total Residentes" value={residents.length} icon={UsersIcon} color="bg-blue-500" />
        </div>
        
        <div 
          onClick={() => onNavigate(Panel.GeneralInventory)}
          className="cursor-pointer transform transition-all hover:scale-105"
        >
          <Card title="Tipos de Medicamentos" value={uniqueMedicationTypes} icon={PillIcon} color="bg-green-500" />
        </div>
        
        <div 
          onClick={() => onNavigate(Panel.SummaryCesfam)} 
          className="cursor-pointer transform transition-all hover:scale-105"
        >
          <Card title="Medicamentos con Bajo Stock" value={lowStockMedications} icon={ChartBarIcon} color={lowStockMedications > 0 ? 'bg-red-500' : 'bg-yellow-500'}>
              {lowStockMedications > 0 ? (
                  <p className='text-red-600'>Requiere atención inmediata.</p>
              ) : (
                  <p className='text-green-600'>Todo el stock está en orden.</p>
              )}
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;