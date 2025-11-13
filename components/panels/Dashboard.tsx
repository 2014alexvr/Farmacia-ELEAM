import React from 'react';
import { MOCK_RESIDENTS, MOCK_MEDICATIONS } from '../../constants';
import Card from '../Card';
import UsersIcon from '../icons/UsersIcon';
import PillIcon from '../icons/PillIcon';
import { User } from '../../types';
import ChartBarIcon from '../icons/ChartBarIcon';

interface DashboardProps {
    user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
    const lowStockMedications = MOCK_MEDICATIONS.filter(med => med.stock < med.lowStockThreshold).length;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-800">Bienvenido, {user.name}</h1>
      <p className="text-gray-600 mt-1">Resumen del sistema FARMACIA ELEAM.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
        <Card title="Total Residentes" value={MOCK_RESIDENTS.length} icon={UsersIcon} color="bg-blue-500" />
        <Card title="Tipos de Medicamentos" value={MOCK_MEDICATIONS.length} icon={PillIcon} color="bg-green-500" />
        <Card title="Medicamentos con Bajo Stock" value={lowStockMedications} icon={ChartBarIcon} color={lowStockMedications > 0 ? 'bg-red-500' : 'bg-yellow-500'}>
            {lowStockMedications > 0 ? (
                <p className='text-red-600'>Requiere atención inmediata.</p>
            ) : (
                <p className='text-green-600'>Todo el stock está en orden.</p>
            )}
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;